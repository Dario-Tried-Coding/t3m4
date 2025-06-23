import { COLOR_SCHEME, FACET_TYPE, MODES } from './constants'
import { Engine } from './engine'
import { EventManager } from './event-manager'
import { Main } from './main'
import { AtLeast, Brand } from './types/brand'
import { State } from './types/subscribers/state'

export class DomManager {
  private static instance: DomManager | undefined
  private static abortController: AbortController | undefined
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
        const elements = document.querySelectorAll(`[${Engine.getInstance().selectors.types.dataAttributes.island}=${island}]`)
        if (elements.length === 0) return undefined
        return new Set(elements)
      },
      all() {
        const elements = Array.from(Engine.getInstance().islands).reduce(
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
            const isIsland = Engine.utils.isValid.value.island(island)
            if (!isIsland) return undefined

            const { mode, facets } = Engine.getInstance().facets.get(island)!

            const state = {} as State.Static.AsMap.Island
            if (facets && facets.size > 0) {
              const facetsMap = Array.from(facets).reduce(
                (acc, facet) => {
                  const facetValue = el.getAttribute(Engine.getInstance().selectors.types.dataAttributes.computed.facet(facet))
                  if (!facetValue) return acc

                  return acc.set(facet, facetValue)
                },
                new Map() as State.Static.AsMap.Island.Facets['facets']
              )
              state.facets = facetsMap
            }
            if (mode) {
              const modeValue = el.getAttribute(Engine.getInstance().selectors.types.dataAttributes.computed.mode)
              if (modeValue) state.mode = modeValue
            }

            return state as Brand<typeof state, { validation: 'dirty' }>
          },
          sanitized(island: string, el: Element, backup?: State.Static.AsMap.Island) {
            const dirty = DomManager.get.state.computed.island.dirty(island, el)
            if (!dirty) return undefined

            const sanitized = Engine.utils.sanitize.state.island(island, dirty, backup)
            return sanitized as Brand<State.Static.AsMap.Island, { validation: 'sanitized' }>
          },
          normalized: (island: string, el: Element, backup?: State.Static.AsMap.Island) => {
            const sanitized = DomManager.get.state.computed.island.sanitized(island, el, backup)
            if (!sanitized) return undefined

            const normalized = Engine.utils.normalize.state.island(island, sanitized, backup)
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
            const isIsland = Engine.utils.isValid.value.island(island)
            if (!isIsland) return undefined

            if (!Engine.getInstance().forcedValues) return {} as Brand<State.Static.AsMap.Island, { validation: 'dirty' }>

            const { mode, facets } = Engine.getInstance().facets.get(island)!

            const state = {} as State.Static.AsMap.Island

            if (facets)
              state.facets = Array.from(facets).reduce(
                (facets, facet) => {
                  const deepestEl = DomManager.findDeepest(Engine.getInstance().selectors.types.dataAttributes.forced.facet(island, facet))
                  if (!deepestEl) return facets

                  const forcedValue = deepestEl.getAttribute(Engine.getInstance().selectors.types.dataAttributes.forced.facet(island, facet))
                  if (!forcedValue) return facets

                  return facets.set(facet, forcedValue)
                },
                new Map() as State.Static.AsMap.Island.Facets['facets']
              )

            if (mode) {
              const deepestEl = DomManager.findDeepest(Engine.getInstance().selectors.types.dataAttributes.forced.mode(island))
              if (deepestEl) {
                const forcedValue = deepestEl.getAttribute(Engine.getInstance().selectors.types.dataAttributes.forced.mode(island))
                if (forcedValue) state.mode = forcedValue
              }
            }

            return state as Brand<typeof state, { validation: 'dirty' }>
          },
          sanitized: (island: Brand<string, { type: 'island' }>) => {
            const dirty = DomManager.get.state.forced.island.dirty(island)
            if (!dirty) return undefined

            if (!Engine.getInstance().forcedValues) return {} as Brand<State.Static.AsMap.Island, { validation: 'sanitized' }>

            const sanitized = {} as State.Static.AsMap.Island

            if (dirty.facets && dirty.facets.size > 0)
              sanitized.facets = Array.from(dirty.facets).reduce(
                (facets, [facet, value]) => {
                  const isValid = Engine.utils.isValid.value.option.facet(island, facet, value)
                  if (!isValid) return facets

                  return facets.set(facet, value)
                },
                new Map() as State.Static.AsMap.Island.Facets['facets']
              )

            if (dirty.mode) {
              const isValid = Engine.utils.isValid.value.option.mode(island, dirty.mode)
              if (isValid) sanitized.mode = dirty.mode
            }

            return sanitized as Brand<typeof sanitized, { validation: 'sanitized' }>
          },
        },
        all: {
          dirty: () => {
            if (!Engine.getInstance().forcedValues) return new Map() as Brand<State.Static.AsMap, { validation: 'dirty' }>

            const state = Array.from(Engine.getInstance().islands).reduce((state, island) => {
              const islandState = DomManager.get.state.forced.island.dirty(island)
              if (islandState && Object.keys(islandState).length > 0) return state.set(island, islandState)
              return state
            }, new Map() as State.Static.AsMap)
            return state as Brand<State.Static.AsMap, { validation: 'dirty' }>
          },
          sanitized: () => {
            if (!Engine.getInstance().forcedValues) return new Map() as Brand<State.Static.AsMap, { validation: 'sanitized'; coverage: 'partial' }>

            const state = Array.from(Engine.getInstance().islands).reduce((state, island) => {
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
    if (Engine.getInstance().nonce) css.setAttribute('nonce', Engine.getInstance().nonce)
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
        island: (island: string, state: AtLeast<State.Static.AsMap.Island, { validation: 'normalized'; coverage: 'complete' }>, opts?: { elements?: Set<Element> }) => {
          const enableBackTransitions = Engine.getInstance().disableTransitionOnChange && Main.isUserMutation ? DomManager.disableTransitions() : undefined

          const els = opts?.elements ?? new Set(DomManager.get.islands.byIsland(island))

          els.forEach((el) => {
            const elCurrState = DomManager.get.state.computed.island.dirty(island, el)

            if (state.facets)
              state.facets.forEach((value, facet) => {
                const needsUpdate = (elCurrState?.facets?.get(facet) as string) !== (value as string)
                if (needsUpdate) el.setAttribute(Engine.getInstance().selectors.types.dataAttributes.computed.facet(facet), value)
              })

            if (state.mode) {
              const needsUpdate = (elCurrState?.mode as string) !== (state.mode as string)
              if (needsUpdate) el.setAttribute(Engine.getInstance().selectors.types.dataAttributes.computed.mode, state.mode)

              const colorScheme = Engine.utils.resolve.colorScheme(island, state.mode)!
              DomManager.set.mode.all(island, colorScheme, { els: new Set([el]) })
            }
          })

          enableBackTransitions?.()
        },
        all: (state: AtLeast<State.Static.AsMap, { validation: 'normalized'; coverage: 'complete' }>, opts?: { elements?: Map<string, Set<Element>> }) => {
          const els = opts?.elements ?? DomManager.get.islands.all()
          els.forEach((islandEls, island) => {
            const islandState = state.get(island)!
            DomManager.set.state.computed.island(island, islandState, { elements: islandEls })
          })
        },
      },
    },
    mode: {
      dataAttribute: (island: string, value: COLOR_SCHEME, opts?: { els?: Set<Element> }) => {
        if (!Engine.getInstance().modes.get(island)?.selectors.has('data-attribute')) return

        const els = opts?.els ?? DomManager.get.islands.byIsland(island)
        els?.forEach((el) => {
          if (!(el instanceof HTMLElement)) return

          const currValue = el.getAttribute(Engine.getInstance().selectors.types.dataAttributes.colorScheme)

          const needsUpdate = currValue !== value
          if (needsUpdate) el.setAttribute(Engine.getInstance().selectors.types.dataAttributes.colorScheme, value)
        })
      },
      colorScheme: (island: string, value: COLOR_SCHEME, opts?: { els?: Set<Element> }) => {
        if (!Engine.getInstance().modes.get(island)?.selectors.has('color-scheme')) return

        const els = opts?.els ?? DomManager.get.islands.byIsland(island)
        els?.forEach((el) => {
          if (!(el instanceof HTMLElement)) return

          const currValue = el.style.colorScheme

          const needsUpdate = currValue !== value
          if (needsUpdate) el.style.colorScheme = value
        })
      },
      class: (island: string, value: COLOR_SCHEME, opts?: { els?: Set<Element> }) => {
        if (!Engine.getInstance().modes.get(island)?.selectors.has('class')) return

        const els = opts?.els ?? DomManager.get.islands.byIsland(island)
        els?.forEach((el) => {
          if (!(el instanceof HTMLElement)) return

          const currValue = el.classList.contains(MODES.light) ? MODES.light : el.classList.contains(MODES.dark) ? MODES.dark : undefined
          const needsUpdate = currValue !== value
          if (needsUpdate) {
            const other = value === MODES.light ? MODES.dark : MODES.light
            el.classList.replace(other, value) || el.classList.add(value)
          }
        })
      },
      all: (island: string, value: COLOR_SCHEME, opts?: { els?: Set<Element> }) => {
        if (Engine.getInstance().modes.get(island)?.selectors.has('data-attribute')) DomManager.set.mode.dataAttribute(island, value, opts)
        if (Engine.getInstance().modes.get(island)?.selectors.has('color-scheme')) DomManager.set.mode.colorScheme(island, value, opts)
        if (Engine.getInstance().modes.get(island)?.selectors.has('class')) DomManager.set.mode.class(island, value, opts)
      },
    },
  }

  private static terminate() {
    DomManager.observer?.disconnect()

    const islands = DomManager.get.islands.all()
    for (const [island, elements] of islands) {
      for (const element of elements) {
        const { mode, facets } = Engine.getInstance().facets.get(island)!
        if (facets) {
          for (const facet of facets) {
            element.removeAttribute(Engine.getInstance().selectors.types.dataAttributes.computed.facet(facet))
          }
        }
        if (mode) {
          element.removeAttribute(Engine.getInstance().selectors.types.dataAttributes.computed.mode)
          if (element instanceof HTMLElement) {
            element.style.colorScheme = ''
            element.removeAttribute(Engine.getInstance().selectors.types.dataAttributes.colorScheme)
            element.classList.remove(MODES.light, MODES.dark)
          }
        }
      }
    }

    DomManager.instance = undefined
  }

  private static constructAttributeFilters() {
    return [
      Engine.getInstance().selectors.observe.dataAttributes.island,
      ...Array.from(Engine.getInstance().selectors.observe.dataAttributes.computed),
      ...Engine.getInstance().selectors.observe.dataAttributes.forced,
      Engine.getInstance().selectors.observe.dataAttributes.colorScheme,
      Engine.getInstance().selectors.observe.class,
      Engine.getInstance().selectors.observe.colorScheme,
    ]
  }

  private constructor() {
    EventManager.on('Reset', 'DomManager:Reset', () => DomManager.terminate())
    EventManager.on('State:Computed:Update', 'DomManager:State:Update', ({ state }) =>
      DomManager.set.state.computed.all(Engine.utils.convert.deep.state.objToMap(state) as Brand<State.Static.AsMap, { coverage: 'complete'; validation: 'normalized' }>)
    )

    const handleMutations = (mutations: MutationRecord[]) => {
      if (DomManager.isPerfomingMutation) return

      for (const { type, oldValue, attributeName, target } of mutations) {
        if (type === 'attributes' && target instanceof HTMLElement && attributeName && Engine.getInstance().observe.has('DOM')) {
          if (attributeName === Engine.getInstance().selectors.types.dataAttributes.island) {
            const newIsland = target.getAttribute(Engine.getInstance().selectors.types.dataAttributes.island)
            const isIsland = Engine.utils.isValid.value.island(newIsland)

            if (!isIsland) {
              const isOldIsland = Engine.utils.isValid.value.island(oldValue)
              if (isOldIsland) target.setAttribute(Engine.getInstance().selectors.types.dataAttributes.island, oldValue!)
            }

            if (isIsland) {
              const compState = Main.get.state.computed()?.get(newIsland)!
              const currState = DomManager.get.state.computed.island.normalized(newIsland!, target)

              const newIslandState = Engine.utils.merge.deep.state.maps.island(currState, compState)

              DomManager.set.state.computed.island(newIsland!, newIslandState)
            }
            continue
          }

          if (Engine.getInstance().selectors.observe.dataAttributes.forced.has(attributeName)) {
            if (!Engine.getInstance().forcedValues) continue

            const parts = attributeName.split('-')

            const island = parts[2]!
            const facetType = parts[3]! as FACET_TYPE
            const facet = parts[4]

            const newOption = target.getAttribute(attributeName)

            if (facetType === 'facet') {
              const isNewOption = newOption ? Engine.utils.isValid.value.option.facet(island, facet!, newOption) : false

              if (!isNewOption) {
                const isOldOption = oldValue ? Engine.utils.isValid.value.option.facet(island, facet!, oldValue) : false
                if (isOldOption) target.setAttribute(attributeName, oldValue!)
              }
            }

            if (facetType === 'mode') {
              const isNewOption = newOption ? Engine.utils.isValid.value.option.mode(island, newOption) : false

              if (!isNewOption) {
                const isOldOption = oldValue ? Engine.utils.isValid.value.option.mode(island, oldValue) : false
                if (isOldOption) target.setAttribute(attributeName, oldValue!)
              }
            }

            const newForcedState = DomManager.get.state.forced.all.sanitized()
            Main.set.state.forced(newForcedState)
            continue
          }

          if (Engine.getInstance().selectors.observe.dataAttributes.computed.has(attributeName)) {
            const island = target.getAttribute(Engine.getInstance().selectors.types.dataAttributes.island)

            const isIsland = Engine.utils.isValid.value.island(island)
            if (!isIsland) continue

            const parts = attributeName.split('-')
            const facetType = parts[1] as FACET_TYPE
            const facet = parts[2]

            const newOption = target.getAttribute(attributeName)

            if (facetType === 'facet' && facet) {
              const revertToComputed = (oldValue: string | null) => {
                const currCompValue = Main.get.state.computed()?.get(island)?.facets?.get(facet)!
                const isOldOption = Engine.utils.isValid.value.option.facet(island, facet, oldValue)

                const isOldCurrCompValue = isOldOption && (currCompValue as string) === oldValue
                if (isOldCurrCompValue) target.setAttribute(attributeName, oldValue!)
                else target.setAttribute(attributeName, currCompValue)
              }

              const isNewOption = Engine.utils.isValid.value.option.facet(island, facet, newOption)
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

              const newStatePartial = Engine.utils.construct.state.fromFacet(island, facet, newOption)
              Main.set.state.base(newStatePartial)
              continue
            }

            if (facetType === 'mode') {
              const revertToComputed = (oldValue: string | null) => {
                const currCompValue = Main.get.state.computed()?.get(island)?.mode!
                const isOldOption = Engine.utils.isValid.value.option.mode(island, oldValue)

                const isOldCurrCompValue = isOldOption && currCompValue === oldValue
                if (isOldCurrCompValue) target.setAttribute(attributeName, oldValue!)
                else target.setAttribute(attributeName, currCompValue)
              }

              const isNewOption = Engine.utils.isValid.value.option.mode(island, newOption)
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

              const newStatePartial = Engine.utils.construct.state.fromMode(island, newOption as Brand<string, { validation: 'sanitized' }>)

              Main.set.state.base(newStatePartial)
              continue
            }
          }

          if (attributeName === Engine.getInstance().selectors.observe.colorScheme) {
            const island = target.getAttribute(Engine.getInstance().selectors.types.dataAttributes.island)

            const isIsland = Engine.utils.isValid.value.island(island)
            if (!isIsland) continue

            const isSelectorEnabled = Engine.getInstance().modes.get(island)?.selectors.has('color-scheme')
            if (!isSelectorEnabled) continue

            const supportedColorSchemes = new Set(Engine.getInstance().modes.get(island)?.colorSchemes.values() ?? [])

            const revertToComputed = (oldValue: string | null) => {
              const currCompValue = Main.get.colorSchemes.computed()?.get(island)!
              const isOldColorScheme = supportedColorSchemes.has(oldValue as COLOR_SCHEME)

              const isOldCurrCompColorScheme = isOldColorScheme && currCompValue === oldValue
              if (isOldCurrCompColorScheme) target.style.colorScheme = oldValue!
              else target.style.colorScheme = currCompValue
            }

            const newColorScheme = target.style.colorScheme
            const isNewColorScheme = supportedColorSchemes.has(newColorScheme as COLOR_SCHEME)
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

            const isSystemStrat = Engine.getInstance().modes.get(island)!.strategy === 'system'
            if (!isSystemStrat) {
              revertToComputed(oldValue)
              continue
            }

            const traceBackMode = (colorScheme: COLOR_SCHEME) => {
              for (const [mode, cs] of Engine.getInstance().modes.get(island)!.colorSchemes) {
                if (cs === colorScheme) return mode
              }
            }
            const corrMode = traceBackMode(newColorScheme as COLOR_SCHEME)!

            const currBaseMode = Main.get.state.base()?.get(island)?.mode!

            const isCurrBaseModeSystem = Engine.getInstance().modes.get(island)?.system?.mode === currBaseMode
            if (isCurrBaseModeSystem) {
              const isNewPrefColorScheme = newColorScheme === Engine.utils.miscellaneous.getSystemPref()
              if (isNewPrefColorScheme) continue
            }

            const isNewAlreadySet = currBaseMode === corrMode
            if (isNewAlreadySet) continue

            const newStatePartial = Engine.utils.construct.state.fromMode(island, corrMode as Brand<string, { validation: 'sanitized' }>)
            Main.set.state.base(newStatePartial)
            continue
          }

          if (attributeName === Engine.getInstance().selectors.observe.dataAttributes.colorScheme) {
            const island = target.getAttribute(Engine.getInstance().selectors.types.dataAttributes.island)

            const isIsland = Engine.utils.isValid.value.island(island)
            if (!isIsland) continue

            const isSelectorEnabled = Engine.getInstance().modes.get(island)?.selectors.has('data-attribute')
            if (!isSelectorEnabled) continue

            const supportedColorSchemes = new Set(Engine.getInstance().modes.get(island)?.colorSchemes.values() ?? [])

            const revertToComputed = (oldValue: string | null) => {
              const currCompValue = Main.get.colorSchemes.computed()?.get(island)!
              const isOldColorScheme = supportedColorSchemes.has(oldValue as COLOR_SCHEME)

              const isOldCurrCompColorScheme = isOldColorScheme && currCompValue === oldValue
              if (isOldCurrCompColorScheme) target.setAttribute(Engine.getInstance().selectors.types.dataAttributes.colorScheme, oldValue!)
              else target.setAttribute(Engine.getInstance().selectors.types.dataAttributes.colorScheme, currCompValue)
            }

            const newColorScheme = target.getAttribute(Engine.getInstance().selectors.types.dataAttributes.colorScheme)
            const isNewColorScheme = supportedColorSchemes.has(newColorScheme as COLOR_SCHEME)
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

            const isSystemStrat = Engine.getInstance().modes.get(island)!.strategy === 'system'
            if (!isSystemStrat) {
              revertToComputed(oldValue)
              continue
            }

            const traceBackMode = (colorScheme: COLOR_SCHEME) => {
              for (const [mode, cs] of Engine.getInstance().modes.get(island)!.colorSchemes) {
                if (cs === colorScheme) return mode
              }
            }
            const corrMode = traceBackMode(newColorScheme as COLOR_SCHEME)!

            const currBaseMode = Main.get.state.base()?.get(island)?.mode!

            const isCurrBaseModeSystem = Engine.getInstance().modes.get(island)?.system?.mode === currBaseMode
            if (isCurrBaseModeSystem) {
              const isNewPrefColorScheme = newColorScheme === Engine.utils.miscellaneous.getSystemPref()
              if (isNewPrefColorScheme) continue
            }

            const isNewAlreadySet = currBaseMode === corrMode
            if (isNewAlreadySet) continue

            const newStatePartial = Engine.utils.construct.state.fromMode(island, corrMode as Brand<string, { validation: 'sanitized' }>)

            Main.set.state.base(newStatePartial)
            continue
          }

          if (attributeName === Engine.getInstance().selectors.observe.class) {
            const island = target.getAttribute(Engine.getInstance().selectors.types.dataAttributes.island)
            const isIsland = Engine.utils.isValid.value.island(island)

            if (!isIsland) continue

            const isSelectorEnabled = Engine.getInstance().modes.get(island)?.selectors.has('class')
            if (!isSelectorEnabled) continue

            const supportedColorSchemes = new Set(Engine.getInstance().modes.get(island)?.colorSchemes.values() ?? [])

            const revertToComputed = () => {
              const currCompColorScheme = Main.get.colorSchemes.computed()?.get(island)!

              const currColorScheme = target.classList.contains(MODES.light) ? MODES.light : target.classList.contains(MODES.dark) ? MODES.dark : undefined
              const from = currColorScheme ?? MODES.light

              target.classList.replace(from, currCompColorScheme) || target.classList.add(currCompColorScheme)
            }

            const newColorScheme = target.classList.contains(MODES.light) ? MODES.light : target.classList.contains(MODES.dark) ? MODES.dark : undefined
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

            const isSystemStrat = Engine.getInstance().modes.get(island)!.strategy === 'system'
            if (!isSystemStrat) {
              revertToComputed()
              continue
            }

            const traceBackMode = (colorScheme: COLOR_SCHEME) => {
              for (const [mode, cs] of Engine.getInstance().modes.get(island)!.colorSchemes) {
                if (cs === colorScheme) return mode
              }
            }
            const corrMode = traceBackMode(newColorScheme!)!

            const currBaseMode = Main.get.state.base()?.get(island)?.mode!

            const isCurrBaseModeSystem = Engine.getInstance().modes.get(island)?.system?.mode === currBaseMode
            if (isCurrBaseModeSystem) {
              const isNewPrefColorScheme = newColorScheme === Engine.utils.miscellaneous.getSystemPref()
              if (isNewPrefColorScheme) continue
            }

            const isNewAlreadySet = currBaseMode === corrMode
            if (isNewAlreadySet) continue

            const newStatePartial = Engine.utils.construct.state.fromMode(island, corrMode as Brand<string, { validation: 'sanitized' }>)

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
    DomManager.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: DomManager.constructAttributeFilters(),
      attributeOldValue: true,
      subtree: true,
      childList: true,
    })

    DomManager.abortController = new AbortController()
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addListener((e) => {
      if (DomManager.isPerfomingMutation) return

      const currState = Main.get.state.base()
      if (!currState) return

      const currModes = Engine.utils.construct.modes(currState)
      currModes?.forEach((mode, island) => {
        const isSystemStrat = Engine.getInstance().modes.get(island)?.strategy === 'system'
        const isSystemMode = mode === Engine.getInstance().modes.get(island)?.system?.mode
        
        if (isSystemStrat && isSystemMode) {
          const fallbackMode = Engine.getInstance().modes.get(island)?.system?.fallback!
          const fallbackColoScheme = Engine.utils.resolve.colorScheme(island, fallbackMode)!

          const colorScheme = Engine.utils.miscellaneous.getSystemPref()
          DomManager.set.mode.all(island, colorScheme ?? fallbackColoScheme)
        }
      })
    })
  }
}
