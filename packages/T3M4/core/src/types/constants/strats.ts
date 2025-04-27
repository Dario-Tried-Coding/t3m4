export type STRATS = {
  MONO: 'mono'
  MULTI: 'multi'
  LIGHT_DARK: 'light-dark'
  SYSTEM: 'system'
}
export type STRAT = STRATS[keyof STRATS]

export type STORE_STRATS = {
  UNIQUE: 'unique',
  SPLIT: 'split'
}
export type STORE_STRAT = STORE_STRATS[keyof STORE_STRATS]