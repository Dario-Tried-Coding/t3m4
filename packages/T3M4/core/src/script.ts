import { Nullable, NullOr, UndefinedOr } from '@t3m4/utils/nullables'
import { Constants, Default_Config, ScriptArgs } from './types/script'
import { CallbackID, EventMap } from './types/events'
import { STRAT } from './types/constants/strats'
import { RESOLVED_MODE } from './types/constants/modes'
import { State as State_Obj } from './types/subscribers/state'

type NestedMap<T> = Map<string, NestedMap<T> | T>
type NestedObj<T> = { [key: string]: NestedObj<T> | T }

type State = Map<string, Map<string, string>>
type Schema = Map<string, Map<string, { options: Set<string>; preferred: string }>>

type Mode_Handling = {
  modes: Map<
    string,
    {
      strategy: STRAT
      resolvedModes: Map<string, RESOLVED_MODE>
      systemMode: UndefinedOr<{ name: string; fallback: string }>
      store: boolean
      selectors: Constants['SELECTORS'][keyof Constants['SELECTORS']][]
    }
  >
  storageKey: string
  store: boolean
}
type Mode = NonNullable<ReturnType<Mode_Handling['modes']['get']>>

export function script(args: ScriptArgs) {
  // #region CONSTANTS
  const { DEFAULT, MODES, FACETS, STRATS, SELECTORS } = {
    DEFAULT: 'default',
    STRATS: {
      MONO: 'mono',
      MULTI: 'multi',
      LIGHT_DARK: 'light-dark',
      SYSTEM: 'system',
    },
    MODES: {
      LIGHT: 'light',
      DARK: 'dark',
      SYSTEM: 'system',
    },
    FACETS: {
      GENERIC: 'facet',
      MODE: 'mode',
    },
    SELECTORS: {
      CLASS: 'class',
      COLOR_SCHEME: 'color-scheme',
      DATA_ATTRIBUTE: 'data-attribute',
    },
  } as const satisfies Constants

  // #region CONFIG
  const DEFAULT_CONFIG = {
    storageKey: 'T3M4',
    mode: {
      storageKey: 'theme',
      store: false,
      selector: [],
    },
    nonce: '',
    disableTransitionOnChange: false,
  } as const satisfies Default_Config

  // #region UTILS
  const utils = {
    deepMerge<T extends NullOr<State>[]>(...maps: T): T[number] extends null ? null : State {
      const result = new Map()

      for (const map of maps) {
        if (!map) continue

        for (const [key, value] of map.entries()) {
          if (result.has(key) && value instanceof Map && result.get(key) instanceof Map) {
            result.set(key, this.deepMerge(result.get(key), value))
          } else {
            result.set(key, value)
          }
        }
      }

      return result as T[number] extends null ? null : State
    },
    deepMapToObj(map: NestedMap<string>): NestedObj<string> {
      const obj: NestedObj<string> = {}

      map.forEach((value, key) => {
        if (value instanceof Map) obj[key] = this.deepMapToObj(value as NestedMap<string>)
        else obj[key] = value
      })

      return obj
    },
    deepObjToMap(obj: NestedObj<string>): NestedMap<string> {
      const map = new Map<string, any>()

      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) map.set(key, this.deepObjToMap(value as NestedObj<string>))
        else map.set(key, value)
      }

      return map
    },
    deepEqual: {
      objects<T>(obj1: T, obj2: T): boolean {
        if (obj1 === obj2) {
          return true
        }

        if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
          return false
        }

        const keys1 = Object.keys(obj1) as (keyof T)[]
        const keys2 = Object.keys(obj2) as (keyof T)[]

        if (keys1.length !== keys2.length) {
          return false
        }

        for (const key of keys1) {
          if (!keys2.includes(key) || !this.objects(obj1[key], obj2[key])) {
            return false
          }
        }

        return true
      },
      maps<K, V>(map1: NullOr<Map<K, V>>, map2: NullOr<Map<K, V>>): boolean {
        if (!map1 || !map2) return false
        if (map1 === map2) return true
        if (map1.size !== map2.size) return false

        for (const [key, value] of map1) {
          if (!map2.has(key) || !this.objects(value, map2.get(key))) return false
        }

        return true
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

    // Metodo per rimuovere tutti gli eventi
    public static dispose() {
      EventManager.events.clear()
    }
  }

  // #region PROCESSOR
  class Processor {
    private static instance: UndefinedOr<Processor> = undefined
    private static _args: ScriptArgs = args

    private static process = {
      islands(args: ScriptArgs) {
        const islands: Processor['_islands'] = new Set(Object.keys(args.config))
        return islands
      },
      schema(args: ScriptArgs) {
        const options_map: Processor['_schema'] = new Map()

        for (const [island, facets] of Object.entries(args.schema)) {
          const facets_map: NonNullable<ReturnType<Schema['get']>> = new Map()

          for (const [facet, opt] of Object.entries(facets)) {
            const preferred: NonNullable<ReturnType<(typeof facets_map)['get']>>['preferred'] = args.config[island]![facet]!.preferred

            const opt_set: NonNullable<ReturnType<(typeof facets_map)['get']>>['options'] = new Set()
            const strat = args.config[island]![facet]!.strategy

            if (opt === true) {
              // prettier-ignore
              switch (strat) {
                case STRATS.MONO: opt_set.add(DEFAULT); break;
                case STRATS.LIGHT_DARK: Object.values(MODES).filter((m) => m !== MODES.SYSTEM).forEach((m) => opt_set.add(m)); break;
                case STRATS.SYSTEM: Object.values(MODES).forEach((m) => opt_set.add(m)); break;
                default: break;
              }
            }
            if (typeof opt === 'string') opt_set.add(opt)
            if (Array.isArray(opt)) opt.forEach((o) => opt_set.add(o))
            if (typeof opt === 'object' && !Array.isArray(opt)) {
              opt_set.add(opt.light ?? MODES.LIGHT)
              opt_set.add(opt.dark ?? MODES.DARK)
              if (strat === STRATS.SYSTEM) opt_set.add((opt as { system: string }).system ?? MODES.SYSTEM)
              if ('custom' in opt) opt.custom?.forEach((cm) => opt_set.add(cm))
            }

            facets_map.set(facet, { options: opt_set, preferred: preferred })
          }

          options_map.set(island, facets_map)
        }

        return options_map
      },
      mode(args: ScriptArgs) {
        const mode = {
          modes: new Map(),
          storageKey: args.mode?.storageKey ?? DEFAULT_CONFIG.mode.storageKey,
          store: args.mode?.store ?? DEFAULT_CONFIG.mode.store,
        } as Mode_Handling

        for (const [island, facets] of Object.entries(args.config)) {
          for (const [facet, strat_obj] of Object.entries(facets)) {
            if (strat_obj.type !== FACETS.MODE) continue

            // resolvedModes
            const resolvedModes: Mode['resolvedModes'] = new Map()
            const strat = strat_obj.strategy
            const opt = args.schema[island]![facet]!

            // prettier-ignore
            switch (strat) {
              case (STRATS.MONO): resolvedModes.set(strat_obj.preferred, strat_obj.colorScheme); break;
              case (STRATS.MULTI): Object.entries(strat_obj.colorSchemes).forEach(([mode, cs]) => resolvedModes.set(mode, cs)); break;
              case (STRATS.LIGHT_DARK):
              case (STRATS.SYSTEM): {

                if (opt === true) {
                  resolvedModes.set(MODES.LIGHT, MODES.LIGHT)
                  resolvedModes.set(MODES.DARK, MODES.DARK)
                }

                if (typeof opt === 'object' && !Array.isArray(opt)) {
                  resolvedModes.set(opt.light ?? MODES.LIGHT, MODES.LIGHT)
                  resolvedModes.set(opt.dark ?? MODES.DARK, MODES.DARK)
                  if ((strat_obj as {colorSchemes: Record<string, RESOLVED_MODE>}).colorSchemes) Object.entries(strat_obj.colorSchemes ?? []).forEach(([mode, cs]) => resolvedModes.set(mode, cs))
                }
              }
            }

            // systemMode
            let systemMode: Mode['systemMode'] = undefined
            if (strat === STRATS.SYSTEM) {
              if (opt === true || (typeof opt === 'object' && !Array.isArray(opt))) {
                systemMode = {
                  name: opt === true ? MODES.SYSTEM : ((opt as { system: string }).system ?? MODES.SYSTEM),
                  fallback: strat_obj.fallback,
                }
              }
            }

            mode.modes.set(island, {
              strategy: strat,
              resolvedModes,
              systemMode,
              store: strat_obj.store ?? false,
              selectors: (typeof strat_obj.selector === 'string' ? [strat_obj.selector] : strat_obj.selector) ?? DEFAULT_CONFIG.mode.selector,
            })
          }
        }

        return mode
      },
    }

    public static getInstance() {
      if (!Processor.instance) Processor.instance = new Processor()
      return Processor.instance
    }

    public static needsReboot(args: ScriptArgs) {
      if (utils.deepEqual.objects(args, Processor._args)) return

      return () => {
        Processor._args = args
        Processor.instance = new Processor()
      }
    }

    public static get storageKey() {
      return Processor.getInstance()._storageKey
    }

    public static get islands() {
      return Processor.getInstance()._islands
    }

    public static get schema() {
      return Processor.getInstance()._schema
    }

    public static get mode() {
      return Processor.getInstance()._mode
    }

    public static get nonce() {
      return Processor.getInstance()._nonce
    }

    public static get disableTransitionOnChange() {
      return Processor.getInstance()._disableTransitionOnChange
    }

    private _storageKey: string
    private _islands: Set<string>
    private _schema: Schema
    private _mode: Mode_Handling
    private _nonce: string
    private _disableTransitionOnChange: boolean

    private constructor() {
      this._storageKey = Processor._args.storageKey ?? DEFAULT_CONFIG.storageKey
      this._islands = Processor.process.islands(Processor._args)
      this._schema = Processor.process.schema(Processor._args)
      this._mode = Processor.process.mode(Processor._args)
      this._nonce = Processor._args.nonce ?? DEFAULT_CONFIG.nonce
      this._disableTransitionOnChange = Processor._args.disableTransitionOnChange ?? DEFAULT_CONFIG.disableTransitionOnChange
    }
  }

  class Normalizer {
    private values: State = new Map()

    private constructor() {}

    static ofJSON(json: NullOr<string>) {
      return Normalizer.of(utils.deepObjToMap(JSON.parse(json ?? '')) as State)
    }

    static ofMap(values: State) {
      return Normalizer.of(values)
    }

    private static of(values: State) {
      const normalizer = new Normalizer()
      normalizer.values = values
      return normalizer
    }

    private static utils = {
      isIsland(value: string) {
        return Processor.islands.has(value)
      },
      isFacet(island: string, value: string) {
        return Processor.schema.get(island)?.has(value) ?? false
      },
      isOption(island: string, facet: string, value?: NullOr<string>) {
        if (!value) return false
        return Processor.schema.get(island)?.get(facet)?.options?.has(value) ?? false
      },
    }

    static normalize({ island, facet, value, fallback }: { island: string; facet: string; value: NullOr<string>; fallback?: NullOr<string> }) {
      const isIsland = Normalizer.utils.isIsland(island)
      if (!isIsland) return { isIsland: false, isFacet: undefined, isOption: undefined, normalized: undefined }

      const isFacet = Normalizer.utils.isFacet(island, facet)
      if (!isFacet) return { isIsland: false, isFacet: false, isOption: undefined, normalized: undefined }

      const isOption = Normalizer.utils.isOption(island, facet, value)
      const isFallbackOption = Normalizer.utils.isOption(island, facet, fallback)
      const preferred = Processor.schema.get(island)!.get(facet)!.preferred

      const normalized = isOption ? value! : isFallbackOption ? fallback! : preferred

      return { isIsland: true, isFacet: true, isOption, normalized }
    }

    normalize(provFallbacks?: Nullable<string | State>) {
      const results: Map<string, Map<string, { isOption: UndefinedOr<boolean>; normalized: UndefinedOr<string> }>> = new Map()
      const normalized: State = new Map()

      const fallbacks = typeof provFallbacks === 'string' ? (utils.deepObjToMap(JSON.parse(provFallbacks)) as State) : (provFallbacks ?? (new Map() as State))

      for (const [island, facets] of Processor.schema) {
        results.set(island, new Map())
        normalized.set(island, new Map())

        for (const [facet, { preferred }] of facets) {
          results.get(island)!.set(facet, { isOption: false, normalized: preferred })
          normalized.get(island)!.set(facet, preferred)
        }
      }

      for (const [island, facets] of fallbacks) {
        const initialized = !!results.get(island)
        if (!initialized) results.set(island, new Map())

        for (const [facet, fallback] of facets) {
          const { isOption, normalized: normValue } = Normalizer.normalize({ island, facet, value: fallback })
          if (isOption) {
            results.get(island)!.set(facet, { isOption, normalized: normValue })
            normalized.get(island)!.set(facet, normValue)
          }
        }
      }

      for (const [island, facets] of this.values) {
        const initialized = !!results.get(island)
        if (!initialized) results.set(island, new Map())

        for (const [facet, value] of facets) {
          const { isOption, normalized: normValue } = Normalizer.normalize({ island, facet, value, fallback: fallbacks.get(island)?.get(facet) })
          if (isOption) {
            results.get(island)!.set(facet, { isOption, normalized: normValue })
            normalized.get(island)!.set(facet, normValue)
          }
        }
      }

      const isFullyValid = Array.from(results.values()).every((facets) => Array.from(facets.values()).every(({ isOption }) => isOption))

      return {
        passed: isFullyValid,
        normalized,
        results,
      }
    }
  }

  class StorageManager {
    private static instance: UndefinedOr<StorageManager>
    private static isInternalChange = false
    private static controller: AbortController

    private static utils = {
      retrieve(storageKey: string) {
        return window.localStorage.getItem(storageKey)
      },
      store(storageKey: string, string: string) {
        StorageManager.isInternalChange = true
        window.localStorage.setItem(storageKey, string)
        StorageManager.isInternalChange = false
      },
    }

    private static store = {
      state(state: State) {
        const currState = Main.state
        const newState = utils.deepMerge(currState, state)

        const currStorageState = StorageManager.utils.retrieve(Processor.storageKey)
        const storageNeedsUpdate = currStorageState !== JSON.stringify(utils.deepMapToObj(newState))
        if (storageNeedsUpdate) StorageManager.utils.store(Processor.storageKey, JSON.stringify(utils.deepMapToObj(newState)))

        const stateNeedsUpdate = !utils.deepEqual.maps(currState, newState)
        if (stateNeedsUpdate) Main.state = newState
      },
      modes(modes: UndefinedOr<Map<string, string>>) {
        if (!modes) return
        if (!Processor.mode) return
        if (!Processor.mode.store) return

        const currState = Main.state
        const stateCurrModes = currState ? Object.fromEntries(currState) : {}
        const storageCurrMode = StorageManager.utils.retrieve(Processor.mode.storageKey)

        const storageNeedsUpdate = storageCurrMode !== mode
        if (storageNeedsUpdate) StorageManager.utils.store(Processor.mode!.storageKey, mode)

        const stateNeedsUpdate = stateCurrMode !== mode
        if (stateNeedsUpdate) Main.state = new Map([[Processor.mode.prop, mode]])
      },
    }
  }

  // #region MAIN
  class Main {
    private static instance: UndefinedOr<Main>

    public static get state(): NullOr<State> {
      return Main.instance?.state ?? null
    }

    public static set state(state: State) {
      if (!Main.instance) return

      const currState = Main.state
      const newState = utils.deepMerge(currState, state)

      const needsUpdate = !utils.deepEqual.maps(currState, newState)
      if (needsUpdate) {
        Main.instance.state = newState
        EventManager.emit('State:update', utils.deepMapToObj(newState) as State_Obj)
      }

      // const resolvedMode = DOMManager.resolveMode(newState)
      // Main.resolvedMode = resolvedMode
    }

    private forcedState: UndefinedOr<State>
    private state: UndefinedOr<State>
    private resolvedMode: UndefinedOr<string>

    private constructor() {}
  }

  // #region T3M4
  class T3M4 {
    public static get state() {
      // return Main.state!
      return null as unknown as { [island: string]: { [facet: string]: string } }
    }

    // public static set state(values: State) {
    //   Main.state = values
    // }

    public static get resolvedMode() {
      // return Main.resolvedMode
      return undefined
    }

    public static get options() {
      // return Main.options
      return {}
    }

    public static subscribe<E extends keyof EventMap>(e: E, id: CallbackID, cb: (payload: EventMap[E]) => void) {
      EventManager.on(e, id, cb)
    }

    public static reboot(args: ScriptArgs) {
      // Main.reboot(args)
    }
  }

  window.T3M4 = T3M4
}
