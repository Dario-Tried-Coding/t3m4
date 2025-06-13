import { CONSTANTS } from './types/constants'
import { Observable } from './types/constants/observables'
import { Selector } from './types/constants/selectors'
import { Store_Strat, Strat, STRATS } from './types/constants/strats'
import { PRESET } from './types/preset'
import { Script_Args } from './types/script'
import { ColorSchemes, Islands, Schema, State, Values } from './types/subscribers'
import { T3M4 as T_T3M4 } from './types'
import { CallbackID, EventMap } from './types/events'
import { Color_Scheme } from './types/constants/color-schemes'
import { Facet_Type } from './types/constants/facets'

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
  type: {
    island: 'island'
    facet: 'facet'
    mode: 'mode'
    option: 'option'
  }
  option: {
    facet: 'facet'
    mode: 'mode'
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
  T extends NodeListOf<infer U>
    ? Brand.Shallow<NodeListOf<Brand.Shallow<U, Omit<B, Non_Primitive_Parameters>>>, B>
    : T extends Map<infer K, infer V>
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

type AtLeast<T, B extends Partial<{ [K in keyof Brand_Stages]: keyof Brand_Stages[K] }>> =
  T extends NodeListOf<infer U>
    ? Brand.Shallow<NodeListOf<Brand.Shallow<U, Omit<B, Non_Primitive_Parameters>>>, B>
    : T extends Map<infer K, infer V>
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
  islands: Set<Brand<string, { type: 'island' }>>
  facets: Map<string, { mode?: boolean; facets?: Set<string> }>
  values: Values.Static.AsMap
  fallbacks: Brand<State.Static.AsMap, { coverage: 'complete'; validation: 'normalized' }>
  nonce: string
  disableTransitionOnChange: boolean
  selectors: {
    observe: {
      dataAttributes: {
        island: string
        forced: Set<string>
        computed: Set<string>
        colorScheme: string
      }
      class: string
      colorScheme: string
    }
    types: {
      dataAttributes: {
        island: string
        computed: {
          facet: (facet: string) => string
          mode: string
        }
        forced: {
          facet: (island: string, facet: string) => string
          mode: (island: string) => string
        }
        colorScheme: string
      }
    }
  }
  storage: {
    key: string
    store: boolean
    toStore: Map<string, { mode?: boolean; facets?: Set<string> }>
  }
  observe: Set<Observable>
  forcedValues: boolean
  modes: Map<
    string,
    {
      strategy: Strat
      selectors: Set<Selector>
      colorSchemes: ColorSchemes.Static.AsMap
      system?: { mode: string; fallback: string }
    }
  >
}

