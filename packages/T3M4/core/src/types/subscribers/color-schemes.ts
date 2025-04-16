import { UndefinedOr } from '@t3m4/utils/nullables'
import { FACETS } from '../constants/facets'
import { RESOLVED_MODE } from '../constants/modes'
import { Config } from './config'
import { Schema } from './schema'

type HasMode<T> = Extract<T, { type: FACETS['MODE'] }> extends never ? false : true

export type Color_Schemes<S extends UndefinedOr<Schema> = undefined, C extends UndefinedOr<Config<S>> = undefined> = [S, C] extends [Schema, Config<S>]
  ? {
      [I in keyof C as HasMode<{ [F in keyof C[I]]: C[I][F] }[keyof C[I]]> extends true ? I : never]: RESOLVED_MODE
    }
  : {
      [island: string]: RESOLVED_MODE
    }

export type Pick_Island_Color_Scheme<Sc extends Schema, C extends Config<Sc>, CSs extends Color_Schemes<Sc, C>, I extends keyof Sc> = I extends keyof C ? (I extends keyof CSs ? CSs[I] : undefined) : never