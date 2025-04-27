import { Nullable } from '@t3m4/utils/nullables'
import { T3M4 as T_T3M4 } from './types'
import { COLOR_SCHEME } from './types/constants/color-schemes'
import { SELECTOR } from './types/constants/selectors'
import { STORE_STRAT, STRAT } from './types/constants/strats'
import { CallbackID, EventMap } from './types/events'
import { Constructed_Script_Args } from './types/script'

// #region TYPES
type NestedMap<T> = Map<string, NestedMap<T> | T>
type NestedObj<T> = { [key: string]: NestedObj<T> | T }

type Island_State_Facet = string
type Island_State = Map<string, Island_State_Facet>
type State = Map<string, Island_State>

type State_Obj = NonNullable<ReturnType<T_T3M4['get']['state']['base']['all']>>
type Island_State_Obj = State_Obj[keyof State_Obj]
type Island_State_Obj_Facet = Island_State_Obj[keyof Island_State_Obj]

type Island_State_Color_Scheme = COLOR_SCHEME
type State_Color_Schemes = Map<string, Island_State_Color_Scheme>

type State_Color_Schemes_Obj = NonNullable<ReturnType<T_T3M4['get']['colorSchemes']['all']>>

type State_Modes = Map<string, string>
type State_Mode = State_Modes_Obj[keyof State_Modes_Obj]

type State_Modes_Obj = Record<string, string>

type Islands = Set<string>

type Options = Map<string, Map<string, Set<string>>>
type Options_Obj = NonNullable<ReturnType<T_T3M4['get']['options']['all']>>
type Island_Options_Obj = Options_Obj[keyof Options_Obj]
type Island_Options_Obj_Facet = Island_Options_Obj[keyof Island_Options_Obj]

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
  store: boolean
  strategy: STORE_STRAT
}

