import { Nullable, NullOr, UndefinedOr } from '@t3m4/utils/nullables'
import { Constants, Default_Config, ScriptArgs } from './types/script'
import { CallbackID, EventMap } from './types/events'
import { STRAT } from './types/constants/strats'
import { RESOLVED_MODE } from './types/constants/modes'
import { State as State_Obj } from './types/subscribers/state'
import { T3M4 as T_T3M4 } from './types/interface'

type NestedMap<T> = Map<string, NestedMap<T> | T>
type NestedObj<T> = { [key: string]: NestedObj<T> | T }

type State = Map<string, Map<string, string>>
type State_Modes = Map<string, string>
type Resolved_Modes = Map<string, RESOLVED_MODE>

type Schema = Map<string, Map<string, { options: Set<string>; preferred: string }>>
type Options = Map<string, Map<string, string[]>>

type Mode_Handling = {
  modes: Map<
    string,
    {
      facet: string
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
    deepMerge: {
      maps<T extends NullOr<State>[]>(...maps: T): T[number] extends null ? null : State {
        const result = new Map()

        for (const map of maps) {
          if (!map) continue

          for (const [key, value] of map.entries()) {
            if (result.has(key) && value instanceof Map && result.get(key) instanceof Map) {
              result.set(key, this.maps(result.get(key), value))
            } else {
              result.set(key, value)
            }
          }
        }

        return result as T[number] extends null ? null : State
      },
      objs(...states: T_T3M4['state'][]): T_T3M4['state'] {
        const result: T_T3M4['state'] = {}

        for (const state of states) {
          for (const island in state) {
            if (!result[island]) {
              result[island] = { ...state[island] }
            } else {
              result[island] = {
                ...result[island],
                ...state[island],
              }
            }
          }
        }

        return result
      },
    },
    deepConvert: {
      mapToObj(map: NestedMap<string>): NestedObj<string> {
        const obj: NestedObj<string> = {}

        map.forEach((value, key) => {
          if (value instanceof Map) obj[key] = this.mapToObj(value as NestedMap<string>)
          else obj[key] = value
        })

        return obj
      },
      objToMap(obj: Nullable<NestedObj<string>>): NestedMap<string> {
        const map = new Map<string, any>()
        if (!obj) return map

        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) map.set(key, this.objToMap(value as NestedObj<string>))
          else map.set(key, value)
        }

        return map
      },
    },
    deepEqual: {
      objects<T>(obj1: T, obj2: T): boolean {
        if (obj1 === obj2) return true

        if (obj1 instanceof Map && obj2 instanceof Map) return this.maps(obj1, obj2)

        if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) return false

        const keys1 = Object.keys(obj1) as (keyof T)[]
        const keys2 = Object.keys(obj2) as (keyof T)[]

        if (keys1.length !== keys2.length) return false

        for (const key of keys1) {
          if (!keys2.includes(key) || !this.objects(obj1[key], obj2[key])) return false
        }

        return true
      },
      maps<K, V>(map1: Nullable<Map<K, V>>, map2: Nullable<Map<K, V>>): boolean {
        if (!map1 || !map2) return false
        if (map1 === map2) return true
        if (map1.size !== map2.size) return false

        for (const [key, value] of map1) {
          if (!map2.has(key) || !this.objects(value, map2.get(key))) return false
        }

        return true
      },
    },
    parse<T = any>(json: NullOr<string>) {
      if (!json?.trim()) return undefined

      try {
        return JSON.parse(json) as T
      } catch (e) {
        return undefined
      }
    },
    isPlainObject(val: any) {
      return val !== null && typeof val === 'object' && !Array.isArray(val) && Object.prototype.toString.call(val) === '[object Object]'
    },
    construct: {
      modes(state: NullOr<State>) {
        const modes: State_Modes = new Map()

        for (const [island, facets] of state ?? []) {
          const modeFacet = Processor.mode.modes.get(island)?.facet
          if (modeFacet && facets.has(modeFacet)) {
            modes.set(island, facets.get(modeFacet)!)
          }
        }

        return modes
      },
      state(modes: State_Modes) {
        const partialState: State = new Map()

        for (const [island, value] of modes) {
          partialState.set(island, new Map())

          const modeFacet = Processor.mode.modes.get(island)?.facet
          if (modeFacet) partialState.get(island)!.set(modeFacet, value)
        }

        return partialState
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
              facet,
              strategy: strat,
              resolvedModes,
              systemMode,
              store: strat_obj.store ?? true,
              selectors: (typeof strat_obj.selector === 'string' ? [strat_obj.selector] : strat_obj.selector) ?? DEFAULT_CONFIG.mode.selector,
            })
          }
        }

        return mode
      },
      options(args: ScriptArgs) {
        const options: Options = new Map()

        for (const [island, facets] of Object.entries(args.config)) {
          const facetsOptions: NonNullable<ReturnType<Options['get']>> = new Map()

          for (const [facet, stratObj] of Object.entries(facets)) {
            
          }
        }
      }
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
      const parsed = utils.parse(json)
      if (!parsed) return Normalizer.of(new Map() as State)

      const isPlainObj = utils.isPlainObject(parsed)
      if (!isPlainObj) return Normalizer.of(new Map() as State)

      return Normalizer.of(utils.deepConvert.objToMap(parsed) as State)
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

    static normalizeModes(modes: NullOr<State_Modes>, fallbacks?: Nullable<State_Modes>) {
      const normalized: State_Modes = new Map()

      for (const [island, facets] of Processor.schema) {
        for (const [facet, { preferred }] of facets) {
          const isModeFacet = facet === Processor.mode.modes.get(island)?.facet
          if (!isModeFacet) continue

          const { store } = Processor.mode.modes.get(island)!
          if (!store) continue

          normalized.set(island, preferred)
        }
      }

      for (const [island, value] of fallbacks ?? []) {
        const isIsland = Normalizer.utils.isIsland(island)
        if (!isIsland) continue

        const { facet, store } = Processor.mode.modes.get(island)!

        const isOption = Normalizer.utils.isOption(island, facet, value)
        if (!isOption) continue
        if (!store) continue

        normalized.set(island, value)
      }

      for (const [island, value] of modes ?? []) {
        const isIsland = Normalizer.utils.isIsland(island)
        if (!isIsland) continue

        const { facet, store } = Processor.mode.modes.get(island)!

        const isOption = Normalizer.utils.isOption(island, facet, value)
        if (!isOption) continue
        if (!store) continue

        normalized.set(island, value)
      }

      return normalized
    }

    normalize(provFallbacks?: Nullable<string | State>) {
      const normalized: State = new Map()

      const fallbacks = typeof provFallbacks === 'string' ? (utils.deepConvert.objToMap(JSON.parse(provFallbacks)) as State) : (provFallbacks ?? (new Map() as State))

      for (const [island, facets] of Processor.schema) {
        normalized.set(island, new Map())

        for (const [facet, { preferred }] of facets) {
          normalized.get(island)!.set(facet, preferred)
        }
      }

      for (const [island, facets] of fallbacks) {
        for (const [facet, fallback] of facets) {
          const { isOption, normalized: normValue } = Normalizer.normalize({ island, facet, value: fallback })
          if (isOption) {
            normalized.get(island)!.set(facet, normValue)
          }
        }
      }

      for (const [island, facets] of this.values) {
        for (const [facet, value] of facets) {
          const { isOption, normalized: normValue } = Normalizer.normalize({ island, facet, value, fallback: fallbacks.get(island)?.get(facet) })
          if (isOption) {
            normalized.get(island)!.set(facet, normValue)
          }
        }
      }

      return normalized
    }
  }

  // #region STORAGE MANAGER
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
        const newState = utils.deepMerge.maps(currState, state)

        const currStorageState = StorageManager.utils.retrieve(Processor.storageKey)
        const storageNeedsUpdate = currStorageState !== JSON.stringify(utils.deepConvert.mapToObj(newState))
        if (storageNeedsUpdate) StorageManager.utils.store(Processor.storageKey, JSON.stringify(utils.deepConvert.mapToObj(newState)))

        const stateNeedsUpdate = !utils.deepEqual.maps(currState, newState)
        if (stateNeedsUpdate) Main.state = newState
      },
      modes(modes: UndefinedOr<Map<string, string>>) {
        if (!modes) return
        if (!Processor.mode) return
        if (!Processor.mode.store) return

        const currState = Main.state
        const currStateModes: State_Modes = new Map()

        for (const [island, facets] of currState ?? []) {
          const modeFacet = Processor.mode.modes.get(island)?.facet
          if (modeFacet && facets.has(modeFacet)) {
            currStateModes.set(island, facets.get(modeFacet)!)
          }
        }

        const stringModes = JSON.stringify(utils.deepConvert.mapToObj(modes))
        const storageCurrMode = StorageManager.utils.retrieve(Processor.mode.storageKey)

        const storageNeedsUpdate = stringModes !== storageCurrMode
        if (storageNeedsUpdate) StorageManager.utils.store(Processor.mode!.storageKey, stringModes)

        const partialState = utils.construct.state(modes)

        const stateNeedsUpdate = !utils.deepEqual.maps(currState, partialState)
        if (stateNeedsUpdate) Main.state = partialState
      },
    }

    public static get state() {
      const stateString = StorageManager.utils.retrieve(Processor.storageKey)
      const normalized = Normalizer.ofJSON(stateString).normalize()
      return normalized
    }

    private static set state(state: State) {
      StorageManager.store.state(state)
    }

    private static set modes(modes: UndefinedOr<State_Modes>) {
      StorageManager.store.modes(modes)
    }

    public static init() {
      if (!StorageManager.instance) StorageManager.instance = new StorageManager()
    }

    private constructor() {
      EventManager.on('State:update', 'StorageManager:state:update', (state) => {
        StorageManager.state = utils.deepConvert.objToMap(state) as State
        StorageManager.modes = utils.construct.modes(utils.deepConvert.objToMap(state) as State)
      })

      StorageManager.controller = new AbortController()
      window.addEventListener(
        'storage',
        ({ key, newValue, oldValue }) => {
          // prettier-ignore
          switch (key) {
            case Processor.storageKey: {
              const normalized = Normalizer.ofJSON(newValue).normalize(oldValue)
              StorageManager.state = normalized
            }; break
            case Processor.mode.storageKey: {
              if (!Processor.mode.store) return
              
              const parsedNew = utils.parse(newValue)
              const newModes = utils.isPlainObject(parsedNew) ? utils.deepConvert.objToMap(parsedNew) as State_Modes : null

              const parsedOld = utils.parse(oldValue)
              const oldModes = utils.isPlainObject(parsedOld) ? utils.deepConvert.objToMap(utils.parse(oldValue)) as State_Modes : null

              const normalized = Normalizer.normalizeModes(newModes, oldModes)
              StorageManager.modes = normalized
            }; break
          }
        },
        { signal: StorageManager.controller.signal }
      )
    }
  }

  class DomManager {
    private static instance: UndefinedOr<DomManager>
    private static systemPref: UndefinedOr<RESOLVED_MODE>
    private static observers: {
      attrs: UndefinedOr<MutationObserver>
    } = {
      attrs: undefined,
    }

    public static utils = {
      disableTransitions() {
        const css = document.createElement('style')
        if (Processor.nonce) css.setAttribute('nonce', Processor.nonce)
        css.appendChild(document.createTextNode(`*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`))
        document.head.appendChild(css)

        return () => {
          ;(() => window.getComputedStyle(document.body))()
          setTimeout(() => document.head.removeChild(css), 1)
        }
      },
      getSystemPref() {
        if (!DomManager.systemPref) {
          const supportsPref = window.matchMedia('(prefers-color-scheme)').media !== 'not all'
          DomManager.systemPref = supportsPref ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? MODES.DARK : MODES.LIGHT) : undefined
        }

        return DomManager.systemPref
      },
      findIslands(island: string, scopes?: Set<HTMLElement>) {
        const selector = `[data-island="${island}"]`

        if (scopes) {
          const results: Set<HTMLElement> = new Set()

          scopes.forEach((scope) => {
            if (scope.matches(selector)) results.add(scope)

            const matches = scope.querySelectorAll<HTMLElement>(selector)
            matches.forEach((el) => results.add(el))
          })

          return results
        }

        return new Set(document.querySelectorAll<HTMLElement>(selector))
      },
      resolveMode(island: string, mode: string) {
        if (!Processor.mode.modes.has(island)) return

        const isSystemStrat = Processor.mode.modes.get(island)!.strategy === STRATS.SYSTEM
        const isSystemMode = Processor.mode.modes.get(island)!.systemMode?.name === mode
        const isSystem = isSystemStrat && isSystemMode
        const fallbackMode = Processor.mode.modes.get(island)!.systemMode?.fallback
        if (isSystem) return DomManager.utils.getSystemPref() ?? Processor.mode.modes.get(island)?.resolvedModes.get(fallbackMode!)

        return Processor.mode.modes.get(island)!.resolvedModes.get(mode)
      },
      resolveModes(modes: State_Modes) {
        const resolvedModes: Resolved_Modes = new Map()

        for (const [island, mode] of modes) {
          const resolvedMode = DomManager.utils.resolveMode(island, mode)
          if (resolvedMode) resolvedModes.set(island, resolvedMode)
        }
        
        return resolvedModes
      }
    }

    private static apply = {
      state(state: NullOr<State>, nodes?: Set<HTMLElement>) {
        if (!state) return

        state.forEach((facets, island) => {
          const targets = DomManager.utils.findIslands(island, nodes)

          facets.forEach((value, facet) => {
            targets.forEach((n) => {
              const currValue = n.getAttribute(`data-${facet}`)
              const needsUpdate = currValue !== value
              if (needsUpdate) n.setAttribute(`data-${facet}`, value)
            })
          })
        })

        const currState = Main.state
        const newState = utils.deepMerge.maps(currState, state)

        const needsUpdate = !utils.deepEqual.maps(currState, newState)
        if (needsUpdate) Main.state = newState
      },
      resolvedModes(modes: Resolved_Modes) {
        modes.forEach((mode, island) => {
          if (!Processor.mode.modes.has(island)) return
          if (!mode) return

          const islands = DomManager.utils.findIslands(island)

          if (Processor.mode.modes.get(island)!.selectors.includes(SELECTORS.COLOR_SCHEME)) {
            islands.forEach((i) => {
              const currValue = i.style.colorScheme
              const needsUpdate = currValue !== mode
              if (needsUpdate) i.style.colorScheme = mode
            })
          }

          if (Processor.mode.modes.get(island)!.selectors.includes(SELECTORS.CLASS)) {
            islands.forEach((i) => {
              const isSet = i.classList.contains(MODES.LIGHT) ? MODES.LIGHT : i.classList.contains(MODES.DARK) ? MODES.DARK : undefined
              if (isSet === mode) return

              const other = mode === MODES.LIGHT ? MODES.DARK : MODES.LIGHT
              i.classList.replace(other, mode) || i.classList.add(mode)
            })
          }

          if (Processor.mode.modes.get(island)!.selectors.includes(SELECTORS.DATA_ATTRIBUTE)) {
            islands.forEach((i) => {
              const currValue = i.getAttribute('data-color-scheme')
              const needsUpdate = currValue !== mode
              if (needsUpdate) i.setAttribute('data-color-scheme', mode)
            })
          }
        })

        const currModes = Main.resolvedModes
        const needsUpdate = utils.deepEqual.maps(currModes, modes)
        if (needsUpdate) Main.resolvedModes = modes
      },
    }

    private static initObservers = {
      attrs() {
        const handler = (mutations: MutationRecord[]) => {
          for (const mutation of mutations) {
            const state = Main.state

            // const target = mutation.target as HTMLElement
            // if (target) {
            //   const islandName = target.getAttribute('data-island')
            //   if (!islandName) continue
            //   if (!Processor.islands.has(islandName)) continue

            //   console.log(mutation)
            //   DomManager.apply.state(state, new Set([target]))
            // }

            const addedNodes = new Set<HTMLElement>(mutation.addedNodes as NodeListOf<HTMLElement>)
            const islandNodes = new Set<HTMLElement>()
            if (addedNodes.size !== 0) {
              for (const node of addedNodes) {
                if (!(node instanceof HTMLElement)) continue

                const islandName = node.getAttribute('data-island')
                if (!islandName) continue
                if (!Processor.islands.has(islandName)) continue

                islandNodes.add(node)
              }

              DomManager.apply.state(state, islandNodes)
            }
          }
        }

        DomManager.observers.attrs = new MutationObserver(handler)
        DomManager.observers.attrs.observe(document.documentElement, { subtree: true, attributes: true, childList: true, attributeOldValue: true })
      },
    }

    private static set state(state: State) {
      const enableTransitions = Processor.disableTransitionOnChange ? DomManager.utils.disableTransitions() : undefined
      DomManager.apply.state(state)

      const modes = utils.construct.modes(state)

      const resolvedModes: Resolved_Modes = new Map()
      for (const [island, mode] of modes) {
        const resolvedMode = DomManager.utils.resolveMode(island, mode)
        if (resolvedMode) resolvedModes.set(island, resolvedMode)
      }
      DomManager.apply.resolvedModes(resolvedModes)

      enableTransitions?.()
    }

    private static set resolvedModes(modes: Resolved_Modes) {
      if (Array.from(modes.keys()).length === 0) return

      const enableTransitions = Processor.disableTransitionOnChange ? DomManager.utils.disableTransitions() : undefined
      DomManager.apply.resolvedModes(modes)
      enableTransitions?.()
    }

    public static init() {
      if (!DomManager.instance) DomManager.instance = new DomManager()
    }

    private constructor() {
      EventManager.on('State:update', 'DOMManager:state:update', (state) => (DomManager.state = utils.deepConvert.objToMap(state) as State))
      EventManager.on('ResolvedModes:update', 'DOMManager:resolvedMode:update', (modes) => (DomManager.resolvedModes = utils.deepConvert.objToMap(modes) as Resolved_Modes))

      DomManager.initObservers.attrs()
      // DomManager.initForceAttrsHandling()
    }
  }

  // #region MAIN
  class Main {
    private static instance: UndefinedOr<Main>

    public static init() {
      if (!Main.instance) Main.instance = new Main()
    }

    public static get state(): NullOr<State> {
      return Main.instance?.state ?? null
    }

    public static set state(state: State) {
      if (!Main.instance) return

      const currState = Main.state
      const newState = utils.deepMerge.maps(currState, state)

      const needsUpdate = !utils.deepEqual.maps(currState, newState)
      if (needsUpdate) {
        Main.instance.state = newState
        EventManager.emit('State:update', utils.deepConvert.mapToObj(newState) as State_Obj)
      }

      // const resolvedMode = DOMManager.resolveMode(newState)
      // Main.resolvedMode = resolvedMode
    }

    public static get resolvedModes() {
      return Main.instance?.resolvedModes
    }

    public static set resolvedModes(modes) {
      if (!Main.instance) return
      if (!modes) return

      const currModes = Main.resolvedModes

      const needsUpdate = utils.deepEqual.maps(currModes, modes)
      if (!needsUpdate) return

      Main.instance.resolvedModes = modes
      EventManager.emit('ResolvedModes:update', utils.deepConvert.mapToObj(modes) as T_T3M4['resolvedModes'])
    }

    public static get options() {
      return Processor.options
    }

    private forcedState: UndefinedOr<State>
    private state: UndefinedOr<State>
    private resolvedModes: UndefinedOr<Resolved_Modes>

    private constructor() {
      StorageManager.init()
      DomManager.init()

      const state = StorageManager.state
      this.state = state
      EventManager.emit('State:update', utils.deepConvert.mapToObj(state) as T_T3M4['state'])

      const stateModes = utils.construct.modes(state)
      const resolvedModes = DomManager.utils.resolveModes(stateModes)
      this.resolvedModes = resolvedModes
      EventManager.emit('ResolvedModes:update', utils.deepConvert.mapToObj(resolvedModes) as T_T3M4['resolvedModes'])
    }
  }

  // #region T3M4
  class T3M4 {
    public static get state(): T_T3M4['state'] {
      return utils.deepConvert.mapToObj(Main.state!) as T_T3M4['state']
    }

    public static update = {
      state(island: string, state: T_T3M4['state'][keyof T_T3M4['state']]) {
        const currState = T3M4.state
        const newState = utils.deepMerge.objs(currState, { [island]: state })

        Main.state = utils.deepConvert.objToMap(newState) as State
      }
    }

    public static get resolvedModes() {
      return utils.deepConvert.mapToObj(Main.resolvedModes!) as T_T3M4['resolvedModes']
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

  Main.init()
  window.T3M4 = T3M4
}
