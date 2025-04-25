import { Nullable } from '@t3m4/utils/nullables'
import { T3M4 as T_T3M4 } from './types'
import { CallbackID, EventMap } from './types/events'
import { Constructed_Script_Args } from './types/script'
import { STRAT } from './types/constants/strats'
import { Opt } from './types/subscribers/schema'
import { Strat_To_Opt } from './types/script/miscellaneous'
import { SELECTOR } from './types/constants/selectors'
import { COLOR_SCHEME } from './types/constants/color-schemes'

// #region TYPES
type NestedMap<T> = Map<string, NestedMap<T> | T>
type NestedObj<T> = { [key: string]: NestedObj<T> | T }

type Island_State = Map<string, string>
type State = Map<string, Island_State>

type State_Obj = NonNullable<ReturnType<T_T3M4['get']['state']['base']['all']>>
type Island_State_Obj = State_Obj[keyof State_Obj]
type Island_State_Obj_Facet = Island_State_Obj[keyof Island_State_Obj]

type Island_State_Color_Scheme = COLOR_SCHEME
type State_Color_Schemes = Map<string, Island_State_Color_Scheme>

type State_Color_Schemes_Obj = NonNullable<ReturnType<T_T3M4['get']['colorSchemes']['all']>>

type State_Modes = Map<string, string>
type State_Modes_Obj = Record<string, string>
type State_Mode = State_Modes_Obj[keyof State_Modes_Obj]

type Options = Map<string, Map<string, Set<string>>>
type Options_Obj = NonNullable<ReturnType<T_T3M4['get']['options']['all']>>
type Island_Options_Obj = Options_Obj[keyof Options_Obj]
type Island_Options_Obj_Facet = Island_Options_Obj[keyof Island_Options_Obj]

type Preferred = Map<string, Map<string, string>>

type Mode_Handling = {
  facet: string
  strategy: STRAT
  resolvedModes: Map<string, COLOR_SCHEME>
  systemMode: { name: string; fallback: string } | undefined
  store: boolean
  selectors: SELECTOR[]
}
type Modes_Handling = {
  modes: Map<string, Mode_Handling>
  storageKey: string
  store: boolean
}

