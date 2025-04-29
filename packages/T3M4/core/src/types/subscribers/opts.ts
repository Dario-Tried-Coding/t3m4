import { LinientAutoComplete } from '@t3m4/utils'
import { DEFAULT } from '../constants/miscellaneous'
import { MODES } from '../constants/modes'

export namespace Opts {
  export type Default = DEFAULT
  export type Mono<T extends 'primitive' | 'suggested' = 'suggested'> = T extends 'primitive' ? string : LinientAutoComplete<Opts.Default>
  export type Multi = string[]
  export type System<T extends 'primitive' | 'suggested' = 'suggested'> = {
    light: T extends 'primitive' ? string : LinientAutoComplete<MODES['light']>
    dark: T extends 'primitive' ? string : LinientAutoComplete<MODES['dark']>
    system: T extends 'primitive' ? string : LinientAutoComplete<MODES['system']>
    custom?: string[]
  }
}
