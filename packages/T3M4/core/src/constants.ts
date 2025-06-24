export const LIBRARY_NAME = 'T3M4' as const
export type LIBRARY_NAME = typeof LIBRARY_NAME

export const DEFAULT = 'default' as const
export type DEFAULT = typeof DEFAULT

export const FACET_TYPES = {
  generic: 'facet',
  mode: 'mode',
} as const
export type FACET_TYPES = typeof FACET_TYPES
export type FACET_TYPE = (typeof FACET_TYPES)[keyof typeof FACET_TYPES]

export const STRATS = {
  mono: 'mono',
  multi: 'multi',
  system: 'system',
} as const
export type STRATS = typeof STRATS
export type STRAT = (typeof STRATS)[keyof typeof STRATS]

export const COLOR_SCHEMES = {
  light: 'light',
  dark: 'dark',
} as const
export type COLOR_SCHEMES = typeof COLOR_SCHEMES
export type COLOR_SCHEME = (typeof COLOR_SCHEMES)[keyof typeof COLOR_SCHEMES]

export const MODES = {
  light: 'light',
  dark: 'dark',
  system: 'system',
  custom: 'custom',
} as const
export type MODES = typeof MODES
export type MODE = (typeof MODES)[keyof typeof MODES]

export const OBSERVABLES = {
  storage: 'storage',
  dom: 'DOM',
} as const
export type OBSERVABLES = typeof OBSERVABLES
export type OBSERVABLE = (typeof OBSERVABLES)[keyof typeof OBSERVABLES]

export const SELECTORS = {
  class: 'class',
  data_color_scheme: 'data-color-scheme',
  color_scheme: 'color-scheme'
} as const
export type SELECTORS = typeof SELECTORS
export type SELECTOR = (typeof SELECTORS)[keyof typeof SELECTORS]