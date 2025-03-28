import { DEFAULT } from '../constants/miscellaneous'
import { MODES } from '../constants/modes'
import { Config } from './config'
import { Generic_Strat } from './config/generic'
import { Mode_Light_Dark_Strat_Obj, Mode_Mono_Strat_Obj, Mode_Strat, Mode_System_Strat_Obj } from './config/mode'
import { Implicit_Opt, Light_Dark_Opt, Mono_Opt, Multi_Opt, Options, System_Opt } from './options'

export namespace State {
  export type Dynamic<Opts extends Options.Schema, C extends Config.Dynamic<Opts>> = {
    [I in keyof C]: I extends keyof Opts
      ? {
          [F in keyof Opts[I] as Opts[I][F] extends false ? never : F]: F extends keyof C[I]
            ? C[I][F] extends Generic_Strat
              ? Opts[I][F] extends Implicit_Opt
                ? DEFAULT
                : Opts[I][F] extends Mono_Opt
                  ? Opts[I][F]
                  : Opts[I][F] extends Multi_Opt
                    ? Opts[I][F][number]
                    : never
              : C[I][F] extends Mode_Strat
                ? Opts[I][F] extends Implicit_Opt
                  ? C[I][F] extends Mode_Mono_Strat_Obj
                    ? DEFAULT
                    : C[I][F] extends Mode_Light_Dark_Strat_Obj
                      ? MODES['LIGHT'] | MODES['DARK']
                      : C[I][F] extends Mode_System_Strat_Obj
                        ? MODES['LIGHT'] | MODES['DARK'] | MODES['SYSTEM']
                        : never
                  : Opts[I][F] extends Mono_Opt
                    ? Opts[I][F]
                    : Opts[I][F] extends Multi_Opt
                      ? Opts[I][F][number]
                      : Opts[I][F] extends Light_Dark_Opt
                        ?
                            | (Opts[I][F]['light'] extends string ? Opts[I][F]['light'] : MODES['LIGHT'])
                            | (Opts[I][F]['dark'] extends string ? Opts[I][F]['dark'] : MODES['DARK'])
                            | (Opts[I][F]['custom'] extends string[] ? Opts[I][F]['custom'][number] : never)
                        : Opts[I][F] extends System_Opt
                          ?
                              | (Opts[I][F]['light'] extends string ? Opts[I][F]['light'] : MODES['LIGHT'])
                              | (Opts[I][F]['dark'] extends string ? Opts[I][F]['dark'] : MODES['DARK'])
                              | (Opts[I][F]['system'] extends string ? Opts[I][F]['system'] : MODES['SYSTEM'])
                              | (Opts[I][F]['custom'] extends string[] ? Opts[I][F]['custom'][number] : never)
                          : never
                : never
            : never
        }
      : never
  }

  export type Static = {
    [island: string]: {
      [facet: string]: string
    }
  }
}