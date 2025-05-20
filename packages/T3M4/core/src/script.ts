import { T3M4 as T_T3M4 } from './types'
import { Color_Scheme } from './types/constants/color-schemes'
import { Selector } from './types/constants/selectors'
import { Store_Strat, Strat } from './types/constants/strats'
import { CallbackID, EventMap } from './types/events'
import { Script_Args } from './types/script'
import { Islands, Schema, State as T_State, Values } from './types/subscribers'

// #region TYPES
type Brand_Map = {
  number: 'singular' | 'plural'
  completeness: 'complete' | 'partial'
}
type Brand<T, K extends keyof Brand_Map, V extends Brand_Map[K]> = T & { [P in `__${K}`]: V }

namespace StorageKeys {
  export namespace Modes {
    export type Singular<S extends string = string> = Brand<S, 'number', 'singular'>
    export type Plural = Brand<string, 'number', 'plural'>
  }
}
namespace State {
  export type AsMap = T_State.Static.AsMap
  export namespace AsMap {
    export type Partial = Brand<AsMap, 'completeness', 'partial'>
    export type Complete = Brand<AsMap, 'completeness', 'complete'>

    export type Modes = Map<string, string>
    export namespace Modes {
      export type Partial = Brand<Modes, 'completeness', 'partial'>
      export type Complete = Brand<Modes, 'completeness', 'complete'>
    }

    export type Color_Schemes = Map<string, Color_Scheme>
    export namespace Color_Schemes {
      export type Partial = Brand<Color_Schemes, 'completeness', 'partial'>
      export type Complete = Brand<Color_Schemes, 'completeness', 'complete'>
    }
  }

  export type AsObj = T_State.Static
}

type Engine = {
  storageKeys: {
    state: string
    modes: StorageKeys.Modes.Singular
  }
  islands: Islands.Static.AsSet
  values: Values.Static.AsMap
  fallbacks: State.AsMap
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
    miscellaneous: {
      getSystemPref() {
        const supportsPref = window.matchMedia('(prefers-color-scheme)').media !== 'not all'
        const systemPref = supportsPref ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? constants.modes.dark : constants.modes.light) : undefined
        return systemPref
      },
      safeParse(json: string | null) {
        if (!json?.trim()) return null

        try {
          return JSON.parse(json) as unknown
        } catch (e) {
          return null
        }
      },
    },
    deepMerge: {
      state: {
        maps(...sources: (State.AsMap | undefined)[]): State.AsMap {
          const result: State.AsMap = new Map()

          for (const source of sources) {
            if (!source) continue

            for (const [key, sourceValue] of source) {
              const targetValue = result.get(key)

              if (!targetValue) {
                result.set(key, {
                  mode: sourceValue.mode,
                  facets: sourceValue.facets ? new Map(sourceValue.facets) : undefined,
                })
              } else {
                const mergedFacets = new Map(targetValue.facets || [])
                if (sourceValue.facets) {
                  for (const [facetKey, facetValue] of sourceValue.facets) {
                    mergedFacets.set(facetKey, facetValue)
                  }
                }

                result.set(key, {
                  mode: sourceValue.mode ?? targetValue.mode,
                  facets: mergedFacets.size > 0 ? mergedFacets : undefined,
                })
              }
            }
          }

          return result
        },
        objects(...sources: (State.AsObj | undefined)[]) {
          const result: State.AsObj = {}

          for (const source of sources) {
            if (!source) continue

            for (const [island, sourceValue] of Object.entries(source)) {
              const targetValue = result[island]

              if (!targetValue) {
                result[island] = {
                  mode: sourceValue.mode,
                  facets: sourceValue.facets ? { ...sourceValue.facets } : undefined,
                }
              } else {
                result[island] = {
                  mode: sourceValue.mode ?? targetValue.mode,
                  facets: {
                    ...(targetValue.facets || {}),
                    ...(sourceValue.facets || {}),
                  },
                }

                // Rimuove facets se risultano vuote
                if (Object.keys(result[island].facets!).length === 0) {
                  delete result[island].facets
                }
              }
            }
          }

          return result
        },
      },
    },
    construct: {
      modes<T extends State.AsMap.Complete | State.AsMap.Partial>(state: T): T extends State.AsMap.Complete ? State.AsMap.Modes.Complete : State.AsMap.Modes.Partial {
        const modes: State.AsMap.Modes = new Map()

        for (const [island, { mode }] of state) {
          if (!mode) continue
          modes.set(island, mode)
        }

        return modes as T extends State.AsMap.Complete ? State.AsMap.Modes.Complete : State.AsMap.Modes.Partial
      },
      /** ATTENTION!!! To get back the entitirety of color schemes, provide a complete State instance. Not a partial. */
      colorSchemes<T extends State.AsMap.Complete | State.AsMap.Partial>(state: T): T extends State.AsMap.Complete ? State.AsMap.Color_Schemes.Complete : State.AsMap.Color_Schemes.Partial {
        const modes = this.modes(state)
        const colorSchemes = utils.resolve.colorSchemes(modes)
        return colorSchemes
      },
    },
    resolve: {
      colorSchemes(modes: State_Modes) {
        const colorSchemes: State_Color_Schemes = new Map()

        for (const [island, mode] of modes) {
          const colorScheme = this.colorScheme(island, mode)
          if (!colorScheme) continue
          colorSchemes.set(island, colorScheme)
        }

        return colorSchemes
      },
      colorScheme(island: string, mode: string) {
        if (!engine.modes.map.has(island)) return

        const isSystemStrat = engine.modes.map.get(island)!.strategy === constants.strats.system
        const isSystemMode = engine.modes.map.get(island)!.system?.mode === mode
        const isSystem = isSystemStrat && isSystemMode
        const fallbackMode = engine.modes.map.get(island)!.system?.fallback
        if (isSystem) return utils.miscellaneous.getSystemPref() ?? engine.modes.map.get(island)?.colorSchemes.get(fallbackMode!)

        return engine.modes.map.get(island)!.colorSchemes.get(mode)
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
          const computed = utils.deepMerge.state.maps(base, forced)

          return computed
        },
      },
      colorSchemes: {
        base() {
          const state = Main.get.state.base()
          if (!state) return undefined

          const colorSchemes = utils.construct.colorSchemes(state)
          return colorSchemes
        },
        forced() {
          const state = Main.get.state.forced()
          const colorSchemes = utils.construct.colorSchemes(state)
          return colorSchemes
        },
        computed() {
          const base = Main.get.colorSchemes.base()
          if (!base) return undefined

          const forced = Main.get.colorSchemes.forced()
          const computed = utils.deepMerge.maps(base, forced)

          return computed
        },
      },
    }

    private state: {
      base: State.AsMap | undefined
      forced: State.AsMap | undefined
    } = {
      base: undefined,
      forced: undefined,
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
