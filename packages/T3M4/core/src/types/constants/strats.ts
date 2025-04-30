export type STRATS = {
  mono: 'mono'
  multi: 'multi'
  light_dark: 'light-dark'
  system: 'system'
}
export type Strat = STRATS[keyof STRATS]

export type STORE_STRATS = {
  unique: 'unique',
  split: 'split'
}
export type Store_Strat = keyof STORE_STRATS