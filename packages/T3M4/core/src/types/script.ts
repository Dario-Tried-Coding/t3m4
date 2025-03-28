import { FACETS } from './constants/facets'
import { DEFAULT, LIBRARY_NAME } from './constants/miscellaneous'
import { MODES } from './constants/modes'
import { SELECTOR, SELECTORS } from './constants/selectors'
import { STRATS } from './constants/strats'
import { Config } from './subscribers/config'
import { Options } from './subscribers/options'

export type ScriptArgs = {
  storageKey?: string
  options: Options.Schema
  config: Config.Static
  mode?: {
    storageKey?: string
    store?: boolean
  }
  nonce?: string
  disableTransitionOnChange?: boolean
}

export type Constants = {
  DEFAULT: DEFAULT
  STRATS: STRATS
  MODES: MODES
  FACETS: FACETS
  SELECTORS: SELECTORS
}

export type Default_Config = {
  storageKey: LIBRARY_NAME
  mode: {
    storageKey: string
    store: boolean
    selector: SELECTOR[]
  }
  nonce: string
  disableTransitionOnChange: boolean
}
