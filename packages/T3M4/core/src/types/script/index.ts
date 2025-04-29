import { LinientAutoComplete } from '@t3m4/utils'
import { FACETS } from '../constants/facets'
import { DEFAULT, LIBRARY_NAME } from '../constants/miscellaneous'
import { MODES } from '../constants/modes'
import { SELECTOR, SELECTORS } from '../constants/selectors'
import { STORE_STRAT, STRATS } from '../constants/strats'
import { Config } from '../subscribers/config'
import { Schema } from '../subscribers/schema'

// export type Script_Args = {
//   storageKey?: string
//   schema: Schema
//   config: Config
//   mode?: Partial<{
//     strategy: STORE_STRAT
//     storageKey: string
//     store: boolean
//   }>
//   nonce?: string
//   disableTransitionOnChange?: boolean
// }

// export type CONSTANTS = {
//   DEFAULT: DEFAULT
//   STRATS: STRATS
//   MODES: MODES
//   FACETS: FACETS
//   SELECTORS: SELECTORS
// }

// type Mode_Preset = Required<Script_Args['mode']> & {
//   selector: SELECTOR[]
// }
// export type PRESET = Required<Pick<Script_Args, 'storageKey' | 'nonce' | 'disableTransitionOnChange'>> & {
//   mode: Mode_Preset
// }

// export type Constructed_Script_Args = Script_Args & {
//   constants: CONSTANTS
//   preset: PRESET
// }

export type Script_Args = {
  storage: {
    strategy: STORE_STRAT
    keys: Partial<{
      state: string
      modes: string
    }>
  }
}