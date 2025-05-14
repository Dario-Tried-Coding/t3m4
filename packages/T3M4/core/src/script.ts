import { T3M4 as T_T3M4 } from './types'
import { CallbackID, EventMap } from './types/events'
import { Script_Args } from './types/script'
import { Islands, Schema, Values } from './types/subscribers'

export type Brand_Map = {
  number: 'singular' | 'plural'
}

export type Brand<T, K extends keyof Brand_Map, V extends Brand_Map[K]> = T & { [P in `__${K}`]: V }

export namespace StorageKeys {
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
  islands: Islands.AsSet
  values: Values.AsMap
}

export const script = (args: Script_Args) => {
  const { schema, config, constants, preset } = args

  function constructEngine({ storageKey, modes, preset }: Pick<Script_Args, 'preset' | 'storageKey' | 'modes'>): Engine {
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

        console.log({i, facets, mode})
        return [i, { ...(facets ?? {}), ...(mode ?? {}) } as NonNullable<ReturnType<Engine['values']['get']>>]
      })
    )

    return {
      storageKeys: {
        state: storageKey ?? preset.storageKey,
        modes: (modes?.storageKey ?? preset.modes.storageKey) as StorageKeys.Modes.Singular,
      },
      islands,
      values,
    }
  }
  const engine = constructEngine(args)

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
  console.dir(engine.values)
}
