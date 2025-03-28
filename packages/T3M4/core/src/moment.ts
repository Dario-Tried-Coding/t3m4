import { Nullable, NullOr, UndefinedOr } from '@t3m4/utils/nullables'
import { ScriptArgs } from './types'
import { CONFIG } from './types/config'
import { ImplicitProp, LightDarkOption, MonoOption, MultiOption, Prop, SystemOption, SystemValues } from './types/config/props'
import { CONSTANTS, OBSERVABLE, RESOLVED_MODE, STRAT } from './types/constants'
import { STRATS } from './types/constants/strats'
import { CallbackID, EventMap } from './types/events'
import { Mapped_Options as Options } from './types/subscribers/options'
import { Unsafe_State as State } from './types/subscribers/state'
import { ModeProp } from './types/subscribers/config/mode'

type Mode = {
  prop: string
  strategy: STRAT
  resolvedModes: Map<string, RESOLVED_MODE>
  system: UndefinedOr<{ mode: string; fallback: string }>
} & Required<ScriptArgs['mode']>

export function script(args: ScriptArgs) {
  // #region CONSTANTS
  const { DEFAULT, MODES, PROP_TYPES, STRATS, OBSERVABLES, SELECTORS } = {
    DEFAULT: 'default',
    STRATS: {
      MONO: 'mono',
      MULTI: 'multi',
      LIGHT_DARK: 'light&dark',
      SYSTEM: 'system',
    },
    MODES: {
      LIGHT: 'light',
      DARK: 'dark',
      SYSTEM: 'system',
    },
    PROP_TYPES: {
      GENERIC: 'generic',
      MODE: 'mode',
    },
    OBSERVABLES: {
      DOM: 'DOM',
      STORAGE: 'storage',
    },
    SELECTORS: {
      CLASS: 'class',
      COLOR_SCHEME: 'color-scheme',
      DATA_ATTRIBUTE: 'data-attribute',
    },
  } as const satisfies CONSTANTS

  // #region CONFIG
  const CONFIG = {
    storageKey: 'T3M4',
    mode: {
      storageKey: 'theme',
      store: false,
      selector: [],
    },
    observe: [],
    nonce: '',
    disableTransitionOnChange: false,
  } as const satisfies CONFIG

  // #region UTILS
  class Utils {
    private constructor() {}

    public static merge<T extends NullOr<State>[]>(...maps: T): T[number] extends null ? null : State {
      const merged = maps.reduce((acc, map) => {
        if (!map) return acc
        return new Map([...(acc ?? []), ...map])
      }, new Map() as State)

      return merged as T[number] extends null ? null : State
    }

    public static mapToJSON(map: State) {
      return JSON.stringify(Object.fromEntries(map))
    }

    public static jsonToMap(json: NullOr<string>): State {
      if (!json?.trim()) return new Map()
      try {
        const parsed = JSON.parse(json)
        if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') return new Map()
        return new Map(Object.entries(parsed).filter(([key, value]) => typeof key === 'string' && typeof value === 'string') as [string, string][])
      } catch {
        return new Map()
      }
    }

    public static deepEqualObjects<T>(obj1: T, obj2: T): boolean {
      if (obj1 === obj2) {
        return true
      }

      if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
        return false
      }

      const keys1 = Object.keys(obj1) as (keyof T)[]
      const keys2 = Object.keys(obj2) as (keyof T)[]

      if (keys1.length !== keys2.length) {
        return false
      }

      for (const key of keys1) {
        if (!keys2.includes(key) || !Utils.deepEqualObjects(obj1[key], obj2[key])) {
          return false
        }
      }

      return true
    }

    public static deepEqualMaps<K, V>(map1: NullOr<Map<K, V>>, map2: NullOr<Map<K, V>>): boolean {
      if (!map1 || !map2) return false
      if (map1 === map2) return true
      if (map1.size !== map2.size) return false

      for (const [key, value] of map1) {
        if (!map2.has(key) || !Utils.deepEqualObjects(value, map2.get(key))) return false
      }

      return true
    }
  }

  // #region NORMALIZER
  class Normalizer {
    private values: State = new Map()

    private constructor() {}

    // Factory methods
    static ofJSON(json: NullOr<string>) {
      return Normalizer.of(Utils.jsonToMap(json))
    }

    static ofMap(values: State) {
      return Normalizer.of(values)
    }

    private static of(values: State) {
      const normalizer = new Normalizer()
      normalizer.values = values
      return normalizer
    }

    // Utility methods
    private static isHandled(prop: string) {
      return Processor.options.has(prop)
    }

    private static isAllowed(prop: string, value: Nullable<string>) {
      return !!value && Normalizer.isHandled(prop) && Processor.options.get(prop)!.options.has(value)
    }

    // Normalize one prop's value
    static normalize(prop: string, value: NullOr<string>, fallback?: NullOr<string>): { handled: false; passed: false; value: undefined } | { handled: true; passed: boolean; value: string } {
      const isHandled = Normalizer.isHandled(prop)
      if (!isHandled) return { handled: false, passed: false, value: undefined }

      const isAllowed = Normalizer.isAllowed(prop, value)
      const isAllowedFallback = Normalizer.isAllowed(prop, fallback)
      const preferred = Processor.options.get(prop)!.preferred

      const finalValue = isAllowed ? value! : isAllowedFallback ? fallback! : preferred

      return { handled: true, passed: isAllowed, value: finalValue }
    }

    // Normalize an entire map of values
    normalize(provFallbacks?: Nullable<string | State>): { passed: boolean; values: State; results: Map<string, { passed: boolean; value: string }> } {
      const results: Map<string, { passed: boolean; value: string; reason?: string }> = new Map()
      const normValues: State = new Map()

      const fallbacks = typeof provFallbacks === 'string' ? Utils.jsonToMap(provFallbacks) : provFallbacks

      for (const [prop, { preferred }] of Processor.options.entries()) {
        results.set(prop, { passed: false, value: preferred })
        normValues.set(prop, preferred)
      }

      for (const [prop, fallback] of fallbacks?.entries() ?? []) {
        const { handled, value } = Normalizer.normalize(prop, fallback)
        if (handled) {
          results.set(prop, { passed: false, value })
          normValues.set(prop, value)
        }
      }

      for (const [prop, value] of this.values.entries()) {
        const { handled, passed, value: normValue } = Normalizer.normalize(prop, value, fallbacks?.get(prop))
        if (handled) {
          results.set(prop, { passed, value: normValue })
          normValues.set(prop, normValue)
        }
      }

      const isFullyValid = Array.from(results.values()).every(({ passed }) => passed)

      return {
        passed: isFullyValid,
        values: normValues,
        results,
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

  // #region MAIN
  class Processor {
    private static instance: UndefinedOr<Processor> = undefined
    private static _args: ScriptArgs = args

    private static isProp<Strat extends STRAT>(
      prop: Prop,
      strat: Strat
    ): prop is Strat extends STRATS['MONO']
      ? ImplicitProp | { prop: string; options: MonoOption }
      : Strat extends STRATS['MULTI']
        ? { prop: string; options: MultiOption }
        : Strat extends STRATS['LIGHT_DARK']
          ? ImplicitProp | { prop: string; options: LightDarkOption }
          : Strat extends STRATS['SYSTEM']
            ? ImplicitProp | { prop: string; options: SystemOption }
            : never {
      if (typeof prop === 'string') return strat !== STRATS.MULTI
      if (typeof prop === 'object') {
        if (typeof prop.options === 'string') return strat === STRATS.MONO
        if (Array.isArray(prop.options)) return strat === STRATS.MULTI
        if (typeof prop.options === 'object') {
          if (MODES.SYSTEM in prop.options) return strat === STRATS.SYSTEM
          return strat === STRATS.LIGHT_DARK || strat === STRATS.SYSTEM
        }
      }
      return false
    }

    public static needsReboot(args: ScriptArgs) {
      if (Utils.deepEqualObjects(args, Processor._args)) return

      return () => {
        Processor._args = args
        Processor.instance = new Processor()
      }
    }

    public static getInstance() {
      if (!Processor.instance) Processor.instance = new Processor()
      return Processor.instance
    }

    public static get target() {
      return Processor.getInstance()._target
    }

    public static get storageKey() {
      return Processor.getInstance()._storageKey
    }

    public static get options() {
      return Processor.getInstance()._options
    }

    public static get mode() {
      return Processor.getInstance()._mode
    }

    public static get observe() {
      return Processor.getInstance()._observe
    }

    public static get nonce() {
      return Processor.getInstance()._nonce
    }

    public static get disableTransitionOnChange() {
      return Processor.getInstance()._disableTransitionOnChange
    }

    private _target: HTMLElement
    private _storageKey: string
    private _options: Options = this.processOptions(Processor._args)
    private _mode: UndefinedOr<Mode> = this.processMode(Processor._args)
    private _observe: OBSERVABLE[]
    private _nonce: string
    private _disableTransitionOnChange: boolean

    private constructor() {
      this._target = document.getElementById(Processor._args.target ?? '') ?? document.documentElement
      this._storageKey = Processor._args.storageKey ?? CONFIG.storageKey
      this._observe = Processor._args.observe ?? CONFIG.observe
      this._nonce = Processor._args.nonce ?? CONFIG.nonce
      this._disableTransitionOnChange = Processor._args.disableTransitionOnChange ?? CONFIG.disableTransitionOnChange
    }

    private processOptions(args: ScriptArgs) {
      const options: Options = new Map()

      for (const [prop, stratObj] of Object.entries(args.config)) {
        const propsItem = args.props.find((i) => (typeof i === 'string' ? prop === i : prop === i.prop))
        if (!propsItem) continue

        // prettier-ignore
        switch (stratObj.strategy) {
          case STRATS.MONO: {
              if (!Processor.isProp(propsItem, STRATS.MONO)) break

              const propOptions = new Set(typeof propsItem === 'string' ? [DEFAULT] : [propsItem.options as string])
              options.set(prop, { preferred: stratObj.preferred, options: propOptions })
            }; break
          case STRATS.MULTI: {
              if (!Processor.isProp(propsItem, STRATS.MULTI)) break

              const propOptions = new Set(propsItem.options)
              options.set(prop, { preferred: stratObj.preferred, options: propOptions })
            }; break
          case STRATS.LIGHT_DARK: {
              if (!Processor.isProp(propsItem, STRATS.LIGHT_DARK)) break

              const propOptions = new Set([
                ...(typeof propsItem === 'string' ? [MODES.LIGHT] : [(propsItem.options as SystemValues).light ?? MODES.LIGHT]),
                ...(typeof propsItem === 'string' ? [MODES.DARK] : [(propsItem.options as SystemValues).dark ?? MODES.DARK]),
                ...(typeof propsItem !== 'string' ? ((propsItem.options as SystemValues).custom ?? []) : []),
              ])

              options.set(prop, { preferred: stratObj.preferred, options: propOptions })
            }; break
          case STRATS.SYSTEM: {
              if (!Processor.isProp(propsItem, STRATS.SYSTEM)) break

              const propOptions = new Set([
                ...(typeof propsItem === 'string' ? [MODES.LIGHT] : [(propsItem.options as SystemValues).light ?? MODES.LIGHT]),
                ...(typeof propsItem === 'string' ? [MODES.DARK] : [(propsItem.options as SystemValues).dark ?? MODES.DARK]),
                ...(typeof propsItem === 'string' ? [MODES.SYSTEM] : [(propsItem.options as SystemValues).system ?? MODES.SYSTEM]),
                ...(typeof propsItem !== 'string' ? ((propsItem.options as SystemValues).custom ?? []) : []),
              ])

              options.set(prop, { preferred: stratObj.preferred, options: propOptions })
            }; break
        }
      }

      return options
    }

    private processMode(args: ScriptArgs) {
      const [modeProp, stratObj] = (Object.entries(args.config).find(([, { type }]) => type === PROP_TYPES.MODE) ?? []) as [string?, ModeProp?]
      if (!modeProp || !stratObj) return

      // Corresponding mode prop from "props" array
      const propsItem = args.props.find((i) => (typeof i === 'string' ? i === modeProp : i.prop === modeProp))
      if (!propsItem) return

      const resolvedModes: NonNullable<Processor['_mode']>['resolvedModes'] = new Map()
      // prettier-ignore
      switch (stratObj.strategy) {
        case STRATS.MONO: {
          if (!Processor.isProp(propsItem, STRATS.MONO)) break;

          const mode = typeof propsItem === 'string' ? DEFAULT : propsItem?.options
          resolvedModes.set(mode, stratObj.colorScheme)
        }; break
        case STRATS.MULTI: {
          Object.entries(stratObj.colorSchemes).forEach(([key, colorScheme]) => {
            resolvedModes.set(key, colorScheme)
          })
        }; break
        case STRATS.LIGHT_DARK:
        case STRATS.SYSTEM: {
          if (!Processor.isProp(propsItem, STRATS.LIGHT_DARK) && !Processor.isProp(propsItem, STRATS.SYSTEM)) break;

          resolvedModes.set(typeof propsItem === 'object' ? propsItem.options.light ?? MODES.LIGHT : MODES.LIGHT, MODES.LIGHT)
          resolvedModes.set(typeof propsItem === 'object' ? propsItem.options.dark ?? MODES.DARK : MODES.DARK, MODES.DARK)
          if (stratObj.colorSchemes) Object.entries(stratObj.colorSchemes).forEach(([key, colorScheme]) => resolvedModes.set(key, colorScheme))
        }; break
        default: break
      }

      const systemMode = Processor.isProp(propsItem, STRATS.SYSTEM) ? (typeof propsItem !== 'string' ? (propsItem.options.system ?? MODES.SYSTEM) : STRATS.SYSTEM) : undefined

      return {
        prop: modeProp,
        strategy: stratObj.strategy,
        resolvedModes,
        system:
          stratObj.strategy === STRATS.SYSTEM
            ? {
                mode: systemMode!,
                fallback: stratObj.fallback,
              }
            : undefined,
        selector: args.mode?.selector ?? CONFIG.mode.selector,
        store: args.mode?.store ?? CONFIG.mode.store,
        storageKey: args.mode?.storageKey ?? CONFIG.mode.storageKey,
      }
    }
  }

  // #region MAIN
  class Main {
    private static instance: UndefinedOr<Main>

    public static init() {
      if (!Main.instance) Main.instance = new Main()
    }

    public static reboot(args: ScriptArgs) {
      const rebootProcessor = Processor.needsReboot(args)
      if (!rebootProcessor) return

      EventManager.emit('State:reset')

      StorageManager.terminate()
      DOMManager.terminate()

      rebootProcessor()

      Main.instance = new Main()
    }

    public static get options() {
      const options = Processor.options
      return Object.fromEntries(Array.from(options.entries()).map(([prop, { options }]) => [prop, Array.from(options)]))
    }

    public static get state(): NullOr<State> {
      return Main.instance?.state ?? null
    }

    public static set state(state: State) {
      if (!Main.instance) return

      const currState = Main.state
      const newState = Utils.merge(currState, state)

      const needsUpdate = !Utils.deepEqualMaps(currState, newState)
      if (needsUpdate) {
        Main.instance.state = newState
        EventManager.emit('State:update', newState)
      }

      const resolvedMode = DOMManager.resolveMode(newState)
      Main.resolvedMode = resolvedMode
    }

    public static get forced(): NullOr<State> {
      if (!Main.instance) return null
      return Main.instance.forced
    }

    public static set forced(state: State) {
      if (!Main.instance) return

      const curr = Main.forced

      const needsUpdate = !Utils.deepEqualMaps(curr, state)
      if (needsUpdate) {
        Main.instance.forced = state
        EventManager.emit('Forced:update', state)
      }
    }

    public static force(prop: string, value: string) {}

    public static get resolvedMode(): UndefinedOr<RESOLVED_MODE> {
      return Main.instance?.resolvedMode
    }

    public static set resolvedMode(RM: UndefinedOr<RESOLVED_MODE>) {
      if (!Main.instance) return
      if (!RM) return

      const currRM = Main.resolvedMode

      const needsUpdate = currRM !== RM
      if (!needsUpdate) return

      Main.instance.resolvedMode = RM
      EventManager.emit('ResolvedMode:update', RM)
    }

    private state: NullOr<State> = null
    private forced: State = new Map()
    private resolvedMode: UndefinedOr<RESOLVED_MODE> = undefined

    private constructor() {
      StorageManager.init()
      DOMManager.init()

      const state = StorageManager.state
      this.state = state
      EventManager.emit('State:update', state)

      const resolvedMode = DOMManager.resolveMode(state)
      if (resolvedMode) {
        this.resolvedMode = resolvedMode
        EventManager.emit('ResolvedMode:update', resolvedMode)
      }
    }
  }

  // #region STORAGE MANAGER
  class StorageManager {
    private static instance: UndefinedOr<StorageManager>
    private static isInternalChange = false
    private static controller: AbortController

    private static utils = {
      retrieve(storageKey: string) {
        return window.localStorage.getItem(storageKey)
      },
      store(storageKey: string, string: string) {
        StorageManager.isInternalChange = true
        window.localStorage.setItem(storageKey, string)
        StorageManager.isInternalChange = false
      },
    }

    private static store = {
      state(state: State) {
        const currState = Main.state
        const newState = Utils.merge(currState, state)

        const currStorageState = StorageManager.utils.retrieve(Processor.storageKey)
        const storageNeedsUpdate = currStorageState !== Utils.mapToJSON(newState)
        if (storageNeedsUpdate) StorageManager.utils.store(Processor.storageKey, Utils.mapToJSON(newState))

        const stateNeedsUpdate = !Utils.deepEqualMaps(currState, newState)
        if (stateNeedsUpdate) Main.state = newState
      },
      mode(mode: UndefinedOr<string>) {
        if (!mode) return
        if (!Processor.mode) return
        if (!Processor.mode.store) return

        const currState = Main.state
        const stateCurrMode = currState?.get(Processor.mode.prop)
        const storageCurrMode = StorageManager.utils.retrieve(Processor.mode.storageKey)

        const storageNeedsUpdate = storageCurrMode !== mode
        if (storageNeedsUpdate) StorageManager.utils.store(Processor.mode!.storageKey, mode)

        const stateNeedsUpdate = stateCurrMode !== mode
        if (stateNeedsUpdate) Main.state = new Map([[Processor.mode.prop, mode]])
      },
    }

    private static set state(state: State) {
      StorageManager.store.state(state)
    }

    private static set mode(mode: UndefinedOr<string>) {
      StorageManager.store.mode(mode)
    }

    public static init() {
      if (!StorageManager.instance) StorageManager.instance = new StorageManager()
    }

    public static terminate(): void {
      StorageManager.controller.abort()

      localStorage.removeItem(Processor.storageKey)
      if (Processor.mode) localStorage.removeItem(Processor.mode.storageKey)

      StorageManager.instance = undefined
    }

    public static get state() {
      const stateString = StorageManager.utils.retrieve(Processor.storageKey)
      const { values } = Normalizer.ofJSON(stateString).normalize()
      return values
    }

    private constructor() {
      EventManager.on('State:update', 'StorageManager:state:update', (state) => {
        StorageManager.state = state
        StorageManager.mode = state.get(Processor.mode?.prop ?? '')
      })

      if (Processor.observe.includes(OBSERVABLES.STORAGE)) {
        StorageManager.controller = new AbortController()
        window.addEventListener(
          'storage',
          ({ key, newValue, oldValue }) => {
            // prettier-ignore
            switch (key) {
              case Processor.storageKey: {
                const { values } = Normalizer.ofJSON(newValue).normalize(oldValue)
                StorageManager.state = values
              }; break;
              case Processor.mode?.storageKey: {
                if (!Processor.mode?.store) return

                const { value } = Normalizer.normalize(Processor.mode.prop, newValue, oldValue)
                if (!value) return
                
                StorageManager.mode = value
              }; break;
              default: break;
            }
          },
          { signal: StorageManager.controller.signal }
        )
      }
    }
  }

  // #region DOM MANAGER
  class DOMManager {
    private static instance: UndefinedOr<DOMManager>
    private static target = Processor.target
    private static systemPref: UndefinedOr<RESOLVED_MODE>
    private static observers: Partial<{
      attrs: MutationObserver
      forceAttrs: MutationObserver
    }> = {}

    private static utils = {
      getSystemPref() {
        if (!DOMManager.systemPref) {
          const supportsPref = window.matchMedia('(prefers-color-scheme)').media !== 'not all'
          DOMManager.systemPref = supportsPref ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? MODES.DARK : MODES.LIGHT) : undefined
        }

        return DOMManager.systemPref
      },
      resolveMode(state: NullOr<State>) {
        if (!state) return
        if (!Processor.mode) return

        const mode = state.get(Processor.mode.prop)
        if (!mode) return

        const isSystemStrat = Processor.mode.strategy === STRATS.SYSTEM
        const isSystemMode = Processor.mode.system?.mode === mode
        const isSystem = isSystemStrat && isSystemMode
        const fallbackMode = Processor.mode.system?.fallback
        if (isSystem) return DOMManager.utils.getSystemPref() ?? Processor.mode.resolvedModes.get(fallbackMode!)

        return Processor.mode.resolvedModes.get(mode)
      },
      disableTransitions() {
        const css = document.createElement('style')
        if (Processor.nonce) css.setAttribute('nonce', Processor.nonce)
        css.appendChild(document.createTextNode(`*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`))
        document.head.appendChild(css)

        return () => {
          ;(() => window.getComputedStyle(document.body))()
          setTimeout(() => document.head.removeChild(css), 1)
        }
      },
      getDepth(el: HTMLElement) {
        let depth = 0
        let currEl: NullOr<HTMLElement> = el

        while (currEl && el.parentElement) {
          depth++
          currEl = currEl.parentElement
        }

        return depth
      },
      findEverythingWithAttrs(el: HTMLElement, attrs: string[]) {
        const mathedElements: HTMLElement[] = []

        if (attrs.some((attr) => el.hasAttribute(attr))) mathedElements.push(el)

        el.querySelectorAll('*').forEach((child) => {
          if (child instanceof HTMLElement && attrs.some((attr) => child.hasAttribute(attr))) mathedElements.push(child)
        })

        return mathedElements
      },
    }

    private static apply = {
      state(state: State) {
        state.forEach((value, prop) => {
          const currValue = DOMManager.target.getAttribute(`data-${prop}`)
          const needsUpdate = currValue !== value
          if (needsUpdate) DOMManager.target.setAttribute(`data-${prop}`, value)
        })

        const currState = Main.state
        const newState = Utils.merge(currState, state)

        const needsUpdate = !Utils.deepEqualMaps(currState, newState)
        if (needsUpdate) Main.state = newState
      },
      resolvedMode(RM: UndefinedOr<RESOLVED_MODE>) {
        if (!RM) return
        if (!Processor.mode) return

        if (Processor.mode.selector.includes(SELECTORS.COLOR_SCHEME)) {
          const DomCurrRM = DOMManager.target.style.colorScheme
          const DomNeedsUpdate = DomCurrRM !== RM
          if (DomNeedsUpdate) DOMManager.target.style.colorScheme = RM
        }

        if (Processor.mode.selector.includes(SELECTORS.CLASS)) {
          const isSet = DOMManager.target.classList.contains(MODES.LIGHT) ? MODES.LIGHT : DOMManager.target.classList.contains(MODES.DARK) ? MODES.DARK : undefined
          if (isSet === RM) return

          const other = RM === MODES.LIGHT ? MODES.DARK : MODES.LIGHT
          DOMManager.target.classList.replace(other, RM) || DOMManager.target.classList.add(RM)
        }

        if (Processor.mode.selector.includes(SELECTORS.DATA_ATTRIBUTE)) {
          const DomCurrRM = DOMManager.target.getAttribute('data-color-scheme')
          const DomNeedsUpdate = DomCurrRM !== RM
          if (DomNeedsUpdate) DOMManager.target.setAttribute('data-color-scheme', RM)
        }

        const stateCurrRM = Main.resolvedMode
        const stateNeedsUpdate = stateCurrRM !== RM
        if (stateNeedsUpdate) Main.resolvedMode = RM
      },
    }

    private static initAttrsObserver() {
      if (!Processor.observe.includes(OBSERVABLES.DOM)) return

      const handleMutations = (mutations: MutationRecord[]) => {
        const updates = new Map() as State
        for (const { attributeName, oldValue } of mutations) {
          // prettier-ignore
          switch (attributeName) {
              case 'style': {
                if (!Processor.mode?.selector.includes(SELECTORS.COLOR_SCHEME)) return

                const currRM = Main.resolvedMode!
                const newRM = DOMManager.target.style.colorScheme

                const needsUpdate = currRM !== newRM
                if (needsUpdate) DOMManager.target.style.colorScheme = currRM
              }; break;
              case 'class': {
                if (!Processor.mode?.selector.includes(SELECTORS.CLASS)) return

                const currRM = Main.resolvedMode!
                const newRM = DOMManager.target.classList.contains(MODES.LIGHT) ? MODES.LIGHT : DOMManager.target.classList.contains(MODES.DARK) ? MODES.DARK : undefined

                if (currRM !== newRM) {
                  const other = currRM === MODES.LIGHT ? MODES.DARK : MODES.LIGHT
                  DOMManager.target.classList.replace(other, currRM) || DOMManager.target.classList.add(currRM)
                }
              }; break;
              case 'data-color-scheme': {
                if (!Processor.mode?.selector.includes(SELECTORS.DATA_ATTRIBUTE)) return

                const currRM = Main.resolvedMode!
                const newRM = DOMManager.target.getAttribute('data-color-scheme')

                const needsUpdate = currRM !== newRM
                if (needsUpdate) DOMManager.target.setAttribute('data-color-scheme', currRM)
              }; break;
              default: {
                if (!attributeName) return

                const prop = attributeName.replace('data-', '')
                const newValue = DOMManager.target.getAttribute(attributeName)

                const { value: normValue } = Normalizer.normalize(prop, newValue, oldValue)
                updates.set(prop, normValue!)
              }
            }
        }
        if (updates.size > 0) DOMManager.state = updates
      }
      DOMManager.observers.attrs = new MutationObserver(handleMutations)
      DOMManager.observers.attrs.observe(DOMManager.target, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: [
          ...Array.from(Processor.options.keys()).map((prop) => `data-${prop}`),
          ...(Processor.mode?.selector.includes(SELECTORS.COLOR_SCHEME) ? ['style'] : []),
          ...(Processor.mode?.selector.includes(SELECTORS.CLASS) ? ['class'] : []),
          ...(Processor.mode?.selector.includes(SELECTORS.DATA_ATTRIBUTE) ? ['data-color-scheme'] : []),
        ],
      })
    }

    private static initForceAttrsHandling() {
      const attributes = Array.from(Processor.options.keys()).map((prop) => `data-force-${prop}`)
      const handler = (mutationsList: MutationRecord[]) => {
        const elMap: Map<string, HTMLElement> = new Map()

        for (const mutation of mutationsList) {
          if (mutation.type === 'attributes') {
            console.log(`Attribute '${mutation.attributeName}' changed on:`, mutation.target)
          }

          if (mutation.type === 'childList') {
            const addedElements = Array.from(mutation.addedNodes).filter((node) => node instanceof HTMLElement) as HTMLElement[]

            addedElements.forEach((el) => {
              const matchedElements = DOMManager.utils.findEverythingWithAttrs(el, attributes)

              matchedElements.forEach((matchedEl) => {
                const priority = parseInt(matchedEl.getAttribute('data-priority') ?? '0', 10)
                const depth = DOMManager.utils.getDepth(matchedEl)
                const key = attributes.find((attr) => matchedEl.hasAttribute(attr))!

                const priorityValue = priority * 1000 + depth

                if (!elMap.has(key) || (elMap.get(key)?.priorityValue ?? 0) < priorityValue) {
                  matchedEl.priorityValue = priorityValue
                  elMap.set(key, matchedEl)
                }
              })
            })

            elMap.forEach((el, key) => console.log(`Max priority element with attribute '${key}':`, el))

            const removedElementsMap: Record<string, HTMLElement[]> = {}

            Array.from(mutation.removedNodes).forEach((node) => {
              if (!(node instanceof HTMLElement)) return

              const matchedElements = DOMManager.utils.findEverythingWithAttrs(node, attributes)

              matchedElements.forEach((matchedEl) => {
                attributes.forEach((attr) => {
                  if (!matchedEl.hasAttribute(attr)) return

                  if (!removedElementsMap[attr]) removedElementsMap[attr] = []
                  removedElementsMap[attr].push(matchedEl)
                })
              })
            })

            Object.keys(removedElementsMap).forEach((key) => console.log(`Removed elements with attribute '${key}':`, ...(removedElementsMap[key] ?? [])))
          }
        }
      }
      DOMManager.observers.forceAttrs = new MutationObserver(handler)
      DOMManager.observers.forceAttrs.observe(Processor.target, { attributes: true, childList: true, subtree: true, attributeFilter: attributes })
    }

    private static set state(state: State) {
      const enableTransitions = Processor.disableTransitionOnChange ? DOMManager.utils.disableTransitions() : undefined

      DOMManager.apply.state(state)

      enableTransitions?.()
    }

    private static set resolvedMode(RM: RESOLVED_MODE) {
      const enableTransitions = Processor.disableTransitionOnChange ? DOMManager.utils.disableTransitions() : undefined

      DOMManager.apply.resolvedMode(RM)

      enableTransitions?.()
    }

    public static init() {
      if (!DOMManager.instance) DOMManager.instance = new DOMManager()
    }

    public static terminate() {
      Object.values(DOMManager.observers).forEach((o) => o.disconnect())

      Main.state?.forEach((_, prop) => {
        if (DOMManager.target.getAttribute(`data-${prop}`)) DOMManager.target.removeAttribute(`data-${prop}`)
      })
      if (DOMManager.target.style.colorScheme) DOMManager.target.style.colorScheme = ''
      if (DOMManager.target.classList.contains(MODES.LIGHT)) DOMManager.target.classList.remove(MODES.LIGHT)
      if (DOMManager.target.classList.contains(MODES.DARK)) DOMManager.target.classList.remove(MODES.DARK)
      if (DOMManager.target.getAttribute('data-color-scheme')) DOMManager.target.removeAttribute('data-color-scheme')

      DOMManager.target = Processor.target
      DOMManager.instance = undefined
    }

    public static resolveMode(state: State) {
      return DOMManager.utils.resolveMode(state)
    }

    private constructor() {
      EventManager.on('State:update', 'DOMManager:state:update', (state) => (DOMManager.state = state))
      EventManager.on('ResolvedMode:update', 'DOMManager:resolvedMode:update', (RM) => (DOMManager.resolvedMode = RM))

      DOMManager.initAttrsObserver()
      DOMManager.initForceAttrsHandling()
    }
  }

  // #region T3M4
  class T3M4 {
    public static get state() {
      return Main.state!
    }

    public static set state(values: State) {
      Main.state = values
    }

    public static get resolvedMode() {
      return Main.resolvedMode
    }

    public static get options() {
      return Main.options
    }

    public static subscribe<E extends keyof EventMap>(e: E, id: CallbackID, cb: (payload: EventMap[E]) => void) {
      EventManager.on(e, id, cb)
    }

    public static reboot(args: ScriptArgs) {
      Main.reboot(args)
    }
  }

  Main.init()
  window.T3M4 = T3M4
}
