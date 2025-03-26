import { UndefinedOr } from '@t3m4/utils/nullables'
import { HasKey } from '@t3m4/utils/objects'
import { GenericMono, GenericMulti, GenericProp } from './generic'
import { ModeLightDark, ModeMono, ModeMulti, ModeSystem } from './mode'
import { MonoOpt, MultiOpt, Props, SystemValues } from './props'

type GenericProps = NonNullable<Props[keyof Props]['props']>
type ModeProp = NonNullable<Props[keyof Props]['mode']>

type Resolve_GenericProp<P extends GenericProps[number]> = P['options'] extends string
  ? GenericMono<P['options']> | ModeMono<P['options']>
  : P['options'] extends string[]
    ? GenericMulti<P['options']> | ModeMulti<P['options']>
    : GenericMono<'default'>

type Default_Resolved_ModeProp = ModeMono<'default'> | ModeSystem<{}> | ModeLightDark<{}>
type Resolve_ModeProp<P extends ModeProp> =
  P extends Exclude<ModeProp, boolean>
    ? P['options'] extends MonoOpt
      ? ModeMono<P['options']>
      : P['options'] extends MultiOpt
        ? ModeMulti<P['options']>
        : P['options'] extends SystemValues
          ? HasKey<P['options'], 'system'> extends true
            ? ModeSystem<P['options']>
            : ModeSystem<P['options']> | ModeLightDark<P['options']>
          : never
    : P extends true
      ? Default_Resolved_ModeProp
      : never

export type Config<Ps extends UndefinedOr<Props> = undefined> = Ps extends Props
  ? {
      [I in keyof Ps]: (Ps[I]['props'] extends GenericProps
        ? {
            props: {
              [P in Ps[I]['props'][number] as P['prop']]: Resolve_GenericProp<P>
            }
          }
        : {}) &
        (Ps[I]['mode'] extends ModeProp ? { mode: Resolve_ModeProp<Ps[I]['mode']> } : {})
    }
  : {
      [island: string]: {
        [prop: string]: GenericProp | ModeProp
      }
    }
