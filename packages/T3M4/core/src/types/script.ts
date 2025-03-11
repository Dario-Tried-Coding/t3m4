import { Config, Props } from './config/index'
import { OBSERVABLE, SELECTOR } from './constants'

export type ScriptArgs = {
  storageKey?: string
  props: Props
  config: Config
  mode?: {
    selector?: SELECTOR[]
    store?: boolean
    storageKey?: string
  }
  target?: string
  observe?: OBSERVABLE[]
  nonce?: string
  disableTransitionOnChange?: boolean
}