import { Nullable, NullOr, UndefinedOr } from '@t3m4/utils/nullables'
import { ScriptArgs } from './types'
import { CONFIG } from './types/config'
import { ImplicitProp, LightDarkOption, MonoOption, MultiOption, Prop, SystemOption, SystemValues } from './types/config/props'
import { CONSTANTS, OBSERVABLE, RESOLVED_MODE, STRAT } from './types/constants'
import { STRATS } from './types/constants/strats'
import { EventMap } from './types/events'
import { Unsafe_Options as Options } from './types/options'
import { Unsafe_State as State } from './types/state'
import { ModeProp } from './types/config/mode'

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
    storageKey: 'next-themes',
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

    public static deepEqualMaps<K, V>(map1: Map<K, V>, map2: Map<K, V>): boolean {
      if (map1 === map2) {
        return true
      }

      if (map1.size !== map2.size) {
        return false
      }

      for (const [key, value] of map1) {
        if (!map2.has(key) || !Utils.deepEqualObjects(value, map2.get(key))) {
          return false
        }
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

    private static getChangedKeys<A extends ScriptArgs>(newArgs: A, oldArgs: A): (keyof A)[] {
      const changedKeys: (keyof A)[] = []

      for (const key of Object.keys(newArgs)) {
        const tKey = key as keyof A
        if (!Utils.deepEqualObjects(newArgs[tKey], oldArgs[tKey])) {
          changedKeys.push(tKey)
        }
      }

      return changedKeys
    }

    public static update(args: ScriptArgs) {
      if (Utils.deepEqualObjects(args, Processor._args)) return

      const changedKeys = Processor.getChangedKeys(args, Processor._args)
      if (!changedKeys.length) return

      Processor._args = args
      Processor.instance = new Processor()

      return changedKeys
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

  interface Rebootable {
    reboot(): void
  }

  // #region MAIN
  class Main {
    private static instance: UndefinedOr<Main>
    private static modules: Map<string, { instance: Rebootable; dependencies: (keyof ScriptArgs)[] }> = new Map()

    private static getInstance() {
      if (!Main.instance) Main.instance = new Main()
      return Main.instance
    }

    private static smartReboot(changedKeys: (keyof ScriptArgs)[]) {
      const modulesToRestart: string[] = []

      Main.modules.forEach(({ dependencies }, name) => {
        if (dependencies.some((d) => changedKeys.includes(d))) modulesToRestart.push(name)
      })

      modulesToRestart.forEach((name) => Main.modules.get(name)!.instance.reboot())
    }

    public static init() {
      if (!Main.instance) Main.instance = new Main()
    }

    public static registerModule(instance: Rebootable, dependencies: (keyof ScriptArgs)[]) {
      const name = instance.constructor.name
      Main.modules.set(name, { instance, dependencies })
    }

    public static reboot(args: ScriptArgs) {
      const changedKeys = Processor.update(args)
      if (!changedKeys) return

      Main.smartReboot(changedKeys)
    }

    public static get state() {
      if (!Main.instance) throw new Error('Main instance not initialized. Call Main.init() first.')
      return Main.getInstance().state!
    }

    public static set state(state: State) {
      Main.getInstance().state = state
      EventManager.emit('State:update', state)
    }

    private state: UndefinedOr<State> = undefined

    private constructor() {
      StorageManager.init()
      
      this.state = StorageManager.state

      EventManager.on('Storage:state:update', (state) => (Main.state = state))
    }
  }

  // #region STORAGE MANAGER
  class StorageManager implements Rebootable {
    private static instance: UndefinedOr<StorageManager> = undefined
    private static isInternalChange = false
    private static controller = new AbortController()

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
        if (stateNeedsUpdate) EventManager.emit('Storage:state:update', newState)
      },
      mode(mode: UndefinedOr<string>) {
        if (!mode) return

        const mustStoreMode = Processor.mode?.store
        if (!mustStoreMode) return

        const currState = Main.state

        const currMode = currState.get(Processor.mode!.prop)
        const storageCurrMode = StorageManager.utils.retrieve(Processor.mode!.storageKey)

        if (!currMode) return

        const storageNeedsUpdate = storageCurrMode !== currMode
        if (storageNeedsUpdate) StorageManager.utils.store(Processor.mode!.storageKey, mode)

        const stateNeedsUpdate = currMode !== mode
        if (stateNeedsUpdate) EventManager.emit('Storage:mode:update', mode)
      },
    }

    public static init() {
      if (!StorageManager.instance) StorageManager.instance = new StorageManager()
    }

    public static get state() {
      const stateString = StorageManager.utils.retrieve(Processor.storageKey)
      const { values } = Normalizer.ofJSON(stateString).normalize()
      return values
    }

    private static set state(state: State) {
      StorageManager.store.state(state)
      StorageManager.store.mode(state.get(Processor.mode?.prop ?? ''))
    }

    private static get mode(): Nullable<string> {
      return Processor.mode ? StorageManager.utils.retrieve(Processor.mode.storageKey) : undefined
    }

    private static set mode(mode: string) {
      StorageManager.store.mode(mode)
      StorageManager.store.state(new Map([[Processor.mode!.prop, mode]]))
    }

    private constructor() {
      EventManager.on('State:update', (state) => (StorageManager.state = state))

      if (Processor.observe.includes(OBSERVABLES.STORAGE)) {
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

      Main.registerModule(this, ['storageKey', 'observe', 'mode', 'config', 'props'])
    }

    public reboot() {
      StorageManager.controller.abort()
      StorageManager.controller = new AbortController()
      StorageManager.instance = new StorageManager()
    }
  }

  Main.init()
}
