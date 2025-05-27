import { T3M4 as T_T3M4 } from './types'
import { Facet } from './types/constants/facets'
import { Selector } from './types/constants/selectors'
import { Store_Strat, Strat } from './types/constants/strats'
import { CallbackID, EventMap } from './types/events'
import { Script_Args } from './types/script'
import { ColorSchemes, Islands, Schema, State, Values } from './types/subscribers'

// #region TYPES
type Brand_Map = {
  completeness: {
    complete: 'complete'
    partial: 'partial' | Brand_Map['completeness']['complete']
  }
  stage: {
    dirty: 'dirty' | Brand_Map['stage']['sanitized']
    sanitized: 'sanitized' | Brand_Map['stage']['normalized']
    normalized: 'normalized'
  }
  toStore: {
    yes: 'yes'
    no: 'no' | Brand_Map['toStore']['yes']
  }
}
type AtLeast<T, B extends Partial<{ [K in keyof Brand_Map]: keyof Brand_Map[K] }>> = T & { [K in keyof B as `__${Extract<K, string>}`]: K extends keyof Brand_Map ? (B[K] extends keyof Brand_Map[K] ? Brand_Map[K][B[K]] : never) : never }
type Brand<T, B extends Partial<{ [K in keyof Brand_Map]: keyof Brand_Map[K] }>> = T & { [K in keyof B as `__${Extract<K, string>}`]: B[K] }

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
  facets: Map<string, { mode?: string; facets?: Set<string> }>
  values: Values.Static.AsMap
  fallbacks: Brand<State.Static.AsMap, { completeness: 'complete'; stage: 'normalized' }>
  nonce: string
  disableTransitionOnChange: boolean
  dataAttributes: {
    force: Set<string>
    computed: Set<string>
  }
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

