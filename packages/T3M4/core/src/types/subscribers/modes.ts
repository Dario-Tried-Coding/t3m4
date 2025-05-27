import { LinientAutoComplete } from '@t3m4/utils'
import { Schema } from './schema'
import { Store_Strat } from '../constants/strats'
import { Selector } from '../constants/selectors'

type Base = {
  storageKey?: LinientAutoComplete<'modes' | 'themes'>
  strategy?: Store_Strat
  store?: boolean
}

export type Modes<Sc extends Schema> = Base & {
  islands?: {
    [I in keyof Schema.Polished<Sc> as Schema.Polished<Sc>[I] extends Schema.Island.Mode ? I : never]?: {
      selectors?: Selector[]
      store?: boolean
    }
  }
}
export namespace Modes {
  export type Static = Base & {
    islands?: {
      [island: string]:
        | {
            selectors?: Selector[]
            store?: boolean
          }
        | undefined
    }
  }
}