import { CONSTANTS } from './types/constants'
import { Observable } from './types/constants/observables'
import { Selector } from './types/constants/selectors'
import { Store_Strat, Strat, STRATS } from './types/constants/strats'
import { PRESET } from './types/preset'
import { Script_Args } from './types/script'
import { ColorSchemes, Islands, Schema, State, Values } from './types/subscribers'
import { T3M4 as T_T3M4 } from './types'
import { CallbackID, EventMap } from './types/events'

// #region TYPES
type Brand_Stages = {
  coverage: {
    complete: 'complete'
    partial: 'partial' | Brand_Stages['coverage']['complete']
  }
  validation: {
    dirty: 'dirty' | Brand_Stages['validation']['sanitized']
    sanitized: 'sanitized' | Brand_Stages['validation']['normalized']
    normalized: 'normalized'
  }
}

type Brand_Map = {
  [P in keyof Brand_Stages]: keyof Brand_Stages[P]
}

type Non_Primitive_Parameters = Extract<keyof Brand_Map, 'coverage'>

declare const __brand: unique symbol

type Brand_Metadata<B extends Partial<Brand_Map>> = {
  [__brand]: {
    [P in keyof B]: B[P]
  }
}

type Brand<T, B extends Partial<{ [K in keyof Brand_Stages]: keyof Brand_Stages[K] }>> =
  T extends Map<infer K, infer V>
    ? Brand.Shallow<Map<K, Brand<V, B>>, B>
    : T extends Set<infer U>
      ? Brand.Shallow<Set<Brand<U, B>>, B>
      : T extends Array<infer U>
        ? Brand.Shallow<Array<Brand<U, B>>, B>
        : T extends object
          ? Brand.Shallow<{ [K in keyof T]: Brand<T[K], B> }, B>
          : keyof Omit<B, Non_Primitive_Parameters> extends never
            ? T
            : Brand.Shallow<T, Omit<B, Non_Primitive_Parameters>>
namespace Brand {
  export type Shallow<T, B extends Partial<Brand_Map>> = T & Brand_Metadata<B>
}

export type AtLeast<T, B extends Partial<{ [K in keyof Brand_Stages]: keyof Brand_Stages[K] }>> =
  T extends Map<infer K, infer V>
    ? AtLeast.Shallow<Map<K, AtLeast<V, B>>, B>
    : T extends Set<infer U>
      ? AtLeast.Shallow<Set<AtLeast<U, B>>, B>
      : T extends Array<infer U>
        ? AtLeast.Shallow<Array<AtLeast<U, B>>, B>
        : T extends object
          ? AtLeast.Shallow<{ [K in keyof T]: AtLeast<T[K], B> }, B>
          : keyof Omit<B, Non_Primitive_Parameters> extends never
            ? T
            : AtLeast.Shallow<T, Omit<B, Non_Primitive_Parameters>>
namespace AtLeast {
  export type Shallow<T, B extends Partial<{ [P in keyof Brand_Stages]: keyof Brand_Stages[P] }>> = T & {
    [__brand]: {
      [P in keyof B]: P extends keyof Brand_Stages ? (B[P] extends keyof Brand_Stages[P] ? Brand_Stages[P][B[P]] : never) : never
    }
  }
}

type Brand_Info<T> = T extends { [__brand]: infer B } ? B : never

namespace Modes {
  export type AsMap = Map<string, string>
}

type Engine = {
  /** Keys to be used in the localStorage */
  storageKeys: {
    state: string
    modes: string
  }
  islands: Islands.Static.AsSet
  facets: Map<string, Set<string>>
  values: Values.Static.AsMap
  fallbacks: Brand<State.Static.AsMap, { coverage: 'complete'; validation: 'normalized' }>
  nonce: string
  disableTransitionOnChange: boolean
  selectors: {
    dataAttributes: {
      force: Set<string>
      computed: Set<string>
      colorScheme: string
    }
    class: string
    colorScheme: string
  }
  observe: Set<Observable>
  forcedValues: boolean
  modes: {
    storage: {
      store: boolean
      strategy: Store_Strat
      key: string
    }
    /** Only Islands with defined mode in here! */
    map: Map<
      string,
      | {
          strategy: Exclude<Strat, STRATS['system']>
          store: boolean
          selectors: Set<Selector>
          colorSchemes: ColorSchemes.Static.AsMap
        }
      | {
          strategy: Extract<Strat, STRATS['system']>
          store: boolean
          selectors: Set<Selector>
          colorSchemes: ColorSchemes.Static.AsMap
          system: { mode: string; fallback: string }
        }
    >
  }
}