export const script = (args: Script_Args) => {
  // #region engine
  function constructEngine({schema, constants, preset, config, modes, storageKey, nonce, disableTransitionOnChange}:Script_Args): Engine {
    const polishedSchema = Object.fromEntries(Object.entries(schema).filter(([k, v]) => Object.keys(v).length > 0 && (!('facets' in v) || Object.keys(v.facets ?? {}).length > 0)))

    const islands = new Set(Object.entries(polishedSchema).map(([k]) => k))

    const facets = Object.entries(polishedSchema).reduce(
      (acc, [i, { facets, mode }]) => {
        const obj = {} as NonNullable<ReturnType<Engine['facets']['get']>>

        if (facets) obj.facets = new Set(Object.keys(facets))
        if (mode) obj.mode = 'mode'

        if (Object.keys(obj).length > 0) acc.set(i, obj)
        return acc
      },
      new Map() as Engine['facets']
    )

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
        Object.entries(polishedSchema ?? {})
          .filter(([i]) => !!config[i]?.mode)
          .map(([i]) => {
            const stratObj = config[i]!.mode!
            const modeSettings = modes?.islands?.[i]

            const obj = {
              strategy: stratObj.strategy,
              store: modeSettings?.store ?? true,
              selectors: modeSettings?.selectors ?? [],
              colorSchemes:
                stratObj.strategy === constants.strats.mono
                  ? new Map([[stratObj.default, stratObj.colorScheme]])
                  : stratObj.strategy === constants.strats.multi
                    ? new Map(Object.entries(stratObj.colorSchemes))
                    : new Map([
                        [(polishedSchema[i]!.mode as Schema.Island.Mode.Facet.System).light, constants.colorSchemes.light],
                        [(polishedSchema[i]!.mode as Schema.Island.Mode.Facet.System).dark, constants.colorSchemes.dark],
                        ...Object.entries(stratObj.colorSchemes ?? {}),
                      ]),
              system:
                stratObj.strategy === constants.strats.system && (polishedSchema[i]!.mode as Schema.Island.Mode.Facet.System)!.system
                  ? { mode: (polishedSchema[i]!.mode as Schema.Island.Mode.Facet.System).system!, fallback: stratObj.fallback! }
                  : undefined,
            }
            return [i, obj]
          })
      ),
    }

    const forceAttributes = new Set<string>()
    facets.forEach(({ facets, mode }, island) => {
      if (facets) facets.forEach((v, f) => forceAttributes.add(`data-force-${island}-facet-${f}`))
      if (mode) forceAttributes.add(`data-force-${island}-mode`)
    })

    const attributes = new Set<string>()
    facets.forEach(({ facets, mode }) => {
      if (facets) facets.forEach((v, f) => attributes.add(`data-facet-${f}`))
      if (mode) attributes.add('data-mode')
    })

    return {
      storageKeys: {
        state: storageKey ?? preset.storageKey,
        modes: `${storageKey ?? preset.storageKey}:${modes?.storageKey ?? preset.modes.storageKey}`,
      },
      islands,
      facets,
      values,
      fallbacks: fallbacks as Brand<State.Static.AsMap, { completeness: 'complete'; stage: 'normalized' }>,
      nonce: nonce ?? preset.nonce,
      disableTransitionOnChange: disableTransitionOnChange ?? preset.disableTransitionOnChange,
      modes: modesHandling,
      dataAttributes: {
        force: forceAttributes,
        computed: attributes,
      },
    }
  }
  let engine = constructEngine(args)

  // #region utils
  const utils = {
    miscellaneous: {
      getSystemPref() {
        const supportsPref = window.matchMedia('(prefers-color-scheme)').media !== 'not all'
        const systemPref = supportsPref ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? args.constants.modes.dark : args.constants.modes.light) : undefined
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
      disableTransitions() {
        const css = document.createElement('style')
        if (engine.nonce) css.setAttribute('nonce', engine.nonce)
        css.appendChild(document.createTextNode(`*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`))
        document.head.appendChild(css)

        return () => {
          ;(() => window.getComputedStyle(document.body))()
          setTimeout(() => document.head.removeChild(css), 1)
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
    convert: {
      shallow: {
        mapToObj: {
          string(map: Map<string, string>) {
            return Object.fromEntries(map)
          },
          set(map: Map<string, Set<string>>) {
            const result: Record<string, string[]> = {}
            for (const [key, value] of map) {
              result[key] = Array.from(value)
            }
            return result
          },
        },
        objToMap: {
          string(obj: Record<string, string>) {
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
      modes(state: AtLeast<State.Static.AsMap, { completeness: 'partial' }>) {
        const modes = new Map() as Brand<Modes.AsMap, { toStore: 'yes'; completeness: 'partial' }>

        for (const [island, { mode }] of state) {
          if (!mode) continue
          if (engine.modes.map.get(island)?.store === false) continue
          modes.set(island, mode)
        }

        return modes
      },
      colorSchemes(state: AtLeast<State.Static.AsMap, { completeness: 'partial' }>) {
        const modes = new Map(
          Array.from(state.entries())
            .filter(([, { mode }]) => !!mode)
            .map(([island, { mode }]) => [island, mode!])
        )

        const colorSchemes = utils.resolve.colorSchemes(modes as Brand<Modes.AsMap, { completeness: 'partial'; toStore: 'no' }>)
        return colorSchemes
      },
    },
    resolve: {
      colorSchemes(modes: AtLeast<Modes.AsMap, { completeness: 'partial'; toStore: 'no' }>) {
        const colorSchemes: ColorSchemes.Static.AsMap = new Map()

        for (const [island, mode] of modes) {
          const colorScheme = this.colorScheme(island, mode)
          if (!colorScheme) continue
          colorSchemes.set(island, colorScheme)
        }

        return colorSchemes
      },
      colorScheme(island: string, mode: string) {
        if (!engine.modes.map.has(island)) return

        const isSystemStrat = engine.modes.map.get(island)!.strategy === args.constants.strats.system
        const isSystemMode = engine.modes.map.get(island)!.system?.mode === mode
        const isSystem = isSystemStrat && isSystemMode
        const fallbackMode = engine.modes.map.get(island)!.system?.fallback
        if (isSystem) return utils.miscellaneous.getSystemPref() ?? engine.modes.map.get(island)?.colorSchemes.get(fallbackMode!)

        return engine.modes.map.get(island)!.colorSchemes.get(mode)
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
          obj(obj: Record<string, unknown>): obj is Brand<Modes.AsObj, { stage: 'dirty'; toStore: 'yes' }> {
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
        const fallback = new Map() as Brand<Modes.AsMap, { stage: 'dirty' }>

        const parsed = utils.miscellaneous.safeParse(string)
        if (!parsed) return fallback

        const isPlainObject = utils.isValid.type.plainObject(parsed)
        if (!isPlainObject) return fallback

        const isModesObj = utils.isValid.structure.modes.obj(parsed)
        if (!isModesObj) return fallback

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
        island(island: string, values: AtLeast<State.Static.AsMap.Island, { stage: 'dirty' }>, backup?: AtLeast<State.Static.AsMap.Island, { stage: 'dirty' }>) {
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
        all(state: AtLeast<State.Static.AsMap, { stage: 'dirty' }>, backup?: AtLeast<State.Static.AsMap, { stage: 'dirty' }>) {
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

          const mustStore = engine.modes.map.get(island)?.store
          if (!mustStore) return

          const isMode = utils.isValid.value.option.mode(island, value)
          const isBackupMode = backup ? utils.isValid.value.option.mode(island, backup) : false
          const fallback = engine.fallbacks.get(island)!.mode!

          return isMode ? value : isBackupMode ? backup! : fallback
        },
        all(modes: AtLeast<Modes.AsMap, { stage: 'dirty' }>, backup?: AtLeast<Modes.AsMap, { stage: 'dirty' }>) {
          const sanModes = new Map() as Brand<Modes.AsMap, { stage: 'sanitized'; toStore: 'yes' }>

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
        island(island: string, values: AtLeast<State.Static.AsMap.Island, { stage: 'dirty' }>, backup?: AtLeast<State.Static.AsMap.Island, { stage: 'dirty' }>) {
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
        state(state: AtLeast<State.Static.AsMap, { stage: 'dirty' }>, backup?: AtLeast<State.Static.AsMap, { stage: 'dirty' }>) {
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
        all: (values: AtLeast<Modes.AsMap, { stage: 'dirty' }>, backup?: AtLeast<Modes.AsMap, { stage: 'dirty' }>) => {
          const normalized = new Map() as Brand<Modes.AsMap, { stage: 'normalized'; completeness: 'complete'; toStore: 'yes' }>

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
            if (!serialized) return new Map() as Brand<Modes.AsMap, { stage: 'dirty' }>

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
            const dirty = new Map() as Brand<Modes.AsMap, { stage: 'dirty' }>

            for (const island of engine.islands) {
              const retrieved = window.localStorage.getItem(`${engine.storageKeys.modes}-${island}`)
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
      state(state: AtLeast<State.Static.AsMap, { completeness: 'complete'; stage: 'normalized' }>) {
        const obj = utils.convert.deep.state.mapToObj(state)
        const serialized = JSON.stringify(obj)

        const needsUpdate = StorageManager.get.state.serialized() !== serialized
        if (needsUpdate) {
          StorageManager.isInternalChange = true
          window.localStorage.setItem(engine.storageKeys.state, serialized)
          StorageManager.isInternalChange = false
        }

        StorageManager.set.modes(state)
      },
      modes(state: AtLeast<State.Static.AsMap, { completeness: 'complete'; stage: 'normalized' }>) {
        const unique = (state: AtLeast<State.Static.AsMap, { completeness: 'complete'; stage: 'normalized' }>) => {
          if (!engine.modes.store) return
          if (engine.modes.strategy === 'split') return

          const modes = utils.construct.modes(state)
          const modesObj = utils.convert.shallow.mapToObj.string(modes)
          const serModes = JSON.stringify(modesObj)

          const needsUpdate = StorageManager.get.modes.unique.serialized() !== serModes
          if (needsUpdate) {
            StorageManager.isInternalChange = true
            window.localStorage.setItem(`${engine.storageKeys.modes}`, serModes)
            StorageManager.isInternalChange = false
          }

          const stateObj = utils.convert.deep.state.mapToObj(state)
          const serState = JSON.stringify(stateObj)
          const stateNeedsUpdate = StorageManager.get.state.serialized() !== serState
          if (stateNeedsUpdate) StorageManager.set.state(state)
        }

        const split = (state: AtLeast<State.Static.AsMap, { completeness: 'complete'; stage: 'normalized' }>) => {
          if (!engine.modes.store) return
          if (engine.modes.strategy === 'unique') return

          const currState = StorageManager.get.state.normalized()
          const newState = utils.merge.deep.state.maps(currState, state) as typeof currState

          const modes = utils.construct.modes(newState)
          const currModes = StorageManager.get.modes.split.dirty()

          const needsUpdate = !utils.equal.shallow.map.string(currModes, modes)
          if (needsUpdate) {
            StorageManager.isInternalChange = true
            for (const [island, mode] of modes) {
              const needsUpdate = currModes.get(island) !== mode
              if (needsUpdate) window.localStorage.setItem(`${engine.storageKeys.modes}:${island}`, mode)
            }
            StorageManager.isInternalChange = false
          }

          const stateObj = utils.convert.deep.state.mapToObj(newState)
          const serState = JSON.stringify(stateObj)
          const stateNeedsUpdate = StorageManager.get.state.serialized() !== serState
          if (stateNeedsUpdate) StorageManager.set.state(newState)
        }

        if (!engine.modes.store) return

        if (engine.modes.strategy === 'unique') unique(state)
        else if (engine.modes.strategy === 'split') split(state)
      },
    }

    public static terminate() {
      StorageManager.abortController?.abort()

      localStorage.removeItem(engine.storageKeys.state)
      if (engine.modes.store) {
        if (engine.modes.strategy === 'unique') localStorage.removeItem(`${engine.storageKeys.modes}`)
        else if (engine.modes.strategy === 'split') {
          for (const island of engine.islands) {
            localStorage.removeItem(`${engine.storageKeys.modes}:${island}`)
          }
        }
      }

      StorageManager.instance = undefined
    }

    private constructor() {
      EventManager.on('State:Base:Update', 'StorageManager:State:Update', (state) => StorageManager.set.state(utils.convert.deep.state.objToMap(state) as Brand<State.Static.AsMap, { completeness: 'complete'; stage: 'normalized' }>))

      StorageManager.abortController = new AbortController()
      window.addEventListener(
        'storage',
        ({ key, oldValue, newValue }) => {
          // prettier ignore
          switch (true) {
            case key === engine.storageKeys.state:
              {
                const deserNew = newValue ? utils.deserialize.state(newValue) : undefined
                const deserOld = oldValue ? utils.deserialize.state(oldValue) : undefined

                const normalized = utils.normalize.state.state(deserNew ?? deserOld ?? engine.fallbacks, deserOld)
                StorageManager.set.state(normalized)
                Main.set.state.base(normalized)
              }
              break
            case key === `${engine.storageKeys.modes}`:
              {
                if (!engine.modes.store) return
                if (engine.modes.strategy === 'split') return

                const fallbackModes = utils.construct.modes(engine.fallbacks) as Brand<Modes.AsMap, { completeness: 'partial'; stage: 'normalized'; toStore: 'yes' }>
                const deserNew = newValue ? utils.deserialize.modes(newValue) : undefined
                const deserOld = oldValue ? utils.deserialize.modes(oldValue) : undefined

                const normModes = utils.normalize.modes.all(deserNew ?? deserOld ?? fallbackModes, deserOld)
                const statePartial = new Map(Array.from(normModes.entries()).map(([island, mode]) => [island, { mode }])) as Brand<State.Static.AsMap, { completeness: 'partial'; stage: 'normalized' }>
                const currState = Main.get.state.base()!
                const newState = utils.merge.deep.state.maps(currState, statePartial) as typeof currState

                StorageManager.set.modes(newState)
                Main.set.state.base(newState)
              }
              break
            case key?.startsWith(`${engine.storageKeys.modes}:`):
              {
                if (!engine.modes.store) return
                if (engine.modes.strategy === 'unique') return

                const island = key?.split(`${engine.storageKeys.modes}:`)[1]
                if (!island) return

                const isIsland = utils.isValid.value.island(island)
                if (!isIsland) return

                const fallbackMode = utils.construct.modes(engine.fallbacks).get(island)
                if (!fallbackMode) return

                const sanMode = utils.sanitize.modes.mode(island, newValue ?? oldValue ?? fallbackMode, oldValue ?? fallbackMode)

                const statePartial = new Map([[island, { mode: sanMode }]]) as Brand<State.Static.AsMap, { completeness: 'partial' }>
                const currState = Main.get.state.base()!
                const newState = utils.merge.deep.state.maps(currState, statePartial) as typeof currState

                StorageManager.set.modes(newState)
                Main.set.state.base(newState)
              }
              break
          }
        },
        { signal: StorageManager.abortController.signal }
      )
    }
  }

  // #region DOM MANAGER
  class DomManager {
    private static instance: DomManager | undefined
    private static observer: MutationObserver | null = null

    public static init() {
      if (!DomManager.instance) DomManager.instance = new DomManager()
    }

    public static get = {
      islands: () => {
        const islands = new Map() as Brand<Map<string, NodeListOf<Element>>, { completeness: 'partial' }>
        for (const island of engine.islands) {
          const elements = document.querySelectorAll(`[data-island="${island}"]`)
          if (elements.length === 0) continue
          islands.set(island, elements)
        }
        return islands
      },
      state: {
        computed: {
          island: {
            dirty: (island: string, el: Element) => {
              const isIsland = utils.isValid.value.island(island)
              if (!isIsland) return undefined

              const { mode, facets } = engine.facets.get(island)!

              const state = {} as Brand<State.Static.AsMap.Island, { stage: 'dirty'; completeness: 'partial' }>
              if (facets) {
                const facetsMap = new Map() as State.Static.AsMap.Island.Facets['facets']
                for (const facet of facets) {
                  const facetValue = el.getAttribute(`data-facet-${facet}`)
                  if (!facetValue) continue

                  facetsMap.set(facet, facetValue)
                }
                if (facetsMap.size !== 0) state.facets = facetsMap
              }
              if (mode) {
                const modeValue = el.getAttribute(`data-mode`)
                if (modeValue) state.mode = modeValue
              }

              return state
            },
            sanitized: (island: string, el: Element, backup?: AtLeast<State.Static.AsMap.Island, { stage: 'dirty' }>) => {
              const dirty = DomManager.get.state.computed.island.dirty(island, el)
              if (!dirty) return undefined

              const sanitized = utils.sanitize.state.island(island, dirty, backup) as Brand<State.Static.AsMap.Island, { completeness: 'partial'; stage: 'sanitized' }>
              return sanitized
            },
            normalized: (island: string, el: Element, backup?: AtLeast<State.Static.AsMap.Island, { stage: 'dirty' }>) => {
              const sanitized = DomManager.get.state.computed.island.sanitized(island, el, backup)
              if (!sanitized) return undefined

              const normalized = utils.normalize.state.island(island, sanitized, backup)
              return normalized
            },
          },
          all: {
            dirty: () => {
              const islands = DomManager.get.islands()
              const states = new Map() as Map<string, Map<Element, Brand<State.Static.AsMap.Island, { stage: 'dirty'; completeness: 'partial' }>>>

              for (const [island, elements] of islands) {
                const islandStates = new Map() as NonNullable<ReturnType<(typeof states)['get']>>
                for (const element of elements) {
                  const islandElState = DomManager.get.state.computed.island.dirty(island, element)!
                  if (Object.keys(islandElState).length > 0) islandStates.set(element, islandElState)
                }
                if (islandStates.size !== 0) states.set(island, islandStates)
              }

              return states
            },
            sanitized: () => {
              const islands = DomManager.get.islands()
              const states = new Map() as Map<string, Map<Element, Brand<State.Static.AsMap.Island, { stage: 'sanitized'; completeness: 'partial' }>>>

              for (const [island, elements] of islands) {
                const islandStates = new Map() as NonNullable<ReturnType<(typeof states)['get']>>
                for (const element of elements) {
                  const islandElState = DomManager.get.state.computed.island.sanitized(island, element)!
                  if (Object.keys(islandElState).length > 0) islandStates.set(element, islandElState)
                }
                if (islandStates.size !== 0) states.set(island, islandStates)
              }

              return states
            },
            normalized: () => {
              const islands = DomManager.get.islands()
              const states = new Map() as Map<string, Map<Element, Brand<State.Static.AsMap.Island, { stage: 'normalized'; completeness: 'complete' }>>>

              for (const [island, elements] of islands) {
                const islandStates = new Map() as NonNullable<ReturnType<(typeof states)['get']>>
                for (const element of elements) {
                  const islandElState = DomManager.get.state.computed.island.normalized(island, element)!
                  islandStates.set(element, islandElState)
                }
                if (islandStates.size !== 0) states.set(island, islandStates)
              }

              return states
            },
          },
        },
        forced: {
          island: {
            dirty: (island: string) => {
              const findDeepest = (attr: string) => {
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

              const isIsland = utils.isValid.value.island(island)
              if (!isIsland) return undefined

              const { mode, facets } = engine.facets.get(island)!

              const state = {} as Brand<State.Static.AsMap.Island, { stage: 'dirty'; completeness: 'partial' }>
              if (facets) {
                const facetsMap = new Map() as State.Static.AsMap.Island.Facets['facets']

                for (const facet of facets) {
                  const deepestEl = findDeepest(`data-force-${island}-facet-${facet}`)
                  if (!deepestEl) continue

                  const forcedValue = deepestEl.getAttribute(`data-force-${island}-facet-${facet}`)
                  if (!forcedValue) continue

                  facetsMap.set(facet, forcedValue)
                }

                if (facetsMap.size !== 0) state.facets = facetsMap
              }
              if (mode) {
                const deepestEl = findDeepest(`data-force-${island}-mode`)
                if (deepestEl) {
                  const forcedValue = deepestEl.getAttribute(`data-force-${island}-mode`)
                  if (forcedValue) state.mode = forcedValue
                }
              }

              return state
            },
            sanitized: (island: string) => {
              const dirty = DomManager.get.state.forced.island.dirty(island)
              if (!dirty) return undefined

              const sanitized = {} as Brand<State.Static.AsMap.Island, { stage: 'sanitized'; completeness: 'partial' }>

              if (dirty.facets) {
                const sanitizedFacets = new Map() as State.Static.AsMap.Island.Facets['facets']
                for (const [facet, value] of dirty.facets) {
                  const isValid = utils.isValid.value.option.facet(island, facet, value)
                  if (isValid) sanitizedFacets.set(facet, value)
                }
                if (sanitizedFacets.size !== 0) sanitized.facets = sanitizedFacets
              }

              if (dirty.mode) {
                const isValid = utils.isValid.value.option.mode(island, dirty.mode)
                if (isValid) sanitized.mode = dirty.mode
              }

              return sanitized
            },
          },
          all: {
            dirty: () => {
              const state = new Map() as Brand<State.Static.AsMap, { stage: 'dirty'; completeness: 'partial' }>

              for (const island of engine.islands) {
                const islandState = DomManager.get.state.forced.island.dirty(island)!
                if (Object.keys(islandState).length > 0) state.set(island, islandState)
              }

              return state
            },
            sanitized: () => {
              const state = new Map() as Brand<State.Static.AsMap, { stage: 'sanitized'; completeness: 'partial' }>

              for (const island of engine.islands) {
                const islandState = DomManager.get.state.forced.island.sanitized(island)!
                if (Object.keys(islandState).length > 0) state.set(island, islandState)
              }

              return state
            },
          },
        },
      },
    }

    public static set = {
      state: {
        island: (island: string, elements: Set<Element>, state: AtLeast<State.Static.AsMap.Island, { completeness: 'complete'; stage: 'normalized' }>) => {
          for (const element of elements) {
            const elementCurrState = DomManager.get.state.computed.island.dirty(island, element)!

            if (state.facets) {
              for (const [facet, value] of state.facets) {
                const needsUpdate = elementCurrState.facets?.get(facet) !== value
                if (needsUpdate) element.setAttribute(`data-facet-${facet}`, value)
              }
            }
            if (state.mode) {
              const needsUpdate = elementCurrState.mode !== state.mode
              if (needsUpdate) element.setAttribute(`data-mode`, state.mode)

              if (!(element instanceof HTMLElement)) continue

              const stateCS = utils.resolve.colorScheme(island, state.mode)!

              const currCS = element.style.colorScheme
              const needsCsUpdate = currCS !== stateCS
              if (needsCsUpdate) element.style.colorScheme = stateCS

              if (engine.modes.map.get(island)?.selectors.includes('data-attribute')) {
                const currValue = element.getAttribute('data-color-scheme')
                const needsUpdate = currValue !== stateCS
                if (needsUpdate) element.setAttribute('data-color-scheme', stateCS)
              }

              if (engine.modes.map.get(island)?.selectors.includes('class')) {
                const currValue = element.classList.contains(args.constants.modes.light) ? args.constants.modes.light : element.classList.contains(args.constants.modes.dark) ? args.constants.modes.dark : undefined
                const needsUpdate = currValue !== stateCS
                if (needsUpdate) {
                  const other = stateCS === args.constants.modes.light ? args.constants.modes.dark : args.constants.modes.light
                  element.classList.replace(other, stateCS) || element.classList.add(stateCS)
                }
              }
            }
          }
        },
        all: (state: AtLeast<State.Static.AsMap, { completeness: 'complete'; stage: 'normalized' }>) => {
          const enableBackTransitions = engine.disableTransitionOnChange ? utils.miscellaneous.disableTransitions() : undefined
          
          const islands = DomManager.get.islands()
          for (const [island, elements] of islands) {
            const islandState = state.get(island)!
            DomManager.set.state.island(island, new Set(elements), islandState as Brand<State.Static.AsMap.Island, { completeness: 'complete'; stage: 'normalized' }>)
          }

          enableBackTransitions?.()
        },
      },
    }

    public static terminate() {
      DomManager.observer?.disconnect()

      const islands = DomManager.get.islands()
      for (const [island, elements] of islands) {
        for (const element of elements) {
          const { mode, facets } = engine.facets.get(island)!
          if (facets) {
            for (const facet of facets) {
              element.removeAttribute(`data-facet-${facet}`)
            }
          }
          if (mode) {
            element.removeAttribute(`data-mode`)
            if (element instanceof HTMLElement) {
              element.style.colorScheme = ''
              element.removeAttribute('data-color-scheme')
              element.classList.remove(args.constants.modes.light, args.constants.modes.dark)
            }
          }
        }
      }

      DomManager.instance = undefined
    }

    private constructor() {
      EventManager.on('State:Computed:Update', 'DomManager:State:Update', (state) => DomManager.set.state.all(utils.convert.deep.state.objToMap(state) as Brand<State.Static.AsMap, { completeness: 'complete'; stage: 'normalized' }>))

      const handleMutations = (mutations: MutationRecord[]) => {
        for (const { type, oldValue, addedNodes, attributeName, target } of mutations) {
          if (type === 'attributes' && target instanceof HTMLElement && attributeName) {
            if (attributeName === 'data-island') {
              const newIsland = target.getAttribute('data-island')
              const isNewIsland = utils.isValid.value.island(newIsland)

              if (!isNewIsland) {
                const isOldIsland = utils.isValid.value.island(oldValue)
                if (isOldIsland) target.setAttribute('data-island', oldValue!)
              }

              if (isNewIsland) {
                const compState = Main.get.state.computed()
                const currState = new Map([[newIsland, DomManager.get.state.computed.island.normalized(newIsland!, target)!]])

                const newState = utils.merge.deep.state.maps(currState, compState)

                DomManager.set.state.island(newIsland!, new Set([target]), newState.get(newIsland) as Brand<State.Static.AsMap.Island, { completeness: 'complete'; stage: 'normalized' }>)
              }
            }

            if (engine.dataAttributes.force.has(attributeName)) {
              const parts = attributeName.split('-')

              const island = parts[2]!
              const facetType = parts[3]! as Facet
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
            }

            if (engine.dataAttributes.computed.has(attributeName)) {
              const island = target.getAttribute('data-island')
              const isIsland = utils.isValid.value.island(island)

              if (isIsland) {
                const parts = attributeName.split('-')
                const facetType = parts[1] as Facet
                const facet = parts[2]

                const newOption = target.getAttribute(attributeName)

                if (facetType === 'facet') {
                  const isNewOption = utils.isValid.value.option.facet(island, facet!, newOption)

                  const currCompValue = Main.get.state.computed()?.get(island)?.facets?.get(facet!)
                  const isNewCurrCompValue = isNewOption && currCompValue === newOption

                  if (!isNewCurrCompValue) {
                    const isOldOption = utils.isValid.value.option.facet(island, facet!, oldValue)
                    const isOldCurrCompValue = isOldOption && currCompValue === oldValue
                    if (isOldCurrCompValue) target.setAttribute(attributeName, oldValue)
                  }
                }

                if (facetType === 'mode') {
                  const isNewOption = utils.isValid.value.option.mode(island, newOption)

                  const currCompValue = Main.get.state.computed()?.get(island)?.mode
                  const isNewCurrCompValue = isNewOption && currCompValue === newOption

                  if (!isNewCurrCompValue) {
                    const isOldOption = utils.isValid.value.option.mode(island, oldValue)
                    const isOldCurrCompValue = isOldOption && currCompValue === oldValue
                    if (isOldCurrCompValue) target.setAttribute(attributeName, oldValue)
                  }
                }
              }
            }

            if (attributeName === 'style') {
              const island = target.getAttribute('data-island')
              const isIsland = utils.isValid.value.island(island)

              if (isIsland) {
                const mustSetSelector = engine.modes.map.has(island)
                const stateColorScheme = Main.get.colorSchemes.computed()?.get(island)

                const newColorScheme = target.style.colorScheme
                
                const needsUpdate = mustSetSelector && stateColorScheme && newColorScheme !== stateColorScheme
                if (needsUpdate) target.style.colorScheme = stateColorScheme
              }
            }

            if (attributeName === 'data-color-scheme') {
              const island = target.getAttribute('data-island')
              const isIsland = utils.isValid.value.island(island)

              if (isIsland) {
                const mustSetSelector = engine.modes.map.get(island)?.selectors.includes('data-attribute')
                const newColorScheme = target.getAttribute('data-color-scheme')
                const stateColorScheme = Main.get.colorSchemes.computed()?.get(island)

                const needsUpdate = mustSetSelector && stateColorScheme && newColorScheme !== stateColorScheme!
                if (needsUpdate) target.setAttribute('data-color-scheme', stateColorScheme)
              }
            }

            if (attributeName === 'class') {
              const island = target.getAttribute('data-island')
              const isIsland = utils.isValid.value.island(island)

              if (isIsland) {
                const mustSetSelector = engine.modes.map.get(island)?.selectors.includes('class')
                const stateColorScheme = Main.get.colorSchemes.computed()?.get(island)
                const newValue = target.classList.contains(args.constants.modes.light) ? args.constants.modes.light : target.classList.contains(args.constants.modes.dark) ? args.constants.modes.dark : undefined

                const needsUpdate = mustSetSelector && stateColorScheme && stateColorScheme! !== newValue
                if (needsUpdate) {
                  const other = stateColorScheme ?? args.constants.modes.light
                  target.classList.replace(other, stateColorScheme) || target.classList.add(stateColorScheme)
                }
              }
            }
          }

          if (type === 'childList') {
            
            const forcedState = DomManager.get.state.forced.all.sanitized()
            Main.set.state.forced(forcedState)

            const currCompState = Main.get.state.computed()!
            DomManager.set.state.all(currCompState)
          }
        }
      }

      DomManager.observer = new MutationObserver(handleMutations)
      DomManager.observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-island', ...Array.from(engine.dataAttributes.force), ...Array.from(engine.dataAttributes.computed), 'data-color-scheme', 'class', 'style'],
        attributeOldValue: true,
        subtree: true,
        childList: true,
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
        base: (state: AtLeast<State.Static.AsMap, { completeness: 'partial' }>) => {
          const currState = Main.get.state.base()
          if (!currState) return console.error('[T3M4]: Library not initialized')

          const mergedState = utils.merge.deep.state.maps(currState, state) as typeof currState
          Main.smartUpdateNotify.state.base(mergedState)
        },
        forced: (state: AtLeast<State.Static.AsMap, { completeness: 'partial' }>) => {
          Main.smartUpdateNotify.state.forced(state)
        },
      },
    }

    private static notifyUpdate = {
      state: {
        base: (state: AtLeast<State.Static.AsMap, { completeness: 'complete' }>) => {
          const colorSchemes = utils.construct.colorSchemes(state)
          EventManager.emit('State:Base:Update', utils.convert.deep.state.mapToObj(state))
          EventManager.emit('ColorSchemes:Base:Update', utils.convert.shallow.mapToObj.string(colorSchemes) as ColorSchemes.Static)
        },
        forced: (state: AtLeast<State.Static.AsMap, { completeness: 'partial' }>) => {
          const colorSchemes = utils.construct.colorSchemes(state)
          EventManager.emit('State:Forced:Update', utils.convert.deep.state.mapToObj(state))
          EventManager.emit('ColorSchemes:Forced:Update', utils.convert.shallow.mapToObj.string(colorSchemes) as ColorSchemes.Static)
        },
        computed: (state: AtLeast<State.Static.AsMap, { completeness: 'complete' }>) => {
          const colorSchemes = utils.construct.colorSchemes(state)
          EventManager.emit('State:Computed:Update', utils.convert.deep.state.mapToObj(state))
          EventManager.emit('ColorSchemes:Computed:Update', utils.convert.shallow.mapToObj.string(colorSchemes) as ColorSchemes.Static)
        },
      },
    }

    private static smartUpdateNotify = {
      state: {
        base(newState: AtLeast<State.Static.AsMap, { completeness: 'complete'; stage: 'normalized' }>) {
          const currState = Main.get.state.base()
          if (!currState) return console.error('[T3M4] Library not initialized.')

          const isEqual = utils.equal.deep.state(currState, newState)
          if (isEqual) return

          Main.instance.state.base = newState
          Main.notifyUpdate.state.base(newState)

          const computedState = Main.get.state.computed()!
          Main.notifyUpdate.state.computed(computedState)
        },
        forced(newState: AtLeast<State.Static.AsMap, { completeness: 'partial' }>) {
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

    public static reboot() {
      Main.instance = new Main()
    }

    private state: {
      base: AtLeast<State.Static.AsMap, { completeness: 'complete'; stage: 'normalized' }> | undefined
      forced: AtLeast<State.Static.AsMap, { completeness: 'partial' }> | undefined
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

      const forcedState = DomManager.get.state.forced.all.sanitized() as Brand<State.Static.AsMap, { completeness: 'partial'; stage: 'sanitized' }>
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

    public reboot(newArgs: Script_Args) {
      const needsReboot = !utils.equal.deep.generic.objects(args, newArgs)
      if (!needsReboot) return

      EventManager.emit('Reset')

      StorageManager.terminate()
      DomManager.terminate()

      engine = constructEngine(newArgs)

      Main.reboot()
    }

    public constructor() {
      Main.init()
    }
  }

  window.T3M4 = new T3M4()
}
