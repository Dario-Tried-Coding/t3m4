import { ScriptArgs } from './types'
import { CONSTANTS } from './types/constants'
import { CONFIG } from './types/config'

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
}
