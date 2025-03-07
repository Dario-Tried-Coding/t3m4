import { Nullable, NullOr, UndefinedOr } from '@t3m4/utils/nullables'
import { ScriptArgs } from './types'
import { Unsafe_State as State } from './types/state'
import { Unsafe_Options as Options } from './types/options'
import { ModeProp } from './types/config/mode'
import { ImplicitProp, LightDarkOption, MonoOption, MultiOption, Prop, SystemOption, SystemValues } from './types/config/props'
import { CONSTANTS, OBSERVER, RESOLVED_MODE, STRAT } from './types/constants'
import { STRATS } from './types/constants/strats'
import { DEFAULTS } from './types/defaults'
import { EventMap } from './types/events'

type ModeHandling = { prop: string; strategy: STRAT; resolvedModes: Map<string, RESOLVED_MODE>; system: UndefinedOr<{ mode: string; fallback: string }> } & Required<ScriptArgs['mode']>

export function script(args: ScriptArgs) {
  // #region CONSTANTS
  const { DEFAULT, MODES, PROP_TYPES, STRATS, OBSERVERS, SELECTORS } = {
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
    OBSERVERS: {
      DOM: 'DOM',
      STORAGE: 'storage',
    },
    SELECTORS: {
      CLASS: 'class',
      COLOR_SCHEME: 'color-scheme',
      DATA_ATTRIBUTE: 'data-attribute',
    },
  } as const satisfies CONSTANTS

  // #region DEFAULTS
  const DEFAULTS = {
    storageKey: 'next-themes',
    mode: {
      storageKey: 'theme',
      store: false,
      selector: [],
    },
    observe: [],
    nonce: '',
    disableTransitionOnChange: false,
  } as const satisfies DEFAULTS

  // #region CONFIG PROCESSOR
  class Processor {
    private static instance: Processor
    private _storageKey = args.storageKey ?? DEFAULTS.storageKey
    private _options: UndefinedOr<Options> = undefined
    private _modeHandling: Nullable<ModeHandling> = undefined
    private _observers: OBSERVER[] = args.observe ?? DEFAULTS.observe
    private _nonce = args.nonce ?? DEFAULTS.nonce
    private _disableTransitionOnChange = args.disableTransitionOnChange ?? DEFAULTS.disableTransitionOnChange

    private constructor() {
      const isProp = <Strat extends STRAT>(
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
              : never => {
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

      const { props, mode: modeHandling } = args

      const options: Options = new Map()
      for (const [prop, stratObj] of Object.entries(args.config)) {
        const propsItem = props.find((i) => (typeof i === 'string' ? prop === i : prop === i.prop))
        if (!propsItem) continue

        // prettier-ignore
        switch (stratObj.strategy) {
            case STRATS.MONO: {
              if (!isProp(propsItem, STRATS.MONO)) break
              
              const propOptions = new Set(typeof propsItem === 'string' ? [DEFAULT] : [propsItem.options as string])
              options.set(prop, { preferred: stratObj.preferred, options: propOptions })
            }; break
            case STRATS.MULTI: {
              if (!isProp(propsItem, STRATS.MULTI)) break
              
              const propOptions = new Set(propsItem.options)
              options.set(prop, { preferred: stratObj.preferred, options: propOptions })
            }; break
            case STRATS.LIGHT_DARK: {
              if (!isProp(propsItem, STRATS.LIGHT_DARK)) break

              const propOptions = new Set([
                ...(typeof propsItem === 'string' ? [MODES.LIGHT] : [(propsItem.options as SystemValues).light ?? MODES.LIGHT]),
                ...(typeof propsItem === 'string' ? [MODES.DARK] : [(propsItem.options as SystemValues).dark ?? MODES.DARK]),
                ...(typeof propsItem !== 'string' ? ((propsItem.options as SystemValues).custom ?? []) : []),
              ])

              options.set(prop, { preferred: stratObj.preferred, options: propOptions })
            }; break
            case STRATS.SYSTEM: {
              if (!isProp(propsItem, STRATS.SYSTEM)) break
            
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
      this._options = options

      const modeConfig = Object.entries(args.config).find(([, { type }]) => type === PROP_TYPES.MODE) as UndefinedOr<[string, ModeProp]>

      if (modeConfig) {
        const [prop, stratObj] = modeConfig
        const propItem = props.find((i) => (typeof i === 'string' ? i === prop : i.prop === prop))
        const resolvedModes: Map<string, RESOLVED_MODE> = new Map()

        if (propItem) {
          // prettier-ignore
          switch (stratObj.strategy) {
            case STRATS.MONO: {
              if (!isProp(propItem, STRATS.MONO)) break;

              const mode = typeof propItem === 'string' ? DEFAULT : propItem?.options
              resolvedModes.set(mode, stratObj.colorScheme)
            }; break
            case STRATS.MULTI: {
              Object.entries(stratObj.colorSchemes).forEach(([key, colorScheme]) => {
                resolvedModes.set(key, colorScheme)
              })
            }; break
            case STRATS.LIGHT_DARK:
            case STRATS.SYSTEM: {
              if (!isProp(propItem, STRATS.LIGHT_DARK) && !isProp(propItem, STRATS.SYSTEM)) break;

              resolvedModes.set(typeof propItem === 'object' ? propItem.options.light ?? MODES.LIGHT : MODES.LIGHT, MODES.LIGHT)
              resolvedModes.set(typeof propItem === 'object' ? propItem.options.dark ?? MODES.DARK : MODES.DARK, MODES.DARK)
              if (stratObj.colorSchemes) Object.entries(stratObj.colorSchemes).forEach(([key, colorScheme]) => resolvedModes.set(key, colorScheme))
            }; break
            default: break
          }

          const systemMode = isProp(propItem, STRATS.SYSTEM) ? (typeof propItem !== 'string' ? (propItem.options.system ?? MODES.SYSTEM) : STRATS.SYSTEM) : undefined

          this._modeHandling = {
            prop,
            strategy: stratObj.strategy,
            resolvedModes,
            system:
              stratObj.strategy === STRATS.SYSTEM
                ? {
                    mode: systemMode!,
                    fallback: stratObj.fallback,
                  }
                : undefined,
            selector: modeHandling?.selector ?? DEFAULTS.mode.selector,
            store: modeHandling?.store ?? DEFAULTS.mode.store,
            storageKey: modeHandling?.storageKey ?? DEFAULTS.mode.storageKey,
          }
        }
      }
    }

    private static getInstance() {
      if (!Processor.instance) Processor.instance = new Processor()
      return Processor.instance
    }

    public static get modeHandling() {
      return Processor.getInstance()._modeHandling
    }

    public static get options() {
      return Processor.getInstance()._options!
    }

    public static get observers() {
      return Processor.getInstance()._observers
    }

    public static get storageKey() {
      return Processor.getInstance()._storageKey
    }

    public static get nonce() {
      return Processor.getInstance()._nonce
    }

    public static get disableTransitionOnChange() {
      return Processor.getInstance()._disableTransitionOnChange
    }
  }

  // #region UTILS
  class Utils {
    private constructor() {}

    static merge<T extends NullOr<State>[]>(...maps: T): T[number] extends null ? null : State {
      const merged = maps.reduce((acc, map) => {
        if (!map) return acc
        return new Map([...(acc ?? []), ...map])
      }, new Map() as State)

      return merged as T[number] extends null ? null : State
    }

    static mapToJSON(map: State) {
      return JSON.stringify(Object.fromEntries(map))
    }

    static jsonToMap(json: NullOr<string>): State {
      if (!json?.trim()) return new Map()
      try {
        const parsed = JSON.parse(json)
        if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') return new Map()
        return new Map(Object.entries(parsed).filter(([key, value]) => typeof key === 'string' && typeof value === 'string') as [string, string][])
      } catch {
        return new Map()
      }
    }

    static isSameMap(map1: NullOr<State>, map2: NullOr<State>) {
      if (!map1 || !map2) return false
      if (map1 === map2) return true

      if (map1.size !== map2.size) return false

      for (const [key, value] of map1) {
        if (!map2.has(key) || map2.get(key) !== value) return false
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

  // #region EVENTS
  class EventManager {
    private static events: Map<string, Set<(...args: any[]) => void>> = new Map()

    public static on<K extends keyof EventMap>(event: K, callback: (payload: EventMap[K]) => void): void {
      if (!EventManager.events.has(event)) {
        EventManager.events.set(event, new Set())
      }
      EventManager.events.get(event)!.add(callback)
    }

    public static emit<K extends keyof EventMap>(event: K, ...args: EventMap[K] extends void ? [] : [payload: EventMap[K]]): void {
      EventManager.events.get(event)?.forEach((callback) => {
        const payload = args[0]
        if (payload) callback(payload)
        else callback()
      })
    }
  }

  // #region STORAGE
  class StorageManager {
    private static instance: UndefinedOr<StorageManager> = undefined
    private _state: NullOr<State> = null
    private _mode: UndefinedOr<string> = undefined

    private constructor() {
      const stateString = StorageManager.utils.retrieve(Processor.storageKey)
      const { values } = Normalizer.ofJSON(stateString).normalize()

      this._state = values

      const mode = Processor.modeHandling ? values.get(Processor.modeHandling.prop) : undefined
      if (mode) this._mode = mode

      StorageManager.storeState(values)

      if (Processor.observers.includes(OBSERVERS.STORAGE)) {
        window.addEventListener('storage', ({ key, newValue, oldValue }) => {
          // prettier-ignore
          switch (key) {
            case Processor.storageKey: {
              const { values } = Normalizer.ofJSON(newValue).normalize(oldValue)
              StorageManager.state = values
            }; break;
            case Processor.modeHandling?.storageKey: {
              if (!Processor.modeHandling?.store) return

              const { value } = Normalizer.normalize(Processor.modeHandling.prop, newValue, oldValue)
              if (value) StorageManager.mode = value
            }
          }
        })
      }

      EventManager.on('DOM:state:update', (state) => (StorageManager.state = state))
      EventManager.on('State:update', (state) => (StorageManager.state = state))
    }

    private static utils = {
      retrieve(storageKey: string) {
        return window.localStorage.getItem(storageKey)
      },
      store(storageKey: string, string: string) {
        const needsUpdate = string !== this.retrieve(storageKey)
        if (needsUpdate) window.localStorage.setItem(storageKey, string)
      },
    }

    private static storeState(values: State) {
      StorageManager.utils.store(Processor.storageKey, Utils.mapToJSON(values))

      const mode = values.get(Processor.modeHandling?.prop ?? '')
      if (mode) StorageManager.storeMode(mode)
    }

    private static storeMode(mode: string) {
      if (!Processor.modeHandling?.store) return
      StorageManager.utils.store(Processor.modeHandling.storageKey, mode)
    }

    public static get state() {
      if (!StorageManager.instance) StorageManager.instance = new StorageManager()
      return StorageManager.instance._state!
    }

    public static set state(values: State) {
      const currState = StorageManager.state
      const merged = Utils.merge(currState, values)

      const needsUpdate = !Utils.isSameMap(currState, merged)
      if (needsUpdate) {
        StorageManager.instance!._state = merged
        EventManager.emit('Storage:update', merged)
      }

      if (Processor.modeHandling?.store) {
        const mode = merged.get(Processor.modeHandling.prop)
        const needsUpdate = !!mode && mode !== StorageManager.mode
        if (needsUpdate) StorageManager.instance!._mode = mode
      }

      StorageManager.storeState(merged)
    }

    public static get mode() {
      if (!StorageManager.instance) StorageManager.instance = new StorageManager()
      return StorageManager.instance._mode!
    }

    public static set mode(mode: string) {
      if (!Processor.modeHandling?.store) return

      const currMode = StorageManager.mode

      const needsUpdate = mode !== currMode
      if (needsUpdate) StorageManager.instance!._mode = mode

      StorageManager.state = new Map([[Processor.modeHandling.prop, mode]])
    }
  }

  // #region DOM
  class DOMManager {
    private static instance: UndefinedOr<DOMManager> = undefined
    private static target = document.documentElement
    private static systemPref: UndefinedOr<RESOLVED_MODE> = undefined
    private _state: NullOr<State> = null
    private _resolvedMode: UndefinedOr<RESOLVED_MODE> = undefined

    private constructor(values: State) {
      this._state = values

      const resolvedMode = DOMManager.resolveMode(values)
      if (resolvedMode) this._resolvedMode = resolvedMode

      DOMManager.applyState(values)

      if (Processor.observers.includes(OBSERVERS.DOM)) {
        const handleMutations = (mutations: MutationRecord[]) => {
          const updates = new Map() as State
          for (const { attributeName, oldValue } of mutations) {
            // prettier-ignore
            switch (attributeName) {
              case 'style': {
                if (!Processor.modeHandling?.selector.includes(SELECTORS.COLOR_SCHEME)) return

                const stateValue = DOMManager.resolvedMode!
                const newValue = DOMManager.target.style.colorScheme

                const needsUpdate = stateValue !== newValue
                if (needsUpdate) DOMManager.target.style.colorScheme = stateValue
              }; break;
              case 'class': {
                if (!Processor.modeHandling?.selector.includes(SELECTORS.CLASS)) return

                const stateValue = DOMManager.resolvedMode!
                const newValue = DOMManager.target.classList.contains(MODES.LIGHT) ? MODES.LIGHT : DOMManager.target.classList.contains(MODES.DARK) ? MODES.DARK : undefined

                if (stateValue !== newValue) {
                  const other = stateValue === MODES.LIGHT ? MODES.DARK : MODES.LIGHT
                  DOMManager.target.classList.replace(other, stateValue) || DOMManager.target.classList.add(stateValue)
                }
              }; break;
              case 'data-color-scheme': {
                if (!Processor.modeHandling?.selector.includes(SELECTORS.DATA_ATTRIBUTE)) return

                const stateValue = DOMManager.resolvedMode!
                const newValue = DOMManager.target.getAttribute('data-color-scheme')

                const needsUpdate = stateValue !== newValue
                if (needsUpdate) DOMManager.target.setAttribute('data-color-scheme', stateValue)
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

        const observer = new MutationObserver(handleMutations)
        observer.observe(DOMManager.target, {
          attributes: true,
          attributeOldValue: true,
          attributeFilter: [
            'data-color-scheme',
            ...Array.from(Processor.options.keys()).map((prop) => `data-${prop}`),
            ...(Processor.modeHandling?.selector.includes(SELECTORS.COLOR_SCHEME) ? ['style'] : []),
            ...(Processor.modeHandling?.selector.includes(SELECTORS.CLASS) ? ['class'] : []),
          ],
        })
      }

      EventManager.on('Storage:update', (state) => (DOMManager.state = state))
      EventManager.on('State:update', (state) => (DOMManager.state = state))
    }

    private static disableTransitions() {
      const css = document.createElement('style')
      if (Processor.nonce) css.setAttribute('nonce', Processor.nonce)
      css.appendChild(document.createTextNode(`*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`))
      document.head.appendChild(css)

      return () => {
        ;(() => window.getComputedStyle(document.body))()
        setTimeout(() => document.head.removeChild(css), 1)
      }
    }

    private static applyState(values: State) {
      const enableTransitions = Processor.disableTransitionOnChange ? DOMManager.disableTransitions() : null

      values.forEach((value, key) => {
        const currValue = DOMManager.target.getAttribute(`data-${key}`)
        const needsUpdate = currValue !== value
        if (needsUpdate) DOMManager.target.setAttribute(`data-${key}`, value)
      })

      const resolvedMode = DOMManager.resolveMode(values)
      if (resolvedMode) DOMManager.applyResolvedMode(resolvedMode)

      enableTransitions?.()
    }

    private static applyResolvedMode(resolvedMode: RESOLVED_MODE) {
      if (Processor.modeHandling?.selector.includes(SELECTORS.COLOR_SCHEME)) {
        const currValue = DOMManager.target.style.colorScheme
        const needsUpdate = currValue !== resolvedMode
        if (needsUpdate) DOMManager.target.style.colorScheme = resolvedMode
      }

      if (Processor.modeHandling?.selector.includes(SELECTORS.CLASS)) {
        const isSet = DOMManager.target.classList.contains(MODES.LIGHT) ? MODES.LIGHT : DOMManager.target.classList.contains(MODES.DARK) ? MODES.DARK : undefined
        if (isSet === resolvedMode) return

        const other = resolvedMode === MODES.LIGHT ? MODES.DARK : MODES.LIGHT
        DOMManager.target.classList.replace(other, resolvedMode) || DOMManager.target.classList.add(resolvedMode)
      }

      if (Processor.modeHandling?.selector.includes(SELECTORS.DATA_ATTRIBUTE)) {
        const currValue = DOMManager.target.getAttribute('data-color-scheme')
        const needsUpdate = currValue !== resolvedMode
        if (needsUpdate) DOMManager.target.setAttribute('data-color-scheme', resolvedMode)
      }
    }

    private static getSystemPref() {
      if (!DOMManager.systemPref) {
        const supportsPref = window.matchMedia('(prefers-color-scheme)').media !== 'not all'
        DOMManager.systemPref = supportsPref ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? MODES.DARK : MODES.LIGHT) : undefined
      }

      return DOMManager.systemPref
    }

    public static resolveMode(values: State) {
      if (!Processor.modeHandling) return

      const mode = values.get(Processor.modeHandling.prop)
      if (!mode) return

      const isSystemStrat = Processor.modeHandling.strategy === STRATS.SYSTEM
      const isSystemMode = Processor.modeHandling.system?.mode === mode
      const isSystem = isSystemStrat && isSystemMode
      const fallbackMode = Processor.modeHandling.system?.fallback
      if (isSystem) return DOMManager.getSystemPref() ?? Processor.modeHandling.resolvedModes.get(fallbackMode!)

      return Processor.modeHandling.resolvedModes.get(mode)
    }

    public static get state() {
      if (!DOMManager.instance) throw new Error('DOMManager not initialized')
      return DOMManager.instance._state!
    }

    public static set state(values: State) {
      if (!DOMManager.instance) DOMManager.instance = new DOMManager(values)
      else {
        const currState = DOMManager.state
        const merged = Utils.merge(currState, values)

        const needsUpdate = !Utils.isSameMap(currState, merged)
        if (needsUpdate) {
          DOMManager.instance._state = merged
          EventManager.emit('DOM:state:update', merged)
        }

        const resolvedMode = DOMManager.resolveMode(merged)
        DOMManager.resolvedMode = resolvedMode

        DOMManager.applyState(merged)
      }
    }

    public static get resolvedMode() {
      if (!DOMManager.instance) throw new Error('DOMManager not initialized')
      return DOMManager.instance._resolvedMode
    }

    public static set resolvedMode(resolvedMode: UndefinedOr<RESOLVED_MODE>) {
      if (!DOMManager.instance) DOMManager.instance = new DOMManager(new Map())
      else {
        if (!Processor.modeHandling || !resolvedMode) return

        const currResolvedMode = DOMManager.resolvedMode
        const needsUpdate = resolvedMode !== currResolvedMode
        if (needsUpdate) {
          DOMManager.instance._resolvedMode = resolvedMode
          EventManager.emit('DOM:resolvedMode:update', resolvedMode)
        }
      }
    }
  }

  class Main {
    private static instance: UndefinedOr<Main> = undefined
    private _state: NullOr<State> = null
    private _resolvedMode: UndefinedOr<RESOLVED_MODE> = undefined

    private constructor() {
      const state = StorageManager.state
      this._state = state
      DOMManager.state = state
      this._resolvedMode = DOMManager.resolvedMode

      EventManager.on('Storage:update', (state) => (Main.state = state))
      EventManager.on('DOM:state:update', (state) => (Main.state = state))
      EventManager.on('DOM:resolvedMode:update', (resolvedMode) => (Main.resolvedMode = resolvedMode))
    }

    private static getInstance() {
      if (!Main.instance) Main.instance = new Main()
      return Main.instance
    }

    public static init() {
      if (!Main.instance) Main.instance = new Main()
    }

    public static get state() {
      return Main.getInstance()._state!
    }

    public static set state(values: State) {
      const currState = Main.state
      const { values: valValues } = Normalizer.ofMap(values).normalize(currState)
      const merged = Utils.merge(currState, valValues)

      const needsUpdate = !Utils.isSameMap(currState, merged)
      if (needsUpdate) {
        Main.getInstance()._state = merged
        EventManager.emit('State:update', merged)
      }
    }

    public static get resolvedMode(): UndefinedOr<RESOLVED_MODE> {
      return Main.getInstance()._resolvedMode
    }

    private static set resolvedMode(resolvedMode: RESOLVED_MODE) {
      if (!Processor.modeHandling || !resolvedMode) return

      const currResolvedMode = DOMManager.resolvedMode
      const needsUpdate = resolvedMode !== currResolvedMode
      if (needsUpdate) Main.getInstance()._resolvedMode = resolvedMode
    }
  }

  // #region NEXT-THEMES
  class NextThemes {
    public static get state() {
      return Main.state
    }

    public static set state(values: State) {
      Main.state = values
    }

    public static get resolvedMode() {
      return Main.resolvedMode
    }

    public static get options() {
      return Processor.options
    }

    public static subscribe<E extends keyof EventMap>(e: E, cb: (payload: EventMap[E]) => void) {
      EventManager.on(e, cb)
    }
  }

  Main.init()
  window.NextThemes = NextThemes
}
