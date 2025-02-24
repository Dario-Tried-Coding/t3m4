import { UndefinedOr } from '@repo/typescript-utils/nullable'
import { GenericMono, GenericMulti, GenericProp } from './generic'
import { ModeLightDark, ModeMono, ModeMulti, ModeProp, ModeSystem } from './mode'
import { ExplicitProp, Props, SystemValues } from './props'
import { HasKey } from '@repo/typescript-utils/object'

export type ExtractProps<Ps extends Props> = Ps[number] extends infer U ? (U extends string ? U : U extends ExplicitProp ? U['prop'] : never) : never
type ResolveProp<P extends Props[number]> = P extends ExplicitProp
  ? P['options'] extends string
    ? GenericMono<P['options']> | ModeMono<P['options']>
    : P['options'] extends string[]
      ? GenericMulti<P['options']> | ModeMulti<P['options']>
      : P['options'] extends SystemValues
        ? HasKey<P['options'], 'system'> extends true
          ? ModeSystem<P['options']>
          : ModeSystem<P['options']> | ModeLightDark<P['options']>
        : never
  : GenericMono<'default'> | ModeMono<'default'> | ModeSystem<{}> | ModeLightDark<{}>

export type Config<Ps extends UndefinedOr<Props> = undefined> = Ps extends Props
  ? {
      [P in ExtractProps<Ps>]: ResolveProp<Extract<Ps[number], { prop: P } | P>>
    }
  : {
      [key: string]: GenericProp | ModeProp
    }
