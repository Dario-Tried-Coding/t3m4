import { type CONSTANTS as T_CONSTANTS } from "./types/constants";

export const CONSTANTS = {
  libraryName: 'T3M4',
  default: 'default',
  facets: {
    generic: 'facet',
    mode: 'mode'
  },
  modes: {
    light: 'light',
    dark: 'dark',
    system: 'system',
    custom: 'custom'
  },
  strats: {
    mono: 'mono',
    multi: 'multi',
    system: 'system'
  },
  colorSchemes: {
    light: 'light',
    dark: 'dark',
  },
  selectors: {
    class: 'class',
    data_attribute: 'data-attribute'
  },
  storeStrats: {
    split: 'split',
    unique: 'unique',
  }
} as const satisfies T_CONSTANTS
