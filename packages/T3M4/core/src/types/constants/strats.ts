export type STRATS = {
  mono: 'mono'
  multi: 'multi'
  light_dark: 'light-dark'
  system: 'system'
}
export type STRAT = STRATS[keyof STRATS]

export type STORE_STRATS = {
  unique: 'unique',
  split: 'split'
}
export type STORE_STRAT = STORE_STRATS[keyof STORE_STRATS]