import { LinientAutoComplete } from '@t3m4/utils'
import { LIBRARY_NAME } from './types/constants/miscellaneous'
import { Selector } from './types/constants/selectors'
import { Store_Strat } from './types/constants/strats'

export type Preset = {
  storageKey: LinientAutoComplete<LIBRARY_NAME>
  modes: {
    strategy: Store_Strat
    storageKey: LinientAutoComplete<'mode' | 'theme'>
    store: boolean
    selectors: Selector[]
  }
  nonce: string
  disableTransitionOnChange: boolean
}

export const PRESET = {
  storageKey: 'T3M4',
  modes: {
    store: false,
    storageKey: 'mode',
    strategy: 'unique',
    selectors: [],
  },
  nonce: '',
  disableTransitionOnChange: false,
} as const satisfies Preset
export type PRESET = typeof PRESET