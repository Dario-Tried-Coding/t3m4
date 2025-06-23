import { COLOR_SCHEMES, MODES, OBSERVABLE, SELECTOR, STRAT, STRATS } from './constants'
import { EventManager } from './event-manager'
import { PRESET } from './preset'
import { Args } from './types/args'
import { AtLeast, Brand, Brand_Info, Brand_Metadata } from './types/brand'
import { Color_Schemes } from './types/subscribers/color-schemes'
import { Schema } from './types/subscribers/schema'
import { State } from './types/subscribers/state'
import { Values } from './types/subscribers/values'

namespace Modes {
  export type AsMap = Map<string, string>
  export type AsObj = Record<string, string>
}

export class Engine {
  private static instance: Engine
  private static args: Args.Static

  public islands: Set<Brand<string, { type: 'island' }>>
  public facets: Map<string, { mode?: boolean; facets?: Set<string> }>
  public values: Values.Static.AsMap
  public fallbacks: Brand<State.Static.AsMap, { coverage: 'complete'; validation: 'normalized' }>
  public nonce: string
  public disableTransitionOnChange: boolean
  public selectors: {
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

  public storage: {
    key: string
    store: boolean
    toStore: Map<string, { mode?: boolean; facets?: Set<string> }>
  }
  public observe: Set<OBSERVABLE>
  public forcedValues: boolean
  public modes: Map<
    string,
    {
      strategy: STRAT
      selectors: Set<SELECTOR>
      colorSchemes: Color_Schemes.Static.AsMap
      system?: { mode: string; fallback: string }
    }
  >

  public static init(args: Args.Static) {
    Engine.args = args
    Engine.instance = new Engine()
    return Engine.instance
  }

  public static reboot(args: Args.Static) {
    if (!Engine.instance || !Engine.args) return console.warn('[T3M4] Engine not initialized. Cannot reboot. Please call Engine.init() first.')
    if (Engine.utils.equal.deep.generic.objects(Engine.args, args)) return

    EventManager.emit('Reset')

    Engine.args = args
    Engine.instance = new Engine()

    EventManager.emit('Reset:Success')
    return Engine.instance
  }

  public static getInstance() {
    if (!Engine.instance) throw new Error('[T3M4] Engine not initialized. Please call Engine.init() first.')
    return Engine.instance
  }

  public static utils = {
    resolve: {
      colorScheme(island: string, mode: string) {
        const modeConfig = Engine.instance.modes.get(island)
        if (!modeConfig) return

        const isSystemStrat = modeConfig.strategy === STRATS.system
        const isSystem = isSystemStrat && modeConfig.system?.mode === mode
        if (isSystem) return Engine.utils.miscellaneous.getSystemPref() ?? modeConfig.colorSchemes.get(modeConfig.system!.fallback)

        return modeConfig.colorSchemes.get(mode)
      },
      colorSchemes<T extends State.Static.AsMap>(state: T) {
        const modes = Array.from(state).reduce((acc, [i, { mode }]) => {
          if (!mode) return acc
          return acc.set(i, mode)
        }, new Map() as Modes.AsMap)

        const colorSchemes = Array.from(modes).reduce((acc, [i, mode]) => {
          const resolvedScheme = Engine.utils.resolve.colorScheme(i, mode)

          if (!resolvedScheme) return acc
          return acc.set(i, resolvedScheme)
        }, new Map() as Color_Schemes.Static.AsMap)

        return colorSchemes as T extends Brand_Metadata.Static ? Brand<Color_Schemes.Static.AsMap, Brand_Info<T>> : T
      },
    },
    miscellaneous: {
      getSystemPref() {
        const supportsPref = window.matchMedia('(prefers-color-scheme)').media !== 'not all'
        const systemPref = supportsPref ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? MODES.dark : MODES.light) : undefined
        return systemPref
      },
      safeParse(json: string | null) {
        if (!json?.trim()) return null

        try {
          return JSON.parse(json) as unknown
        } catch {
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
        return Engine.utils.resolve.colorSchemes(state)
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

    deserialize: {
      state(string: string) {
        const parsed = Engine.utils.miscellaneous.safeParse(string)
        if (!parsed) return undefined

        const isPlainObject = Engine.utils.isValid.type.plainObject(parsed)
        if (!isPlainObject) return undefined

        const isStateObj = Engine.utils.isValid.structure.state.obj(parsed)
        if (!isStateObj) return undefined

        const dirtyState = Engine.utils.convert.deep.state.objToMap(parsed)
        return dirtyState
      },
    },
    sanitize: {
      state: {
        option: {
          facet(island: string, facet: string, value: string, backup?: string) {
            const isIsland = Engine.utils.isValid.value.island(island)
            if (!isIsland) return

            const isFacet = Engine.utils.isValid.value.facet(island, facet)
            if (!isFacet) return

            const isOption = Engine.utils.isValid.value.option.facet(island, facet, value)
            const isBackupOption = backup ? Engine.utils.isValid.value.option.facet(island, facet, backup) : false
            const fallback = Engine.instance.fallbacks.get(island)!.facets!.get(facet)!

            return (isOption ? value : isBackupOption ? backup! : fallback) as Brand<string, { validation: 'sanitized' }>
          },
          mode(island: string, value: string, backup?: string) {
            const isIsland = Engine.utils.isValid.value.island(island)
            if (!isIsland) return

            const hasMode = Engine.instance.values.get(island)!.mode !== undefined
            if (!hasMode) return

            const isOption = Engine.utils.isValid.value.option.mode(island, value)
            const isBackupOption = backup ? Engine.utils.isValid.value.option.mode(island, backup) : false
            const fallback = Engine.instance.fallbacks.get(island)!.mode!

            return (isOption ? value : isBackupOption ? backup! : fallback) as Brand<string, { validation: 'sanitized' }>
          },
        },
        island(island: string, values: State.Static.AsMap.Island, backup?: State.Static.AsMap.Island) {
          const isIsland = Engine.utils.isValid.value.island(island)
          if (!isIsland) return

          const obj = {} as Brand<State.Static.AsMap.Island, { validation: 'sanitized' }>

          if (values.facets) {
            const facets = new Map() as NonNullable<typeof obj.facets>
            for (const [facet, value] of values.facets) {
              const sanFacet = Engine.utils.sanitize.state.option.facet(island, facet, value, backup?.facets?.get(facet))
              if (sanFacet) facets.set(facet, sanFacet)
            }
            if (facets.size !== 0) obj.facets = facets
          }

          if (values.mode) {
            const mode = Engine.utils.sanitize.state.option.mode(island, values.mode, backup?.mode)
            if (mode) obj.mode = mode
          }

          return obj
        },
        all<T extends State.Static.AsMap>(state: T, backup?: T) {
          const sanState = new Map() as AtLeast<State.Static.AsMap, { validation: 'sanitized' }>

          for (const [island, values] of state) {
            const sanIsland = Engine.utils.sanitize.state.island(island, values, backup?.get(island))
            if (!sanIsland) continue

            sanState.set(island, sanIsland)
          }

          return sanState
        },
      },
      modes: {
        mode(island: string, value: string | undefined, backup?: string) {
          const isIsland = Engine.utils.isValid.value.island(island)
          if (!isIsland) return

          const hasMode = !!Engine.instance.values.get(island)!.mode
          if (!hasMode) return

          const isMode = Engine.utils.isValid.value.option.mode(island, value)
          const isBackupMode = backup ? Engine.utils.isValid.value.option.mode(island, backup) : false
          const fallback = Engine.instance.fallbacks.get(island)!.mode!

          return (isMode ? value : isBackupMode ? backup! : fallback) as Brand<string, { validation: 'sanitized' }>
        },
        all<T extends Modes.AsMap>(modes: T, backup?: T) {
          const sanModes = new Map() as AtLeast<Modes.AsMap, { validation: 'sanitized'; coverage: 'partial' }>

          for (const [island, value] of modes) {
            const sanMode = Engine.utils.sanitize.modes.mode(island, value, backup?.get(island))
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
          const isIsland = Engine.utils.isValid.value.island(island)
          if (!isIsland) return

          const normalized = {} as State.Static.AsMap.Island

          // fallbacks
          for (const [facet, fallback] of Engine.instance.fallbacks.get(island)!.facets ?? []) {
            if (!normalized.facets) normalized.facets = new Map() as NonNullable<typeof normalized.facets>
            normalized.facets.set(facet, fallback)
          }
          if (Engine.instance.fallbacks.get(island)!.mode) normalized.mode = Engine.instance.fallbacks.get(island)!.mode!

          // backup
          if (backup) {
            const sanBackup = Engine.utils.sanitize.state.island(island, backup)!
            if (sanBackup.facets) {
              for (const [facet, value] of sanBackup.facets) {
                normalized.facets?.set(facet, value)
              }
            }
            if (sanBackup.mode) normalized.mode = sanBackup.mode
          }

          // values
          const sanValues = Engine.utils.sanitize.state.island(island, values, backup)!
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

          for (const [island, values] of Engine.instance.fallbacks) {
            normalized.set(island, values)
          }

          for (const [island, values] of backup ?? []) {
            const normIsland = Engine.utils.normalize.state.island(island, values)
            if (!normIsland) continue

            normalized.set(island, normIsland)
          }

          for (const [island, values] of state ?? []) {
            const normIsland = Engine.utils.normalize.state.island(island, values, backup?.get(island))
            if (!normIsland) continue

            normalized.set(island, normIsland)
          }

          return normalized as Brand<State.Static.AsMap, { validation: 'normalized'; coverage: 'complete' }>
        },
      },
      modes: {
        mode: (island: string, value: string | undefined, backup?: string) => {
          return Engine.utils.sanitize.modes.mode(island, value, backup) as unknown as Brand<string, { validation: 'normalized' }> | undefined
        },
        all: <T extends Modes.AsMap>(values: T | undefined, backup?: T) => {
          const normalized = new Map() as Brand<Modes.AsMap, { validation: 'normalized'; coverage: 'complete' }>

          for (const [island, value] of Engine.utils.construct.modes(Engine.instance.fallbacks)) {
            normalized.set(island, value)
          }

          if (backup) {
            for (const [island, value] of backup) {
              const sanValue = Engine.utils.sanitize.modes.mode(island, value) as unknown as Brand<string, { validation: 'normalized' }>
              if (!sanValue) continue

              normalized.set(island, sanValue)
            }
          }

          for (const [island, value] of values ?? []) {
            const sanValue = Engine.utils.sanitize.modes.mode(island, value, backup?.get(island)) as unknown as Brand<string, { validation: 'normalized' }>
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
          return Engine.instance.islands.has(value as Brand<string, { type: 'island' }>)
        },
        facet(island: string, value: string | undefined | null): value is Brand<string, { type: 'facet' }> {
          if (!value) return false
          return Engine.instance.values.get(island)?.facets?.has(value) ?? false
        },
        mode(island: string, value: string | undefined | null): value is Brand<string, { type: 'mode' }> {
          if (!value) return false

          const isMode = value === 'mode'
          const islandHasMode = Engine.instance.values.get(island)?.mode ?? false

          if (isMode && islandHasMode) return true
          return false
        },
        option: {
          facet(island: string, facet: string, value: string | undefined | null): value is AtLeast<string, { type: 'option'; option: 'facet'; validation: 'sanitized' }> {
            if (!value) return false
            return Engine.instance.values.get(island)?.facets?.get(facet)?.has(value) ?? false
          },
          mode(island: string, value: string | undefined | null): value is AtLeast<string, { type: 'option'; option: 'mode'; validation: 'sanitized' }> {
            if (!value) return false
            return Engine.instance.values.get(island)?.mode?.has(value) ?? false
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

  private constructor() {
    const schema = Object.fromEntries(
      Object.entries(Engine.args.schema).flatMap(([island, { facets, mode }]) => {
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

    this.islands = new Set(Object.entries(schema).map(([k]) => k)) as Engine['islands']
    this.facets = Object.entries(schema).reduce(
      (acc, [i, { mode, facets }]) => {
        const obj = {} as NonNullable<ReturnType<NonNullable<Engine['facets']>['get']>>

        obj.facets = Object.keys(facets ?? {}).reduce((acc, facet) => acc.add(facet), new Set<string>())
        if (mode) obj.mode = true

        return acc.set(i, obj)
      },
      new Map() as NonNullable<Engine['facets']>
    )
    this.values = Object.entries(schema).reduce(
      (acc, [i, { facets, mode }]) => {
        const islandValues = {} as NonNullable<ReturnType<NonNullable<Engine['values']>['get']>>

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
      new Map() as NonNullable<Engine['values']>
    )
    this.fallbacks = Object.entries(Engine.args.config).reduce(
      (acc, [i, { facets, mode }]) => {
        const islandFallbacks = {} as NonNullable<ReturnType<NonNullable<Engine['fallbacks']>['get']>>

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
      new Map() as NonNullable<Engine['fallbacks']>
    )
    this.storage = {
      key: Engine.args.storageKey || PRESET.storage.key,
      store: Engine.args.store ?? PRESET.storage.store.values,
      toStore: Object.entries(Engine.args.config).reduce(
        (acc, [i, { mode, facets }]) => {
          const islandObj = {} as NonNullable<ReturnType<NonNullable<Engine['storage']>['toStore']['get']>>

          if (mode) islandObj.mode = Engine.args.config[i]!.mode!.store ?? PRESET.storage.store.value
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
        new Map() as NonNullable<Engine['storage']>['toStore']
      ),
    }
    this.selectors = {
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
          forced: Object.entries(schema).reduce(
            (acc, [i, { facets, mode }]) => {
              if (facets) Object.keys(facets).forEach((f) => acc.add(`data-force-${i}-facet-${f}`))
              if (mode) acc.add(`data-force-${i}-mode`)
              return acc
            },
            new Set() as NonNullable<Engine['selectors']>['observe']['dataAttributes']['forced']
          ),
          computed: Object.entries(schema).reduce(
            (acc, [, { facets, mode }]) => {
              if (facets) Object.keys(facets).forEach((f) => acc.add(`data-facet-${f}`))
              if (mode) acc.add('data-mode')
              return acc
            },
            new Set() as NonNullable<Engine['selectors']>['observe']['dataAttributes']['computed']
          ),
          colorScheme: 'data-color-scheme',
        },
        class: 'class',
        colorScheme: 'style',
      },
    }
    this.modes = Object.entries(schema).reduce(
      (acc, [i, { mode }]) => {
        if (!mode) return acc

        const stratObj = Engine.args.config[i]!.mode!

        const obj: NonNullable<ReturnType<NonNullable<Engine['modes']>['get']>> = {
          selectors: new Set([...PRESET.modes.dom.selectors, ...(Engine.args.selector ? typeof Engine.args.selector === 'string' ? [Engine.args.selector] : Engine.args.selector : []), ...(typeof stratObj.selector === 'string' ? [stratObj.selector] : Array.isArray(stratObj.selector) ? stratObj.selector : PRESET.modes.dom.island.selectors)]),
          strategy: stratObj.strategy,
          colorSchemes:
            stratObj.strategy === STRATS.mono
              ? new Map([[stratObj.default, stratObj.colorScheme]])
              : stratObj.strategy === STRATS.multi
                ? new Map(Object.entries(stratObj.colorSchemes))
                : new Map([[(mode as Schema.Island.Mode.Facet.System).light, COLOR_SCHEMES.light], [(mode as Schema.Island.Mode.Facet.System).dark, COLOR_SCHEMES.dark], ...Object.entries(stratObj.colorSchemes ?? {})]),
          system: undefined,
        }

        if (stratObj.strategy === STRATS.system)
          obj.system = {
            mode: (mode as Schema.Island.Mode.Facet.System).system!,
            fallback: stratObj.fallback!,
          }

        return acc.set(i, obj)
      },
      new Map() as NonNullable<Engine['modes']>
    )

    this.nonce = Engine.args.nonce || PRESET.nonce
    this.disableTransitionOnChange = Engine.args.disableTransitionOnChange ?? PRESET.disable_transitions_on_change
    this.forcedValues = Engine.args.forcedValues ?? PRESET.forced_values
    this.observe = new Set(Engine.args.observe ? (typeof Engine.args.observe === 'string' ? [Engine.args.observe] : Engine.args.observe) : PRESET.observe)
  }
}
