import { PRESET as T_PRESET } from './types/script'

export const PRESET = {
  storageKey: 'T3M4',
  mode: {
    strategy: 'unique',
    storageKey: 'theme',
    store: false,
    selector: [],
  },
  nonce: '',
  disableTransitionOnChange: false,
} as const satisfies T_PRESET
