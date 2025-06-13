import { LinientAutoComplete } from '@t3m4/utils'
import { LIBRARY_NAME, OBSERVABLE, SELECTOR } from '../constants'
import { Schema } from './subscribers/schema'
import { Config } from './subscribers/config'

export interface Args<Sc extends Schema.Suggested, C extends Config<Sc>> {
  schema: Sc
  config: C
  store?: boolean
  storageKey?: LinientAutoComplete<LIBRARY_NAME>
  forcedValues?: boolean
  selector?: SELECTOR | SELECTOR[]
  observe?: OBSERVABLE | OBSERVABLE[]
  disableTransitionOnChange?: boolean
  nonce?: string
}

export namespace Args {
  export type Static = {
    schema: Schema
    config: Config.Static
    store?: boolean
    storageKey?: string
    forcedValues?: boolean
    selector?: SELECTOR | SELECTOR[]
    observe?: OBSERVABLE | OBSERVABLE[]
    disableTransitionOnChange?: boolean
    nonce?: string
  }
}
