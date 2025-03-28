import { Generic_Mono_Strat_Obj, Generic_Multi_Strat_Obj, Generic_Strat_Obj } from './generic'
import { Mode_Light_Dark_Strat_Obj, Mode_Mono_Strat_Obj, Mode_Multi_Strat_Obj, Mode_Strat_Obj, Mode_System_Strat_Obj } from './mode'
import { DEFAULT } from '../../constants/miscellaneous'
import { Implicit_Opt, Light_Dark_Opt, Mono_Opt, Multi_Opt, Options, System_Opt } from '../options'

export namespace Config {
  export type Dynamic<Opts extends Options.Schema> = {
    [I in keyof Opts]: {
      [F in keyof Opts[I] as Opts[I][F] extends false ? never : F]: Opts[I][F] extends Implicit_Opt
        ? Generic_Mono_Strat_Obj<DEFAULT> | Mode_Mono_Strat_Obj<DEFAULT> | Mode_System_Strat_Obj<{}> | Mode_Light_Dark_Strat_Obj<{}>
        : Opts[I][F] extends Mono_Opt
          ? Generic_Mono_Strat_Obj<Opts[I][F]> | Mode_Mono_Strat_Obj<Opts[I][F]>
          : Opts[I][F] extends Multi_Opt
            ? Generic_Multi_Strat_Obj<Opts[I][F]> | Mode_Multi_Strat_Obj<Opts[I][F]>
            : Opts[I][F] extends Light_Dark_Opt
              ? Mode_Light_Dark_Strat_Obj<Opts[I][F]> | Mode_System_Strat_Obj<Opts[I][F]>
              : Opts[I][F] extends System_Opt
                ? Mode_System_Strat_Obj<Opts[I][F]>
                : never
    }
  }

  export type Static = {
    [island: string]: {
      [facet: string]: Generic_Strat_Obj | Mode_Strat_Obj
    }
  }
}
