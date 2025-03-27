import { UndefinedOr } from '@t3m4/utils/nullables'
import { DEFAULT } from '../constants'
import { Facets, Implicit_Opt, Light_Dark_Opt, Mono_Opt, Multi_Opt, System_Opt } from './facets'
import { Generic_Mono_Strat_Obj, Generic_Multi_Strat_Obj, Generic_Strat_Obj } from './generic'
import { Mode_Light_Dark_Strat_Obj, Mode_Mono_Strat_Obj, Mode_Multi_Strat_Obj, Mode_Strat_Obj, Mode_System_Strat_Obj } from './mode'

export type Config<Fs extends UndefinedOr<Facets> = undefined> = Fs extends Facets
  ? {
      [I in keyof Fs]: {
        [F in keyof Fs[I] as Fs[I][F] extends false ? never : F]: Fs[I][F] extends Implicit_Opt
          ? Generic_Mono_Strat_Obj<DEFAULT> | Mode_Mono_Strat_Obj<DEFAULT> | Mode_System_Strat_Obj<{}> | Mode_Light_Dark_Strat_Obj<{}>
          : Fs[I][F] extends Mono_Opt
            ? Generic_Mono_Strat_Obj<Fs[I][F]> | Mode_Mono_Strat_Obj<Fs[I][F]>
            : Fs[I][F] extends Multi_Opt
              ? Generic_Multi_Strat_Obj<Fs[I][F]> | Mode_Multi_Strat_Obj<Fs[I][F]>
              : Fs[I][F] extends Light_Dark_Opt
                ? Mode_Light_Dark_Strat_Obj<Fs[I][F]> | Mode_System_Strat_Obj<Fs[I][F]>
                : Fs[I][F] extends System_Opt
                  ? Mode_System_Strat_Obj<Fs[I][F]>
                  : never
      }
    }
  : {
      [island: string]: {
        [facet: string]: Generic_Strat_Obj | Mode_Strat_Obj
      }
    }