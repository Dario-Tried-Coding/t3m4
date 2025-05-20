import { Nullable } from '@t3m4/utils/nullables'
import { T3M4 as T_T3M4 } from './types'
import { Color_Scheme } from './types/constants/color-schemes'
import { Selector } from './types/constants/selectors'
import { Store_Strat, Strat } from './types/constants/strats'
import { CallbackID, EventMap } from './types/events'
import { Script_Args } from './types/script'
import { Islands, Schema, State, Values } from './types/subscribers'

type Brand_Map = {
  number: 'singular' | 'plural'
}
type Brand<T, K extends keyof Brand_Map, V extends Brand_Map[K]> = T & { [P in `__${K}`]: V }

type NestedMap<T> = Map<string, NestedMap<T> | T>
type NestedObj<T> = { [key: string]: NestedObj<T> | T }

namespace StorageKeys {
  export namespace Modes {
    export type Singular<S extends string = string> = Brand<S, 'number', 'singular'>
    export type Plural = Brand<string, 'number', 'plural'>
  }
}

type Engine = {
  storageKeys: {
    state: string
    modes: StorageKeys.Modes.Singular
  }
  islands: Islands.Static.AsSet
  values: Values.Static.AsMap
  fallbacks: State.Static.AsMap
  nonce: string
  disableTransitionOnChange: boolean
  modes: {
    store: boolean
    strategy: Store_Strat
    storageKey: string
    map: Map<
      string,
      {
        strategy: Strat
        store: boolean
        selectors: Selector[]
        colorSchemes: Map<string, Color_Scheme>
        system: { mode: string; fallback: string } | undefined
      }
    >
  }
}

