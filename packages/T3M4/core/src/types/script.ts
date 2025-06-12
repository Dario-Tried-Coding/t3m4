import { LinientAutoComplete } from '@t3m4/utils'
import { LIBRARY_NAME } from './constants/miscellaneous'
import { Observable } from './constants/observables'
import { Selector } from './constants/selectors'
import { Config, Schema } from './subscribers'

export interface Script_Args<Sc extends Schema.Suggested, C extends Config<Sc>> {
  schema: Sc
  config: C
  store?: boolean
  storageKey?: LinientAutoComplete<LIBRARY_NAME>
  forcedValues?: boolean
  selector?: Selector | Selector[]
  observe?: Observable | Observable[]
  disableTransitionOnChange?: boolean
  nonce?: string
}

export namespace Script_Args {
  export type Static = {
    schema: Schema
    config: Config.Static
    store?: boolean
    storageKey?: string
    forcedValues?: boolean
    selector?: Selector | Selector[]
    observe?: Observable | Observable[]
    disableTransitionOnChange?: boolean
    nonce?: string
  }
}
