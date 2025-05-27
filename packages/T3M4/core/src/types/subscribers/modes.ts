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

const schema = {
  root: {
    mode: { light: 'custom-light', dark: 'dark', system: 'system', custom: ['custom1', 'custom2'] },
    facets: {
      color: ['zinc', 'blue', 'red', 'rose', 'orange', 'green', 'yellow', 'violet'],
      radius: ['0', '0.3', '0.5', '0.75', '1'],
    },
  },
  switch: {
    mode: ['custom1', 'custom2'],
  },
  footer: {
    facets: {
      font: ['sans', 'serif', 'mono'],
    },
  },
} as const satisfies Schema.Suggested
export type TSchema = typeof schema

type test = Modes<TSchema>['islands']