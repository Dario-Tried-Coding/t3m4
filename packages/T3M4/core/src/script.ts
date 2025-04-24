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

type State_Obj = T_T3M4['state']
type Island_State_Obj = State_Obj[keyof State_Obj]

type Island_State_Color_Scheme = COLOR_SCHEME
type State_Color_Schemes = Map<string, Island_State_Color_Scheme>

type State_Color_Schemes_Obj = T_T3M4['colorSchemes']
type Island_State_Color_Schemes_Obj = State_Color_Schemes_Obj[keyof State_Color_Schemes_Obj]

type State_Modes = Map<string, string>

type Options = Map<string, Map<string, Set<string>>>
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
      mapToObj(map: NestedMap<string>): NestedObj<string> {
        const obj: any = {}

        map.forEach((value, key) => {
          if (value instanceof Map) obj[key] = this.mapToObj(value)
          else obj[key] = value
        })

        return obj
      },
      objToMap(obj: Nullable<NestedObj<string>>): NestedMap<string> {
        const map = new Map<string, any>()
        if (!obj) return map

        for (const [key, value] of Object.entries(obj)) {
          if (value === null || value === undefined) map.set(key, value)
          else if (Array.isArray(value)) map.set(key, new Set(value))
          else if (value instanceof Date) map.set(key, value.toISOString())
          else if (typeof value === 'object') map.set(key, this.objToMap(value))
          else map.set(key, value)
        }

        return map
      },
    },
    construct: {
      /** ATTENTION!!! To get back the entirety of modes, provide a complete State instance. Not a partial. */
      modes(state: State) {
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
      /** ATTENTION!!! To get back the entitirety of color schemes, provide a complete State instance. Not a partial. */
      colorSchemes(state: State) {
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
        if (!Processor.mode.modes.has(island)) return

        const isSystemStrat = Processor.mode.modes.get(island)!.strategy === STRATS.SYSTEM
        const isSystemMode = Processor.mode.modes.get(island)!.systemMode?.name === mode
        const isSystem = isSystemStrat && isSystemMode
        const fallbackMode = Processor.mode.modes.get(island)!.systemMode?.fallback
        if (isSystem) return utils.getSystemPref() ?? Processor.mode.modes.get(island)?.resolvedModes.get(fallbackMode!)

        return Processor.mode.modes.get(island)!.resolvedModes.get(mode)
      },
    },
    getSystemPref() {
      const supportsPref = window.matchMedia('(prefers-color-scheme)').media !== 'not all'
      const systemPref = supportsPref ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? MODES.DARK : MODES.LIGHT) : undefined
      return systemPref
    },
    isPlainObject(val: any) {
      return val !== null && typeof val === 'object' && !Array.isArray(val) && Object.prototype.toString.call(val) === '[object Object]'
    },
    parse(json: string | null) {
      if (!json?.trim()) return undefined

      try {
        return JSON.parse(json)
      } catch (e) {
        return undefined
      }
    },
    isValid: {
      island(value: string) {
        return Processor.islands.has(value)
      },
      facet(island: string, value: string) {
        return Processor.options.get(island)?.has(value) ?? false
      },
      option(island: string, facet: string, value: string) {
        return Processor.options.get(island)?.get(facet)?.has(value) ?? false
      },
    },
    sanitize: {
      facet(island: string, facet: string, value: string, fallback?: string) {
        const isIsland = utils.isValid.island(island)
        if (!isIsland) return

        const isFacet = utils.isValid.facet(island, facet)
        if (!isFacet) return

        const isOption = utils.isValid.option(island, facet, value)
        const isFallbackOption = fallback ? utils.isValid.option(island, facet, fallback) : false
        const preferred = Processor.preferred.get(island)!.get(facet)!

        return isOption ? value : isFallbackOption ? fallback! : preferred
      },
      island(island: string, facets: Island_State, fallbacks?: Island_State) {
        const sanFacets: Island_State = new Map()

        const isIsland = utils.isValid.island(island)
        if (!isIsland) return

        for (const [facet, value] of facets) {
          const sanValue = this.facet(island, facet, value, fallbacks?.get(facet))
          if (!sanValue) continue

          sanFacets.set(facet, sanValue)
        }

        return sanFacets
      },
      state(state: State, fallbacks?: State) {
        const sanState: State = new Map()

        for (const [island, facets] of state) {
          const sanFacets = this.island(island, facets, fallbacks?.get(island))
          if (!sanFacets) continue
          
          sanState.set(island, sanFacets)
        }

        return sanState
      }
    },
    normalize: {
      island(island: string, facets: Island_State, fallbacks?: Island_State) {
        const sanFacets = utils.sanitize.island(island, facets, fallbacks)
        if (!sanFacets) return

        const normFacets = sanFacets

        for (const [facet, preferred] of Processor.preferred.get(island)!) {
          if (!normFacets.has(facet)) normFacets.set(facet, preferred)
        }
        
        return normFacets
      },
      state(state: State, fallbacks?: State) {
        const sanState = utils.sanitize.state(state, fallbacks)

        const normState = sanState
        
        for (const [island, facets] of Processor.preferred) {
          for (const [facet, preferred] of facets) {
            if (!normState.has(island)) normState.set(island, new Map())
            if (!normState.get(island)!.has(facet)) normState.get(island)!.set(facet, preferred)
          }
        }

        return normState
      }
    }
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

    private static utils = {
      isOptStrat<S extends STRAT>(opt: Opt, strat: S): opt is S extends keyof Strat_To_Opt ? Strat_To_Opt[S] : never {
        if (opt === true) return strat !== STRATS.MULTI
        if (typeof opt === 'string') return strat === STRATS.MONO
        if (typeof opt === 'object') {
          if (Array.isArray(opt)) return strat === STRATS.MULTI
          else {
            if (MODES.SYSTEM in opt) return strat === STRATS.SYSTEM
            return strat === STRATS.LIGHT_DARK || strat === STRATS.SYSTEM
          }
        }
        return false
      },
    }

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

  // #region MAIN
  class Main {
    private static instance: Main

    public static init() {
      if (!Main.instance) Main.instance = new Main()
    }

    public static get = {
      state: {
        base: {
          all() {
            return Main.instance.state
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
            return Main.instance.forcedState
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
            const currState = Main.get.state.base.all()
            const currForcedState = Main.get.state.forced.all()
          
            const computedState = utils.deepMerge.maps(currState, currForcedState) as State
            return computedState
          },
          island(island: string) {
            return this.all()?.get(island)
          },
          facet(island: string, facet: string) {
            return this.island(island)?.get(facet)
          }
        }
      },
      colorSchemes: {
        all() {
          return Main.instance.colorSchemes
        },
        island(island: string) {
          return this.all()?.get(island)
        },
      },
    }

    public static set = {
      state: {
        base: {
          /** Accepts both complete or even deep-partials instances of state; merges partial with the current instance. */
          all(state: State) {
            const currState = Main.get.state.base.all()
            const newState = utils.deepMerge.maps(currState, state) as State

            Main.smartUpdate.state(newState)

            const colorSchemes = utils.construct.colorSchemes(newState)
            Main.set.colorSchemes.all(colorSchemes)
          },
          /** Accepts both complete or partial instances of island state; merges partial with the current island instance. */
          island(island: string, state: Island_State) {
            this.all(new Map([[island, state]]))
          },
          facet(island: string, facet: string, state: string) {
            this.island(island, new Map([[facet, state]]))
          },
        },
        forced: {
          /** Accepts both complete or even deep-partials instances of state; merges partial with the current instance. */
          all(state: State) {
            const currState = Main.get.state.forced.all()
            const newState = utils.deepMerge.maps(currState, state) as State

            Main.smartUpdate.forcedState(newState)
          },
          /** Accepts both complete or partial instances of island state; merges partial with the current island instance. */
          island(island: string, state: Island_State) {
            this.all(new Map([[island, state]]))
          },
          facet(island: string, facet: string, state: string) {
            this.island(island, new Map([[facet, state]]))
          },
        },
      },
      colorSchemes: {
        /** Accepts both complete or partials instances of state; merges partial with the current instance. */
        all(colorSchemes: State_Color_Schemes) {
          const currColorSchemes = Main.get.colorSchemes.all()
          const newColorSchemes = utils.deepMerge.maps(currColorSchemes, colorSchemes) as State_Color_Schemes

          Main.smartUpdate.colorSchemes(newColorSchemes)
        },
        /** Performs update only if needed. */
        island(island: string, colorScheme: Island_State_Color_Scheme) {
          this.all(new Map([[island, colorScheme]]))
        },
      },
    }

    private static smartUpdate = {
      forcedState(newState: State) {
        const currState = Main.get.state.forced.all()
        const needsUpdate = !utils.deepEqual.maps(currState, newState)
        if (!needsUpdate) return

        Main.instance.forcedState = newState
        EventManager.emit('ForcedState:update', utils.deepConvert.mapToObj(newState) as State_Obj)
      },
      /** ATTENTION!!! newState must be a complete instance of State, not just a partial one. */
      state(newState: State) {
        const currState = Main.get.state.base.all()
        const needsUpdate = !utils.deepEqual.maps(currState, newState)
        if (!needsUpdate) return

        Main.instance.state = newState
        EventManager.emit('State:update', utils.deepConvert.mapToObj(newState) as State_Obj)
      },
      /** ATTENTION!!! newColorSchemes must be a complete instance of State_Color_Schemes, not just a partial one. */
      colorSchemes(newColorSchemes: State_Color_Schemes) {
        const currColorSchemes = Main.get.colorSchemes.all()
        const needsUpdate = !utils.deepEqual.maps(currColorSchemes, newColorSchemes)
        if (!needsUpdate) return

        Main.instance.colorSchemes = newColorSchemes
        EventManager.emit('ColorSchemes:update', utils.deepConvert.mapToObj(newColorSchemes) as State_Color_Schemes_Obj)
      },
    }

    private forcedState: State | undefined
    private state: State | undefined
    private colorSchemes: State_Color_Schemes | undefined

    private constructor() {}
  }
}
