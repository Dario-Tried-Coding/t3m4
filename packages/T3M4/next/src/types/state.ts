import { Config, ExplicitProp, ExtractProps, Prop, Props, SystemValues } from '@t3m4/core/types/config'

type ExtractProp<Ps extends Props, P extends Prop> = P extends string ? (P extends ExtractProps<Ps> ? P : never) : P extends ExplicitProp ? (P['prop'] extends ExtractProps<Ps> ? P['prop'] : never) : never

export type State<Ps extends Props, C extends Config<Ps>> = {
  [P in Ps[number] as P extends string ? P : P extends ExplicitProp ? P['prop'] : never]: ExtractProp<Ps, P> extends keyof C
    ? C[ExtractProp<Ps, P>]['strategy'] extends 'mono'
      ? P extends string
        ? 'default'
        : P extends ExplicitProp
          ? P['options']
          : never
      : C[ExtractProp<Ps, P>]['strategy'] extends 'multi'
        ? P extends ExplicitProp
          ? P['options'] extends string[]
            ? P['options'][number]
            : never
          : never
        : C[ExtractProp<Ps, P>]['strategy'] extends 'light&dark'
          ? P extends string
            ? 'light' | 'dark'
            : P extends ExplicitProp
              ? P['options'] extends SystemValues
                ? 
                  | (P['options']['light'] extends string ? P['options']['light'] : 'light')
                  | (P['options']['dark'] extends string ? P['options']['dark'] : 'dark')
                  | (P['options']['custom'] extends string[] ? P['options']['custom'][number] : never)
                : never
              : never
          : C[ExtractProp<Ps, P>]['strategy'] extends 'system'
            ? P extends string
              ? 'light' | 'dark' | 'system'
              : P extends ExplicitProp
                ? P['options'] extends SystemValues
                  ?
                      | (P['options']['light'] extends string ? P['options']['light'] : 'light')
                      | (P['options']['dark'] extends string ? P['options']['dark'] : 'dark')
                      | (P['options']['system'] extends string ? P['options']['system'] : 'system')
                      | (P['options']['custom'] extends string[] ? P['options']['custom'][number] : never)
                  : never
                : never
            : never
    : never
}