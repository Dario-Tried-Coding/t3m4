import { UndefinedOr } from '@t3m4/utils/nullables'
import { HasKey } from '@t3m4/utils/objects'
import { Explicit_Generic_Prop, Explicit_Mode_Prop, Generic_Prop, Implicit_Generic_Prop, Mode_Prop, Mono_Opt, Multi_Opt, Props, System_Opt } from './props'
import { Generic_Mono_Strat_Obj, Generic_Multi_Strat_Obj, Generic_Strat_Obj } from './generic'
import { Mode_Light_Dark_Strat_Obj, Mode_Mono_Strat_Obj, Mode_Multi_Strat_Obj, Mode_Strat_Obj, Mode_System_Strat_Obj } from './mode'

type Default_Resolved_Generic_Strat_Obj = Generic_Mono_Strat_Obj<'default'>
export type Resolve_Generic_Strat_Obj<P extends Generic_Prop> = P extends Explicit_Generic_Prop
  ? P['options'] extends string
    ? Generic_Mono_Strat_Obj<P['options']>
    : P['options'] extends string[]
      ? Generic_Multi_Strat_Obj<P['options']>
      : Default_Resolved_Generic_Strat_Obj
  : P extends Implicit_Generic_Prop
    ? Default_Resolved_Generic_Strat_Obj
    : never

type Default_Resolved_Mode_Strat_Obj = Mode_Mono_Strat_Obj<'default'> | Mode_System_Strat_Obj<{}> | Mode_Light_Dark_Strat_Obj<{}>
export type Resolve_Mode_Strat_Obj<P extends Mode_Prop> = (P extends Explicit_Mode_Prop
  ? P['options'] extends Mono_Opt
    ? Mode_Mono_Strat_Obj<P['options']>
    : P['options'] extends Multi_Opt
      ? Mode_Multi_Strat_Obj<P['options']>
      : P['options'] extends System_Opt
        ? HasKey<P['options'], 'system'> extends true
          ? Mode_System_Strat_Obj<P['options']>
          : Mode_System_Strat_Obj<P['options']> | Mode_Light_Dark_Strat_Obj<P['options']>
        : Default_Resolved_Mode_Strat_Obj
  : P extends true
    ? Default_Resolved_Mode_Strat_Obj
    : {}) &
  (P extends Explicit_Mode_Prop ? (P['prop'] extends string ? { prop: P['prop'] } : {}) : {})

export type Config<Ps extends UndefinedOr<Props> = undefined> = Ps extends Props
  ? {
      [I in keyof Ps]: (Ps[I]['props'] extends Generic_Prop[]
        ? {
            props: {
              [P in Ps[I]['props'][number] as P extends Explicit_Generic_Prop ? P['prop'] : P]: Resolve_Generic_Strat_Obj<P>
            }
          }
        : {}) &
        (Ps[I]['mode'] extends Mode_Prop ? { mode: Resolve_Mode_Strat_Obj<Ps[I]['mode']> } : {})
    }
  : {
      [island: string]: {
        props?: {
          [prop: string]: Generic_Strat_Obj
        }
        mode?: Mode_Strat_Obj
      }
    }
