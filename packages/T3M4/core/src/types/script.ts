import { LinientAutoComplete } from '@t3m4/utils'
import { LIBRARY_NAME, MODES_SK } from './constants/miscellaneous'
import { Observable } from './constants/observables'
import { Selector } from './constants/selectors'
import { Config, Schema } from './subscribers'
import { Store_Strat } from './constants/strats'

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
  modes?: {
    store?: boolean
    storageKey?: LinientAutoComplete<MODES_SK>
    storageStrategy?: Store_Strat
  }
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
    modes?: {
      store?: boolean
      storageKey?: string
      storageStrategy?: Store_Strat
    }
  }
}
