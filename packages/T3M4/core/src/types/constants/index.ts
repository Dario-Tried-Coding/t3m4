import { MODES, RESOLVED_MODE } from './modes'
import { OBSERVERS, OBSERVER } from './observers'
import { PROP_TYPES } from './props'
import { SELECTORS, SELECTOR } from './selectors'
import { STRATS, STRAT } from './strats'

type DEFAULT = 'default'

export type CONSTANTS = {
  DEFAULT: DEFAULT
  STRATS: STRATS
  MODES: MODES
  PROP_TYPES: PROP_TYPES
  OBSERVERS: OBSERVERS
  SELECTORS: SELECTORS
}

export type { STRAT, STRATS, RESOLVED_MODE, OBSERVER, SELECTOR}