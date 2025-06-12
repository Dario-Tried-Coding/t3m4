import { LinientAutoComplete } from '@t3m4/utils'
import { Observable } from './constants/observables'
import { Selector } from './constants/selectors'
import { Store_Strat } from './constants/strats'
import { LIBRARY_NAME, MODES_SK } from './constants/miscellaneous'

export type PRESET = {
  storage: {
    key: LinientAutoComplete<LIBRARY_NAME>
    store: {
      values: false
      value: true
    }
  }
  modes: {
    dom: {
      selectors: Selector[]
      island: {
        selectors: Selector[]
      }
    }
  }
  forced_values: boolean
  observe: Observable[]
  disable_transitions_on_change: boolean
  nonce: string
}