export function script(args: Constructed_Script_Args) {
  const {
    constants: { STRATS, MODES, DEFAULT, FACETS },
    preset,
  } = args

  // #region UTILS
  const utils = {
    miscellaneous: {
      getSystemPref() {
        const supportsPref = window.matchMedia('(prefers-color-scheme)').media !== 'not all'
        const systemPref = supportsPref ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? MODES.DARK : MODES.LIGHT) : undefined
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
    deepConvert: {
      mapToObj<T extends string | Set<string> = string>(map: NestedMap<T>): T extends Set<infer M> ? NestedObj<M[]> : NestedObj<T> {
        const obj: any = {}

        map.forEach((value, key) => {
          if (value instanceof Map) obj[key] = this.mapToObj(value)
          else if (value instanceof Set) obj[key] = Array.from(value)
          else obj[key] = value
        })

        return obj
      },
      objToMap<T extends string | string[]>(obj: NestedObj<T>): T extends (infer M)[] ? NestedMap<Set<M>> : NestedMap<T> {
        const map = new Map()
        if (!obj) return map as T extends (infer M)[] ? NestedMap<Set<M>> : NestedMap<T>

        for (const [key, value] of Object.entries(obj)) {
          if (Array.isArray(value)) map.set(key, new Set(value))
          else if (typeof value === 'object') map.set(key, this.objToMap(value as any))
          else map.set(key, value)
        }

        return map as T extends (infer M)[] ? NestedMap<Set<M>> : NestedMap<T>
      },
    },
    construct: {
      modes: {
        /** ATTENTION!!! To get back the entirety of modes, provide a complete State instance. Not a partial. */
        fromState(state: State) {
          const modes: State_Modes = new Map()

          for (const [island, facets] of state) {
            const islandMode = Processor.mode.modes.get(island)?.facet
            if (!islandMode) continue

            const stateIslandHasMode = facets.has(islandMode)
            if (!stateIslandHasMode) continue

            modes.set(island, islandMode)
          }

          return modes
        },
        preferred() {
          const modes: State_Modes = new Map()

          for (const [island, facets] of Processor.preferred) {
            const islandModeFacet = Processor.mode.modes.get(island)?.facet
            if (!islandModeFacet) continue

            const preferredMode = facets.get(islandModeFacet)!
            modes.set(island, preferredMode)
          }

          return modes
        },
      },
      colorSchemes: {
        /** ATTENTION!!! To get back the entitirety of color schemes, provide a complete State instance. Not a partial. */
        fromState(state: State) {
          const modes = utils.construct.modes.fromState(state)
          const colorSchemes = utils.resolve.colorSchemes(modes)
          return colorSchemes
        },
        preferred() {
          const prefModes = utils.construct.modes.preferred()
          const colorSchemes = utils.resolve.colorSchemes(prefModes)
          return colorSchemes
        }
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
        if (!Processor.mode.modes.has(island)) return

        const isSystemStrat = Processor.mode.modes.get(island)!.strategy === STRATS.SYSTEM
        const isSystemMode = Processor.mode.modes.get(island)!.systemMode?.name === mode
        const isSystem = isSystemStrat && isSystemMode
        const fallbackMode = Processor.mode.modes.get(island)!.systemMode?.fallback
        if (isSystem) return utils.miscellaneous.getSystemPref() ?? Processor.mode.modes.get(island)?.resolvedModes.get(fallbackMode!)

        return Processor.mode.modes.get(island)!.resolvedModes.get(mode)
      },
    },
    isValid: {
      value: {
        island(value: string) {
          return Processor.islands.has(value)
        },
        facet(island: string, value: string) {
          return Processor.options.get(island)?.has(value) ?? false
        },
        option(island: string, facet: string, value: string) {
          return Processor.options.get(island)?.get(facet)?.has(value) ?? false
        },
        mode(island: string, value: string) {
          const facetName = Processor.mode.modes.get(island)?.facet
          if (!facetName) return false

          return Processor.options.get(island)!.get(facetName)!.has(value)
        },
      },
      structure: {
        serializedState(obj: Record<string, unknown>): obj is State_Obj {
          for (const outerValue of Object.values(obj)) {
            if (!utils.isValid.type.plainObject(outerValue)) return false

            for (const [key, innerValue] of Object.entries(outerValue)) {
              if (typeof key !== 'string' || typeof innerValue !== 'string') return false
            }
          }

          return true
        },
        serializedModes(obj: Record<string, unknown>): obj is State_Modes_Obj {
          for (const value of Object.values(obj)) {
            if (typeof value !== 'string') return false
          }

          return true
        },
      },
      type: {
        string(value: unknown): value is string {
          return typeof value === 'string'
        },
        plainObject(val: unknown): val is Record<string, unknown> {
          return val !== null && val !== undefined && typeof val === 'object' && !Array.isArray(val) && Object.prototype.toString.call(val) === '[object Object]'
        },
      },
    },
    sanitize: {
      state: {
        facet(island: string, facet: string, value: string, fallback?: string) {
          const isIsland = utils.isValid.value.island(island)
          if (!isIsland) return

          const isFacet = utils.isValid.value.facet(island, facet)
          if (!isFacet) return

          const isOption = utils.isValid.value.option(island, facet, value)
          const isFallbackOption = fallback ? utils.isValid.value.option(island, facet, fallback) : false
          const preferred = Processor.preferred.get(island)!.get(facet)!

          return isOption ? value : isFallbackOption ? fallback! : preferred
        },
        island(island: string, facets: Island_State, fallbacks?: Island_State) {
          const sanFacets: Island_State = new Map()

          const isIsland = utils.isValid.value.island(island)
          if (!isIsland) return

          for (const [facet, value] of facets) {
            const sanValue = this.facet(island, facet, value, fallbacks?.get(facet))
            if (!sanValue) continue

            sanFacets.set(facet, sanValue)
          }

          return sanFacets
        },
        all(state: State, fallbacks?: State) {
          const sanState: State = new Map()

          for (const [island, facets] of state) {
            const sanFacets = this.island(island, facets, fallbacks?.get(island))
            if (!sanFacets) continue

            sanState.set(island, sanFacets)
          }

          return sanState
        },
      },
      modes: {
        island(island: string, mode: string, fallback?: string) {
          const isMode = utils.isValid.value.mode(island, mode)
          const isFallbackMode = fallback ? utils.isValid.value.mode(island, fallback) : false

          const facetName = Processor.mode.modes.get(island)?.facet
          if (!facetName) return

          const preferred = Processor.preferred.get(island)!.get(facetName)!

          return isMode ? mode : isFallbackMode ? fallback! : preferred
        },
        all(modes: State_Modes, fallbacks?: State_Modes) {
          const sanModes: State_Modes = new Map()

          for (const [island, mode] of modes) {
            const sanMode = this.island(island, mode, fallbacks?.get(island))
            if (!sanMode) continue

            sanModes.set(island, sanMode)
          }

          return sanModes
        },
      },
    },
    normalize: {
      state: {
        island(island: string, facets: Island_State, fallbacks?: Island_State) {
          const sanFacets = utils.sanitize.state.island(island, facets, fallbacks)
          if (!sanFacets) return

          const normFacets = sanFacets

          for (const [facet, preferred] of Processor.preferred.get(island)!) {
            if (!normFacets.has(facet)) normFacets.set(facet, preferred)
          }

          return normFacets
        },
        all(state: State, fallbacks?: State) {
          const sanState = utils.sanitize.state.all(state, fallbacks)

          const normState = sanState

          for (const [island, facets] of Processor.preferred) {
            for (const [facet, preferred] of facets) {
              if (!normState.has(island)) normState.set(island, new Map())
              if (!normState.get(island)!.has(facet)) normState.get(island)!.set(facet, preferred)
            }
          }

          return normState
        },
      },
      modes: {
        all(modes: State_Modes, fallbacks?: State_Modes) {
          const sanModes = utils.sanitize.modes.all(modes, fallbacks)
          const normModes = sanModes

          const prefModes = utils.construct.modes.preferred()

          for (const [island, prefMode] of prefModes) {
            if (!normModes.has(island)) normModes.set(island, prefMode)
          }
          
          return normModes
        },
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
    private static instance: Processor | undefined = undefined
    private static _args: Constructed_Script_Args = args

    private static process = {
      islands(args: Constructed_Script_Args) {
        const islands: Processor['_islands'] = new Set(Object.keys(args.config))
        return islands
      },
      options(args: Constructed_Script_Args) {
        const opts: Processor['_options'] = new Map()

        for (const [island, facets] of Object.entries(args.schema)) {
          const island_opts: NonNullable<ReturnType<Processor['_options']['get']>> = new Map()

          for (const [facet, opt] of Object.entries(facets)) {
            const facet_opts: NonNullable<ReturnType<(typeof island_opts)['get']>> = new Set()
            const strat = args.config[island]![facet]!.strategy

            if (opt === true) {
              // prettier-ignore
              switch (strat) {
                case STRATS.MONO: facet_opts.add(DEFAULT); break;
                case STRATS.LIGHT_DARK: Object.values(MODES).filter((m) => m !== MODES.SYSTEM).forEach((m) => facet_opts.add(m)); break;
                case STRATS.SYSTEM: Object.values(MODES).forEach((m) => facet_opts.add(m)); break;
                default: break;
              }
            }
            if (typeof opt === 'string') facet_opts.add(opt)
            if (Array.isArray(opt)) opt.forEach((o) => facet_opts.add(o))
            if (typeof opt === 'object' && !Array.isArray(opt)) {
              facet_opts.add(opt.light ?? MODES.LIGHT)
              facet_opts.add(opt.dark ?? MODES.DARK)
              if (strat === STRATS.SYSTEM) facet_opts.add((opt as { system: string }).system ?? MODES.SYSTEM)
              if ('custom' in opt) opt.custom?.forEach((cm) => facet_opts.add(cm))
            }

            island_opts.set(facet, facet_opts)
          }

          opts.set(island, island_opts)
        }

        return opts
      },
      preferred(args: Constructed_Script_Args) {
        const preferred: Processor['_preferred'] = new Map()

        for (const [island, facets] of Object.entries(args.config)) {
          const island_preferred: NonNullable<ReturnType<Processor['_preferred']['get']>> = new Map()

          for (const [facet, { preferred }] of Object.entries(facets)) {
            island_preferred.set(facet, preferred)
          }

          preferred.set(island, island_preferred)
        }

        return preferred
      },
      mode(args: Constructed_Script_Args) {
        const mode = {
          modes: new Map(),
          storageKey: args.mode?.storageKey ?? preset.mode.storageKey,
          store: args.mode?.store ?? preset.mode.store,
        } as Modes_Handling

        for (const [island, facets] of Object.entries(args.config)) {
          for (const [facet, strat_obj] of Object.entries(facets)) {
            if (strat_obj.type !== FACETS.MODE) continue

            // resolvedModes
            const resolvedModes: Mode_Handling['resolvedModes'] = new Map()
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
                  if ((strat_obj as {colorSchemes: Record<string, COLOR_SCHEME>}).colorSchemes) Object.entries(strat_obj.colorSchemes ?? []).forEach(([mode, cs]) => resolvedModes.set(mode, cs))
                }
              }
            }

            // systemMode
            let systemMode: Mode_Handling['systemMode'] = undefined
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
              selectors: (typeof strat_obj.selector === 'string' ? [strat_obj.selector] : strat_obj.selector) ?? preset.mode.selector,
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

    public static needsReboot(args: Constructed_Script_Args) {
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

    public static get options() {
      return Processor.getInstance()._options
    }

    public static get preferred() {
      return Processor.getInstance()._preferred
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
    private _options: Options
    private _preferred: Preferred
    private _mode: Modes_Handling
    private _nonce: string
    private _disableTransitionOnChange: boolean

    private constructor() {
      this._storageKey = Processor._args.storageKey ?? preset.storageKey
      this._islands = Processor.process.islands(Processor._args)
      this._options = Processor.process.options(Processor._args)
      this._preferred = Processor.process.preferred(Processor._args)
      this._mode = Processor.process.mode(Processor._args)
      this._nonce = Processor._args.nonce ?? preset.nonce
      this._disableTransitionOnChange = Processor._args.disableTransitionOnChange ?? preset.disableTransitionOnChange
    }
  }

  // #region STATE MANAGER
  class StateManager {
    private static instance: StateManager

    public static init() {
      if (!StateManager.instance) StateManager.instance = new StateManager()
    }

    public static get = {
      state: {
        base: {
          all() {
            return StateManager.instance.state
          },
          island(island: string) {
            return this.all()?.get(island)
          },
          facet(island: string, facet: string) {
            return this.island(island)?.get(facet)
          },
        },
        forced: {
          all() {
            return StateManager.instance.forcedState
          },
          island(island: string) {
            return this.all()?.get(island)
          },
          facet(island: string, facet: string) {
            return this.island(island)?.get(facet)
          },
        },
        computed: {
          all() {
            const currState = StateManager.get.state.base.all()
            const currForcedState = StateManager.get.state.forced.all()

            const computedState = utils.deepMerge.maps(currState, currForcedState) as State | undefined
            return computedState
          },
          island(island: string) {
            return this.all()?.get(island)
          },
          facet(island: string, facet: string) {
            return this.island(island)?.get(facet)
          },
        },
      },
      colorSchemes: {
        all() {
          return StateManager.instance.colorSchemes
        },
        island(island: string) {
          return this.all()?.get(island)
        },
      },
    }

    public static set = {
      state: {
        base: {
          /** Accepts even deep-partials instances of state; merges partial with the current instance. */
          all(state: State) {
            const currState = StateManager.get.state.base.all()
            const newState = utils.deepMerge.maps(currState, state) as State

            StateManager.smartUpdate.state.base(newState)

            const colorSchemes = utils.construct.colorSchemes.fromState(newState)
            StateManager.set.colorSchemes.all(colorSchemes)
          },
          /** Accepts even partial instances of island state; merges partial with the current instance. */
          island(island: string, state: Island_State) {
            this.all(new Map([[island, state]]))
          },
          /** Performs update only if needed. */
          facet(island: string, facet: string, state: string) {
            this.island(island, new Map([[facet, state]]))
          },
        },
        forced: {
          /** Accepts even deep-partials instances of state; merges partial with the current instance. */
          all(state: State) {
            const currState = StateManager.get.state.forced.all()
            const newState = utils.deepMerge.maps(currState, state) as State

            StateManager.smartUpdate.state.forced(newState)

            const colorSchemes = utils.construct.colorSchemes.fromState(newState)
            StateManager.set.colorSchemes.all(colorSchemes)
          },
          /** Accepts even partial instances of island state; merges partial with the current instance. */
          island(island: string, state: Island_State) {
            this.all(new Map([[island, state]]))
          },
          /** Performs update only if needed. */
          facet(island: string, facet: string, state: string) {
            this.island(island, new Map([[facet, state]]))
          },
        },
      },
      colorSchemes: {
        /** Accepts even partials instances; merges partial with the current instance. */
        all(colorSchemes: State_Color_Schemes) {
          const currColorSchemes = StateManager.get.colorSchemes.all()
          const newColorSchemes = utils.deepMerge.maps(currColorSchemes, colorSchemes) as State_Color_Schemes

          StateManager.smartUpdate.colorSchemes(newColorSchemes)
        },
        /** Performs update only if needed. */
        island(island: string, colorScheme: Island_State_Color_Scheme) {
          this.all(new Map([[island, colorScheme]]))
        },
      },
    }

    private static smartUpdate = {
      state: {
        /** ATTENTION!!! newState must be a complete instance of State, not just a partial one. */
        base(newState: State) {
          const currState = StateManager.get.state.base.all()
          const needsUpdate = !utils.deepEqual.maps(currState, newState)
          if (!needsUpdate) return

          StateManager.instance.state = newState
          EventManager.emit('State:update', utils.deepConvert.mapToObj(newState) as State_Obj)
        },
        /** ATTENTION!!! newState must be a complete instance of State, not just a partial one. */
        forced(newState: State) {
          const currState = StateManager.get.state.forced.all()
          const needsUpdate = !utils.deepEqual.maps(currState, newState)
          if (!needsUpdate) return

          StateManager.instance.forcedState = newState
          EventManager.emit('ForcedState:update', utils.deepConvert.mapToObj(newState) as State_Obj)
        },
      },
      /** ATTENTION!!! newColorSchemes must be a complete instance of State_Color_Schemes, not just a partial one. */
      colorSchemes(newColorSchemes: State_Color_Schemes) {
        const currColorSchemes = StateManager.get.colorSchemes.all()
        const needsUpdate = !utils.deepEqual.maps(currColorSchemes, newColorSchemes)
        if (!needsUpdate) return

        StateManager.instance.colorSchemes = newColorSchemes
        EventManager.emit('ColorSchemes:update', utils.deepConvert.mapToObj(newColorSchemes) as State_Color_Schemes_Obj)
      },
    }

    private forcedState: State | undefined
    private state: State | undefined
    private colorSchemes: State_Color_Schemes | undefined

    private constructor() {}
  }

  // #region STORAGE MANAGER
  class StorageManager {
    private static instance: StorageManager | undefined = undefined
    private static isInternalChange = false

    private static utils = {
      retrieve: {
        generic(storageKey: string) {
          return window.localStorage.getItem(storageKey)
        },
        state() {
          return this.generic(Processor.storageKey)
        },
        modes() {
          return this.generic(Processor.mode.storageKey)
        },
      },
      store(storageKey: string, string: string) {
        StorageManager.isInternalChange = true
        window.localStorage.setItem(storageKey, string)
        StorageManager.isInternalChange = false
      },
    }

    public static get = {
      state: {
        all() {
          const retrieved = StorageManager.utils.retrieve.state()
          if (!retrieved) return undefined

          const parsed = utils.miscellaneous.safeParse(retrieved)
          if (!parsed) return undefined

          const isPlainObject = utils.isValid.type.plainObject(parsed)
          if (!isPlainObject) return undefined

          const isStateObj = utils.isValid.structure.serializedState(parsed)
          if (!isStateObj) return undefined

          const state = utils.deepConvert.objToMap(parsed) as State
          const normState = utils.normalize.state.all(state)

          return normState
        },
        island(island: string) {
          return this.all()?.get(island)
        },
        facet(island: string, facet: string) {
          return this.island(island)?.get(facet)
        },
      },
      modes: {
        all() {
          const retrieved = StorageManager.utils.retrieve.modes()
          if (!retrieved) return undefined

          const parsed = utils.miscellaneous.safeParse(retrieved)
          if (!parsed) return undefined

          const isPlainObject = utils.isValid.type.plainObject(parsed)
          if (!isPlainObject) return undefined

          const isModesObj = utils.isValid.structure.serializedModes(parsed)
          if (!isModesObj) return undefined

          const modes = utils.deepConvert.objToMap(parsed) as State_Modes
          return modes
        },
        island(island: string) {
          return this.all()?.get(island)
        },
      },
      mode(island: string) {
        const mode = StorageManager.utils.retrieve.generic(`${island}-${Processor.mode.storageKey}`)
        if (!mode) return undefined

        const parsed = utils.miscellaneous.safeParse(mode)
        if (!parsed) return undefined

        const isString = utils.isValid.type.string(parsed)
        if (!isString) return undefined

        return parsed
      },
    }
  }

  // #region T3M4
  class T3M4 implements T_T3M4 {
    public get = {
      state: {
        base: {
          all() {
            const state = StateManager.get.state.base.all()
            if (!state) return undefined
            return utils.deepConvert.mapToObj(state) as State_Obj
          },
          island(island: string) {
            const state = StateManager.get.state.base.island(island)
            if (!state) return undefined
            return utils.deepConvert.mapToObj(state) as Island_State_Obj
          },
          facet(island: string, facet: string) {
            const state = StateManager.get.state.base.facet(island, facet)
            if (!state) return undefined
            return state as Island_State_Obj_Facet
          },
        },
        forced: {
          all() {
            const state = StateManager.get.state.forced.all()
            if (!state) return undefined
            return utils.deepConvert.mapToObj(state) as State_Obj
          },
          island(island: string) {
            const state = StateManager.get.state.forced.island(island)
            if (!state) return undefined
            return utils.deepConvert.mapToObj(state) as Island_State_Obj
          },
          facet(island: string, facet: string) {
            const state = StateManager.get.state.forced.facet(island, facet)
            if (!state) return undefined
            return state as Island_State_Obj_Facet
          },
        },
        computed: {
          all() {
            const state = StateManager.get.state.computed.all()
            if (!state) return undefined
            return utils.deepConvert.mapToObj(state) as State_Obj
          },
          island(island: string) {
            const state = StateManager.get.state.computed.island(island)
            if (!state) return undefined
            return utils.deepConvert.mapToObj(state) as Island_State_Obj
          },
          facet(island: string, facet: string) {
            const state = StateManager.get.state.computed.facet(island, facet)
            if (!state) return undefined
            return state as Island_State_Obj_Facet
          },
        },
      },
      options: {
        all() {
          const options = Processor.options
          return utils.deepConvert.mapToObj(options) as Options_Obj
        },
        island(island: string) {
          const options = Processor.options.get(island)
          if (!options) return undefined
          return utils.deepConvert.mapToObj(options) as Island_Options_Obj
        },
        facet(island: string, facet: string) {
          const options = Processor.options.get(island)?.get(facet)
          if (!options) return undefined
          return Array.from(options) as Island_Options_Obj_Facet
        },
      },
      colorSchemes: {
        all() {
          const colorSchemes = StateManager.get.colorSchemes.all()
          if (!colorSchemes) return undefined
          return utils.deepConvert.mapToObj(colorSchemes) as State_Color_Schemes_Obj
        },
        island(island: string) {
          const colorScheme = StateManager.get.colorSchemes.island(island)
          if (!colorScheme) return undefined
          return colorScheme as Island_State_Color_Scheme
        },
      },
    }

    public set = {
      state: {
        base: {
          /** Accepts even deep-partials instances of state; merges partial with the current instance. */
          all(state: State_Obj) {
            const stateMap = utils.deepConvert.objToMap(state) as State
            StateManager.set.state.base.all(stateMap)
          },
          /** Accepts even partial instances of island state; merges partial with the current instance. */
          island(island: string, state: Island_State_Obj) {
            const stateMap = utils.deepConvert.objToMap(state) as Island_State
            StateManager.set.state.base.island(island, stateMap)
          },
          /** Performs update only if needed. */
          facet(island: string, facet: string, state: string) {
            StateManager.set.state.base.facet(island, facet, state)
          },
        },
        forced: {
          /** Accepts even deep-partials instances of state; merges partial with the current instance. */
          all(state: State_Obj) {
            const stateMap = utils.deepConvert.objToMap(state) as State
            StateManager.set.state.forced.all(stateMap)
          },
          /** Accepts even partial instances of island state; merges partial with the current instance. */
          island(island: string, state: Island_State_Obj) {
            const stateMap = utils.deepConvert.objToMap(state) as Island_State
            StateManager.set.state.forced.island(island, stateMap)
          },
          /** Performs update only if needed. */
          facet(island: string, facet: string, state: string) {
            StateManager.set.state.forced.facet(island, facet, state)
          },
        },
      },
    }

    public subscribe<E extends keyof EventMap>(e: E, id: CallbackID, cb: (payload: EventMap[E]) => void) {
      EventManager.on(e, id, cb)
    }

    public reboot(args: Constructed_Script_Args) {}
  }

  StateManager.init()
  window.T3M4 = new T3M4()
}