export const script = ({ schema, config, constants, preset, nonce, disableTransitionOnChange, storageKey, modes }: Script_Args) => {
  // #region Engine
  function constructEngine({ storageKey, modes, preset }: { storageKey: Script_Args['storageKey']; modes: Script_Args['modes']; preset: Script_Args['preset'] }): Engine {
    const polishedSchema = Object.fromEntries(Object.entries(schema).filter(([k, v]) => Object.keys(v).length > 0 && (!('facets' in v) || Object.keys(v.facets ?? {}).length > 0)))

    const islands = new Set(Object.entries(polishedSchema).map(([k]) => k))

    const values = new Map(
      Object.entries(polishedSchema).map(([i, v]) => {
        const facets =
          'facets' in v
            ? new Map(
                Object.entries(v.facets!).map(([f, o]) => {
                  if (typeof o === 'string') return [f, new Set([o])]
                  else return [f, new Set(o)]
                })
              )
            : undefined

        const mode = 'mode' in v ? new Set(typeof v.mode === 'string' ? [v.mode] : Array.isArray(v.mode) ? v.mode : [v.mode!.light, v.mode!.dark, ...(v.mode!.system ? [v.mode!.system] : []), ...(v.mode!.custom ? v.mode!.custom : [])]) : undefined

        return [i, { ...(facets ? { facets } : {}), ...(mode ? { mode } : {}) } as NonNullable<ReturnType<Engine['values']['get']>>]
      })
    )

    const fallbacks = new Map(
      Object.entries(config).map(([i, v]) => {
        const facets = 'facets' in v ? new Map(Object.entries(v.facets!).map(([f, strat_obj]) => [f, strat_obj.default])) : undefined
        const mode = 'mode' in v ? v.mode!.default : undefined

        return [i, { ...(facets ? { facets } : {}), ...(mode ? { mode } : {}) }]
      })
    )

    const modesHandling = {
      store: modes?.store ?? preset.modes.store,
      strategy: modes?.strategy ?? preset.modes.strategy,
      storageKey: modes?.storageKey ?? preset.modes.storageKey,
      map: new Map(
        Object.entries(config)
          .filter(([i, { mode }]) => !!mode)
          .map(([i, { mode }]) => {
            const obj = {
              strategy: mode!.strategy,
              store: mode!.store ?? true,
              selectors: (typeof mode?.selector === 'string' ? [mode.selector] : mode!.selector) ?? preset.modes.selectors,
              colorSchemes:
                mode!.strategy === constants.strats.mono
                  ? new Map([[mode!.default, mode!.colorScheme]])
                  : mode!.strategy === constants.strats.multi
                    ? new Map(Object.entries(mode!.colorSchemes))
                    : new Map([
                        [(polishedSchema[i]!.mode as Schema.Island.Mode.Facet.System).light, constants.colorSchemes.light],
                        [(polishedSchema[i]!.mode as Schema.Island.Mode.Facet.System).dark, constants.colorSchemes.dark],
                        ...Object.entries(mode!.colorSchemes ?? {}),
                      ]),
              system:
                mode?.strategy === constants.strats.system && (polishedSchema[i]!.mode as Schema.Island.Mode.Facet.System)!.system ? { mode: (polishedSchema[i]!.mode as Schema.Island.Mode.Facet.System).system!, fallback: mode.fallback! } : undefined,
            }
            return [i, obj]
          })
      ),
    }

    return {
      storageKeys: {
        state: storageKey ?? preset.storageKey,
        modes: (modes?.storageKey ?? preset.modes.storageKey) as StorageKeys.Modes.Singular,
      },
      islands,
      values,
      fallbacks,
      nonce: nonce ?? preset.nonce,
      disableTransitionOnChange: disableTransitionOnChange ?? preset.disableTransitionOnChange,
      modes: modesHandling,
    }
  }
  const engine = constructEngine({ preset, modes, storageKey })

  const utils = {
    deepMerge: {
      maps<T extends Nullable<NestedMap<string>>[]>(...maps: T): T[number] extends null | undefined ? undefined : NestedMap<string> {
        const result: NestedMap<string> = new Map()

        for (const map of maps) {
          if (!map) continue

          for (const [key, value] of map.entries()) {
            if (result.has(key) && value instanceof Map && result.get(key) instanceof Map) {
              result.set(key, this.maps(result.get(key) as NestedMap<string>, value))
            } else {
              result.set(key, value)
            }
          }
        }

        return (result.size === 0 ? undefined : result) as T[number] extends null | undefined ? undefined : NestedMap<string>
      },
      objs<T extends Nullable<NestedObj<string>>[]>(...objs: T): T[number] extends null | undefined ? undefined : NestedObj<string> {
        const result: NestedObj<string> = {}

        for (const obj of objs) {
          if (!obj) continue

          for (const [key, value] of Object.entries(obj)) {
            if (result[key] && typeof result[key] === 'object' && typeof value === 'object') {
              result[key] = this.objs(result[key], value)
            } else {
              result[key] = value
            }
          }
        }

        return (Object.keys(result).length === 0 ? undefined : result) as T[number] extends null | undefined ? undefined : NestedObj<string>
      },
    },
  }

  // #region EVENT MANAGER
  class EventManager {
    private static events: Map<string, Map<string, (...args: any[]) => void>> = new Map()

    public static on<K extends keyof EventMap>(event: K, id: CallbackID, callback: (payload: EventMap[K]) => void): void {
      if (!EventManager.events.has(event)) EventManager.events.set(event, new Map())

      const eventCallbacks = EventManager.events.get(event)!
      eventCallbacks.set(id, callback)
    }

    public static emit<K extends keyof EventMap>(event: K, ...args: EventMap[K] extends void ? [] : [payload: EventMap[K]]): void {
      EventManager.events.get(event)?.forEach((callback) => {
        const payload = args[0]
        if (payload) callback(payload)
        else callback()
      })
    }

    public static off<K extends keyof EventMap>(event: K, id: CallbackID): void {
      const eventCallbacks = EventManager.events.get(event)
      if (eventCallbacks) {
        eventCallbacks.delete(id)
        if (eventCallbacks.size === 0) EventManager.events.delete(event)
      }
    }

    public static dispose() {
      EventManager.events.clear()
    }
  }

  // #region MAIN
  class Main {
    private static instance: Main

    public static init() {
      if (!Main.instance) Main.instance = new Main()
    }
    
    public static get = {
      state: {
        base: () => Main.instance.state.base,
        forced: () => Main.instance.state.forced,
        computed: () => {
          const base = Main.get.state.base()
          if (!base) return undefined

          const forced = Main.get.state.forced()
          const computed = utils.deepMerge.maps(base, forced) as State

          return computed
        }
      }

    }

    private state: {
      base: State.Static.AsMap | undefined
      forced: State.Static.AsMap | undefined
    } = {
      base: undefined,
      forced: undefined
    }

    private constructor() {}
  }

  // #region T3M4
  class T3M4 implements T_T3M4 {
    public get = {
      state: {
        base: () => undefined,
        forced: () => ({}),
        computed: () => undefined,
      },
      colorSchemes: {
        base: () => undefined,
        forced: () => ({}),
        computed: () => undefined,
      },
      values: () => ({}),
    }

    public set = {
      state: {
        base: (state: {}) => {},
        forced: (state: {}) => {},
      },
    }

    public subscribe<E extends keyof EventMap>(e: E, id: CallbackID, cb: (payload: EventMap[E]) => void) {
      EventManager.on(e, id, cb)
    }

    public reboot(args: Script_Args) {}
  }

  window.T3M4 = new T3M4()
  console.log(engine.modes)
}
