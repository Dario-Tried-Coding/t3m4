import { LinientAutoComplete } from '@t3m4/utils'
import { FACETS } from '../constants/facets'
import { DEFAULT } from '../constants/miscellaneous'
import { MODES } from '../constants/modes'
import { Brand, Brand_Map } from './brand'

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
    export type Mono<T extends Primitive.Mono, B extends Partial<Brand_Map> & Pick<Brand_Map, 'type' | 'strat'>> = Brand<T, B>

    export type Multi<T extends readonly Primitive.Mono[], B extends Partial<Brand_Map> &  Pick<Brand_Map, 'type' | 'strat'>> = { [I in keyof T]: Brand<T[I], B> }

    export type System<T extends Primitive.System, B extends Pick<Brand_Map, 'facet' | 'strat'>> = {
      light: Mono<T['light'], B & { type: FACETS['mode']; mode: MODES['light'] }>
      dark: Mono<T['dark'], B & { type: FACETS['mode']; mode: MODES['dark'] }>
    } & (T['system'] extends Primitive.Mono ? { system: Mono<NonNullable<T['system']>, B & { type: FACETS['mode']; mode: MODES['system'] }> } : {}) &
      (T['custom'] extends Primitive.Multi ? { custom: Multi<NonNullable<T['custom']>, B & { type: FACETS['mode']; mode: MODES['custom'] }> } : {})
  }
}
