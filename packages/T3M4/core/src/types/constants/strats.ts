export type STRATS = {
  MONO: 'mono'
  MULTI: 'multi'
  LIGHT_DARK: 'light&dark'
  SYSTEM: 'system'
}
export type STRAT = STRATS[keyof STRATS]