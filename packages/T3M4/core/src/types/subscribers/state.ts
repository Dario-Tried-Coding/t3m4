import { UndefinedOr } from '@t3m4/utils/nullables'
import { DEFAULT } from '../constants/miscellaneous'
import { MODES } from '../constants/modes'
import { Config } from './config'
import { Generic_Strat } from './config/generic'
import { Mode_Light_Dark_Strat_Obj, Mode_Mono_Strat_Obj, Mode_Strat, Mode_System_Strat_Obj } from './config/mode'
import { Implicit_Opt, Light_Dark_Opt, Mono_Opt, Multi_Opt, Schema, System_Opt } from './schema'

export type State<Sc extends UndefinedOr<Schema> = undefined, C extends UndefinedOr<Config<Sc>> = undefined> = [Sc, C] extends [Schema, Config<Sc>]
  ? {
      [I in keyof C]: I extends keyof Sc
        ? {
            [F in keyof Sc[I] as Sc[I][F] extends false ? never : F]: F extends keyof C[I]
              ? C[I][F] extends Generic_Strat
                ? Sc[I][F] extends Implicit_Opt
                  ? DEFAULT
                  : Sc[I][F] extends Mono_Opt
                    ? Sc[I][F]
                    : Sc[I][F] extends Multi_Opt
                      ? Sc[I][F][number]
                      : never
                : C[I][F] extends Mode_Strat
                  ? Sc[I][F] extends Implicit_Opt
                    ? C[I][F] extends Mode_Mono_Strat_Obj
                      ? DEFAULT
                      : C[I][F] extends Mode_Light_Dark_Strat_Obj
                        ? MODES['LIGHT'] | MODES['DARK']
                        : C[I][F] extends Mode_System_Strat_Obj
                          ? MODES['LIGHT'] | MODES['DARK'] | MODES['SYSTEM']
                          : never
                    : Sc[I][F] extends Mono_Opt
                      ? Sc[I][F]
                      : Sc[I][F] extends Multi_Opt
                        ? Sc[I][F][number]
                        : Sc[I][F] extends Light_Dark_Opt
                          ? (Sc[I][F]['light'] extends string ? Sc[I][F]['light'] : MODES['LIGHT']) | (Sc[I][F]['dark'] extends string ? Sc[I][F]['dark'] : MODES['DARK']) | (Sc[I][F]['custom'] extends string[] ? Sc[I][F]['custom'][number] : never)
                          : Sc[I][F] extends System_Opt
                            ?
                                | (Sc[I][F]['light'] extends string ? Sc[I][F]['light'] : MODES['LIGHT'])
                                | (Sc[I][F]['dark'] extends string ? Sc[I][F]['dark'] : MODES['DARK'])
                                | (Sc[I][F]['system'] extends string ? Sc[I][F]['system'] : MODES['SYSTEM'])
                                | (Sc[I][F]['custom'] extends string[] ? Sc[I][F]['custom'][number] : never)
                            : never
                  : never
              : never
          }
        : never
    }
  : {
      [island: string]: {
        [facet: string]: string
      }
  }

export type Pick_Island_State<Sc extends Schema, C extends Config<Sc>, S extends State<Sc, C>, I extends keyof Sc> = I extends keyof C ? (I extends keyof S ? (S[I] extends S[keyof S] ? S[I] : never) : never) : never