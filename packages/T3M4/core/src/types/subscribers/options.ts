import { UndefinedOr } from '@t3m4/utils/nullables'
import { Config } from './config'
import { Schema } from './schema'
import { State } from './state'

export type Options<Sc extends UndefinedOr<Schema> = undefined, C extends UndefinedOr<Config<Sc>> = undefined, St extends UndefinedOr<State<Sc, C>> = undefined> = [Sc, C, St] extends [Schema, Config<Schema>, State<Sc, C>]
  ? {
      [I in keyof St]: {
        [F in keyof St[I]]: St[I][F][]
      }
    }
  : {
      [island: string]: {
        [facet: string]: string[]
      }
    }
