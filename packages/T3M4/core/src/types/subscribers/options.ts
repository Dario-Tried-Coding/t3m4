import { UndefinedOr } from '@t3m4/utils/nullables'
import { Config } from './config'
import { Schema } from './schema'
import { State } from './state'

export type Options<Sc extends UndefinedOr<Schema> = undefined, C extends UndefinedOr<Config<Sc>> = undefined, St extends UndefinedOr<State<Sc, C>> = undefined> = [Sc, C, St] extends [Schema, Config<Sc>, State<Sc, C>]
  ? {
      [I in keyof St]: I extends keyof Sc
        ? I extends keyof C
          ? {
              [F in keyof St[I]]: St[I][F][]
            }
          : never
        : never
    }
  : {
      [island: string]: {
        [facet: string]: string[]
      }
    }

export type Pick_Island_Options<Sc extends Schema, C extends Config<Sc>, S extends State<Sc, C>, O extends Options<Sc, C, S>, I extends keyof Sc> = I extends keyof C
  ? I extends keyof S
    ? I extends keyof O
      ? O[I] extends Options<Sc, C, S>[keyof Options<Sc, C, S>]
        ? O[I]
        : never
      : never
    : never
  : never