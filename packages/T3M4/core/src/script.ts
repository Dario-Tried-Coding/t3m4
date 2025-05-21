import { T3M4 as T_T3M4 } from './types'
import { Selector } from './types/constants/selectors'
import { Store_Strat, Strat } from './types/constants/strats'
import { CallbackID, EventMap } from './types/events'
import { Script_Args } from './types/script'
import { ColorSchemes, Islands, Schema, State, Values } from './types/subscribers'

// #region TYPES
type Brand_Map = {
  completeness: 'complete' | 'partial'
  stage: 'dirty' | 'sanitized' | 'normalized'
}
type Brand<T, B extends Partial<Brand_Map>> = T & { [K in keyof B as `__${Extract<K, string>}`]: B[K] }

namespace Modes {
  export type AsMap = Map<string, string>
  export type AsObj = Record<string, string>
}

type Engine = {
  storageKeys: {
    state: string
    modes: string
  }
  islands: Islands.Static.AsSet
  values: Values.Static.AsMap
  fallbacks: Brand<State.Static.AsMap, { completeness: 'complete'; stage: 'normalized' }>
  nonce: string
  disableTransitionOnChange: boolean
  modes: {
    store: boolean
    strategy: Store_Strat
    storageKey: string
    map: Map<
      string,
      {
        strategy: Strat
        store: boolean
        selectors: Selector[]
        colorSchemes: ColorSchemes.Static.AsMap
        system: { mode: string; fallback: string } | undefined
      }
    >
  }
}

