import { LinientAutoComplete } from '@t3m4/utils'
import { LIBRARY_NAME, MODES_SK } from '../constants/miscellaneous'
import { Observable } from '../constants/observables'
import { Selector } from '../constants/selectors'
import { Store_Strat } from '../constants/strats'
import { Config, Schema } from '../subscribers'

export interface Script_Args<Sc extends Schema.Suggested, C extends Config<Sc>> {
  schema: Sc
  config: C
  storageKey?: LinientAutoComplete<LIBRARY_NAME>
  enableForcedValues?: boolean
  selector?: Selector | Selector[]
  observe?: Observable | Observable[]
  disableTransitionOnChange?: boolean
  nonce?: string
}

export namespace Script_Args {
  export type Static = {
    schema: Schema
    config: Config.Static
    storageKey?: string
    enableForcedValues?: boolean
    selector?: Selector | Selector[]
    observe?: Observable | Observable[]
    disableTransitionOnChange?: boolean
    nonce?: string
  }
}
