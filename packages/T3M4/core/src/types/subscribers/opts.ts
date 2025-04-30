import { LinientAutoComplete } from '@t3m4/utils'
import { FACETS } from '../constants/facets'
import { DEFAULT } from '../constants/miscellaneous'
import { MODES } from '../constants/modes'
import { Brand, Brand_Map } from './brand'
import { STRATS } from '../constants/strats'

export namespace Opts {
  export type Default = DEFAULT

  export namespace Primitive {
    export type Mono = string
    export type Multi = Mono[]
    export type System = {
      light: Mono
      dark: Mono
      system?: Mono
      custom?: Multi
    }

    export namespace Suggested {
      export type Mono = LinientAutoComplete<Default>
      export type System = {
        light: LinientAutoComplete<MODES['light']>
        dark: LinientAutoComplete<MODES['dark']>
        system?: LinientAutoComplete<MODES['system']>
        custom?: string[]
      }
    }
  }

  export namespace Branded {
    export type Mono<B extends Omit<Partial<Brand_Map>, 'mode'> & Pick<Brand_Map, 'type' | 'facet' | 'strat'>, T extends Primitive.Mono = Primitive.Mono> = Brand<T, B>

    export type Multi<B extends Omit<Partial<Brand_Map>, 'mode'> & Pick<Brand_Map, 'type' | 'facet' | 'strat'>, T extends readonly Primitive.Mono[]> = { [I in keyof T]: Brand<T[I], B> }

    export type System<B extends Omit<Partial<Brand_Map>, 'type' | 'mode'> & Pick<Brand_Map, 'facet' | 'strat'>, T extends Primitive.System = Primitive.System> = {
      light: Mono<B & { type: FACETS['mode']; mode: MODES['light'] }, T['light']>
      dark: Mono<B & { type: FACETS['mode']; mode: MODES['dark'] }, T['dark']>
    } & (T['system'] extends Primitive.Mono ? { system: Mono<B & { type: FACETS['mode']; mode: MODES['system'] }, NonNullable<T['system']>> } : {}) &
      (T['custom'] extends Primitive.Multi ? { custom: Multi<B & { type: FACETS['mode']; mode: MODES['custom'] }, NonNullable<T['custom']>> } : {})
  }
}
