export type DEFAULT = 'default'
export type LIBRARY_NAME = 'T3M4'

export type STRATS = {
  mono: 'mono'
  multi: 'multi'
  system: 'system'
}
export type STRAT = STRATS[keyof STRATS]

export type MODES = {
  light: 'light'
  dark: 'dark'
  system: 'system'
  custom: 'custom'
}
export type MODE = MODES[keyof MODES]

export type COLOR_SCHEMES = {
  light: 'light'
  dark: 'dark'
}
export type COLOR_SCHEME = COLOR_SCHEMES[keyof COLOR_SCHEMES]

export type FACET_TYPES = {
  generic: 'facet'
  mode: 'mode'
}
export type FACET_TYPE = FACET_TYPES[keyof FACET_TYPES]

export type OBSERVABLES = {
  storage: 'storage'
  dom: 'DOM'
}
export type OBSERVABLE = OBSERVABLES[keyof OBSERVABLES]

export type SELECTORS = {
  class: 'class'
  data_color_scheme: 'data-color-scheme'
  color_scheme: 'color-scheme'
}
export type SELECTOR = SELECTORS[keyof SELECTORS]
