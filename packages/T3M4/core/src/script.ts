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
  toStore: {
    yes: 'yes'
    no: 'no' | Brand_Stages['toStore']['yes']
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
namespace Brand_Metadata {
  export type Static = {
    [__brand]: Partial<Brand_Map>
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
  export type AsObj = Record<string, string>
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
      key: string,
      toStore: Islands.Static.AsSet
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
        toStore: Object.entries(schema).reduce((acc, [i, { mode }]) => {
          if (!mode) return acc

          const stratObj = args.config[i]!.mode!
          const mustStore = stratObj.store ?? PRESET.modes.storage.island.store
          if (!mustStore) return acc

          return acc.add(i)
        }, new Set() as Set<string>)
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
    } satisfies Engine['modes']

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
      safeParse(json: string | null) {
        if (!json?.trim()) return null

        try {
          return JSON.parse(json) as unknown
        } catch (e) {
          return null
        }
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
      shallow: {
        map: {
          string(map1: Map<string, string> | undefined, map2: Map<string, string> | undefined) {
            if (!map1 || !map2) return false
            if (map1.size !== map2.size) return false

            for (const [key, value] of map1) {
              if (map2.get(key) !== value) return false
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
          string<T extends Brand<Map<string, string>, Partial<Brand_Map>>>(map: T) {
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
          mapToObj<T extends State.Static.AsMap>(state: T) {
            const result = {} as State.Static

            for (const [key, { facets, mode }] of state) {
              const obj = {} as State.Static.Island
              if (mode) obj.mode = mode
              if (facets) obj.facets = Object.fromEntries(facets)
              result[key] = obj
            }

            return result as T extends Brand_Metadata.Static ? Brand<State.Static, Brand_Info<T>> : State.Static
          },
          objToMap<T extends State.Static>(state: T) {
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

            return result as T extends Brand_Metadata.Static ? Brand<State.Static.AsMap, Brand_Info<T>> : State.Static.AsMap
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
      modes<T extends AtLeast<State.Static.AsMap, { coverage: 'partial' }>>(state: T) {
        const modes = Array.from(state).reduce((acc, [i, { mode }]) => {
          if (!mode) return acc
          return acc.set(i, mode)
        }, new Map() as Modes.AsMap)

        return modes as Brand<Modes.AsMap, Brand_Info<T>>
      },
      state: {
        fromModes<T extends Modes.AsMap>(modes: T) {
          const state = Array.from(modes).reduce((acc, [i, mode]) => {
            return acc.set(i, { mode })
          }, new Map() as State.Static.AsMap)

          return state as T extends Brand_Metadata.Static ? Brand<State.Static.AsMap, Omit<Brand_Info<T>, 'coverage'> & { coverage: 'partial' }> : Modes.AsMap
        },
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
    deserialize: {
      state(string: string) {
        const parsed = utils.miscellaneous.safeParse(string)
        if (!parsed) return undefined

        const isPlainObject = utils.isValid.type.plainObject(parsed)
        if (!isPlainObject) return undefined

        const isStateObj = utils.isValid.structure.state.obj(parsed)
        if (!isStateObj) return undefined

        const dirtyState = utils.convert.deep.state.objToMap(parsed)
        return dirtyState
      },
      modes(string: string) {
        const fallback = new Map() as Brand<Modes.AsMap, { validation: 'dirty'; coverage: 'partial' | 'complete' }>

        const parsed = utils.miscellaneous.safeParse(string)
        if (!parsed) return fallback

        const isPlainObject = utils.isValid.type.plainObject(parsed)
        if (!isPlainObject) return fallback

        const isModesObj = utils.isValid.structure.modes.obj(parsed)
        if (!isModesObj) return fallback

        const dirtyModes = utils.convert.shallow.objToMap.string(parsed)
        return dirtyModes as Brand<Modes.AsMap, { validation: 'dirty'; coverage: 'partial' | 'complete' }>
      },
    },
    sanitize: {
      state: {
        option: {
          facet<T extends AtLeast<string, { validation: 'dirty' }>>(island: string, facet: string, value: T, backup?: T) {
            const isIsland = utils.isValid.value.island(island)
            if (!isIsland) return

            const isFacet = utils.isValid.value.facet(island, facet)
            if (!isFacet) return

            const isOption = utils.isValid.value.option.facet(island, facet, value)
            const isBackupOption = backup ? utils.isValid.value.option.facet(island, facet, backup) : false
            const fallback = engine.fallbacks.get(island)!.facets!.get(facet)!

            return (isOption ? value : isBackupOption ? backup! : fallback) as Brand<string, { validation: 'sanitized' }>
          },
          mode(island: string, value: AtLeast<string, { validation: 'dirty' }>, backup?: AtLeast<string, { validation: 'dirty' }>) {
            const isIsland = utils.isValid.value.island(island)
            if (!isIsland) return

            const hasMode = engine.values.get(island)!.mode !== undefined
            if (!hasMode) return

            const isOption = utils.isValid.value.option.mode(island, value)
            const isBackupOption = backup ? utils.isValid.value.option.mode(island, backup) : false
            const fallback = engine.fallbacks.get(island)!.mode!

            return (isOption ? value : isBackupOption ? backup! : fallback) as Brand<string, { validation: 'sanitized' }>
          },
        },
        island<T extends AtLeast<State.Static.AsMap.Island, { validation: 'dirty' }>>(island: string, values: T, backup?: T) {
          const isIsland = utils.isValid.value.island(island)
          if (!isIsland) return

          const obj = {} as Brand<State.Static.AsMap.Island, { validation: 'sanitized' }>

          if (values.facets) {
            const facets = new Map() as NonNullable<typeof obj.facets>
            for (const [facet, value] of values.facets) {
              const sanFacet = utils.sanitize.state.option.facet(island, facet, value, backup?.facets?.get(facet))
              if (sanFacet) facets.set(facet, sanFacet)
            }
            if (facets.size !== 0) obj.facets = facets
          }

          if (values.mode) {
            const mode = utils.sanitize.state.option.mode(island, values.mode, backup?.mode)
            if (mode) obj.mode = mode
          }

          return obj
        },
        all<T extends AtLeast<State.Static.AsMap, { validation: 'dirty' }>>(state: T, backup?: T) {
          const sanState = new Map() as Brand<State.Static.AsMap, { validation: 'sanitized' }>

          for (const [island, values] of state) {
            const sanIsland = utils.sanitize.state.island(island, values, backup?.get(island))
            if (!sanIsland) continue

            sanState.set(island, sanIsland)
          }

          return sanState
        },
      },
      modes: {
        mode(island: string, value: string | undefined, backup?: string) {
          const isIsland = utils.isValid.value.island(island)
          if (!isIsland) return

          const hasMode = !!engine.values.get(island)!.mode
          if (!hasMode) return

          const mustStore = engine.modes.map.get(island)?.store
          if (!mustStore) return

          const isMode = utils.isValid.value.option.mode(island, value)
          const isBackupMode = backup ? utils.isValid.value.option.mode(island, backup) : false
          const fallback = engine.fallbacks.get(island)!.mode!

          return (isMode ? value : isBackupMode ? backup! : fallback) as Brand<string, { validation: 'sanitized' }>
        },
        all<T extends AtLeast<Modes.AsMap, { validation: 'dirty' }>>(modes: T, backup?: T) {
          const sanModes = new Map() as Brand<Modes.AsMap, { validation: 'sanitized' }>

          for (const [island, value] of modes) {
            const sanMode = utils.sanitize.modes.mode(island, value, backup?.get(island))
            if (!sanMode) continue

            sanModes.set(island, sanMode)
          }

          return sanModes
        },
      },
    },
    normalize: {
      state: {
        island<T extends AtLeast<State.Static.AsMap.Island, { validation: 'dirty' }>>(island: string, values: T, backup?: T) {
          const isIsland = utils.isValid.value.island(island)
          if (!isIsland) return

          const normalized = {} as Brand<State.Static.AsMap.Island, { validation: 'normalized'; coverage: 'complete' }>

          // fallbacks
          for (const [facet, fallback] of engine.fallbacks.get(island)!.facets ?? []) {
            if (!normalized.facets) normalized.facets = new Map() as NonNullable<typeof normalized.facets>
            normalized.facets.set(facet, fallback)
          }
          if (engine.fallbacks.get(island)!.mode) normalized.mode = engine.fallbacks.get(island)!.mode!

          // backup
          if (backup) {
            const sanBackup = utils.sanitize.state.island(island, backup)! as unknown as Brand<State.Static.AsMap.Island, { validation: 'normalized' }>
            if (sanBackup.facets) {
              for (const [facet, value] of sanBackup.facets) {
                normalized.facets?.set(facet, value)
              }
            }
            if (sanBackup.mode) normalized.mode = sanBackup.mode
          }

          // values
          const sanValues = utils.sanitize.state.island(island, values, backup)! as unknown as Brand<State.Static.AsMap.Island, { validation: 'normalized' }>
          if (sanValues.facets) {
            for (const [facet, value] of sanValues.facets) {
              normalized.facets?.set(facet, value)
            }
          }
          if (sanValues.mode) normalized.mode = sanValues.mode

          return normalized
        },
        state<T extends AtLeast<State.Static.AsMap, { validation: 'dirty' }>>(state: T | undefined, backup?: T) {
          const normalized = new Map() as Brand<State.Static.AsMap, { validation: 'normalized'; coverage: 'complete' }>

          for (const [island, values] of engine.fallbacks) {
            normalized.set(island, values)
          }

          for (const [island, values] of backup ?? []) {
            const normIsland = utils.normalize.state.island(island, values)
            if (!normIsland) continue

            normalized.set(island, normIsland)
          }

          for (const [island, values] of state ?? []) {
            const normIsland = utils.normalize.state.island(island, values, backup?.get(island))
            if (!normIsland) continue

            normalized.set(island, normIsland)
          }

          return normalized
        },
      },
      modes: {
        mode: (island: string, value: string | undefined, backup?: string) => {
          return utils.sanitize.modes.mode(island, value, backup) as unknown as Brand<string, { validation: 'normalized' }> | undefined
        },
        all: <T extends AtLeast<Modes.AsMap, { validation: 'dirty' }>>(values: T | undefined, backup?: T) => {
          const normalized = new Map() as Brand<Modes.AsMap, { validation: 'normalized'; coverage: 'complete' }>

          for (const [island, value] of utils.construct.modes(engine.fallbacks)) {
            normalized.set(island, value)
          }

          if (backup) {
            for (const [island, value] of backup) {
              const sanValue = utils.sanitize.modes.mode(island, value) as unknown as Brand<string, { validation: 'normalized' }>
              if (!sanValue) continue

              normalized.set(island, sanValue)
            }
          }

          for (const [island, value] of values ?? []) {
            const sanValue = utils.sanitize.modes.mode(island, value, backup?.get(island)) as unknown as Brand<string, { validation: 'normalized' }>
            if (!sanValue) continue

            normalized.set(island, sanValue)
          }

          return normalized
        },
      },
    },
    isValid: {
      value: {
        island(value: string | undefined | null): value is string {
          if (!value) return false
          return engine.islands.has(value)
        },
        facet(island: string, value: string | undefined | null): value is string {
          if (!value) return false
          return engine.values.get(island)?.facets?.has(value) ?? false
        },
        mode(island: string, value: string | undefined | null): value is string {
          if (!value) return false

          const isMode = value === 'mode'
          const islandHasMode = engine.values.get(island)?.mode ?? false

          if (isMode && islandHasMode) return true
          return false
        },
        option: {
          facet(island: string, facet: string, value: string | undefined | null): value is string {
            if (!value) return false
            return engine.values.get(island)?.facets?.get(facet)?.has(value) ?? false
          },
          mode(island: string, value: string | undefined | null): value is string {
            if (!value) return false
            return engine.values.get(island)?.mode?.has(value) ?? false
          },
        },
      },
      structure: {
        state: {
          obj(obj: Record<string, unknown>): obj is Brand<State.Static, { validation: 'dirty' }> {
            for (const [, value] of Object.entries(obj)) {
              if (typeof value !== 'object' || value === null || Array.isArray(value)) return false

              const { facets, mode } = value as Record<string, unknown>
              if (facets !== undefined && (typeof facets !== 'object' || facets === null || Array.isArray(facets))) return false
              if (facets !== undefined) {
                for (const fKey in facets) {
                  if (typeof (facets as Record<string, unknown>)[fKey] !== 'string') return false
                }
              }

              if (mode !== undefined && typeof mode !== 'string') return false
            }

            return true
          },
        },
        modes: {
          obj(obj: Record<string, unknown>): obj is Brand<Modes.AsObj, { validation: 'dirty' }> {
            return Object.values(obj).every((v) => typeof v === 'string')
          },
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

  // #region Storage Manager
  class StorageManager {
    private static instance: StorageManager | undefined
    private static abortController: AbortController | undefined
    private static isInternalChange = false

    public static init() {
      if (!StorageManager.instance) StorageManager.instance = new StorageManager()
    }

    public static get = {
      state: {
        serialized: () => {
          const retrieved = window.localStorage.getItem(engine.storageKeys.state)
          return retrieved ?? undefined
        },
        deserialized: () => {
          const serialized = StorageManager.get.state.serialized()
          if (!serialized) return undefined

          const deserialized = utils.deserialize.state(serialized)
          return deserialized
        },
        sanitized: () => {
          const deserialized = StorageManager.get.state.deserialized()
          if (!deserialized) return undefined

          const sanitized = utils.sanitize.state.all(deserialized)
          return sanitized
        },
        normalized: () => {
          const sanitized = StorageManager.get.state.sanitized()

          const normalized = utils.normalize.state.state(sanitized ?? engine.fallbacks)
          return normalized
        },
      },
      modes: {
        unique: {
          serialized: () => {
            const retrieved = window.localStorage.getItem(`${engine.storageKeys.modes}`)
            return retrieved ?? undefined
          },
          deserialized: () => {
            const serialized = StorageManager.get.modes.unique.serialized()
            if (!serialized) return new Map() as Brand<Modes.AsMap, { validation: 'dirty' }>

            const deserialized = utils.deserialize.modes(serialized)
            return deserialized
          },
          sanitized: () => {
            const deserialized = StorageManager.get.modes.unique.deserialized()
            const sanitized = utils.sanitize.modes.all(deserialized)
            return sanitized
          },
          normalized: () => {
            const sanitized = StorageManager.get.modes.unique.sanitized()
            const normalized = utils.normalize.modes.all(sanitized)
            return normalized
          },
        },
        split: {
          dirty: () => {
            const dirty = new Map() as Brand<Modes.AsMap, { validation: 'dirty' }>

            for (const island of engine.islands) {
              const retrieved = window.localStorage.getItem(`${engine.storageKeys.modes}-${island}`) as Brand<string, { validation: 'dirty' }> | null
              if (!retrieved) continue

              dirty.set(island, retrieved)
            }

            return dirty
          },
          sanitized: () => {
            const dirty = StorageManager.get.modes.split.dirty()
            const sanitized = utils.sanitize.modes.all(dirty)
            return sanitized
          },
          normalized: () => {
            const sanitized = StorageManager.get.modes.split.sanitized()
            const normalized = utils.normalize.modes.all(sanitized)
            return normalized
          },
        },
      },
    }

    public static set = {
      state: {
        facet<T extends Brand<string, { validation: 'normalized' }>>(island: string, facet: string, value: T) {
          const currState = Main.get.state.base()!
          const newStatePartial = new Map([[island, { facets: new Map([[facet, value]]) }]]) as unknown as Brand<State.Static.AsMap, Brand_Info<T> & { coverage: 'partial' }>

          const newState = utils.merge.deep.state.maps(currState, newStatePartial)
          const newStateObj = utils.convert.deep.state.mapToObj(newState)
          const newSerState = JSON.stringify(newStateObj) as Brand<string, { validation: 'normalized' }>

          const currSerState = StorageManager.get.state.serialized()

          const needsUpdate = currSerState !== newSerState
          if (needsUpdate) StorageManager.updateStorage.state(newSerState)
        },
        island<T extends Brand<State.Static.AsMap.Island, { coverage: 'complete'; validation: 'normalized' }>>(island: string, values: T) {
          const currState = Main.get.state.base()!
          const newStatePartial = new Map([[island, values]]) as unknown as Brand<State.Static.AsMap, Brand_Info<T> & { coverage: 'partial' }>

          const newState = utils.merge.deep.state.maps(currState, newStatePartial)
          const newStateObj = utils.convert.deep.state.mapToObj(newState)
          const newSerState = JSON.stringify(newStateObj) as Brand<string, { validation: 'normalized' }>

          const currSerState = StorageManager.get.state.serialized()

          const needsUpdate = currSerState !== newSerState
          if (needsUpdate) StorageManager.updateStorage.state(newSerState)
        },
        all<T extends AtLeast<State.Static.AsMap, { coverage: 'complete'; validation: 'normalized' }>>(state: T) {
          const newStateObj = utils.convert.deep.state.mapToObj(state)
          const newSerState = JSON.stringify(newStateObj) as Brand<string, { validation: 'normalized' }>

          const currSerState = StorageManager.get.state.serialized()

          const needsUpdate = currSerState !== newSerState
          if (needsUpdate) StorageManager.updateStorage.state(newSerState)

          StorageManager.set.modes.set(state)
        },
      },
      modes: {
        split: {
          island(island: string, mode: Brand<string, { validation: 'normalized' }>) {
            if (!engine.modes.storage.store) return
            if (engine.modes.storage.strategy !== 'split') return
            if (!engine.modes.map.get(island)?.store) return

            const currMode = StorageManager.get.modes.split.dirty().get(island)

            const needsUpdate = (currMode as string) !== (mode as string)
            if (needsUpdate) StorageManager.updateStorage.modes.split.island(island, mode as Brand<string, Brand_Info<typeof mode> & { toStore: 'yes' }>)
          },
          all(modes: AtLeast<Modes.AsMap, { validation: 'normalized' }>) {
            if (!engine.modes.storage.store) return
            if (engine.modes.storage.strategy !== 'split') return

            const modesToStore = StorageManager.constructModesToStore(modes)

            const modesToUpdate = Array.from(modesToStore).reduce(
              (acc, [i, mode]) => {
                const currMode = StorageManager.get.modes.split.dirty().get(i)

                const needsUpdate = (currMode as string) !== (mode as string)
                if (needsUpdate) acc.set(i, mode)

                return acc
              },
              new Map() as typeof modesToStore
            )

            StorageManager.updateStorage.modes.split.all(modesToUpdate)
          },
        },
        unique: {
          island: (island: string, mode: Brand<string, { validation: 'normalized' }>) => {
            if (!engine.modes.storage.store) return
            if (engine.modes.storage.strategy !== 'unique') return
            if (!engine.modes.map.get(island)?.store) return

            const currModes = Main.get.modes.base()!
            const currModesToStore = StorageManager.constructModesToStore(currModes)

            const newModes = currModesToStore.set(island, mode as Brand<string, Brand_Info<typeof mode> & { toStore: 'yes' }>)

            const currStorageModes = StorageManager.get.modes.unique.deserialized()

            const needsUpdate = !utils.equal.shallow.map.string(currStorageModes, newModes)
            if (needsUpdate) StorageManager.updateStorage.modes.unique.all(newModes)
          },
          all: (modes: AtLeast<Modes.AsMap, { validation: 'normalized' }>) => {
            if (!engine.modes.storage.store) return
            if (engine.modes.storage.strategy !== 'unique') return

            const modesToStore = StorageManager.constructModesToStore(modes)

            const currStorageModes = StorageManager.get.modes.unique.deserialized()

            const needsUpdate = !utils.equal.shallow.map.string(currStorageModes, modesToStore)
            if (needsUpdate) StorageManager.updateStorage.modes.unique.all(modesToStore)
          },
        },
        set: (state: AtLeast<State.Static.AsMap, { validation: 'normalized'; coverage: 'complete' }>) => { 
          if (!engine.modes.storage.store) return

          const modes = utils.construct.modes(state)
          if (engine.modes.storage.strategy === 'unique') StorageManager.set.modes.unique.all(modes)
          else if (engine.modes.storage.strategy === 'split') StorageManager.set.modes.split.all(modes)
        }
      },
    }

    private static updateStorage = {
      state(serState: AtLeast<string, { validation: 'normalized' }>) {
        if (StorageManager.isInternalChange) return

        StorageManager.isInternalChange = true
        window.localStorage.setItem(engine.storageKeys.state, serState)
        StorageManager.isInternalChange = false
      },
      modes: {
        split: {
          island: (island: string, mode: AtLeast<string, { validation: 'normalized'; toStore: 'yes' }>) => {
            if (StorageManager.isInternalChange) return

            StorageManager.isInternalChange = true
            window.localStorage.setItem(`${engine.storageKeys.modes}:${island}`, mode)
            StorageManager.isInternalChange = false
          },
          all: (modes: AtLeast<Modes.AsMap, { validation: 'normalized'; toStore: 'yes' }>) => {
            if (StorageManager.isInternalChange) return

            StorageManager.isInternalChange = true
            for (const [island, mode] of modes) {
              window.localStorage.setItem(`${engine.storageKeys.modes}:${island}`, mode)
            }
            StorageManager.isInternalChange = false
          },
        },
        unique: {
          all: (modes: AtLeast<Modes.AsMap, { validation: 'normalized'; toStore: 'yes' }>) => {
            if (StorageManager.isInternalChange) return
            if (engine.modes.storage.toStore.size === 0) return
            if (modes.size === 0) return

            StorageManager.isInternalChange = true

            const modesObj = utils.convert.shallow.mapToObj.string(modes)
            window.localStorage.setItem(engine.storageKeys.modes, JSON.stringify(modesObj))

            StorageManager.isInternalChange = false
          },
        },
      },
    }

    private static constructModesToStore<T extends Modes.AsMap>(modes: T) {
      const modesToStore = Array.from(modes).reduce(
        (acc, [i, mode]) => {
          if (!engine.modes.map.get(i)?.store) return acc
          return acc.set(i, mode as T extends Brand_Metadata.Static ? Brand<string, Brand_Info<T> & { toStore: 'yes' }> : Brand<string, { toStore: 'yes' }>)
        },
        new Map() as T extends Brand_Metadata.Static ? Brand<Modes.AsMap, Brand_Info<T> & { toStore: 'yes' }> : Brand<Modes.AsMap, { toStore: 'yes' }>
      )

      return modesToStore
    }

    public static terminate() {
      StorageManager.abortController?.abort()

      localStorage.removeItem(engine.storageKeys.state)
      if (engine.modes.storage.store) {
        if (engine.modes.storage.strategy === 'unique') localStorage.removeItem(`${engine.storageKeys.modes}`)
        else if (engine.modes.storage.strategy === 'split') {
          for (const island of engine.islands) {
            localStorage.removeItem(`${engine.storageKeys.modes}:${island}`)
          }
        }
      }

      StorageManager.instance = undefined
    }

    private constructor() {
      EventManager.on('State:Base:Update', 'StorageManager:State:Update', (state) => StorageManager.set.state.all(utils.convert.deep.state.objToMap(state as Brand<State.Static, { validation: 'normalized'; coverage: 'complete' }>)))

      StorageManager.abortController = new AbortController()
      window.addEventListener(
        'storage',
        ({ key, oldValue, newValue }) => {
          switch (true) {
            case key === engine.storageKeys.state:
              {
                const deserNew = newValue ? utils.deserialize.state(newValue) : undefined
                const deserOld = oldValue ? utils.deserialize.state(oldValue) : undefined

                const normalized = utils.normalize.state.state(deserNew ?? deserOld, deserOld)
                StorageManager.set.state.all(normalized)
                Main.set.state.base(normalized)
              }
              break
            case key === `${engine.storageKeys.modes}`:
              {
                if (!engine.modes.storage.store) return
                if (engine.modes.storage.toStore.size === 0) return
                if (engine.modes.storage.strategy !== 'unique') return

                const deserNew = newValue ? utils.deserialize.modes(newValue) : undefined
                const deserOld = oldValue ? utils.deserialize.modes(oldValue) : undefined

                const normModes = utils.normalize.modes.all(deserNew ?? deserOld, deserOld)
                const statePartial = utils.construct.state.fromModes(normModes)

                StorageManager.set.modes.unique.all(normModes)
                Main.set.state.base(statePartial)
              }
              break
            case key?.startsWith(`${engine.storageKeys.modes}:`):
              {
                if (!engine.modes.storage.store) return
                if (engine.modes.storage.toStore.size === 0) return
                if (engine.modes.storage.strategy !== 'split') return

                const island = key?.split(`${engine.storageKeys.modes}:`)[1]
                if (!island) return

                const isIsland = utils.isValid.value.island(island)
                if (!isIsland) return

                const normMode = utils.normalize.modes.mode(island, newValue ?? oldValue ?? undefined, oldValue ?? undefined)!
                const statePartial = utils.construct.state.fromModes(new Map([[island, normMode]]) as Brand<Modes.AsMap, { validation: 'normalized' }>)

                StorageManager.set.modes.split.island(island, normMode)
                Main.set.state.base(statePartial)
              }
              break
          }
        },
        {
          signal: StorageManager.abortController.signal,
        }
      )
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
      modes: {
        base() {
          const state = Main.get.state.base()
          if (!state) return undefined

          const modes = utils.construct.modes(state)
          return modes
        },
        forced() {
          const state = Main.get.state.forced()
          if (!state) return undefined

          const modes = utils.construct.modes(state)
          return modes
        },
        computed() {
          const base = Main.get.modes.base()
          if (!base) return undefined

          const forced = Main.get.modes.forced()
          const computed = utils.merge.shallow.maps(base, forced)

          return computed
        },
      },
    }

    public static set = {
      state: {
        base: (state: AtLeast<State.Static.AsMap, { coverage: 'partial'; validation: 'normalized' }>) => {
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
      StorageManager.init()
      // DomManager.init()

      const storageState = StorageManager.get.state.normalized()

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
  console.log(engine.modes)
}
