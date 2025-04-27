import { UndefinedOr } from '@t3m4/utils/nullables'
import { FACETS } from '../constants/facets'
import { Config } from './config'
import { Schema } from './schema'
import { COLOR_SCHEME } from '../constants/color-schemes'

type HasMode<T> = Extract<T, { type: FACETS['MODE'] }> extends never ? false : true

export type Color_Schemes<S extends UndefinedOr<Schema> = undefined, C extends UndefinedOr<Config<S>> = undefined> = [S, C] extends [Schema, Config<S>]
  ? {
      [I in keyof C as HasMode<{ [F in keyof C[I]]: C[I][F] }[keyof C[I]]> extends true ? I : never]: COLOR_SCHEME
    }
  : {
      [island: string]: COLOR_SCHEME
    }

export type Pick_Island_Color_Scheme<Sc extends Schema, C extends Config<Sc>, CSs extends Color_Schemes<Sc, C>, I extends keyof Sc> = I extends keyof C ? (I extends keyof CSs ? CSs[I] : undefined) : never