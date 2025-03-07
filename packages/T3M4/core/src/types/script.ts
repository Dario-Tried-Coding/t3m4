import { Config, Props } from './config'
import { OBSERVER, SELECTOR } from './constants'

export type ScriptArgs = {
  storageKey?: string
  props: Props
  config: Config
  mode?: {
    selector?: SELECTOR[]
    store?: boolean
    storageKey?: string
  }
  observe?: OBSERVER[]
  nonce?: string
  disableTransitionOnChange?: boolean
}