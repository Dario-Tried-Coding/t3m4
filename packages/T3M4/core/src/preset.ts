import { LinientAutoComplete } from '@t3m4/utils'
import { LIBRARY_NAME } from './types/constants/miscellaneous'
import { Modes } from './types/subscribers/modes'

export type Preset = {
  storageKey: LinientAutoComplete<LIBRARY_NAME>
  modes: Omit<Modes.Static, 'islands'>
  nonce: string
  disableTransitionOnChange: boolean
}

export const PRESET = {
  storageKey: 'T3M4',
  modes: {
    store: false,
    storageKey: 'modes',
    strategy: 'unique',
  },
  nonce: '',
  disableTransitionOnChange: false,
} as const satisfies Preset
export type PRESET = typeof PRESET