export const script = (args: Script_Args.Static) => {
  // #region PRESET
  const PRESET = {
    storage: {
      key: 'T3M4',
      store: {
        values: false,
        value: true,
      },
    },
    modes: {
      dom: {
        selectors: [],
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
    const islands = new Set(Object.entries(schema).map(([k]) => k)) as Engine['islands']

    /** All facets provided for each meaningful island in Schema */
    const facets = Object.entries(schema).reduce(
      (acc, [i, { mode, facets }]) => {
        const obj = {} as NonNullable<ReturnType<Engine['facets']['get']>>

        obj.facets = Object.keys(facets ?? {}).reduce((acc, facet) => acc.add(facet), new Set<string>())
        if (mode) obj.mode = true

        return acc.set(i, obj)
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

    const storage = {
      key: args.storageKey || PRESET.storage.key,
      store: args.store ?? PRESET.storage.store.values,
      toStore: Object.entries(args.config).reduce(
        (acc, [i, { mode, facets }]) => {
          const islandObj = {} as NonNullable<ReturnType<Engine['storage']['toStore']['get']>>

          if (mode) islandObj.mode = args.config[i]!.mode!.store ?? PRESET.storage.store.value
          if (facets) {
            const facetsToStore = Object.entries(facets).reduce(
              (acc, [facet, stratObj]) => {
                const mustStore = stratObj.store ?? PRESET.storage.store.value
                if (mustStore) return acc.add(facet)
                return acc
              },
              new Set() as NonNullable<typeof islandObj.facets>
            )

            if (facetsToStore.size > 0) islandObj.facets = facetsToStore
          }

          if (Object.keys(islandObj).length > 0) return acc.set(i, islandObj)
          return acc
        },
        new Map() as Engine['storage']['toStore']
      ),
    } satisfies Engine['storage']

    const forcedDataAttrs = Object.entries(schema).reduce(
      (acc, [i, { facets, mode }]) => {
        if (facets) Object.keys(facets).forEach((f) => acc.add(`data-force-${i}-facet-${f}`))
        if (mode) acc.add(`data-force-${i}-mode`)
        return acc
      },
      new Set() as Engine['selectors']['observe']['dataAttributes']['forced']
    )

    const computedDataAttrs = Object.entries(schema).reduce(
      (acc, [i, { facets, mode }]) => {
        if (facets) Object.keys(facets).forEach((f) => acc.add(`data-facet-${f}`))
        if (mode) acc.add('data-mode')
        return acc
      },
      new Set() as Engine['selectors']['observe']['dataAttributes']['computed']
    )

    const modes = Object.entries(schema).reduce(
      (acc, [i, { mode }]) => {
        if (!mode) return acc

        const stratObj = args.config[i]!.mode!

        const obj: NonNullable<ReturnType<Engine['modes']['get']>> = {
          selectors: new Set([...PRESET.modes.dom.selectors, ...(typeof stratObj.selector === 'string' ? [stratObj.selector] : Array.isArray(stratObj.selector) ? stratObj.selector : PRESET.modes.dom.island.selectors)]),
          strategy: stratObj.strategy,
          colorSchemes:
            stratObj.strategy === CONSTANTS.strats.mono
              ? new Map([[stratObj.default, stratObj.colorScheme]])
              : stratObj.strategy === CONSTANTS.strats.multi
                ? new Map(Object.entries(stratObj.colorSchemes))
                : new Map([[(mode as Schema.Island.Mode.Facet.System).light, CONSTANTS.color_schemes.light], [(mode as Schema.Island.Mode.Facet.System).dark, CONSTANTS.color_schemes.dark], ...Object.entries(stratObj.colorSchemes ?? {})]),
          system: undefined,
        }

        if (stratObj.strategy === CONSTANTS.strats.system)
          obj.system = {
            mode: (mode as Schema.Island.Mode.Facet.System).system!,
            fallback: stratObj.fallback!,
          }

        return acc.set(i, obj)
      },
      new Map() as Engine['modes']
    ) satisfies Engine['modes']

    return {
      islands,
      facets,
      values,
      fallbacks,
      nonce: args.nonce || PRESET.nonce,
      disableTransitionOnChange: args.disableTransitionOnChange ?? PRESET.disable_transitions_on_change,
      forcedValues: args.forcedValues ?? PRESET.forced_values,
      selectors: {
        types: {
          dataAttributes: {
            island: 'data-island',
            computed: {
              facet: (facet) => `data-facet-${facet}`,
              mode: 'data-mode',
            },
            forced: {
              facet: (island, facet) => `data-force-${island}-facet-${facet}`,
              mode: (island) => `data-force-${island}-mode`,
            },
            colorScheme: 'data-color-scheme',
          },
        },
        observe: {
          dataAttributes: {
            island: 'data-island',
            forced: forcedDataAttrs,
            computed: computedDataAttrs,
            colorScheme: 'data-color-scheme',
          },
          class: 'class',
          colorScheme: 'style',
        },
      },
      storage,
      observe: new Set(args.observe ? (typeof args.observe === 'string' ? [args.observe] : args.observe) : PRESET.observe),
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
        maps<T extends (Map<string, string> | undefined)[]>(...sources: T) {
          const result = new Map<string, string>()

          for (const source of sources) {
            if (!source) continue

            for (const [key, value] of source) {
              result.set(key, value)
            }
          }

          return result as NonNullable<T[number]> extends Brand_Metadata.Static
            ? Extract<T[number], Brand_Metadata<{ coverage: 'complete' }>> extends never
              ? Extract<T[number], Brand_Metadata<{ coverage: 'partial' }>>
              : Extract<T[number], Brand_Metadata<{ coverage: 'complete' }>>
            : NonNullable<T[number]>
        },
      },
      deep: {
        state: {
          maps: {
            island<T extends (State.Static.AsMap.Island | undefined)[]>(...sources: T) {
              let mergedMode: string | undefined = undefined
              const mergedFacets = new Map<string, string>()

              for (const source of sources) {
                if (!source) continue

                if (source.mode) mergedMode = source.mode
                if (source.facets) {
                  for (const [facet, value] of source.facets) {
                    mergedFacets.set(facet, value)
                  }
                }
              }

              return {
                ...(mergedMode ? { mode: mergedMode } : {}),
                ...(mergedFacets.size > 0 ? { facets: mergedFacets } : {}),
              } as NonNullable<T[number]> extends Brand_Metadata.Static
                ? Extract<T[number], Brand_Metadata<{ coverage: 'complete' }>> extends never
                  ? Extract<T[number], Brand_Metadata<{ coverage: 'partial' }>>
                  : Extract<T[number], Brand_Metadata<{ coverage: 'complete' }>>
                : State.Static.AsMap.Island
            },
            all<T extends (State.Static.AsMap | undefined)[]>(...sources: T) {
              const islandStates = sources.reduce(
                (islandStates, source) => {
                  for (const [i, values] of source ?? []) {
                    if (!islandStates?.has(i)) islandStates?.set(i, new Set())
                    islandStates?.get(i)?.add(values)
                  }
                  return islandStates
                },
                new Map() as Map<string, Set<State.Static.AsMap.Island | undefined>>
              )

              const mergedState = Array.from(islandStates).reduce((mergedState, [i, islandStates]) => {
                const mergedIslandState = this.island(...Array.from(islandStates))
                return mergedState.set(i, mergedIslandState)
              }, new Map() as State.Static.AsMap)

              return mergedState as NonNullable<T[number]> extends Brand_Metadata.Static
                ? Extract<T[number], Brand_Metadata<{ coverage: 'complete' }>> extends never
                  ? Extract<T[number], Brand_Metadata<{ coverage: 'partial' }>>
                  : Extract<T[number], Brand_Metadata<{ coverage: 'complete' }>>
                : State.Static.AsMap
            },
          },
        },
      },
    },
    convert: {
      shallow: {
        mapToObj: {
          string<T extends Map<string, string>>(map: T) {
            return Object.fromEntries(map) as T extends Brand_Metadata.Static ? Brand<Record<string, string>, Brand_Info<T>> : T
          },
          set<T extends Map<string, Set<string>>>(map: T) {
            const result: Record<string, string[]> = {}
            for (const [key, value] of map) {
              result[key] = Array.from(value)
            }
            return result as T extends Brand_Metadata.Static ? Brand<Record<string, string[]>, Brand_Info<T>> : T
          },
        },
        objToMap: {
          string<T extends Record<string, string>>(obj: T) {
            return new Map(Object.entries(obj)) as T extends Brand_Metadata.Static ? Brand<Map<string, string>, Brand_Info<T>> : T
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
    construct: {
      colorSchemes<T extends State.Static.AsMap>(state: T) {
        return utils.resolve.colorSchemes(state)
      },
      modes<T extends State.Static.AsMap>(state: T) {
        const modes = Array.from(state).reduce((acc, [i, { mode }]) => {
          if (!mode) return acc
          return acc.set(i, mode)
        }, new Map() as Modes.AsMap)

        return modes as T extends Brand_Metadata.Static ? Brand<Modes.AsMap, Brand_Info<T>> : T
      },
      state: {
        fromMode<T extends string>(island: Brand<string, { type: 'island' }>, mode: T) {
          const state = new Map([[island, { mode }]]) as State.Static.AsMap

          return state as T extends Brand_Metadata.Static ? Brand<State.Static.AsMap, Omit<Brand_Info<T>, 'coverage'> & { coverage: 'partial' }> : Brand<State.Static.AsMap, { coverage: 'partial' }>
        },
        fromModes<T extends Modes.AsMap>(modes: T) {
          const state = Array.from(modes).reduce((acc, [i, mode]) => {
            return acc.set(i, { mode })
          }, new Map() as State.Static.AsMap)

          return state as T extends Brand_Metadata.Static ? Brand<State.Static.AsMap, Omit<Brand_Info<T>, 'coverage'> & { coverage: 'partial' }> : Brand<Modes.AsMap, { coverage: 'partial' }>
        },
        fromFacet<T extends string>(island: string, facet: string, value: T) {
          return new Map([[island, { facets: new Map([[facet, value]]) }]]) as unknown as T extends Brand_Metadata.Static
            ? Brand<State.Static.AsMap, Omit<Brand_Info<T>, 'coverage'> & { coverage: 'partial' }>
            : Brand<State.Static.AsMap, { coverage: 'partial' }>
        },
        fromIslandValues<T extends State.Static.AsMap.Island>(island: string, values: T) {
          return new Map([[island, values]]) as T extends Brand_Metadata.Static ? Brand<State.Static.AsMap, Omit<Brand_Info<T>, 'coverage'> & { coverage: 'partial' }> : Brand<State.Static.AsMap, { coverage: 'partial' }>
        },
      },
    },
    resolve: {
      colorScheme(island: string, mode: string) {
        const modeConfig = engine.modes.get(island)
        if (!modeConfig) return

        const isSystemStrat = modeConfig.strategy === CONSTANTS.strats.system
        const isSystem = isSystemStrat && modeConfig.system?.mode === mode
        if (isSystem) return utils.miscellaneous.getSystemPref() ?? modeConfig.colorSchemes.get(modeConfig.system!.fallback)

        return modeConfig.colorSchemes.get(mode)
      },
      colorSchemes<T extends State.Static.AsMap>(state: T) {
        const modes = Array.from(state).reduce((acc, [i, { mode }]) => {
          if (!mode) return acc
          return acc.set(i, mode)
        }, new Map() as Modes.AsMap)

        const colorSchemes = Array.from(modes).reduce((acc, [i, mode]) => {
          const resolvedScheme = utils.resolve.colorScheme(i, mode)

          if (!resolvedScheme) return acc
          return acc.set(i, resolvedScheme)
        }, new Map() as ColorSchemes.Static.AsMap)

        return colorSchemes as T extends Brand_Metadata.Static ? Brand<ColorSchemes.Static.AsMap, Brand_Info<T>> : T
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
    },
    sanitize: {
      state: {
        option: {
          facet(island: string, facet: string, value: string, backup?: string) {
            const isIsland = utils.isValid.value.island(island)
            if (!isIsland) return

            const isFacet = utils.isValid.value.facet(island, facet)
            if (!isFacet) return

            const isOption = utils.isValid.value.option.facet(island, facet, value)
            const isBackupOption = backup ? utils.isValid.value.option.facet(island, facet, backup) : false
            const fallback = engine.fallbacks.get(island)!.facets!.get(facet)!

            return (isOption ? value : isBackupOption ? backup! : fallback) as Brand<string, { validation: 'sanitized' }>
          },
          mode(island: string, value: string, backup?: string) {
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
        island(island: string, values: State.Static.AsMap.Island, backup?: State.Static.AsMap.Island) {
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
        all<T extends State.Static.AsMap>(state: T, backup?: T) {
          const sanState = new Map() as AtLeast<State.Static.AsMap, { validation: 'sanitized' }>

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

          const isMode = utils.isValid.value.option.mode(island, value)
          const isBackupMode = backup ? utils.isValid.value.option.mode(island, backup) : false
          const fallback = engine.fallbacks.get(island)!.mode!

          return (isMode ? value : isBackupMode ? backup! : fallback) as Brand<string, { validation: 'sanitized' }>
        },
        all<T extends Modes.AsMap>(modes: T, backup?: T) {
          const sanModes = new Map() as AtLeast<Modes.AsMap, { validation: 'sanitized'; coverage: 'partial' }>

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
        island(island: string, values: State.Static.AsMap.Island, backup?: State.Static.AsMap.Island) {
          const isIsland = utils.isValid.value.island(island)
          if (!isIsland) return

          const normalized = {} as State.Static.AsMap.Island

          // fallbacks
          for (const [facet, fallback] of engine.fallbacks.get(island)!.facets ?? []) {
            if (!normalized.facets) normalized.facets = new Map() as NonNullable<typeof normalized.facets>
            normalized.facets.set(facet, fallback)
          }
          if (engine.fallbacks.get(island)!.mode) normalized.mode = engine.fallbacks.get(island)!.mode!

          // backup
          if (backup) {
            const sanBackup = utils.sanitize.state.island(island, backup)!
            if (sanBackup.facets) {
              for (const [facet, value] of sanBackup.facets) {
                normalized.facets?.set(facet, value)
              }
            }
            if (sanBackup.mode) normalized.mode = sanBackup.mode
          }

          // values
          const sanValues = utils.sanitize.state.island(island, values, backup)!
          if (sanValues.facets) {
            for (const [facet, value] of sanValues.facets) {
              normalized.facets?.set(facet, value)
            }
          }
          if (sanValues.mode) normalized.mode = sanValues.mode

          return normalized as Brand<State.Static.AsMap.Island, { validation: 'normalized'; coverage: 'complete' }>
        },
        state(state: State.Static.AsMap | undefined, backup?: State.Static.AsMap) {
          const normalized = new Map() as State.Static.AsMap

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

          return normalized as Brand<State.Static.AsMap, { validation: 'normalized'; coverage: 'complete' }>
        },
      },
      modes: {
        mode: (island: string, value: string | undefined, backup?: string) => {
          return utils.sanitize.modes.mode(island, value, backup) as unknown as Brand<string, { validation: 'normalized' }> | undefined
        },
        all: <T extends Modes.AsMap>(values: T | undefined, backup?: T) => {
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
        island(value: string | undefined | null): value is Brand<string, { type: 'island' }> {
          if (!value) return false
          return engine.islands.has(value as Brand<string, { type: 'island' }>)
        },
        facet(island: string, value: string | undefined | null): value is Brand<string, { type: 'facet' }> {
          if (!value) return false
          return engine.values.get(island)?.facets?.has(value) ?? false
        },
        mode(island: string, value: string | undefined | null): value is Brand<string, { type: 'mode' }> {
          if (!value) return false

          const isMode = value === 'mode'
          const islandHasMode = engine.values.get(island)?.mode ?? false

          if (isMode && islandHasMode) return true
          return false
        },
        option: {
          facet(island: string, facet: string, value: string | undefined | null): value is AtLeast<string, { type: 'option'; option: 'facet'; validation: 'sanitized' }> {
            if (!value) return false
            return engine.values.get(island)?.facets?.get(facet)?.has(value) ?? false
          },
          mode(island: string, value: string | undefined | null): value is AtLeast<string, { type: 'option'; option: 'mode'; validation: 'sanitized' }> {
            if (!value) return false
            return engine.values.get(island)?.mode?.has(value) ?? false
          },
        },
      },
      structure: {
        state: {
          obj(obj: Record<string, unknown>): obj is AtLeast<State.Static, { validation: 'dirty'; coverage: 'partial' }> {
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
          const retrieved = window.localStorage.getItem(engine.storage.key)
          return retrieved ?? undefined
        },
        deserialized: () => {
          const serialized = StorageManager.get.state.serialized()
          if (!serialized) return

          return utils.deserialize.state(serialized)
        },
        sanitized: () => {
          const deserialized = StorageManager.get.state.deserialized()
          if (!deserialized) return undefined

          const sanitized = utils.sanitize.state.all(deserialized)
          return sanitized as Brand<State.Static.AsMap, Omit<Brand_Info<typeof deserialized>, 'toStore'> & { toStore: 'yes' }>
        },
        normalized: () => {
          const sanitized = StorageManager.get.state.sanitized()

          const normalized = utils.normalize.state.state(sanitized ?? engine.fallbacks)
          return normalized
        },
      },
    }

    public static set = {
      state: {
        facet(island: string, facet: string, value: Brand<string, { validation: 'sanitized' }>) {
          if (!engine.storage.store) return

          const currState = Main.get.state.base()!
          const newStatePartial = utils.construct.state.fromFacet(island, facet, value)

          const newState = utils.merge.deep.state.maps.all(currState, newStatePartial)
          const newStateToStore = StorageManager.constructStateToStore(newState)
          const newStateObjToStore = utils.convert.deep.state.mapToObj(newStateToStore)
          const newSerState = JSON.stringify(newStateObjToStore) as Brand<string, Brand_Info<typeof newStateObjToStore>>

          const currSerState = StorageManager.get.state.serialized()

          const needsUpdate = currSerState !== newSerState
          if (needsUpdate) StorageManager.updateStorageState(newSerState)
        },
        island(island: string, values: Brand<State.Static.AsMap.Island, { validation: 'normalized'; coverage: 'complete' }>) {
          if (!engine.storage.store) return

          const currState = Main.get.state.base()!
          const newStatePartial = utils.construct.state.fromIslandValues(island, values)

          const newState = utils.merge.deep.state.maps.all(currState, newStatePartial)
          const newStateToStore = StorageManager.constructStateToStore(newState)
          const newStateObjToStore = utils.convert.deep.state.mapToObj(newStateToStore)
          const newSerState = JSON.stringify(newStateObjToStore) as Brand<string, Brand_Info<typeof newStateObjToStore>>

          const currSerState = StorageManager.get.state.serialized()

          const needsUpdate = currSerState !== newSerState
          if (needsUpdate) StorageManager.updateStorageState(newSerState)
        },
        all(state: Brand<State.Static.AsMap, { validation: 'normalized'; coverage: 'complete' }>) {
          if (!engine.storage.store) return

          const stateToStore = StorageManager.constructStateToStore(state)
          const stateObjToStore = utils.convert.deep.state.mapToObj(stateToStore)
          const newSerState = JSON.stringify(stateObjToStore) as Brand<string, Brand_Info<typeof stateObjToStore>>

          const currSerState = StorageManager.get.state.serialized()

          const needsUpdate = currSerState !== newSerState
          if (needsUpdate) StorageManager.updateStorageState(newSerState)
        },
      },
    }

    private static updateStorageState(serState: Brand<string, { validation: 'sanitized'; toStore: 'yes' }>) {
      if (StorageManager.isInternalChange) return

      StorageManager.isInternalChange = true
      window.localStorage.setItem(engine.storage.key, serState)
      StorageManager.isInternalChange = false
    }

    private static constructStateToStore(state: AtLeast<State.Static.AsMap, { validation: 'normalized'; coverage: 'complete' }>) {
      const stateToStore = Array.from(state).reduce((acc, [i, { mode, facets }]) => {
        if (!engine.storage.toStore.has(i)) return acc

        const islandState: State.Static.AsMap.Island = {}

        if (mode) {
          const mustStore = engine.storage.toStore.get(i)?.mode ?? false
          if (mustStore) islandState.mode = mode
        }
        if (facets) {
          islandState.facets = Array.from(facets).reduce(
            (facetsAcc, [facet, value]) => {
              const mustStore = engine.storage.toStore.get(i)?.facets?.has(facet) ?? false
              if (mustStore) return facetsAcc.set(facet, value)

              return facetsAcc
            },
            new Map() as State.Static.AsMap.Island.Facets['facets']
          )
        }

        return acc.set(i, islandState)
      }, new Map() as State.Static.AsMap)

      return stateToStore as Brand<State.Static.AsMap, { validation: 'sanitized'; toStore: 'yes' }>
    }

    public static terminate() {
      StorageManager.abortController?.abort()

      if (engine.storage.store) localStorage.removeItem(engine.storage.key)

      StorageManager.instance = undefined
    }

    private constructor() {
      EventManager.on('State:Base:Update', 'StorageManager:State:Update', (state) => StorageManager.set.state.all(utils.convert.deep.state.objToMap(state as Brand<State.Static, { validation: 'normalized'; coverage: 'complete' }>)))

      StorageManager.abortController = new AbortController()
      if (engine.observe.has('storage'))
        window.addEventListener(
          'storage',
          ({ key, oldValue, newValue }) => {
            if (key === engine.storage.key) {
              if (!engine.storage.store) return

              const deserNew = newValue ? utils.deserialize.state(newValue) : undefined
              const deserOld = oldValue ? utils.deserialize.state(oldValue) : undefined

              const normalized = utils.normalize.state.state(deserNew ?? deserOld, deserOld)
              StorageManager.set.state.all(normalized)
              Main.set.state.base(normalized)
            }
          },
          {
            signal: StorageManager.abortController.signal,
          }
        )
    }
  }

  // #region Dom Mananger
  class DomManager {
    private static instance: DomManager | undefined
    private static observer: MutationObserver | undefined
    private static isPerfomingMutation = false

    public static init() {
      if (!DomManager.instance) DomManager.instance = new DomManager()
    }

    private static findDeepest(attr: string) {
      let deepest = null as Element | null
      let maxDepth = -1

      const dfs = (node: Element, depth: number) => {
        if (node.hasAttribute(attr)) {
          if (depth > maxDepth) {
            maxDepth = depth
            deepest = node
          }
        }

        for (const child of node.children) dfs(child, depth + 1)
      }

      dfs(document.documentElement, 0)
      return deepest
    }

    public static get = {
      islands: {
        byIsland(island: string) {
          const elements = document.querySelectorAll(`[${engine.selectors.types.dataAttributes.island}=${island}]`)
          if (elements.length === 0) return undefined
          return new Set(elements)
        },
        all() {
          const elements = Array.from(engine.islands).reduce(
            (acc, island) => {
              const elements = DomManager.get.islands.byIsland(island)
              if (!elements) return acc

              return acc.set(island, elements)
            },
            new Map() as Map<string, Set<Element>>
          )
          return elements
        },
      },
      state: {
        computed: {
          island: {
            dirty: (island: string, el: Element) => {
              const isIsland = utils.isValid.value.island(island)
              if (!isIsland) return undefined

              const { mode, facets } = engine.facets.get(island)!

              const state = {} as State.Static.AsMap.Island
              if (facets && facets.size > 0) {
                const facetsMap = Array.from(facets).reduce(
                  (acc, facet) => {
                    const facetValue = el.getAttribute(engine.selectors.types.dataAttributes.computed.facet(facet))
                    if (!facetValue) return acc

                    return acc.set(facet, facetValue)
                  },
                  new Map() as State.Static.AsMap.Island.Facets['facets']
                )
                state.facets = facetsMap
              }
              if (mode) {
                const modeValue = el.getAttribute(engine.selectors.types.dataAttributes.computed.mode)
                if (modeValue) state.mode = modeValue
              }

              return state as Brand<typeof state, { validation: 'dirty' }>
            },
            sanitized(island: string, el: Element, backup?: State.Static.AsMap.Island) {
              const dirty = DomManager.get.state.computed.island.dirty(island, el)
              if (!dirty) return undefined

              const sanitized = utils.sanitize.state.island(island, dirty, backup)
              return sanitized as Brand<State.Static.AsMap.Island, { validation: 'sanitized' }>
            },
            normalized: (island: string, el: Element, backup?: State.Static.AsMap.Island) => {
              const sanitized = DomManager.get.state.computed.island.sanitized(island, el, backup)
              if (!sanitized) return undefined

              const normalized = utils.normalize.state.island(island, sanitized, backup)
              return normalized
            },
          },
          all: {
            dirty: () => {
              const islands = DomManager.get.islands.all()

              const states = Array.from(islands).reduce(
                (states, [i, els]) => {
                  const islandStates = Array.from(els).reduce(
                    (islandStates, el) => {
                      const state = DomManager.get.state.computed.island.dirty(i, el)
                      if (state && Object.keys(state).length > 0) return islandStates.set(el, state)
                      return islandStates
                    },
                    new Map() as Map<Element, State.Static.AsMap.Island>
                  )
                  if (islandStates.size > 0) return states.set(i, islandStates)
                  return states
                },
                new Map() as Map<string, Map<Element, State.Static.AsMap.Island>>
              )

              return states as Brand<typeof states, { validation: 'dirty' }>
            },
            sanitized: () => {
              const islands = DomManager.get.islands.all()

              const states = Array.from(islands).reduce(
                (states, [i, els]) => {
                  const islandStates = Array.from(els).reduce(
                    (islandStates, el) => {
                      const state = DomManager.get.state.computed.island.sanitized(i, el)
                      if (state) return islandStates.set(el, state)
                      return islandStates
                    },
                    new Map() as Map<Element, State.Static.AsMap.Island>
                  )
                  if (islandStates.size > 0) return states.set(i, islandStates)
                  return states
                },
                new Map() as Map<string, Map<Element, State.Static.AsMap.Island>>
              )

              return states as Brand<typeof states, { validation: 'sanitized' }>
            },
            normalized: () => {
              const islands = DomManager.get.islands.all()

              const states = Array.from(islands).reduce(
                (states, [i, els]) => {
                  const islandStates = Array.from(els).reduce(
                    (islandStates, el) => {
                      const state = DomManager.get.state.computed.island.normalized(i, el)
                      if (state) return islandStates.set(el, state)
                      return islandStates
                    },
                    new Map() as Map<Element, State.Static.AsMap.Island>
                  )
                  if (islandStates.size > 0) return states.set(i, islandStates)
                  return states
                },
                new Map() as Map<string, Map<Element, State.Static.AsMap.Island>>
              )

              return states as Brand<typeof states, { validation: 'normalized'; coverage: 'complete' }>
            },
          },
        },
        forced: {
          island: {
            dirty: (island: string) => {
              const isIsland = utils.isValid.value.island(island)
              if (!isIsland) return undefined

              if (!engine.forcedValues) return {} as Brand<State.Static.AsMap.Island, { validation: 'dirty' }>

              const { mode, facets } = engine.facets.get(island)!

              const state = {} as State.Static.AsMap.Island

              if (facets)
                state.facets = Array.from(facets).reduce(
                  (facets, facet) => {
                    const deepestEl = DomManager.findDeepest(engine.selectors.types.dataAttributes.forced.facet(island, facet))
                    if (!deepestEl) return facets

                    const forcedValue = deepestEl.getAttribute(engine.selectors.types.dataAttributes.forced.facet(island, facet))
                    if (!forcedValue) return facets

                    return facets.set(facet, forcedValue)
                  },
                  new Map() as State.Static.AsMap.Island.Facets['facets']
                )

              if (mode) {
                const deepestEl = DomManager.findDeepest(engine.selectors.types.dataAttributes.forced.mode(island))
                if (deepestEl) {
                  const forcedValue = deepestEl.getAttribute(engine.selectors.types.dataAttributes.forced.mode(island))
                  if (forcedValue) state.mode = forcedValue
                }
              }

              return state as Brand<typeof state, { validation: 'dirty' }>
            },
            sanitized: (island: Brand<string, { type: 'island' }>) => {
              const dirty = DomManager.get.state.forced.island.dirty(island)
              if (!dirty) return undefined

              if (!engine.forcedValues) return {} as Brand<State.Static.AsMap.Island, { validation: 'sanitized' }>

              const sanitized = {} as State.Static.AsMap.Island

              if (dirty.facets && dirty.facets.size > 0)
                sanitized.facets = Array.from(dirty.facets).reduce(
                  (facets, [facet, value]) => {
                    const isValid = utils.isValid.value.option.facet(island, facet, value)
                    if (!isValid) return facets

                    return facets.set(facet, value)
                  },
                  new Map() as State.Static.AsMap.Island.Facets['facets']
                )

              if (dirty.mode) {
                const isValid = utils.isValid.value.option.mode(island, dirty.mode)
                if (isValid) sanitized.mode = dirty.mode
              }

              return sanitized as Brand<typeof sanitized, { validation: 'sanitized' }>
            },
          },
          all: {
            dirty: () => {
              if (!engine.forcedValues) return new Map() as Brand<State.Static.AsMap, { validation: 'dirty' }>

              const state = Array.from(engine.islands).reduce((state, island) => {
                const islandState = DomManager.get.state.forced.island.dirty(island)
                if (islandState && Object.keys(islandState).length > 0) return state.set(island, islandState)
                return state
              }, new Map() as State.Static.AsMap)
              return state as Brand<State.Static.AsMap, { validation: 'dirty' }>
            },
            sanitized: () => {
              if (!engine.forcedValues) return new Map() as Brand<State.Static.AsMap, { validation: 'sanitized'; coverage: 'partial' }>

              const state = Array.from(engine.islands).reduce((state, island) => {
                const islandState = DomManager.get.state.forced.island.sanitized(island)
                if (islandState && Object.keys(islandState).length > 0) return state.set(island, islandState)
                return state
              }, new Map() as State.Static.AsMap)
              return state as AtLeast<State.Static.AsMap, { validation: 'sanitized'; coverage: 'partial' }>
            },
          },
        },
      },
    }

    private static disableTransitions() {
      DomManager.isPerfomingMutation = true

      const css = document.createElement('style')
      if (engine.nonce) css.setAttribute('nonce', engine.nonce)
      css.appendChild(document.createTextNode(`*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`))
      document.head.appendChild(css)

      return () => {
        ;(() => window.getComputedStyle(document.body))()
        setTimeout(() => {
          document.head.removeChild(css)
          DomManager.isPerfomingMutation = false
        }, 1)
      }
    }

    public static set = {
      state: {
        computed: {
          island: (island: string, state: AtLeast<State.Static.AsMap.Island, { validation: 'normalized'; coverage: 'complete' }>, opts?: { elements?: Set<Element>; transitionsAlreadyDisabled?: boolean; isAlreadyMutatingDom?: boolean }) => {
            const enableBackTransitions = engine.disableTransitionOnChange ? DomManager.disableTransitions() : undefined

            const els = opts?.elements ?? new Set(DomManager.get.islands.byIsland(island))

            els.forEach((el) => {
              const elCurrState = DomManager.get.state.computed.island.dirty(island, el)

              if (state.facets)
                state.facets.forEach((value, facet) => {
                  const needsUpdate = (elCurrState?.facets?.get(facet) as string) !== (value as string)
                  if (needsUpdate) el.setAttribute(engine.selectors.types.dataAttributes.computed.facet(facet), value)
                })

              if (state.mode) {
                const needsUpdate = (elCurrState?.mode as string) !== (state.mode as string)
                if (needsUpdate) el.setAttribute(engine.selectors.types.dataAttributes.computed.mode, state.mode)

                const colorScheme = utils.resolve.colorScheme(island, state.mode)!
                DomManager.set.mode.set(island, el, colorScheme)
              }
            })

            enableBackTransitions?.()
          },
          all: (state: AtLeast<State.Static.AsMap, { validation: 'normalized'; coverage: 'complete' }>, elements?: Map<string, Set<Element>>) => {
            const els = elements ?? DomManager.get.islands.all()
            els.forEach((islandEls, island) => {
              const islandState = state.get(island)!
              DomManager.set.state.computed.island(island, islandState, { elements: islandEls, isAlreadyMutatingDom: true })
            })
          },
        },
      },
      mode: {
        dataAttribute: (island: string, el: Element, value: Color_Scheme) => {
          if (!engine.modes.get(island)?.selectors.has('data-attribute')) return
          if (!(el instanceof HTMLElement)) return

          const currValue = el.getAttribute(engine.selectors.types.dataAttributes.colorScheme)

          const needsUpdate = currValue !== value
          if (needsUpdate) el.setAttribute(engine.selectors.types.dataAttributes.colorScheme, value)
        },
        colorScheme: (island: string, el: Element, value: Color_Scheme) => {
          if (!engine.modes.get(island)?.selectors.has('color-scheme')) return
          if (!(el instanceof HTMLElement)) return

          const currValue = el.style.colorScheme

          const needsUpdate = currValue !== value
          if (needsUpdate) el.style.colorScheme = value
        },
        class: (island: string, el: Element, value: Color_Scheme) => {
          if (!engine.modes.get(island)?.selectors.has('class')) return
          if (!(el instanceof HTMLElement)) return

          const currValue = el.classList.contains(CONSTANTS.modes.light) ? CONSTANTS.modes.light : el.classList.contains(CONSTANTS.modes.dark) ? CONSTANTS.modes.dark : undefined
          const needsUpdate = currValue !== value
          if (needsUpdate) {
            const other = value === CONSTANTS.modes.light ? CONSTANTS.modes.dark : CONSTANTS.modes.light
            el.classList.replace(other, value) || el.classList.add(value)
          }
        },
        set: (island: string, el: Element, value: Color_Scheme) => {
          if (!(el instanceof HTMLElement)) return

          if (engine.modes.get(island)?.selectors.has('data-attribute')) DomManager.set.mode.dataAttribute(island, el, value)
          if (engine.modes.get(island)?.selectors.has('color-scheme')) DomManager.set.mode.colorScheme(island, el, value)
          if (engine.modes.get(island)?.selectors.has('class')) DomManager.set.mode.class(island, el, value)
        },
      },
    }

    public static terminate() {
      DomManager.observer?.disconnect()

      const islands = DomManager.get.islands.all()
      for (const [island, elements] of islands) {
        for (const element of elements) {
          const { mode, facets } = engine.facets.get(island)!
          if (facets) {
            for (const facet of facets) {
              element.removeAttribute(engine.selectors.types.dataAttributes.computed.facet(facet))
            }
          }
          if (mode) {
            element.removeAttribute(engine.selectors.types.dataAttributes.computed.mode)
            if (element instanceof HTMLElement) {
              element.style.colorScheme = ''
              element.removeAttribute(engine.selectors.types.dataAttributes.colorScheme)
              element.classList.remove(CONSTANTS.modes.light, CONSTANTS.modes.dark)
            }
          }
        }
      }

      DomManager.instance = undefined
    }

    private static constructAttributeFilters() {
      return [
        engine.selectors.observe.dataAttributes.island,
        ...Array.from(engine.selectors.observe.dataAttributes.computed),
        ...engine.selectors.observe.dataAttributes.forced,
        engine.selectors.observe.dataAttributes.colorScheme,
        engine.selectors.observe.class,
        engine.selectors.observe.colorScheme,
      ]
    }

    private constructor() {
      EventManager.on('State:Computed:Update', 'DomManager:State:Update', (state) => DomManager.set.state.computed.all(utils.convert.deep.state.objToMap(state) as Brand<State.Static.AsMap, { coverage: 'complete'; validation: 'normalized' }>))

      const handleMutations = (mutations: MutationRecord[]) => {
        for (const { type, oldValue, attributeName, target } of mutations) {
          if (DomManager.isPerfomingMutation) continue

          if (type === 'attributes' && target instanceof HTMLElement && attributeName) {
            if (attributeName === engine.selectors.types.dataAttributes.island) {
              const newIsland = target.getAttribute(engine.selectors.types.dataAttributes.island)
              const isIsland = utils.isValid.value.island(newIsland)

              if (!isIsland) {
                const isOldIsland = utils.isValid.value.island(oldValue)
                if (isOldIsland) target.setAttribute(engine.selectors.types.dataAttributes.island, oldValue!)
              }

              if (isIsland) {
                const compState = Main.get.state.computed()?.get(newIsland)!
                const currState = DomManager.get.state.computed.island.normalized(newIsland!, target)

                const newIslandState = utils.merge.deep.state.maps.island(currState, compState)

                DomManager.set.state.computed.island(newIsland!, newIslandState)
              }
              continue
            }

            if (engine.selectors.observe.dataAttributes.forced.has(attributeName)) {
              if (!engine.forcedValues) continue

              const parts = attributeName.split('-')

              const island = parts[2]!
              const facetType = parts[3]! as Facet_Type
              const facet = parts[4]

              const newOption = target.getAttribute(attributeName)

              if (facetType === 'facet') {
                const isNewOption = newOption ? utils.isValid.value.option.facet(island, facet!, newOption) : false

                if (!isNewOption) {
                  const isOldOption = oldValue ? utils.isValid.value.option.facet(island, facet!, oldValue) : false
                  if (isOldOption) target.setAttribute(attributeName, oldValue!)
                }
              }

              if (facetType === 'mode') {
                const isNewOption = newOption ? utils.isValid.value.option.mode(island, newOption) : false

                if (!isNewOption) {
                  const isOldOption = oldValue ? utils.isValid.value.option.mode(island, oldValue) : false
                  if (isOldOption) target.setAttribute(attributeName, oldValue!)
                }
              }

              const newForcedState = DomManager.get.state.forced.all.sanitized()
              Main.set.state.forced(newForcedState)
              continue
            }

            if (engine.selectors.observe.dataAttributes.computed.has(attributeName)) {
              const island = target.getAttribute(engine.selectors.types.dataAttributes.island)

              const isIsland = utils.isValid.value.island(island)
              if (!isIsland) continue

              const parts = attributeName.split('-')
              const facetType = parts[1] as Facet_Type
              const facet = parts[2]

              const newOption = target.getAttribute(attributeName)

              if (facetType === 'facet' && facet) {
                const revertToComputed = (oldValue: string | null) => {
                  const currCompValue = Main.get.state.computed()?.get(island)?.facets?.get(facet)!
                  const isOldOption = utils.isValid.value.option.facet(island, facet, oldValue)

                  const isOldCurrCompValue = isOldOption && (currCompValue as string) === oldValue
                  if (isOldCurrCompValue) target.setAttribute(attributeName, oldValue!)
                  else target.setAttribute(attributeName, currCompValue)
                }

                const isNewOption = utils.isValid.value.option.facet(island, facet, newOption)
                if (!isNewOption) {
                  revertToComputed(oldValue)
                  continue
                }

                const isEffectiveUpdate = oldValue !== newOption
                if (!isEffectiveUpdate) continue

                const isFacetCurrForced = Main.get.state.forced()?.get(island)?.facets?.has(facet)
                if (isFacetCurrForced) {
                  revertToComputed(oldValue)
                  continue
                }

                const currBaseValue = Main.get.state.base()?.get(island)?.facets?.get(facet)!
                const isNewAlreadySet = (currBaseValue as string) === newOption
                if (isNewAlreadySet) continue

                const newStatePartial = utils.construct.state.fromFacet(island, facet, newOption)
                Main.set.state.base(newStatePartial)
                continue
              }

              if (facetType === 'mode') {
                const revertToComputed = (oldValue: string | null) => {
                  const currCompValue = Main.get.state.computed()?.get(island)?.mode!
                  const isOldOption = utils.isValid.value.option.mode(island, oldValue)

                  const isOldCurrCompValue = isOldOption && currCompValue === oldValue
                  if (isOldCurrCompValue) target.setAttribute(attributeName, oldValue!)
                  else target.setAttribute(attributeName, currCompValue)
                }

                const isNewOption = utils.isValid.value.option.mode(island, newOption)
                if (!isNewOption) {
                  revertToComputed(oldValue)
                  continue
                }

                const isEffectiveUpdate = oldValue !== newOption
                if (!isEffectiveUpdate) continue

                const isModeCurrForced = !!Main.get.state.forced()?.get(island)?.mode
                if (isModeCurrForced) {
                  revertToComputed(oldValue)
                  continue
                }

                const currBaseValue = Main.get.state.base()?.get(island)?.mode!
                const isNewAlreadySet = currBaseValue === newOption
                if (isNewAlreadySet) continue

                const newStatePartial = utils.construct.state.fromMode(island, newOption as Brand<string, { validation: 'sanitized' }>)

                Main.set.state.base(newStatePartial)
                continue
              }
            }

            if (attributeName === engine.selectors.observe.colorScheme) {
              const island = target.getAttribute(engine.selectors.types.dataAttributes.island)

              const isIsland = utils.isValid.value.island(island)
              if (!isIsland) continue

              const isSelectorEnabled = engine.modes.get(island)?.selectors.has('color-scheme')
              if (!isSelectorEnabled) continue

              const supportedColorSchemes = new Set(engine.modes.get(island)?.colorSchemes.values() ?? [])

              const revertToComputed = (oldValue: string | null) => {
                const currCompValue = Main.get.colorSchemes.computed()?.get(island)!
                const isOldColorScheme = supportedColorSchemes.has(oldValue as Color_Scheme)

                const isOldCurrCompColorScheme = isOldColorScheme && currCompValue === oldValue
                if (isOldCurrCompColorScheme) target.style.colorScheme = oldValue!
                else target.style.colorScheme = currCompValue
              }

              const newColorScheme = target.style.colorScheme
              const isNewColorScheme = supportedColorSchemes.has(newColorScheme as Color_Scheme)
              if (!isNewColorScheme) {
                revertToComputed(oldValue)
                continue
              }

              const isEffectiveUpdate = oldValue !== newColorScheme
              if (!isEffectiveUpdate) continue

              const isModeCurrForced = !!Main.get.state.forced()?.get(island)?.mode
              if (isModeCurrForced) {
                revertToComputed(oldValue)
                continue
              }

              const isSystemStrat = engine.modes.get(island)!.strategy === 'system'
              if (!isSystemStrat) {
                revertToComputed(oldValue)
                continue
              }

              const traceBackMode = (colorScheme: Color_Scheme) => {
                for (const [mode, cs] of engine.modes.get(island)!.colorSchemes) {
                  if (cs === colorScheme) return mode
                }
              }
              const corrMode = traceBackMode(newColorScheme as Color_Scheme)!

              const currBaseMode = Main.get.state.base()?.get(island)?.mode!

              const isCurrBaseModeSystem = engine.modes.get(island)?.system?.mode === currBaseMode
              if (isCurrBaseModeSystem) {
                const isNewPrefColorScheme = newColorScheme === utils.miscellaneous.getSystemPref()
                if (isNewPrefColorScheme) continue
              }

              const isNewAlreadySet = currBaseMode === corrMode
              if (isNewAlreadySet) continue

              const newStatePartial = utils.construct.state.fromMode(island, corrMode as Brand<string, { validation: 'sanitized' }>)
              Main.set.state.base(newStatePartial)
              continue
            }

            if (attributeName === engine.selectors.observe.dataAttributes.colorScheme) {
              const island = target.getAttribute(engine.selectors.types.dataAttributes.island)

              const isIsland = utils.isValid.value.island(island)
              if (!isIsland) continue

              const isSelectorEnabled = engine.modes.get(island)?.selectors.has('data-attribute')
              if (!isSelectorEnabled) continue

              const supportedColorSchemes = new Set(engine.modes.get(island)?.colorSchemes.values() ?? [])

              const revertToComputed = (oldValue: string | null) => {
                const currCompValue = Main.get.colorSchemes.computed()?.get(island)!
                const isOldColorScheme = supportedColorSchemes.has(oldValue as Color_Scheme)

                const isOldCurrCompColorScheme = isOldColorScheme && currCompValue === oldValue
                if (isOldCurrCompColorScheme) target.setAttribute(engine.selectors.types.dataAttributes.colorScheme, oldValue!)
                else target.setAttribute(engine.selectors.types.dataAttributes.colorScheme, currCompValue)
              }

              const newColorScheme = target.getAttribute(engine.selectors.types.dataAttributes.colorScheme)
              const isNewColorScheme = supportedColorSchemes.has(newColorScheme as Color_Scheme)
              if (!isNewColorScheme) {
                revertToComputed(oldValue)
                continue
              }

              const isEffectiveUpdate = oldValue !== newColorScheme
              if (!isEffectiveUpdate) continue

              const isModeCurrForced = !!Main.get.state.forced()?.get(island)?.mode
              if (isModeCurrForced) {
                revertToComputed(oldValue)
                continue
              }

              const isSystemStrat = engine.modes.get(island)!.strategy === 'system'
              if (!isSystemStrat) {
                revertToComputed(oldValue)
                continue
              }

              const traceBackMode = (colorScheme: Color_Scheme) => {
                for (const [mode, cs] of engine.modes.get(island)!.colorSchemes) {
                  if (cs === colorScheme) return mode
                }
              }
              const corrMode = traceBackMode(newColorScheme as Color_Scheme)!

              const currBaseMode = Main.get.state.base()?.get(island)?.mode!

              const isCurrBaseModeSystem = engine.modes.get(island)?.system?.mode === currBaseMode
              if (isCurrBaseModeSystem) {
                const isNewPrefColorScheme = newColorScheme === utils.miscellaneous.getSystemPref()
                if (isNewPrefColorScheme) continue
              }

              const isNewAlreadySet = currBaseMode === corrMode
              if (isNewAlreadySet) continue

              const newStatePartial = utils.construct.state.fromMode(island, corrMode as Brand<string, { validation: 'sanitized' }>)

              Main.set.state.base(newStatePartial)
              continue
            }

            if (attributeName === engine.selectors.observe.class) {
              const island = target.getAttribute(engine.selectors.types.dataAttributes.island)
              const isIsland = utils.isValid.value.island(island)

              if (!isIsland) continue

              const isSelectorEnabled = engine.modes.get(island)?.selectors.has('class')
              if (!isSelectorEnabled) continue

              const supportedColorSchemes = new Set(engine.modes.get(island)?.colorSchemes.values() ?? [])

              const revertToComputed = () => {
                const currCompColorScheme = Main.get.colorSchemes.computed()?.get(island)!

                const currColorScheme = target.classList.contains(CONSTANTS.modes.light) ? CONSTANTS.modes.light : target.classList.contains(CONSTANTS.modes.dark) ? CONSTANTS.modes.dark : undefined
                const from = currColorScheme ?? CONSTANTS.modes.light

                target.classList.replace(from, currCompColorScheme) || target.classList.add(currCompColorScheme)
              }

              const newColorScheme = target.classList.contains(CONSTANTS.modes.light) ? CONSTANTS.modes.light : target.classList.contains(CONSTANTS.modes.dark) ? CONSTANTS.modes.dark : undefined
              const isNewColorScheme = newColorScheme ? supportedColorSchemes.has(newColorScheme) : false
              if (!isNewColorScheme) {
                revertToComputed()
                continue
              }

              const isEffectiveUpdate = oldValue !== newColorScheme
              if (!isEffectiveUpdate) continue

              const isModeCurrForced = !!Main.get.state.forced()?.get(island)?.mode
              if (isModeCurrForced) {
                revertToComputed()
                continue
              }

              const isSystemStrat = engine.modes.get(island)!.strategy === 'system'
              if (!isSystemStrat) {
                revertToComputed()
                continue
              }

              const traceBackMode = (colorScheme: Color_Scheme) => {
                for (const [mode, cs] of engine.modes.get(island)!.colorSchemes) {
                  if (cs === colorScheme) return mode
                }
              }
              const corrMode = traceBackMode(newColorScheme!)!

              const currBaseMode = Main.get.state.base()?.get(island)?.mode!

              const isCurrBaseModeSystem = engine.modes.get(island)?.system?.mode === currBaseMode
              if (isCurrBaseModeSystem) {
                const isNewPrefColorScheme = newColorScheme === utils.miscellaneous.getSystemPref()
                if (isNewPrefColorScheme) continue
              }

              const isNewAlreadySet = currBaseMode === corrMode
              if (isNewAlreadySet) continue

              const newStatePartial = utils.construct.state.fromMode(island, corrMode as Brand<string, { validation: 'sanitized' }>)

              Main.set.state.base(newStatePartial)
              continue
            }
          }

          if (type === 'childList') {
            const forcedState = DomManager.get.state.forced.all.sanitized()
            Main.set.state.forced(forcedState)

            const currCompState = Main.get.state.computed()!
            DomManager.set.state.computed.all(currCompState)
          }
        }
      }

      DomManager.observer = new MutationObserver(handleMutations)
      if (engine.observe.has('DOM'))
        DomManager.observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: DomManager.constructAttributeFilters(),
          attributeOldValue: true,
          subtree: true,
          childList: true,
        })
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
          const computed = utils.merge.deep.state.maps.all(base, forced)

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
        base: (state: AtLeast<State.Static.AsMap, { coverage: 'partial'; validation: 'sanitized' }>) => {
          const currState = Main.get.state.base()
          if (!currState) return console.error('[T3M4]: Library not initialized')

          const mergedState = utils.merge.deep.state.maps.all(currState, state)
          Main.smartUpdateNotify.state.base(mergedState)
        },
        forced: (state: AtLeast<State.Static.AsMap, { coverage: 'partial'; validation: 'sanitized' }>) => {
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
        forced(newState: AtLeast<State.Static.AsMap, { coverage: 'partial'; validation: 'sanitized' }>) {
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
        forced: (state: AtLeast<State.Static.AsMap, { coverage: 'partial'; validation: 'sanitized' }>) => {
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
      forced: AtLeast<State.Static.AsMap, { coverage: 'partial'; validation: 'sanitized' }> | undefined
    } = {
      base: undefined,
      forced: undefined,
    }

    private constructor() {
      StorageManager.init()
      DomManager.init()

      const storageState = StorageManager.get.state.normalized()

      const baseState = storageState
      this.state.base = baseState
      Main.notifyUpdate.state.base(baseState)

      const forcedState = DomManager.get.state.forced.all.sanitized()
      this.state.forced = forcedState
      Main.notifyUpdate.state.forced(forcedState)

      const computedState = utils.merge.deep.state.maps.all(baseState, forcedState)
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
      StorageManager.terminate()
      DomManager.terminate()
      engine = getEngine(newArgs)
      Main.reboot()
      EventManager.emit('Reset:Success')
    }

    public constructor() {
      Main.init()
    }
  }

  window.T3M4 = new T3M4()
}
