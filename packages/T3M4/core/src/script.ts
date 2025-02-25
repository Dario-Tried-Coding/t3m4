import { Nullable, NullOr, UndefinedOr } from '@repo/typescript-utils/nullable'
import { ScriptArgs } from './types'
import { ModeProp } from './types/config/mode'
import { ImplicitProp, LightDarkOption, MonoOption, MultiOption, Prop, SystemOption, SystemValues } from './types/config/props'
import { CONSTANTS, OBSERVER, RESOLVED_MODE, STRAT } from './types/constants'
import { STRATS } from './types/constants/strats'
import { DEFAULTS } from './types/defaults'
import { EventMap } from './types/events'

export type State = Map<string, string>
export type Options = Map<string, { preferred: string; options: Set<string> }>
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
  class ArgsProcessor {
    private static instance: ArgsProcessor
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
        // prettier-ignore
        switch (strat) {
          case STRATS.MONO: {
            if (typeof prop === 'string') return true
            if (typeof prop === 'object' && typeof prop.options === 'string') return true
            return false
          };
          case STRATS.MULTI: {
            if (typeof prop === 'string') return true
            if (typeof prop === 'object' && typeof prop.options === 'string') return true
            return false
          };
          case STRATS.LIGHT_DARK: {
            if (typeof prop === 'string') return true
            if (typeof prop === 'object' && typeof prop.options === 'object' && !Array.isArray(prop.options) && !('system' in prop.options)) return true
            return false
          };
          case STRATS.SYSTEM: {
            if (typeof prop === 'string') return true
            if (typeof prop === 'object' && typeof prop.options === 'object' && !Array.isArray(prop.options)) return true
            return false
          };
          default: return false;
        }
      }

      const { props, mode: modeHandling } = args

      const options: Options = new Map()
      for (const [prop, stratObj] of Object.entries(args.config)) {
        const propsItem = props.find((i) => (typeof i === 'string' ? prop === i : prop === i.prop))
        if (!propsItem) continue

        // prettier-ignore
        switch (stratObj.strategy) {
            case STRATS.MONO: {
              if ((typeof propsItem !== 'string' && typeof propsItem.options !== 'string')) break
              
              const propOptions = new Set(typeof propsItem === 'string' ? [DEFAULT] : [propsItem.options as string])
              options.set(prop, { preferred: stratObj.preferred, options: propOptions })
            }; break
            case STRATS.MULTI: {
              if (typeof propsItem === 'string' || !Array.isArray(propsItem.options)) break
              
              const propOptions = new Set(propsItem.options)
              options.set(prop, { preferred: stratObj.preferred, options: propOptions })
            }; break
            case STRATS.LIGHT_DARK:
              {
                if (typeof propsItem !== 'string' && (typeof propsItem.options === 'string' || Array.isArray(propsItem.options))) break

              const propOptions = new Set([
                ...(typeof propsItem === 'string' ? [MODES.LIGHT] : [(propsItem.options as SystemValues).light ?? MODES.LIGHT]),
                ...(typeof propsItem === 'string' ? [MODES.DARK] : [(propsItem.options as SystemValues).dark ?? MODES.DARK]),
                ...(typeof propsItem !== 'string' ? ((propsItem.options as SystemValues).custom ?? []) : []),
              ])

                options.set(prop, { preferred: stratObj.preferred, options: propOptions })
              }; break
            case STRATS.SYSTEM:
              {
                if (typeof propsItem !== 'string' && (typeof propsItem.options === 'string' || Array.isArray(propsItem.options))) break
              
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

          const systemMode = stratObj.strategy === STRATS.SYSTEM && isProp(propItem, STRATS.SYSTEM) && typeof propItem !== 'string' ? (propItem.options.system ?? MODES.SYSTEM) : undefined

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
      if (!ArgsProcessor.instance) ArgsProcessor.instance = new ArgsProcessor()
      return ArgsProcessor.instance
    }

    public static get modeHandling() {
      return ArgsProcessor.getInstance()._modeHandling
    }

    public static get options() {
      return ArgsProcessor.getInstance()._options!
    }

    public static get observers() {
      return ArgsProcessor.getInstance()._observers
    }

    public static get storageKey() {
      return ArgsProcessor.getInstance()._storageKey
    }

    public static get nonce() {
      return ArgsProcessor.getInstance()._nonce
    }

    public static get disableTransitionOnChange() {
      return ArgsProcessor.getInstance()._disableTransitionOnChange
    }
  }

  // #region UTILS
  class Utils {
    private constructor() {}

    static merge<T extends NullOr<Map<string, string>>[]>(...maps: T): T[number] extends null ? null : Map<string, string> {
      const merged = maps.reduce((acc, map) => {
        if (!map) return acc
        return new Map([...(acc ?? []), ...map])
      }, new Map<string, string>())

      return merged as T[number] extends null ? null : Map<string, string>
    }

    static mapToJSON(map: Map<string, string>) {
      return JSON.stringify(Object.fromEntries(map))
    }

    static jsonToMap(json: NullOr<string>): Map<string, string> {
      if (!json?.trim()) return new Map()
      try {
        const parsed = JSON.parse(json)
        if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') return new Map()
        return new Map(Object.entries(parsed).filter(([key, value]) => typeof key === 'string' && typeof value === 'string') as [string, string][])
      } catch {
        return new Map()
      }
    }

    static isSameMap(map1: NullOr<Map<string, string>>, map2: NullOr<Map<string, string>>) {
      if (!map1 || !map2) return false
      if (map1 === map2) return true

      if (map1.size !== map2.size) return false

      for (const [key, value] of map1) {
        if (!map2.has(key) || map2.get(key) !== value) return false
      }

      return true
    }
  }

  // #region VALIDATOR
  class Validator<TState extends 'uninitialized' | 'initialized' = 'uninitialized'> {
    private values: Map<string, string> = new Map()

    private constructor() {}

    static ofJSON(json: NullOr<string>) {
      const validator = new Validator<'initialized'>()
      validator.values = Utils.jsonToMap(json)
      return validator
    }

    static ofMap(values: Map<string, string>) {
      const validator = new Validator<'initialized'>()
      validator.values = values
      return validator
    }

    static validate(prop: string, value: NullOr<string>, fallback?: NullOr<string>) {
      const isHandled = ArgsProcessor.options.has(prop)
      const isAllowed = isHandled && !!value ? ArgsProcessor.options.get(prop)!.options.has(value) : false
      const isAllowedFallback = isHandled && !!fallback ? ArgsProcessor.options.get(prop)!.options.has(fallback) : false

      const preferred = isHandled ? ArgsProcessor.options.get(prop)!.preferred : undefined
      const valValue = !isHandled ? undefined : isAllowed ? value! : isAllowedFallback ? fallback! : preferred

      return { passed: isHandled && isAllowed, value: valValue }
    }

    validate(fallbacks?: NullOr<string> | Map<string, string>): TState extends 'initialized' ? { passed: boolean; values: Map<string, string>; results: Map<string, { passed: boolean; value: string }> } : never
    validate(fallbacks?: NullOr<string> | Map<string, string>) {
      const results: Map<string, { passed: boolean; value: string }> = new Map()
      const sanValues: Map<string, string> = new Map()
      let passed = false
      const normFallbacks = typeof fallbacks === 'string' ? Utils.jsonToMap(fallbacks) : fallbacks

      for (const [prop, { preferred }] of ArgsProcessor.options.entries()) {
        results.set(prop, { passed: false, value: undefined as unknown as string })
        sanValues.set(prop, preferred)
      }

      for (const [prop, fallback] of normFallbacks?.entries() ?? []) {
        const { passed, value: sanValue } = Validator.validate(prop, fallback)
        results.set(prop, { passed, value: fallback })
        if (sanValue) sanValues.set(prop, sanValue)
      }

      for (const [prop, value] of this.values.entries()) {
        const { passed: valuePassed, value: sanValue } = Validator.validate(prop, value, normFallbacks?.get(prop))
        results.set(prop, { passed, value })
        if (sanValue) sanValues.set(prop, sanValue)
        if (valuePassed) passed = true
      }

      return { passed: true, values: sanValues, results } as TState extends 'initialized' ? { passed: boolean; values: Map<string, string>; results: Map<string, { passed: boolean; value: string }> } : never
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
    private _state: NullOr<Map<string, string>> = null
    private _mode: UndefinedOr<string> = undefined

    private constructor() {
      const stateString = StorageManager.utils.retrieve(ArgsProcessor.storageKey)
      const { values } = Validator.ofJSON(stateString).validate()

      this._state = values

      const mode = ArgsProcessor.modeHandling ? values.get(ArgsProcessor.modeHandling.prop) : undefined
      if (mode) this._mode = mode

      StorageManager.storeState(values)

      if (ArgsProcessor.observers.includes(OBSERVERS.STORAGE)) {
        window.addEventListener('storage', ({ key, newValue, oldValue }) => {
          // prettier-ignore
          switch (key) {
            case ArgsProcessor.storageKey: {
              const { values } = Validator.ofJSON(newValue).validate(oldValue)
              StorageManager.state = values
            }; break;
            case ArgsProcessor.modeHandling?.storageKey: {
              if (!ArgsProcessor.modeHandling?.store) return

              const { value } = Validator.validate(ArgsProcessor.modeHandling.prop, newValue, oldValue)
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

    private static storeState(values: Map<string, string>) {
      StorageManager.utils.store(ArgsProcessor.storageKey, Utils.mapToJSON(values))

      const mode = values.get(ArgsProcessor.modeHandling?.prop ?? '')
      if (mode) StorageManager.storeMode(mode)
    }

    private static storeMode(mode: string) {
      if (!ArgsProcessor.modeHandling?.store) return
      StorageManager.utils.store(ArgsProcessor.modeHandling.storageKey, mode)
    }

    public static get state() {
      if (!StorageManager.instance) StorageManager.instance = new StorageManager()
      return StorageManager.instance._state!
    }

    public static set state(values: Map<string, string>) {
      const currState = StorageManager.state
      const merged = Utils.merge(currState, values)

      const needsUpdate = !Utils.isSameMap(currState, merged)
      if (needsUpdate) {
        StorageManager.instance!._state = merged
        EventManager.emit('Storage:update', merged)
      }

      if (ArgsProcessor.modeHandling?.store) {
        const mode = merged.get(ArgsProcessor.modeHandling.prop)
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
      if (!ArgsProcessor.modeHandling?.store) return

      const currMode = StorageManager.mode

      const needsUpdate = mode !== currMode
      if (needsUpdate) StorageManager.instance!._mode = mode

      StorageManager.state = new Map([[ArgsProcessor.modeHandling.prop, mode]])
    }
  }

  // #region DOM
  class DOMManager {
    private static instance: UndefinedOr<DOMManager> = undefined
    private static target = document.documentElement
    private _state: NullOr<Map<string, string>> = null
    private _resolvedMode: UndefinedOr<RESOLVED_MODE> = undefined

    private constructor(values: Map<string, string>) {
      this._state = values

      const resolvedMode = DOMManager.resolveMode(values)
      if (resolvedMode) this._resolvedMode = resolvedMode

      DOMManager.applyState(values)

      if (ArgsProcessor.observers.includes(OBSERVERS.DOM)) {
        const handleMutations = (mutations: MutationRecord[]) => {
          for (const { attributeName, oldValue } of mutations) {
            // prettier-ignore
            switch (attributeName) {
              case 'style': {
                if (!ArgsProcessor.modeHandling?.selector.includes(SELECTORS.COLOR_SCHEME)) return

                const stateValue = DOMManager.resolvedMode!
                const newValue = DOMManager.target.style.colorScheme

                const needsUpdate = stateValue !== newValue
                if (needsUpdate) DOMManager.target.style.colorScheme = stateValue
              }; break;
              case 'class': {
                if (!ArgsProcessor.modeHandling?.selector.includes(SELECTORS.CLASS)) return

                const stateValue = DOMManager.resolvedMode!
                const newValue = DOMManager.target.classList.contains(MODES.LIGHT) ? MODES.LIGHT : DOMManager.target.classList.contains(MODES.DARK) ? MODES.DARK : undefined

                if (stateValue !== newValue) {
                  const other = stateValue === MODES.LIGHT ? MODES.DARK : MODES.LIGHT
                  DOMManager.target.classList.replace(other, stateValue) || DOMManager.target.classList.add(stateValue)
                }
              }; break;
              default: {
                if (!attributeName) return

                const prop = attributeName.replace('data-', '')
                const newValue = DOMManager.target.getAttribute(attributeName)

                const { value: sanValue } = Validator.validate(prop, newValue, oldValue)
                DOMManager.state = new Map([[prop, sanValue!]])
              }
            }
          }
        }

        const observer = new MutationObserver(handleMutations)
        observer.observe(DOMManager.target, {
          attributes: true,
          attributeOldValue: true,
          attributeFilter: [
            ...Array.from(ArgsProcessor.options.keys()).map((prop) => `data-${prop}`),
            ...(ArgsProcessor.modeHandling?.selector.includes(SELECTORS.COLOR_SCHEME) ? ['style'] : []),
            ...(ArgsProcessor.modeHandling?.selector.includes(SELECTORS.CLASS) ? ['class'] : []),
          ],
        })
      }

      EventManager.on('Storage:update', (state) => (DOMManager.state = state))
      EventManager.on('State:update', (state) => (DOMManager.state = state))
    }

    private static disableTransitions() {
      const css = document.createElement('style')
      if (ArgsProcessor.nonce) css.setAttribute('nonce', ArgsProcessor.nonce)
      css.appendChild(document.createTextNode(`*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`))
      document.head.appendChild(css)

      return () => {
        ;(() => window.getComputedStyle(document.body))()
        setTimeout(() => document.head.removeChild(css), 1)
      }
    }

    private static applyState(values: Map<string, string>) {
      const enableTransitions = ArgsProcessor.disableTransitionOnChange ? DOMManager.disableTransitions() : null

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
      if (ArgsProcessor.modeHandling?.selector.includes(SELECTORS.COLOR_SCHEME)) {
        const currValue = DOMManager.target.style.colorScheme
        const needsUpdate = currValue !== resolvedMode
        if (needsUpdate) DOMManager.target.style.colorScheme = resolvedMode
      }

      if (ArgsProcessor.modeHandling?.selector.includes(SELECTORS.CLASS)) {
        const isSet = DOMManager.target.classList.contains(MODES.LIGHT) ? MODES.LIGHT : DOMManager.target.classList.contains(MODES.DARK) ? MODES.DARK : undefined
        if (isSet === resolvedMode) return

        const other = resolvedMode === MODES.LIGHT ? MODES.DARK : MODES.LIGHT
        DOMManager.target.classList.replace(other, resolvedMode) || DOMManager.target.classList.add(resolvedMode)
      }
    }

    private static getSystemPref() {
      const supportsPref = window.matchMedia('(prefers-color-scheme)').media !== 'not all'
      return supportsPref ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? MODES.DARK : MODES.LIGHT) : undefined
    }

    public static resolveMode(values: Map<string, string>) {
      if (!ArgsProcessor.modeHandling) return

      const mode = values.get(ArgsProcessor.modeHandling.prop)
      if (!mode) return

      const isSystemStrat = ArgsProcessor.modeHandling.strategy === STRATS.SYSTEM
      const isSystemMode = ArgsProcessor.modeHandling.system?.mode === mode
      const isSystem = isSystemStrat && isSystemMode
      const fallbackMode = ArgsProcessor.modeHandling.system?.fallback
      if (isSystem) return DOMManager.getSystemPref() ?? ArgsProcessor.modeHandling.resolvedModes.get(fallbackMode!)

      return ArgsProcessor.modeHandling.resolvedModes.get(mode)
    }

    public static get state() {
      if (!DOMManager.instance) throw new Error('DOMManager not initialized')
      return DOMManager.instance._state!
    }

    public static set state(values: Map<string, string>) {
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
        if (!ArgsProcessor.modeHandling || !resolvedMode) return

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
    private _state: NullOr<Map<string, string>> = null
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

    public static init() {
      if (!Main.instance) Main.instance = new Main()
    }

    public static get state() {
      if (!Main.instance) Main.instance = new Main()
      return Main.instance._state!
    }

    public static set state(values: Map<string, string>) {
      if (!Main.instance) Main.instance = new Main()
      else {
        const currState = Main.state
        const { values: valValues } = Validator.ofMap(values).validate(currState)
        const merged = Utils.merge(currState, valValues)

        const needsUpdate = !Utils.isSameMap(currState, merged)
        if (needsUpdate) {
          Main.instance._state = merged
          EventManager.emit('State:update', merged)
        }
      }
    }

    public static get resolvedMode(): UndefinedOr<RESOLVED_MODE> {
      if (!Main.instance) Main.instance = new Main()
      return Main.instance._resolvedMode
    }

    private static set resolvedMode(resolvedMode: RESOLVED_MODE) {
      if (!Main.instance) Main.instance = new Main()
      else {
        if (!ArgsProcessor.modeHandling || !resolvedMode) return

        const currResolvedMode = DOMManager.resolvedMode
        const needsUpdate = resolvedMode !== currResolvedMode
        if (needsUpdate) Main.instance._resolvedMode = resolvedMode
      }
    }
  }

  // #region NEXT-THEMES
  class NextThemes {
    public static get state() {
      return Main.state
    }

    public static set state(values: Map<string, string>) {
      Main.state = values
    }

    public static get resolvedMode() {
      return Main.resolvedMode
    }

    public static get options() {
      return ArgsProcessor.options
    }

    public static subscribe<E extends keyof EventMap>(e: E, cb: (payload: EventMap[E]) => void) {
      EventManager.on(e, cb)
    }

    public static update(prop: string, value: string) {
      NextThemes.state = new Map([[prop, value]])
    }
  }

  Main.init()
  window.NextThemes = NextThemes
}
