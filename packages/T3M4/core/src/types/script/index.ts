import { FACETS } from '../constants/facets'
import { DEFAULT } from '../constants/miscellaneous'
import { MODES } from '../constants/modes'
import { SELECTOR, SELECTORS } from '../constants/selectors'
import { STRATS } from '../constants/strats'
import { Config } from '../subscribers/config'
import { Schema } from '../subscribers/schema'

export type CONSTANTS = {
  DEFAULT: DEFAULT
  STRATS: STRATS
  MODES: MODES
  FACETS: FACETS
  SELECTORS: SELECTORS
}

export type PRESET = {
  storageKey: string
  mode: {
    storageKey: string
    store: boolean
    selector: SELECTOR[]
  }
  nonce: string
  disableTransitionOnChange: boolean
}

export type Script_Args = {
  storageKey?: string
  schema: Schema
  config: Config
  mode?: {
    storageKey?: string
    store?: boolean
  }
  nonce?: string
  disableTransitionOnChange?: boolean
}

export type Constructed_Script_Args = Script_Args & {
  constants: CONSTANTS
  preset: PRESET
}