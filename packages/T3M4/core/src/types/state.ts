import { Config, Props } from './config/index'
import { Mode_Light_Dark_Strat_Obj, Mode_Mono_Strat_Obj, Mode_Multi_Strat_Obj, Mode_System_Strat_Obj } from './config/mode'
import { Explicit_Generic_Prop, Explicit_Mode_Prop, Generic_Prop, Implicit_Generic_Prop, Light_Dark_Opt, Mono_Opt, Multi_Opt, System_Opt } from './config/props'
import { DEFAULT } from './constants'
import { MODES } from './constants/modes'

export type State<Ps extends Props, C extends Config<Ps>> = {
  [I in keyof C]: I extends keyof Ps
    ? (Ps[I]['props'] extends Generic_Prop[]
        ? {
            [P in Ps[I]['props'][number] as P extends Explicit_Generic_Prop ? P['prop'] : P]: P extends Implicit_Generic_Prop
              ? DEFAULT
              : P extends Explicit_Generic_Prop
                ? P['options'] extends Mono_Opt
                  ? P['options']
                  : P['options'] extends Multi_Opt
                    ? P['options'][number]
                    : DEFAULT
                : never
          }
        : {}) &
        (C[I] extends { mode: any }
          ? {
              [K in C[I]['mode'] extends { prop: string } ? C[I]['mode']['prop'] : 'mode']: C[I]['mode'] extends Mode_Mono_Strat_Obj
                ? Ps[I]['mode'] extends Explicit_Mode_Prop
                  ? Ps[I]['mode']['options'] extends Mono_Opt
                    ? Ps[I]['mode']['options']
                    : DEFAULT
                  : DEFAULT
                : C[I]['mode'] extends Mode_Multi_Strat_Obj
                  ? Ps[I]['mode'] extends Explicit_Mode_Prop
                    ? Ps[I]['mode']['options'] extends Multi_Opt
                      ? Ps[I]['mode']['options'][number]
                      : never
                    : never
                  : C[I]['mode'] extends Mode_Light_Dark_Strat_Obj
                    ? Ps[I]['mode'] extends Explicit_Mode_Prop
                      ? Ps[I]['mode']['options'] extends Light_Dark_Opt
                        ?
                            | (Ps[I]['mode']['options']['light'] extends string ? Ps[I]['mode']['options']['light'] : 'light')
                            | (Ps[I]['mode']['options']['dark'] extends string ? Ps[I]['mode']['options']['dark'] : 'dark')
                            | (Ps[I]['mode']['options']['custom'] extends string[] ? Ps[I]['mode']['options']['custom'][number] : never)
                        : MODES['LIGHT'] | MODES['DARK']
                      : MODES['LIGHT'] | MODES['DARK']
                    : C[I]['mode'] extends Mode_System_Strat_Obj
                      ? Ps[I]['mode'] extends Explicit_Mode_Prop
                        ? Ps[I]['mode']['options'] extends System_Opt
                          ?
                              | (Ps[I]['mode']['options']['light'] extends string ? Ps[I]['mode']['options']['light'] : 'light')
                              | (Ps[I]['mode']['options']['dark'] extends string ? Ps[I]['mode']['options']['dark'] : 'dark')
                              | (Ps[I]['mode']['options']['system'] extends string ? Ps[I]['mode']['options']['system'] : 'system')
                              | (Ps[I]['mode']['options']['custom'] extends string[] ? Ps[I]['mode']['options']['custom'][number] : never)
                          : MODES['LIGHT'] | MODES['DARK'] | MODES['SYSTEM']
                        : MODES['LIGHT'] | MODES['DARK'] | MODES['SYSTEM']
                      : never
            }
          : {})
    : never
}

export type Unsafe_State = Map<string, Map<string, string>>