type Engine = {
  storageKeys: {
    state: string
    modes: string
  }
  values: {
    islands: Islands
    options: Options
  }
  preferred: {
    state: State
    modes: State_Modes
    colorSchemes: State_Color_Schemes
  }
  nonce: string
  disableTransitionOnChange: boolean
  modesHandling: Modes_Handling
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
      /** ATTENTION!!! To get back the entirety of modes, provide a complete State instance. Not a partial. */
      modes(state: State) {
        const modes: State_Modes = new Map()

        for (const [island, facets] of state) {
          const islandMode = Engine.modesHandling.modes.get(island)?.facet
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
        if (!Engine.modesHandling.modes.has(island)) return

        const isSystemStrat = Engine.modesHandling.modes.get(island)!.strategy === STRATS.SYSTEM
        const isSystemMode = Engine.modesHandling.modes.get(island)!.systemMode?.name === mode
        const isSystem = isSystemStrat && isSystemMode
        const fallbackMode = Engine.modesHandling.modes.get(island)!.systemMode?.fallback
        if (isSystem) return utils.miscellaneous.getSystemPref() ?? Engine.modesHandling.modes.get(island)?.resolvedModes.get(fallbackMode!)

        return Engine.modesHandling.modes.get(island)!.resolvedModes.get(mode)
      },
    },
    isValid: {
      value: {
        island(value: string) {
          return Engine.values.islands.has(value)
        },
        facet(island: string, value: string) {
          return Engine.values.options.get(island)?.has(value) ?? false
        },
        option(island: string, facet: string, value: string) {
          return Engine.values.options.get(island)?.get(facet)?.has(value) ?? false
        },
        mode(island: string, value: string) {
          const facetName = Engine.modesHandling.modes.get(island)?.facet
          if (!facetName) return false

          return Engine.values.options.get(island)!.get(facetName)!.has(value)
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
          const preferred = Engine.preferred.state.get(island)!.get(facet)!

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

          const facetName = Engine.modesHandling.modes.get(island)?.facet
          if (!facetName) return

          const preferred = Engine.preferred.state.get(island)!.get(facetName)!

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

          for (const [facet, preferred] of Engine.preferred.state.get(island)!) {
            if (!normFacets.has(facet)) normFacets.set(facet, preferred)
          }

          return normFacets
        },
        all(state: State, fallbacks?: State) {
          const sanState = utils.sanitize.state.all(state, fallbacks)

          const normState = sanState

          for (const [island, facets] of Engine.preferred.state) {
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

          const prefModes = Engine.preferred.modes

          for (const [island, prefMode] of prefModes) {
            if (!normModes.has(island)) normModes.set(island, prefMode)
          }

          return normModes
        },
      },
    },
    deserialize: {
      state: {
        all(string: string) {
          const parsed = utils.miscellaneous.safeParse(string)
          if (!parsed) return undefined

          const isPlainObject = utils.isValid.type.plainObject(parsed)
          if (!isPlainObject) return undefined

          const isStateObj = utils.isValid.structure.serializedState(parsed)
          if (!isStateObj) return undefined

          const dirtyState = utils.deepConvert.objToMap(parsed) as State
          return dirtyState
        },
        island(string: string, island: string) {
          return this.all(string)?.get(island)
        },
        facet(string: string, island: string, facet: string) {
          return this.island(string, island)?.get(facet)
        },
      },
      modes: {
        all(string: string) {},
      },
    },
  }

  // #region ENGINE
  function constructEngine(args: Constructed_Script_Args): Engine {
    const storageKeys = {
      state: args.storageKey ?? preset.storageKey,
      modes: args.mode?.storageKey ?? preset.mode.storageKey,
    }

    const nonce = args.nonce ?? preset.nonce
    const disableTransitionOnChange = args.disableTransitionOnChange ?? preset.disableTransitionOnChange

    const constructValues = (): Engine['values'] => {
      const islands = new Set(Object.keys(args.config))

      const options: Engine['values']['options'] = new Map()
      for (const [island, facets] of Object.entries(args.schema)) {
        const island_options: NonNullable<ReturnType<(typeof options)['get']>> = new Map()

        for (const [facet, opt] of Object.entries(facets)) {
          const facet_options: NonNullable<ReturnType<(typeof island_options)['get']>> = new Set()
          const strat = args.config[island]![facet]!.strategy

          if (opt === true) {
            // prettier-ignore
            switch (strat) {
                case STRATS.MONO: facet_options.add(DEFAULT); break;
                case STRATS.LIGHT_DARK: Object.values(MODES).filter((m) => m !== MODES.SYSTEM).forEach((m) => facet_options.add(m)); break;
                case STRATS.SYSTEM: Object.values(MODES).forEach((m) => facet_options.add(m)); break;
                default: break;
              }
          }
          if (typeof opt === 'string') facet_options.add(opt)
          if (Array.isArray(opt)) opt.forEach((o) => facet_options.add(o))
          if (typeof opt === 'object' && !Array.isArray(opt)) {
            facet_options.add(opt.light ?? MODES.LIGHT)
            facet_options.add(opt.dark ?? MODES.DARK)
            if (strat === STRATS.SYSTEM) facet_options.add((opt as { system: string }).system ?? MODES.SYSTEM)
            if ('custom' in opt) opt.custom?.forEach((cm) => facet_options.add(cm))
          }

          island_options.set(facet, facet_options)
        }

        options.set(island, island_options)
      }

      return { islands, options }
    }
    const values = constructValues()

    const constructModes = (): Engine['modesHandling'] => {
      const modes = {
        modes: new Map(),
        strategy: args.mode?.strategy ?? preset.mode.strategy,
        store: args.mode?.store ?? preset.mode.store,
      } satisfies Modes_Handling

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

          modes.modes.set(island, {
            facet,
            strategy: strat,
            resolvedModes,
            systemMode,
            store: strat_obj.store ?? true,
            selectors: (typeof strat_obj.selector === 'string' ? [strat_obj.selector] : strat_obj.selector) ?? preset.mode.selector,
          })
        }
      }

      return modes
    }
    const modesHandling = constructModes()

    const contructPreferred = (): Engine['preferred'] => {
      const state: Engine['preferred']['state'] = new Map()
      for (const [island, facets] of Object.entries(args.config)) {
        const island_preferred: NonNullable<ReturnType<(typeof state)['get']>> = new Map()

        for (const [facet, { preferred }] of Object.entries(facets)) {
          island_preferred.set(facet, preferred)
        }

        state.set(island, island_preferred)
      }

      const modes: Engine['preferred']['modes'] = new Map()
      for (const [island, facets] of state) {
        const islandModeFacet = modesHandling.modes.get(island)?.facet
        if (!islandModeFacet) continue

        const preferredMode = facets.get(islandModeFacet)!
        modes.set(island, preferredMode)
      }

      const colorSchemes = utils.resolve.colorSchemes(modes)

      return { state, modes, colorSchemes }
    }
    const preferred = contructPreferred()

    return {
      storageKeys,
      values,
      modesHandling,
      preferred,
      nonce,
      disableTransitionOnChange,
    }
  }
  let Engine = constructEngine(args)

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

    /** ATTENTION!!! No sanitization/normalization performed here. */
    public static set = {
      state: {
        base: {
          /** Accepts even deep-partials instances of state; merges partial with the current instance. */
          all(state: State) {
            const currState = StateManager.get.state.base.all()
            const newState = utils.deepMerge.maps(currState, state) as State

            StateManager.smartUpdate.state.base(newState)

            const colorSchemes = utils.construct.colorSchemes(newState)
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

            const colorSchemes = utils.construct.colorSchemes(newState)
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
          EventManager.emit('State:base:update', utils.deepConvert.mapToObj(newState) as State_Obj)

          const compState = StateManager.get.state.computed.all()
          if (compState) EventManager.emit('State:computed:update', utils.deepConvert.mapToObj(compState) as State_Obj)
        },
        /** ATTENTION!!! newState must be a complete instance of State, not just a partial one. */
        forced(newState: State) {
          const currState = StateManager.get.state.forced.all()
          const needsUpdate = !utils.deepEqual.maps(currState, newState)
          if (!needsUpdate) return

          StateManager.instance.forcedState = newState
          EventManager.emit('State:forced:update', utils.deepConvert.mapToObj(newState) as State_Obj)

          const compState = StateManager.get.state.computed.all()
          if (compState) EventManager.emit('State:computed:update', utils.deepConvert.mapToObj(compState) as State_Obj)
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

    private constructor() {
      StorageManager.init()
    }
  }

  // #region STORAGE MANAGER
  class StorageManager {
    private static instance: StorageManager | undefined = undefined
    private static abortController: AbortController | undefined = undefined
    private static isInternalChange = false

    public static init() {
      if (!StorageManager.instance) StorageManager.instance = new StorageManager()
    }

    private static utils = {
      retrieve: {
        generic(storageKey: string) {
          return window.localStorage.getItem(storageKey)
        },
        state() {
          return this.generic(Engine.storageKeys.state)
        },
        modes() {
          return this.generic(Engine.storageKeys.modes)
        },
      },
      store: {
        /** Efficiently stores the provided string by checking if it's already set first. */
        generic(storageKey: string, string: string) {
          StorageManager.isInternalChange = true

          const currValue = window.localStorage.getItem(storageKey)

          const needsUpdate = currValue !== string
          if (needsUpdate) window.localStorage.setItem(storageKey, string)

          StorageManager.isInternalChange = false
        },
        /** Efficiently stores the provided state by checking if it's already set first. */
        state(state: State) {
          const stateObj = utils.deepConvert.mapToObj(state) as State_Obj
          const stringified = JSON.stringify(stateObj)
          this.generic(Engine.storageKeys.state, stringified)
        },
        /** Efficiently stores the provided modes by checking if they're already set first. */
        modes(modes: State_Modes) {
          const modesObj = utils.deepConvert.mapToObj(modes) as State_Modes_Obj
          const stringified = JSON.stringify(modesObj)
          this.generic(Engine.storageKeys.modes, stringified)
        },
      },
    }

    public static get = {
      state: {
        /** Returns a normalized state instance if present and with valid obj structure. */
        all() {
          const retrieved = StorageManager.utils.retrieve.state()
          if (!retrieved) return undefined

          const deserializedState = utils.deserialize.state.all(retrieved)
          if (!deserializedState) return undefined

          const normState = utils.normalize.state.all(deserializedState)
          return normState
        },
        /** Returns a normalized island state instance if state's present and with valid obj structure. */
        island(island: string) {
          return this.all()?.get(island)
        },
        /** Returns a normalized island state facet value if state's present and with valid obj structure. */
        facet(island: string, facet: string) {
          return this.island(island)?.get(facet)
        },
      },
      modes: {
        /** Returns a normalized modes instance if present and with valid obj structure */
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
          const normModes = utils.normalize.modes.all(modes)

          return normModes
        },
        /** Returns a normalized island mode instance if modes are present and with valid obj structure. */
        island(island: string) {
          return this.all()?.get(island)
        },
      },
      mode(island: string) {
        const mode = StorageManager.utils.retrieve.generic(`${island}-${Engine.storageKeys.modes}`)
        if (!mode) return undefined

        const parsed = utils.miscellaneous.safeParse(mode)
        if (!parsed) return undefined

        const isString = utils.isValid.type.string(parsed)
        if (!isString) return undefined

        return parsed
      },
    }

    /** ATTENTION!!! No sanitization/normalization performed here. */
    public static set = {
      state: {
        /** Accepts even deep-partials instances of state; merges partial with the current/default (preferred) instance. */
        all(state: State) {
          const currState = StorageManager.get.state.all()
          const prefState = Engine.preferred.state
          const newState = utils.deepMerge.maps(currState ?? prefState, state) as State
          StorageManager.utils.store.state(newState)
        },
        /** Accepts even partial instances of island state; merges partial with the current/default (preferred) instance. */
        island(island: string, state: Island_State) {
          this.all(new Map([[island, state]]))
        },
        /** Performs update only if needed. */
        facet(island: string, facet: string, value: string) {
          this.island(island, new Map([[facet, value]]))
        },
      },
      modes: {
        /** Accepts even partial instances of modes; merges partial with the current/default (preferred) instance. */
        all(modes: State_Modes) {
          const currModes = StorageManager.get.modes.all()
          const prefModes = Engine.preferred.modes
          const newModes = utils.deepMerge.maps(currModes ?? prefModes, modes) as State_Modes
          StorageManager.utils.store.modes(newModes)
        },
        /** Performs update only if needed. */
        island(island: string, mode: string) {
          this.all(new Map([[island, mode]]))
        },
      },
    }

    private constructor() {
      EventManager.on('State:base:update', 'StorageManager:state:update', (stateObj) => {
        const state = utils.deepConvert.objToMap(stateObj) as State
        StorageManager.set.state.all(state)

        const modes = utils.construct.modes(state)
        StorageManager.set.modes.all(modes)
      })

      StorageManager.abortController = new AbortController()
      window.addEventListener(
        'storage',
        ({ key, newValue, oldValue }) => {
          // prettier-ignore
          switch (key) {
          case Engine.storageKeys.state: {
            const deserNewState = newValue ? utils.deserialize.state.all(newValue) : undefined
            const deserOldState = oldValue ? utils.deserialize.state.all(oldValue) : undefined

            const normNewState = utils.normalize.state.all(deserNewState ?? Engine.preferred.state, deserOldState)
            StorageManager.set.state.all(normNewState)
            StateManager.set.state.base.all(normNewState)
          }; break;
        }
        },
        { signal: StorageManager.abortController.signal }
      )
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
          const options = Engine.values.options
          return utils.deepConvert.mapToObj(options) as Options_Obj
        },
        island(island: string) {
          const options = Engine.values.options.get(island)
          if (!options) return undefined
          return utils.deepConvert.mapToObj(options) as Island_Options_Obj
        },
        facet(island: string, facet: string) {
          const options = Engine.values.options.get(island)?.get(facet)
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

  console.log(window.T3M4.get.state.base.all())
}