export const script = ({ schema, config, constants, preset, nonce, disableTransitionOnChange, storageKey, modes }: Script_Args) => {
  // #region Engine
  function constructEngine({ storageKey, modes, preset }: { storageKey: Script_Args['storageKey']; modes: Script_Args['modes']; preset: Script_Args['preset'] }): Engine {
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

        return [i, { ...(facets ? { facets } : {}), ...(mode ? { mode } : {}) } as NonNullable<ReturnType<Engine['values']['get']>>]
      })
    )

    const fallbacks = new Map(
      Object.entries(config).map(([i, v]) => {
        const facets = 'facets' in v ? new Map(Object.entries(v.facets!).map(([f, strat_obj]) => [f, strat_obj.default])) : undefined
        const mode = 'mode' in v ? v.mode!.default : undefined

        return [i, { ...(facets ? { facets } : {}), ...(mode ? { mode } : {}) }]
      })
    )

    const modesHandling = {
      store: modes?.store ?? preset.modes.store,
      strategy: modes?.strategy ?? preset.modes.strategy,
      storageKey: modes?.storageKey ?? preset.modes.storageKey,
      map: new Map(
        Object.entries(config)
          .filter(([i, { mode }]) => !!mode)
          .map(([i, { mode }]) => {
            const obj = {
              strategy: mode!.strategy,
              store: mode!.store ?? true,
              selectors: (typeof mode?.selector === 'string' ? [mode.selector] : mode!.selector) ?? preset.modes.selectors,
              colorSchemes:
                mode!.strategy === constants.strats.mono
                  ? new Map([[mode!.default, mode!.colorScheme]])
                  : mode!.strategy === constants.strats.multi
                    ? new Map(Object.entries(mode!.colorSchemes))
                    : new Map([
                        [(polishedSchema[i]!.mode as Schema.Island.Mode.Facet.System).light, constants.colorSchemes.light],
                        [(polishedSchema[i]!.mode as Schema.Island.Mode.Facet.System).dark, constants.colorSchemes.dark],
                        ...Object.entries(mode!.colorSchemes ?? {}),
                      ]),
              system:
                mode?.strategy === constants.strats.system && (polishedSchema[i]!.mode as Schema.Island.Mode.Facet.System)!.system ? { mode: (polishedSchema[i]!.mode as Schema.Island.Mode.Facet.System).system!, fallback: mode.fallback! } : undefined,
            }
            return [i, obj]
          })
      ),
    }

    return {
      storageKeys: {
        state: storageKey ?? preset.storageKey,
        modes: modes?.storageKey ?? preset.modes.storageKey,
      },
      islands,
      values,
      fallbacks,
      nonce: nonce ?? preset.nonce,
      disableTransitionOnChange: disableTransitionOnChange ?? preset.disableTransitionOnChange,
      modes: modesHandling,
    } as Engine
  }
  const engine = constructEngine({ preset, modes, storageKey })

  // #region utils
  const utils = {
    miscellaneous: {
      getSystemPref() {
        const supportsPref = window.matchMedia('(prefers-color-scheme)').media !== 'not all'
        const systemPref = supportsPref ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? constants.modes.dark : constants.modes.light) : undefined
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
    merge: {
      shallow: {
        maps(...sources: (Map<string, string> | undefined)[]): Map<string, string> {
          const result = new Map<string, string>()

          for (const source of sources) {
            if (!source) continue

            for (const [key, value] of source) {
              result.set(key, value)
            }
          }

          return result
        },
      },
      deep: {
        state: {
          maps(...sources: (State.Static.AsMap | undefined)[]): State.Static.AsMap {
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

            return result
          },
          objects(...sources: (State.Static | undefined)[]) {
            const result: State.Static = {}

            for (const source of sources) {
              if (!source) continue

              for (const [island, sourceValue] of Object.entries(source)) {
                const targetValue = result[island]

                if (!targetValue) {
                  result[island] = {
                    mode: sourceValue.mode,
                    facets: sourceValue.facets ? { ...sourceValue.facets } : undefined,
                  }
                } else {
                  result[island] = {
                    mode: sourceValue.mode ?? targetValue.mode,
                    facets: {
                      ...(targetValue.facets || {}),
                      ...(sourceValue.facets || {}),
                    },
                  }

                  // Rimuove facets se risultano vuote
                  if (Object.keys(result[island].facets!).length === 0) {
                    delete result[island].facets
                  }
                }
              }
            }

            return result
          },
        },
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
      },
    },
    convert: {
      shallow: {
        mapToObj: {
          string(map: Map<string, string>): Record<string, string> {
            return Object.fromEntries(map)
          },
          set(map: Map<string, Set<string>>): Record<string, string[]> {
            const result: Record<string, string[]> = {}
            for (const [key, value] of map) {
              result[key] = Array.from(value)
            }
            return result
          },
        },
        objToMap: {
          string(obj: Record<string, string>): Map<string, string> {
            return new Map(Object.entries(obj))
          },
        },
      },
      deep: {
        state: {
          mapToObj(state: State.Static.AsMap) {
            const result = {} as State.Static

            for (const [key, { facets, mode }] of state) {
              const obj = {} as State.Static.Island
              if (mode) obj.mode = mode
              if (facets) obj.facets = Object.fromEntries(facets)
              result[key] = obj
            }

            return result
          },
          objToMap(state: State.Static) {
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

            return result
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
      modes<T extends Brand<State.Static.AsMap, { completeness: 'complete' | 'partial' }>>(state: T) {
        const modes = new Map() as T extends Brand<any, { completeness: 'complete' }> ? Brand<Modes.AsMap, Brand_Map & { completeness: 'complete' }> : Brand<Modes.AsMap, Brand_Map & { completeness: 'partial' }>

        for (const [island, { mode }] of state) {
          if (!mode) continue
          if (!engine.modes.map.get(island)?.store) continue
          modes.set(island, mode)
        }

        return modes
      },
      colorSchemes<T extends Brand<State.Static.AsMap, { completeness: 'complete' | 'partial' }>>(state: T) {
        const modes = new Map(
          Array.from(state.entries())
            .filter(([, { mode }]) => !!mode)
            .map(([island, { mode }]) => [island, mode!])
        ) as T extends Brand<State.Static.AsMap, { completeness: 'complete' }> ? Brand<Modes.AsMap, { completeness: 'complete' }> : Brand<Modes.AsMap, { completeness: 'partial' }>

        const colorSchemes = utils.resolve.colorSchemes(modes)
        return colorSchemes
      },
    },
    resolve: {
      colorSchemes<T extends Brand<Modes.AsMap, { completeness: 'complete' | 'partial' }>>(modes: T) {
        const colorSchemes = new Map() as T extends Brand<Modes.AsMap, { completeness: 'complete' }> ? Brand<ColorSchemes.Static.AsMap, { completeness: 'complete' }> : Brand<ColorSchemes.Static.AsMap, { completeness: 'partial' }>

        for (const [island, mode] of modes) {
          const colorScheme = this.colorScheme(island, mode)
          if (!colorScheme) continue
          colorSchemes.set(island, colorScheme)
        }

        return colorSchemes
      },
      colorScheme(island: string, mode: string) {
        if (!engine.modes.map.has(island)) return

        const isSystemStrat = engine.modes.map.get(island)!.strategy === constants.strats.system
        const isSystemMode = engine.modes.map.get(island)!.system?.mode === mode
        const isSystem = isSystemStrat && isSystemMode
        const fallbackMode = engine.modes.map.get(island)!.system?.fallback
        if (isSystem) return utils.miscellaneous.getSystemPref() ?? engine.modes.map.get(island)?.colorSchemes.get(fallbackMode!)

        return engine.modes.map.get(island)!.colorSchemes.get(mode)
      },
    },
    isValid: {
      value: {
        island(value: string) {
          return engine.islands.has(value)
        },
        facet(island: string, value: string) {
          return engine.values.get(island)?.facets?.has(value) ?? false
        },
        option: {
          facet(island: string, facet: string, value: string) {
            return engine.values.get(island)?.facets?.get(facet)?.has(value) ?? false
          },
          mode(island: string, value: string) {
            return engine.values.get(island)?.mode?.has(value) ?? false
          },
        },
      },
      structure: {
        state: {
          obj(obj: Record<string, unknown>): obj is Brand<State.Static, { stage: 'dirty' }> {
            for (const [key, value] of Object.entries(obj)) {
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
          obj(obj: Record<string, unknown>): obj is Brand<Modes.AsObj, { stage: 'dirty' }> {
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
    deserialize: {
      state(string: string) {
        const parsed = utils.miscellaneous.safeParse(string)
        if (!parsed) return undefined

        const isPlainObject = utils.isValid.type.plainObject(parsed)
        if (!isPlainObject) return undefined

        const isStateObj = utils.isValid.structure.state.obj(parsed)
        if (!isStateObj) return undefined

        const dirtyState = utils.convert.deep.state.objToMap(parsed)
        return dirtyState as Brand<State.Static.AsMap, { stage: 'dirty' }>
      },
      modes(string: string) {
        const parsed = utils.miscellaneous.safeParse(string)
        if (!parsed) return undefined

        const isPlainObject = utils.isValid.type.plainObject(parsed)
        if (!isPlainObject) return undefined

        const isModesObj = utils.isValid.structure.modes.obj(parsed)
        if (!isModesObj) return undefined

        const dirtyModes = utils.convert.shallow.objToMap.string(parsed)
        return dirtyModes as Brand<Modes.AsMap, { stage: 'dirty' }>
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

            return isOption ? value : isBackupOption ? backup! : fallback
          },
          mode(island: string, value: string, backup?: string) {
            const isIsland = utils.isValid.value.island(island)
            if (!isIsland) return

            const hasMode = engine.values.get(island)!.mode !== undefined
            if (!hasMode) return

            const isOption = utils.isValid.value.option.mode(island, value)
            const isBackupOption = backup ? utils.isValid.value.option.mode(island, backup) : false
            const fallback = engine.fallbacks.get(island)!.mode!

            return isOption ? value : isBackupOption ? backup! : fallback
          },
        },
        island(island: string, values: Brand<State.Static.AsMap.Island, { stage: 'dirty' }>, backup?: Brand<State.Static.AsMap.Island, { stage: 'dirty' }>) {
          const isIsland = utils.isValid.value.island(island)
          if (!isIsland) return

          const obj = {} as Brand<State.Static.AsMap.Island, { stage: 'sanitized' }>

          if (values.facets) {
            const facets = new Map() as NonNullable<State.Static.AsMap.Island.Facets['facets']>
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
        all(state: Brand<State.Static.AsMap, { stage: 'dirty' }>, backup?: Brand<State.Static.AsMap, { stage: 'dirty' }>) {
          const sanState = new Map() as Brand<State.Static.AsMap, { stage: 'sanitized' }>

          for (const [island, values] of state) {
            const sanIsland = utils.sanitize.state.island(island, values as Brand<State.Static.AsMap.Island, { stage: 'dirty' }>, backup?.get(island) as Brand<State.Static.AsMap.Island, { stage: 'dirty' }>)
            if (!sanIsland) continue

            sanState.set(island, sanIsland)
          }

          return sanState
        },
      },
      modes: {
        mode(island: string, value: string, backup?: string) {
          const isIsland = utils.isValid.value.island(island)
          if (!isIsland) return

          const hasMode = !!engine.values.get(island)!.mode
          if (!hasMode) return

          const isMode = utils.isValid.value.option.mode(island, value)
          const isBackupMode = backup ? utils.isValid.value.option.mode(island, backup) : false
          const fallback = engine.fallbacks.get(island)!.mode!

          return isMode ? value : isBackupMode ? backup! : fallback
        },
        all(modes: Brand<Modes.AsMap, { stage: 'dirty' }>, backup?: Brand<Modes.AsMap, { stage: 'dirty' }>) {
          const sanModes = new Map() as Brand<Modes.AsMap, { stage: 'sanitized' }>

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
        island(island: string, values: Brand<State.Static.AsMap.Island, { stage: 'dirty' }>, backup?: Brand<State.Static.AsMap.Island, { stage: 'dirty' }>) {
          const isIsland = utils.isValid.value.island(island)
          if (!isIsland) return

          const normalized = {} as Brand<State.Static.AsMap.Island, { stage: 'normalized'; completeness: 'complete' }>

          // fallbacks
          for (const [facet, fallback] of engine.fallbacks.get(island)!.facets ?? []) {
            if (!normalized.facets) normalized.facets = new Map()
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

          return normalized
        },
        state(state: Brand<State.Static.AsMap, { stage: 'dirty' | 'sanitized' | 'normalized' }>, backup?: Brand<State.Static.AsMap, { stage: 'dirty' | 'sanitized' | 'normalized' }>) {
          const normalized = new Map() as Brand<State.Static.AsMap, { stage: 'normalized'; completeness: 'complete' }>

          for (const [island, values] of engine.fallbacks) {
            normalized.set(island, values)
          }

          for (const [island, values] of state) {
            const normIsland = utils.normalize.state.island(island, values as Brand<State.Static.AsMap.Island, { stage: 'dirty' }>, backup?.get(island) as Brand<State.Static.AsMap.Island, { stage: 'dirty' }>)
            if (!normIsland) continue

            normalized.set(island, normIsland)
          }

          return normalized
        },
      },
      modes: {
        all: (values: Brand<Modes.AsMap, Pick<Brand_Map, 'stage'>>, backup?: Brand<Modes.AsMap, Pick<Brand_Map, 'stage'>>) => {
          const normalized = new Map() as Brand<Modes.AsMap, { stage: 'normalized'; completeness: 'complete' }>

          for (const [island, value] of utils.construct.modes(engine.fallbacks)) {
            normalized.set(island, value)
          }

          if (backup) {
            for (const [island, value] of backup) {
              const sanValue = utils.sanitize.modes.mode(island, value)
              if (!sanValue) continue

              normalized.set(island, sanValue)
            }
          }

          for (const [island, value] of values) {
            const sanValue = utils.sanitize.modes.mode(island, value, backup?.get(island))
            if (!sanValue) continue

            normalized.set(island, sanValue)
          }

          return normalized
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

  // #region STORAGE MANAGER
  class StorageManager {
    private static instance: StorageManager
    private static abortController = new AbortController()
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
        serialized: () => {
          const retrieved = window.localStorage.getItem(engine.storageKeys.modes)
          return retrieved ?? undefined
        },
        deserialized: () => {
          const serialized = StorageManager.get.modes.serialized()
          if (!serialized) return undefined

          const deserialized = utils.deserialize.modes(serialized)
          return deserialized
        },
        sanitized: () => {
          const deserialized = StorageManager.get.modes.deserialized()
          if (!deserialized) return undefined

          const sanitized = utils.sanitize.modes.all(deserialized)
          return sanitized
        },
        normalized: () => {
          const sanitized = StorageManager.get.modes.sanitized()

          const normalized = utils.normalize.modes.all(sanitized ?? utils.construct.modes(engine.fallbacks))
          return normalized
        },
      },
    }

    public static set = {
      state(state: Brand<State.Static.AsMap, Pick<Brand_Map, 'completeness'>>) {
        const currState = StorageManager.get.state.normalized()
        const newState = utils.merge.deep.state.maps(currState, state) as typeof currState

        const obj = utils.convert.deep.state.mapToObj(newState) as Brand<State.Static, { stage: 'normalized'; completeness: 'complete' }>
        const serialized = JSON.stringify(obj)

        const needsUpdate = StorageManager.get.state.serialized() !== serialized
        if (needsUpdate) {
          StorageManager.isInternalChange = true
          window.localStorage.setItem(engine.storageKeys.state, serialized)
          StorageManager.isInternalChange = false
        }

        StorageManager.set.modes(newState)
      },
      modes(state: Brand<State.Static.AsMap, Pick<Brand_Map, 'completeness'>>) {
        if (!engine.modes.store) return
        if (engine.modes.strategy === 'split') return

        const currState = StorageManager.get.state.normalized()
        const newState = utils.merge.deep.state.maps(currState, state) as typeof currState

        const modes = utils.construct.modes(newState)
        const modesObj = utils.convert.shallow.mapToObj.string(modes)
        const serModes = JSON.stringify(modesObj)

        const needsUpdate = StorageManager.get.modes.serialized() !== serModes
        if (needsUpdate) {
          StorageManager.isInternalChange = true
          window.localStorage.setItem(engine.storageKeys.modes, serModes)
          StorageManager.isInternalChange = false
        }

        const stateObj = utils.convert.deep.state.mapToObj(newState)
        const serState = JSON.stringify(stateObj)
        const stateNeedsUpdate = StorageManager.get.state.serialized() !== serState
        if (stateNeedsUpdate) StorageManager.set.state(newState)
      },
    }

    private constructor() {
      EventManager.on('State:Base:Update', 'StorageManager:State:Update', (state) => StorageManager.set.state(utils.convert.deep.state.objToMap(state) as Brand<State.Static.AsMap, { completeness: 'complete' }>))

      window.addEventListener('storage', ({ key, oldValue, newValue }) => {
        switch (key) {
          // prettier ignore
          case engine.storageKeys.state:
            {
              const deserNew = newValue ? utils.deserialize.state(newValue) : undefined
              const deserOld = oldValue ? utils.deserialize.state(oldValue) : undefined

              const normalized = utils.normalize.state.state(deserNew ?? deserOld ?? engine.fallbacks, deserOld)
              StorageManager.set.state(normalized)
              Main.set.state.base(normalized as unknown as Brand<State.Static.AsMap, { completeness: 'partial' }>)
            }
            break
          case engine.storageKeys.modes:
            {
              if (!engine.modes.store) return
              if (engine.modes.strategy === 'split') return

              const fallbackModes = utils.construct.modes(engine.fallbacks)
              const deserNew = newValue ? utils.deserialize.modes(newValue) : undefined
              const deserOld = oldValue ? utils.deserialize.modes(oldValue) : undefined

              const normModes = utils.normalize.modes.all(deserNew ?? deserOld ?? fallbackModes, deserOld)
              const statePartial = new Map(Array.from(normModes.entries()).map(([island, mode]) => [island, { mode }])) as Brand<State.Static.AsMap, { completeness: 'partial'; stage: 'normalized' }>

              StorageManager.set.modes(statePartial)
              Main.set.state.base(statePartial)
            }
            break
        }
      })
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
        base: () => Main.instance.state.base,
        forced: () => Main.instance.state.forced,
        computed: () => {
          const base = Main.get.state.base()
          if (!base) return undefined

          const forced = Main.get.state.forced()
          const computed = utils.merge.deep.state.maps(base, forced) as typeof base

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
          const computed = utils.merge.shallow.maps(base, forced) as typeof base

          return computed
        },
      },
    }

    public static set = {
      state: {
        base: (state: Brand<State.Static.AsMap, { completeness: 'partial' }>) => {
          const currState = Main.get.state.base()
          if (!currState) return console.error('[T3M4]: Library not initialized')

          const mergedState = utils.merge.deep.state.maps(currState, state) as typeof currState
          Main.smartUpdateNotify.state.base(mergedState)
        },
        forced: (state: Brand<State.Static.AsMap, { completeness: 'partial' }>) => {
          const currState = Main.get.state.forced()
          if (!currState) return console.error('[T3M4]: Library not initialized')

          const mergedState = utils.merge.deep.state.maps(currState, state) as typeof currState
          Main.smartUpdateNotify.state.forced(mergedState)
        },
      },
    }

    private static notifyUpdate = {
      state: {
        base: (state: Brand<State.Static.AsMap, { completeness: 'complete' }>) => {
          const colorSchemes = utils.construct.colorSchemes(state)
          EventManager.emit('State:Base:Update', utils.convert.deep.state.mapToObj(state))
          EventManager.emit('ColorSchemes:Base:Update', utils.convert.shallow.mapToObj.string(colorSchemes) as ColorSchemes.Static)
        },
        forced: (state: Brand<State.Static.AsMap, { completeness: 'partial' }>) => {
          const colorSchemes = utils.construct.colorSchemes(state)
          EventManager.emit('State:Forced:Update', utils.convert.deep.state.mapToObj(state))
          EventManager.emit('ColorSchemes:Forced:Update', utils.convert.shallow.mapToObj.string(colorSchemes) as ColorSchemes.Static)
        },
        computed: (state: Brand<State.Static.AsMap, { completeness: 'complete' }>) => {
          const colorSchemes = utils.construct.colorSchemes(state)
          EventManager.emit('State:Computed:Update', utils.convert.deep.state.mapToObj(state))
          EventManager.emit('ColorSchemes:Computed:Update', utils.convert.shallow.mapToObj.string(colorSchemes) as ColorSchemes.Static)
        },
      },
    }

    private static smartUpdateNotify = {
      state: {
        base(newState: Brand<State.Static.AsMap, { completeness: 'complete' }>) {
          const currState = Main.get.state.base()
          if (!currState) return console.error('[T3M4] Library not initialized.')

          const isEqual = utils.equal.deep.state(currState, newState)
          if (isEqual) return

          Main.instance.state.base = newState
          Main.notifyUpdate.state.base(newState)

          const computedState = Main.get.state.computed()!
          Main.notifyUpdate.state.computed(computedState)
        },
        forced(newState: Brand<State.Static.AsMap, { completeness: 'partial' }>) {
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

    private state: {
      base: Brand<State.Static.AsMap, { completeness: 'complete' }> | undefined
      forced: Brand<State.Static.AsMap, { completeness: 'partial' }> | undefined
    } = {
      base: undefined,
      forced: undefined,
    }

    private constructor() {
      StorageManager.init()

      const storageState = StorageManager.get.state.normalized()

      const baseState = storageState
      this.state.base = baseState
      Main.notifyUpdate.state.base(baseState)

      const forcedState = new Map() as Brand<State.Static.AsMap, { completeness: 'partial' }>
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
          const stateMap = utils.convert.deep.state.objToMap(state) as Brand<State.Static.AsMap, { completeness: 'partial' }>
          Main.set.state.base(stateMap)
        },
        forced: (state: State.Static) => {
          const stateMap = utils.convert.deep.state.objToMap(state) as Brand<State.Static.AsMap, { completeness: 'partial' }>
          Main.set.state.forced(stateMap)
        },
      },
    }

    public subscribe<E extends keyof EventMap>(e: E, id: CallbackID, cb: (payload: EventMap[E]) => void) {
      EventManager.on(e, id, cb)
    }

    public reboot(args: Script_Args) {}

    public constructor() {
      Main.init()
    }
  }

  window.T3M4 = new T3M4()
}
