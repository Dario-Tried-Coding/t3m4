import { CONSTANTS } from './types/constants'
import { Observable } from './types/constants/observables'
import { Selector } from './types/constants/selectors'
import { Store_Strat, Strat, STRATS } from './types/constants/strats'
import { PRESET } from './types/preset'
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
  cleanliness: {
    polished: 'polished'
  }
}
type AtLeast<T, B extends Partial<{ [K in keyof Brand_Map]: keyof Brand_Map[K] }>> = T & { [K in keyof B as `__${Extract<K, string>}`]: K extends keyof Brand_Map ? (B[K] extends keyof Brand_Map[K] ? Brand_Map[K][B[K]] : never) : never }
type Brand<T, B extends Partial<{ [K in keyof Brand_Map]: keyof Brand_Map[K] }>> = T & { [K in keyof B as `__${Extract<K, string>}`]: B[K] }

type Engine = {
  storageKeys: {
    state: string
    modes: string
  }
  islands: Islands.Static.AsSet
  facets: Map<string, Set<string>>
  values: Values.Static.AsMap
  fallbacks: Brand<State.Static.AsMap, { completeness: 'complete'; stage: 'normalized' }>
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
    map: Map<
      string,
      | {
          strategy: Exclude<Strat, STRATS['system']>
          store: boolean
          selectors: Selector[]
          colorSchemes: ColorSchemes.Static.AsMap
        }
      | {
          strategy: Extract<Strat, STRATS['system']>
          store: boolean
          selectors: Selector[]
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
        selectors: [] as Selector[],
        island: {
          selectors: [] as Selector[],
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
      system: 'system'
    }
  } as const satisfies CONSTANTS

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

        return acc
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
              return acc.set(f, stratObj.default)
            },
            new Map() as NonNullable<typeof islandFallbacks.facets>
          )

        if (mode) islandFallbacks.mode = mode.default

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
      map: Object.entries(schema).reduce((acc, [i, { mode, facets }]) => {
        let obj = {} as NonNullable<ReturnType<Engine['modes']['map']['get']>>
        
        const stratObj = args.config[i]!.mode!

        if (stratObj.strategy === CONSTANTS.strats.system) {
          obj = {
            store: stratObj.store ?? PRESET.modes.storage.island.store,
            selectors: stratObj.selectors ?? PRESET.modes.dom.selectors,
            strategy: stratObj.strategy,
            colorSchemes: new Map(),
            system: {
              mode: (mode as Schema.Island.Mode.Facet.System).system!,
              fallback: stratObj.fallback!
            }
          }

          return acc.set(i, obj)
        }
        
        obj = {
          store: stratObj.store ?? PRESET.modes.storage.island.store,
          selectors: stratObj.selectors ?? PRESET.modes.dom.selectors,
          strategy: stratObj.strategy,
          colorSchemes: new Map()
        } as NonNullable<ReturnType<Engine['modes']['map']['get']>>

        return acc.set(i, obj)
      }, new Map() as Engine['modes']['map']),
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
      modes
    }
  }
}
