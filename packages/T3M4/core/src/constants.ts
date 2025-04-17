import { CONSTANTS as T_CONSTANTS } from './types/script'

export const CONSTANTS = {
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
  FACETS: {
    GENERIC: 'facet',
    MODE: 'mode',
  },
  SELECTORS: {
    CLASS: 'class',
    COLOR_SCHEME: 'color-scheme',
    DATA_ATTRIBUTE: 'data-attribute',
  },
} as const satisfies T_CONSTANTS
