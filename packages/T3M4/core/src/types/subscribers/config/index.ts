import { DEFAULT } from '../../constants/miscellaneous'
import { Implicit_Opt, Light_Dark_Opt, Mono_Opt, Multi_Opt, Schema, System_Opt } from '../schema'
import { Generic_Mono_Strat_Obj, Generic_Multi_Strat_Obj, Generic_Strat_Obj } from './generic'
import { Mode_Light_Dark_Strat_Obj, Mode_Mono_Strat_Obj, Mode_Multi_Strat_Obj, Mode_Strat_Obj, Mode_System_Strat_Obj } from './mode'

export namespace Config {
  export namespace Facet {
    export type Dynamic<S extends Schema, I extends keyof S, F extends keyof S[I]> = S[I][F] extends Implicit_Opt
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

    export type Static = Generic_Strat_Obj | Mode_Strat_Obj
  }

  export namespace Island {
    export type Dynamic<S extends Schema, I extends keyof S> = {
      [F in keyof S[I] as S[I][F] extends false ? never : F]: Config.Facet.Dynamic<S, I, F>
    }

    export type Static = {
      [facet: string]: Config.Facet.Static
    }
  }

  export namespace All {
    export type Dynamic<S extends Schema> = {
      [I in keyof S]: Config.Island.Dynamic<S, I>
    }

    export type Static = {
      [island: string]: Config.Island.Static
    }
  }
}