export const script = (args: Script_Args.Static) => {
  // #region PRESET
  const PRESET = {
    storage: {
      key: 'T3M4',
      store: true,
    },
    modes: {
      storage: {
        store: false,
        key: 'modes',
        strategy: 'unique',
        island: {
          store: true,
        },
      },
      dom: {
        selectors: ['color-scheme'],
        island: {
          selectors: [],
        },
      },
    },
    forced_values: false,
    observe: [],
    disable_transitions_on_change: false,
    nonce: '',
  } as const satisfies PRESET

  // #region CONSTANTS
  const CONSTANTS = {
    facet_types: {
      generic: 'facet',
      mode: 'mode',
    },
    strats: {
      mono: 'mono',
      multi: 'multi',
      system: 'system',
    },
    color_schemes: {
      light: 'light',
      dark: 'dark',
    },
    modes: {
      light: 'light',
      dark: 'dark',
      system: 'system',
      custom: 'custom',
    },
  } as const satisfies CONSTANTS

  // #region Engine
  function getEngine(args: Script_Args.Static): Engine {
    /** Polished - A Schema instance containing only meaningful islands */
    const schema = Object.fromEntries(
      Object.entries(args.schema).flatMap(([island, { facets, mode }]) => {
        const hasValidFacets = facets && Object.keys(facets).length > 0
        const hasMode = !!mode

        if (!hasValidFacets && !hasMode) return []

        const polished = {
          ...(mode ? { mode } : {}),
          ...(hasValidFacets ? { facets } : {}),
        }

        return [[island, polished]]
      })
    )

    /** All meaningful islands provided by Schema */
    const islands = new Set(Object.entries(schema).map(([k]) => k))

    /** All facets provided for each meaningful island in Schema */
    const facets = Object.entries(schema).reduce(
      (acc, [i, { mode, facets }]) => {
        const islandFacets = new Set<string>()

        if (facets) Object.keys(facets).forEach((f) => islandFacets.add(f))
        if (mode) islandFacets.add(CONSTANTS.facet_types.mode)

        return acc.set(i, islandFacets)
      },
      new Map() as Engine['facets']
    )

    /** All values provided for each facet of every meaningful island in Schema */
    const values = Object.entries(schema).reduce(
      (acc, [i, { facets, mode }]) => {
        const islandValues = {} as NonNullable<ReturnType<Engine['values']['get']>>

        if (facets)
          islandValues.facets = Object.entries(facets).reduce(
            (acc, [f, v]) => {
              const facetsValues = new Set<string>()

              if (typeof v === 'string') facetsValues.add(v)
              else v.forEach((v) => facetsValues.add(v))

              return acc.set(f, facetsValues)
            },
            new Map() as NonNullable<typeof islandValues.facets>
          )

        if (mode) islandValues.mode = new Set(typeof mode === 'string' ? [mode] : Array.isArray(mode) ? mode : [mode.light, mode.dark, ...(mode.system ? [mode.system] : []), ...(mode.custom ? mode.custom : [])])

        return acc.set(i, islandValues)
      },
      new Map() as Engine['values']
    )

    /** A State instance holding the default values for each facet of every meaningful island in Schema */
    const fallbacks = Object.entries(args.config).reduce(
      (acc, [i, { facets, mode }]) => {
        const islandFallbacks = {} as NonNullable<ReturnType<Engine['fallbacks']['get']>>

        if (facets)
          islandFallbacks.facets = Object.entries(facets).reduce(
            (acc, [f, stratObj]) => {
              return acc.set(f, stratObj.default as NonNullable<ReturnType<NonNullable<typeof islandFallbacks.facets>['get']>>)
            },
            new Map() as NonNullable<typeof islandFallbacks.facets>
          )

        if (mode) islandFallbacks.mode = mode.default as NonNullable<typeof islandFallbacks.mode>

        return acc.set(i, islandFallbacks)
      },
      new Map() as Engine['fallbacks']
    )

    const forceDataAttrs = Object.entries(schema).reduce(
      (acc, [i, { facets, mode }]) => {
        if (facets) Object.keys(facets).forEach((f) => acc.add(`data-force-${i}-facet-${f}`))
        if (mode) acc.add(`data-force-${i}-mode`)
        return acc
      },
      new Set() as Engine['selectors']['dataAttributes']['force']
    )

    const computedDataAttrs = Object.entries(schema).reduce(
      (acc, [i, { facets, mode }]) => {
        if (facets) Object.keys(facets).forEach((f) => acc.add(`data-facet-${f}`))
        if (mode) acc.add('data-mode')
        return acc
      },
      new Set() as Engine['selectors']['dataAttributes']['computed']
    )

    const modes = {
      storage: {
        store: args.modes?.storage?.store ?? PRESET.modes.storage.store,
        key: args.modes?.storage?.key ?? PRESET.modes.storage.key,
        strategy: args.modes?.storage?.strategy ?? PRESET.modes.storage.strategy,
      },
      map: Object.entries(schema).reduce(
        (acc, [i, { mode }]) => {
          if (!mode) return acc

          const stratObj = args.config[i]!.mode!
          const modesConfig = args.modes

          let obj = {
            store: stratObj.store ?? PRESET.modes.storage.island.store,
            selectors: new Set([
              ...(typeof modesConfig?.dom?.selector === 'string' ? [modesConfig.dom.selector] : Array.isArray(modesConfig?.dom?.selector) ? modesConfig.dom.selector : PRESET.modes.dom.selectors),
              ...(typeof stratObj.selector === 'string' ? [stratObj.selector] : Array.isArray(stratObj.selector) ? stratObj.selector : PRESET.modes.dom.island.selectors),
            ]),
            strategy: stratObj.strategy,
          } as NonNullable<ReturnType<Engine['modes']['map']['get']>>

          const colorSchemes =
            stratObj.strategy === CONSTANTS.strats.mono
              ? new Map([[stratObj.default, stratObj.colorScheme]])
              : stratObj.strategy === CONSTANTS.strats.multi
                ? new Map(Object.entries(stratObj.colorSchemes))
                : new Map([[(mode as Schema.Island.Mode.Facet.System).light, CONSTANTS.color_schemes.light], [(mode as Schema.Island.Mode.Facet.System).dark, CONSTANTS.color_schemes.dark], ...Object.entries(stratObj.colorSchemes ?? {})])

          if (stratObj.strategy === CONSTANTS.strats.system) {
            obj = {
              ...obj,
              colorSchemes,
              system: {
                mode: (mode as Schema.Island.Mode.Facet.System).system!,
                fallback: stratObj.fallback!,
              },
            } as typeof obj
            return acc.set(i, obj)
          }

          obj = { ...obj, colorSchemes } as typeof obj
          return acc.set(i, obj)
        },
        new Map() as Engine['modes']['map']
      ),
    } as Engine['modes']

    return {
      storageKeys: {
        state: args.storageKey || PRESET.storage.key,
        modes: `${args.storageKey ?? PRESET.storage.key}:${args.modes?.storage?.key ?? PRESET.modes.storage.key}`,
      },
      islands,
      facets,
      values,
      fallbacks,
      nonce: args.nonce || PRESET.nonce,
      disableTransitionOnChange: args.disableTransitionOnChange ?? PRESET.disable_transitions_on_change,
      forcedValues: args.forcedValues ?? PRESET.forced_values,
      selectors: {
        dataAttributes: {
          force: forceDataAttrs,
          computed: computedDataAttrs,
          colorScheme: 'data-color-scheme',
        },
        class: 'class',
        colorScheme: 'style',
      },
      observe: new Set(args.observe ?? PRESET.observe),
      modes,
    }
  }
  let engine = getEngine(args)

  const utils = {
    miscellaneous: {
      getSystemPref() {
        const supportsPref = window.matchMedia('(prefers-color-scheme)').media !== 'not all'
        const systemPref = supportsPref ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? CONSTANTS.modes.dark : CONSTANTS.modes.light) : undefined
        return systemPref
      },
    },
    equal: {
      deep: {
        state(state1: State.Static.AsMap | undefined, state2: State.Static.AsMap | undefined) {
          if (!state1 || !state2) return false
          if (state1.size !== state2.size) return false

          for (const [key, value1] of state1) {
            const value2 = state2.get(key)
            if (!value2) return false

            if (value1.mode !== value2.mode) return false

            const facets1 = value1.facets
            const facets2 = value2.facets

            if ((facets1 && !facets2) || (!facets1 && facets2)) return false
            if (facets1 && facets2) {
              if (facets1.size !== facets2.size) return false
              for (const [facetKey, facetVal1] of facets1) {
                if (facets2.get(facetKey) !== facetVal1) return false
              }
            }
          }

          return true
        },
        generic: {
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
          maps<K, V>(map1: Map<K, V> | null | undefined, map2: Map<K, V> | null | undefined): boolean {
            if (!map1 || !map2) return false
            if (map1 === map2) return true
            if (map1.size !== map2.size) return false

            for (const [key, value] of map1) {
              if (!map2.has(key) || !this.objects(value, map2.get(key))) return false
            }

            return true
          },
        },
      },
    },
    merge: {
      shallow: {
        maps<T extends (AtLeast<Map<string, string>, { coverage: 'partial' }> | undefined)[]>(...sources: T) {
          const result = new Map<string, string>()

          for (const source of sources) {
            if (!source) continue

            for (const [key, value] of source) {
              result.set(key, value)
            }
          }

          return result as Extract<T[number], Brand_Metadata<{ coverage: 'complete' }>> extends never ? Extract<T[number], Brand_Metadata<{ coverage: 'partial' }>> : Extract<T[number], Brand_Metadata<{ coverage: 'complete' }>>
        },
      },
      deep: {
        state: {
          maps<T extends (AtLeast<State.Static.AsMap, { coverage: 'partial' }> | undefined)[]>(...sources: T) {
            const result: State.Static.AsMap = new Map()

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

            return result as Extract<T[number], Brand_Metadata<{ coverage: 'complete' }>> extends never ? Extract<T[number], Brand_Metadata<{ coverage: 'partial' }>> : Extract<T[number], Brand_Metadata<{ coverage: 'complete' }>>
          },
        },
      },
    },
    convert: {
      shallow: {
        mapToObj: {
          string<T extends Brand<Map<string, string>, any>>(map: T) {
            return Object.fromEntries(map) as Brand<Record<string, string>, Brand_Info<T>>
          },
          set<T extends Brand<Map<string, Set<string>>, any>>(map: T) {
            const result: Record<string, string[]> = {}
            for (const [key, value] of map) {
              result[key] = Array.from(value)
            }
            return result as Brand<Record<string, string[]>, Brand_Info<T>>
          },
        },
        objToMap: {
          string<T extends Brand<Record<string, string>, any>>(obj: T) {
            return new Map(Object.entries(obj)) as Brand<Map<string, string>, Brand_Info<T>>
          },
        },
      },
      deep: {
        state: {
          mapToObj<T extends Brand<State.Static.AsMap, any>>(state: T) {
            const result = {} as State.Static

            for (const [key, { facets, mode }] of state) {
              const obj = {} as State.Static.Island
              if (mode) obj.mode = mode
              if (facets) obj.facets = Object.fromEntries(facets)
              result[key] = obj
            }

            return result as Brand<State.Static, Brand_Info<T>>
          },
          objToMap<T extends Brand<State.Static, any>>(state: T) {
            const result = new Map() as State.Static.AsMap

            for (const [key, { facets, mode }] of Object.entries(state)) {
              const obj = {} as State.Static.AsMap.Island

              if (mode) obj.mode = mode
              if (facets) {
                const map = new Map() as State.Static.AsMap.Island.Facets['facets']
                for (const [facet, value] of Object.entries(facets)) {
                  map.set(facet, value)
                }
                obj.facets = map
              }

              result.set(key, obj)
            }

            return result as Brand<State.Static.AsMap, Brand_Info<T>>
          },
        },
        values: {
          mapToObj(map: Values.Static.AsMap): Values.Static {
            const result: Values.Static = {}

            for (const [key, { facets, mode }] of map) {
              const obj = {} as Values.Static[typeof key]
              if (mode) obj.mode = Array.from(mode)
              if (facets) {
                const facetsObj = {} as NonNullable<Values.Static[typeof key]['facets']>
                for (const [facet, value] of facets) {
                  facetsObj[facet] = Array.from(value)
                }
                obj.facets = facetsObj
              }
              result[key] = obj
            }

            return result
          },
        },
      },
    },
    /** Construct appropriate entities dynamically based on provided fn arguments - no additional logic */
    construct: {
      /**
       * Constructs appropriate ColorSchemes map instance for each island in the given State, based on configuration settings.
       *
       * Skips:
       * - Islands with no mode defined in the state
       * - Islands not defined in the configuration (i.e., missing from engine.modes)
       *
       * Handles the 'system' mode case as needed, too
       */
      colorSchemes<T extends AtLeast<State.Static.AsMap, { coverage: 'partial' }>>(state: T) {
        return utils.resolve.colorSchemes(state)
      },
    },
    resolve: {
      /**
       * Determines the appropriate ColorScheme for a given island and mode, based on configuration settings.
       *
       * Skips:
       * - islands that have no configuration defined (i.e., not present in the engine.modes map)
       *
       * Handles the 'system' mode case as needed, too
       */
      colorScheme(island: string, mode: string) {
        const modeConfig = engine.modes.map.get(island)
        if (!modeConfig) return

        const isSystemStrat = modeConfig.strategy === CONSTANTS.strats.system
        const isSystem = isSystemStrat && modeConfig.system.mode === mode
        if (isSystem) return utils.miscellaneous.getSystemPref() ?? modeConfig.colorSchemes.get(modeConfig.system.fallback)

        return modeConfig.colorSchemes.get(mode)
      },
      /**
       * Resolves appropriate ColorSchemes for each island in the given State, based on configuration settings.
       *
       * Skips:
       * - Islands with no mode defined in the state
       * - Islands not defined in the configuration (i.e., missing from engine.modes)
       *
       * Handles the 'system' mode case as needed, too
       */
      colorSchemes<T extends AtLeast<State.Static.AsMap, { coverage: 'partial' }>>(state: T) {
        const modes = Array.from(state).reduce((acc, [i, { mode }]) => {
          if (!mode) return acc
          return acc.set(i, mode)
        }, new Map() as Modes.AsMap)

        const colorSchemes = Array.from(modes).reduce((acc, [i, mode]) => {
          const resolvedScheme = utils.resolve.colorScheme(i, mode)

          if (!resolvedScheme) return acc
          return acc.set(i, resolvedScheme)
        }, new Map() as ColorSchemes.Static.AsMap)

        return colorSchemes as Brand<ColorSchemes.Static.AsMap, Brand_Info<T>>
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

  // #region Main
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
          const computed = utils.merge.deep.state.maps(base, forced)

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
          if (!state) return undefined

          const colorSchemes = utils.construct.colorSchemes(state)
          return colorSchemes
        },
        computed() {
          const base = Main.get.colorSchemes.base()
          if (!base) return undefined

          const forced = Main.get.colorSchemes.forced()
          const computed = utils.merge.shallow.maps(base, forced)

          return computed
        },
      },
    }

    public static set = {
      state: {
        base: (state: AtLeast<State.Static.AsMap, { coverage: 'partial' }>) => {
          const currState = Main.get.state.base()
          if (!currState) return console.error('[T3M4]: Library not initialized')

          const mergedState = utils.merge.deep.state.maps(currState, state)
          Main.smartUpdateNotify.state.base(mergedState)
        },
        forced: (state: AtLeast<State.Static.AsMap, { coverage: 'partial'; validation: 'normalized' }>) => {
          Main.smartUpdateNotify.state.forced(state)
        },
      },
    }

    private static smartUpdateNotify = {
      state: {
        base(newState: AtLeast<State.Static.AsMap, { coverage: 'complete'; validation: 'normalized' }>) {
          const currState = Main.get.state.base()
          if (!currState) return console.error('[T3M4] Library not initialized.')

          const isEqual = utils.equal.deep.state(currState, newState)
          if (isEqual) return

          Main.instance.state.base = newState
          Main.notifyUpdate.state.base(newState)

          const computedState = Main.get.state.computed()!
          Main.notifyUpdate.state.computed(computedState)
        },
        forced(newState: AtLeast<State.Static.AsMap, { coverage: 'partial'; validation: 'normalized' }>) {
          const currState = Main.get.state.forced()
          if (!currState) return console.error('[T3M4] Library not initialized.')

          const isEqual = utils.equal.deep.state(currState, newState)
          if (isEqual) return

          Main.instance.state.forced = newState
          Main.notifyUpdate.state.forced(newState)

          const computedState = Main.get.state.computed()!
          Main.notifyUpdate.state.computed(computedState)
        },
      },
    }

    private static notifyUpdate = {
      state: {
        base: (state: AtLeast<State.Static.AsMap, { coverage: 'complete'; validation: 'normalized' }>) => {
          const colorSchemes = utils.construct.colorSchemes(state)
          EventManager.emit('State:Base:Update', utils.convert.deep.state.mapToObj(state))
          EventManager.emit('ColorSchemes:Base:Update', utils.convert.shallow.mapToObj.string(colorSchemes) as ColorSchemes.Static)
        },
        forced: (state: AtLeast<State.Static.AsMap, { coverage: 'partial'; validation: 'normalized' }>) => {
          const colorSchemes = utils.construct.colorSchemes(state)
          EventManager.emit('State:Forced:Update', utils.convert.deep.state.mapToObj(state))
          EventManager.emit('ColorSchemes:Forced:Update', utils.convert.shallow.mapToObj.string(colorSchemes) as ColorSchemes.Static)
        },
        computed: (state: AtLeast<State.Static.AsMap, { coverage: 'complete'; validation: 'normalized' }>) => {
          const colorSchemes = utils.construct.colorSchemes(state)
          EventManager.emit('State:Computed:Update', utils.convert.deep.state.mapToObj(state))
          EventManager.emit('ColorSchemes:Computed:Update', utils.convert.shallow.mapToObj.string(colorSchemes) as ColorSchemes.Static)
        },
      },
    }

    public static reboot() {
      Main.instance = new Main()
    }

    private state: {
      base: AtLeast<State.Static.AsMap, { coverage: 'complete'; validation: 'normalized' }> | undefined
      forced: AtLeast<State.Static.AsMap, { coverage: 'partial'; validation: 'normalized' }> | undefined
    } = {
      base: undefined,
      forced: undefined,
    }

    private constructor() {
      // StorageManager.init()
      // DomManager.init()

      // const storageState = StorageManager.get.state.normalized()
      const storageState = new Map([['root', { mode: 'light' }]]) as Brand<State.Static.AsMap, { coverage: 'complete'; validation: 'normalized' }>

      const baseState = storageState
      this.state.base = baseState
      Main.notifyUpdate.state.base(baseState)

      // const forcedState = DomManager.get.state.forced.all.sanitized()
      const forcedState = new Map() as Brand<State.Static.AsMap, { coverage: 'partial'; validation: 'normalized' }>
      this.state.forced = forcedState
      Main.notifyUpdate.state.forced(forcedState)

      const computedState = utils.merge.deep.state.maps(baseState, forcedState) as typeof baseState
      Main.notifyUpdate.state.computed(computedState)
    }
  }

  // #region T3M4
  class T3M4 implements T_T3M4 {
    public get = {
      state: {
        base: () => {
          const state = Main.get.state.base()
          if (!state) return undefined
          return utils.convert.deep.state.mapToObj(state)
        },
        forced: () => {
          const state = Main.get.state.forced()
          if (!state) return undefined
          return utils.convert.deep.state.mapToObj(state)
        },
        computed: () => {
          const state = Main.get.state.computed()
          if (!state) return undefined
          return utils.convert.deep.state.mapToObj(state)
        },
      },
      colorSchemes: {
        base: () => {
          const colorSchemes = Main.get.colorSchemes.base()
          if (!colorSchemes) return undefined
          return utils.convert.shallow.mapToObj.string(colorSchemes) as ColorSchemes.Static
        },
        forced: () => {
          const colorSchemes = Main.get.colorSchemes.forced()
          if (!colorSchemes) return undefined
          return utils.convert.shallow.mapToObj.string(colorSchemes) as ColorSchemes.Static
        },
        computed: () => {
          const colorSchemes = Main.get.colorSchemes.computed()
          if (!colorSchemes) return undefined
          return utils.convert.shallow.mapToObj.string(colorSchemes) as ColorSchemes.Static
        },
      },
      values: () => utils.convert.deep.values.mapToObj(engine.values),
    }

    public set = {
      state: {
        base: (state: State.Static) => {
          const stateMap = utils.convert.deep.state.objToMap(state as Brand<State.Static, { coverage: 'complete'; validation: 'normalized' }>)
          Main.set.state.base(stateMap)
        },
        forced: (state: State.Static) => {
          const stateMap = utils.convert.deep.state.objToMap(state as Brand<State.Static, { coverage: 'partial'; validation: 'normalized' }>)
          Main.set.state.forced(stateMap)
        },
      },
    }

    public subscribe<E extends keyof EventMap>(e: E, id: CallbackID, cb: (payload: EventMap[E]) => void) {
      EventManager.on(e, id, cb)
    }

    public reboot(newArgs: Script_Args.Static) {
      const needsReboot = !utils.equal.deep.generic.objects(args, newArgs)
      if (!needsReboot) return
      EventManager.emit('Reset')
      // StorageManager.terminate()
      // DomManager.terminate()
      engine = getEngine(newArgs)
      Main.reboot()
    }

    public constructor() {
      Main.init()
    }
  }

  window.T3M4 = new T3M4()
}
