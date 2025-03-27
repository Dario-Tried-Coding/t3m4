import { Facets, Implicit_Opt } from './config/facets'
import { Generic_Strat } from './config/generic'
import { Config } from './config/index'
import { Mode_Light_Dark_Strat_Obj, Mode_Mono_Strat_Obj, Mode_Strat, Mode_System_Strat_Obj } from './config/mode'
import { Light_Dark_Opt, Mono_Opt, Multi_Opt, System_Opt } from './config/facets'
import { DEFAULT } from './constants'
import { MODES } from './constants/modes'

export type Unsafe_State = Map<string, Map<string, string>>

export type State<Fs extends Facets, C extends Config<Fs>> = {
  [I in keyof C]: I extends keyof Fs
    ? {
        [F in keyof Fs[I] as Fs[I][F] extends false ? never : F]: F extends keyof C[I]
          ? C[I][F] extends Generic_Strat
            ? Fs[I][F] extends Implicit_Opt
              ? DEFAULT
              : Fs[I][F] extends Mono_Opt
                ? Fs[I][F]
                : Fs[I][F] extends Multi_Opt
                  ? Fs[I][F][number]
                  : never
            : C[I][F] extends Mode_Strat
              ? Fs[I][F] extends Implicit_Opt
                ? C[I][F] extends Mode_Mono_Strat_Obj
                  ? DEFAULT
                  : C[I][F] extends Mode_Light_Dark_Strat_Obj
                    ? MODES['LIGHT'] | MODES['DARK']
                    : C[I][F] extends Mode_System_Strat_Obj
                      ? MODES['LIGHT'] | MODES['DARK'] | MODES['SYSTEM']
                      : never
                : Fs[I][F] extends Mono_Opt
                  ? Fs[I][F]
                  : Fs[I][F] extends Multi_Opt
                    ? Fs[I][F][number]
                    : Fs[I][F] extends Light_Dark_Opt
                      ? (Fs[I][F]['light'] extends string ? Fs[I][F]['light'] : MODES['LIGHT']) | (Fs[I][F]['dark'] extends string ? Fs[I][F]['dark'] : MODES['DARK']) | (Fs[I][F]['custom'] extends string[] ? Fs[I][F]['custom'][number] : never)
                      : Fs[I][F] extends System_Opt
                        ?
                            | (Fs[I][F]['light'] extends string ? Fs[I][F]['light'] : MODES['LIGHT'])
                            | (Fs[I][F]['dark'] extends string ? Fs[I][F]['dark'] : MODES['DARK'])
                            | (Fs[I][F]['system'] extends string ? Fs[I][F]['system'] : MODES['SYSTEM'])
                            | (Fs[I][F]['custom'] extends string[] ? Fs[I][F]['custom'][number] : never)
                        : never
              : never
          : never
      }
    : never
}