import { UndefinedOr } from '@t3m4/utils/nullables'
import { DEFAULT } from '../../constants/miscellaneous'
import { Implicit_Opt, Light_Dark_Opt, Mono_Opt, Multi_Opt, Schema, System_Opt } from '../schema'
import { Generic_Mono_Strat_Obj, Generic_Multi_Strat_Obj, Generic_Strat_Obj } from './generic'
import { Mode_Light_Dark_Strat_Obj, Mode_Mono_Strat_Obj, Mode_Multi_Strat_Obj, Mode_Strat_Obj, Mode_System_Strat_Obj } from './mode'

export type Config<S extends UndefinedOr<Schema> = undefined> = S extends Schema
  ? {
      [I in keyof S]: {
        [F in keyof S[I] as S[I][F] extends false ? never : F]: S[I][F] extends Implicit_Opt
          ? Generic_Mono_Strat_Obj<DEFAULT> | Mode_Mono_Strat_Obj<DEFAULT> | Mode_System_Strat_Obj<{}> | Mode_Light_Dark_Strat_Obj<{}>
          : S[I][F] extends Mono_Opt
            ? Generic_Mono_Strat_Obj<S[I][F]> | Mode_Mono_Strat_Obj<S[I][F]>
            : S[I][F] extends Multi_Opt
              ? Generic_Multi_Strat_Obj<S[I][F]> | Mode_Multi_Strat_Obj<S[I][F]>
              : S[I][F] extends Light_Dark_Opt
                ? Mode_Light_Dark_Strat_Obj<S[I][F]> | Mode_System_Strat_Obj<S[I][F]>
                : S[I][F] extends System_Opt
                  ? Mode_System_Strat_Obj<S[I][F]>
                  : never
      }
    }
  : {
      [island: string]: {
        [facet: string]: Generic_Strat_Obj | Mode_Strat_Obj
      }
    }

export type Pick_Island_Config<Sc extends Schema, C extends Config<Sc>, I extends keyof Sc> = I extends keyof C ? (C[I] extends Config<Sc>[keyof Config<Sc>] ? C[I] : never) : never

const schema = {
  root: {
    mode: { light: 'custom-light' },
    radius: ['0', '0.3', '0.5', '0.75', '1'],
    color: ['zinc', 'red', 'rose', 'orange', 'green', 'blue', 'yellow', 'violet'],
  },
  test: {
    mode: true,
  },
} as const satisfies Schema
type TSchema = typeof schema

const config = {
  root: {
    mode: {
      type: 'mode',
      strategy: 'system',
      preferred: 'custom-light',
      fallback: 'custom-light',
      selector: 'data-attribute',
    },
    color: {
      type: 'facet',
      strategy: 'multi',
      preferred: 'orange',
    },
    radius: {
      type: 'facet',
      strategy: 'multi',
      preferred: '0.3',
    },
  },
  test: {
    mode: {
      type: 'facet',
      strategy: 'mono',
      preferred: 'default'
    }
  },
} as const satisfies Config<TSchema>
type TConfig = typeof config

type test = Pick_Island_Config<TSchema, TConfig, 'test'>