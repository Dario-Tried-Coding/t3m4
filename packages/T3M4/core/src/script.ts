import { ScriptArgs } from './types'
import { CONSTANTS } from './types/constants'
import { CONFIG } from './types/config'
import { NullOr } from '@t3m4/utils/nullables'
import { Unsafe_State as State } from './types/state'
import { M } from 'vitest/dist/chunks/environment.d8YfPkTm.js'

export function script(args: ScriptArgs) {
  // #region CONSTANTS
  const { DEFAULT, MODES, PROP_TYPES, STRATS, OBSERVABLES, SELECTORS } = {
    DEFAULT: 'default',
    STRATS: {
      MONO: 'mono',
      MULTI: 'multi',
      LIGHT_DARK: 'light-dark',
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
  const utils = {
    merge<T extends NullOr<State>[]>(...maps: T): T[number] extends null ? null : State {
      const merged = maps.reduce((acc, map) => {
        if (!map) return acc
        return new Map([...(acc ?? []), ...map])
      }, new Map() as State)

      return merged as T[number] extends null ? null : State
    },
    mapToJSON(map: State) {
      return JSON.stringify(Object.fromEntries(map))
    },
    jsonToMap(json: NullOr<string>): Map<string, string> {
      if (!json?.trim()) return new Map()
      try {
        const parsed = JSON.parse(json)
        if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') return new Map()
        return new Map(Object.entries(parsed).filter(([key, value]) => typeof key === 'string' && typeof value === 'string') as [string, string][])
      } catch {
        return new Map()
      }
    },
    deepEqualObjects<T>(obj1: T, obj2: T): boolean {
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
        if (!keys2.includes(key) || !this.deepEqualObjects(obj1[key], obj2[key])) {
          return false
        }
      }

      return true
    },
    deepEqualMaps<K, V>(map1: NullOr<Map<K, V>>, map2: NullOr<Map<K, V>>): boolean {
      if (!map1 || !map2) return false
      if (map1 === map2) return true
      if (map1.size !== map2.size) return false

      for (const [key, value] of map1) {
        if (!map2.has(key) || !this.deepEqualObjects(value, map2.get(key))) return false
      }

      return true
    },
  }


}
