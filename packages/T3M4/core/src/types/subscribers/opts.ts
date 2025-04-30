import { LinientAutoComplete } from '@t3m4/utils'
import { FACETS } from '../constants/facets'
import { DEFAULT } from '../constants/miscellaneous'
import { MODES } from '../constants/modes'
import { Brand, Brand_Map, Unbrand } from './brand'

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
  }

  export namespace Branded {
    export type Mono<B extends Partial<Brand_Map> & Pick<Brand_Map, 'type' | 'facet'>, T extends Primitive.Mono = Primitive.Mono> = Brand<T, B>
    export type Multi<B extends Partial<Brand_Map> & Pick<Brand_Map, 'type' | 'facet'>, T extends Primitive.Multi = Primitive.Multi> = { [O in T[number]]: Brand<O, B> }[T[number]][]
    export type System<B extends Partial<Brand_Map> & Pick<Brand_Map, 'facet'>, T extends Primitive.System = Primitive.System> = {
      light: Brand<T['light'], B & { type: FACETS['mode']; mode: MODES['light'] }>
      dark: Brand<T['dark'], B & { type: FACETS['mode']; mode: MODES['dark'] }>
      system?: Brand<NonNullable<T['system']>, B & { type: FACETS['mode']; mode: MODES['system'] }>
      custom?: { [O in NonNullable<T['custom']>[number]]: Brand<O, B & { type: FACETS['mode']; mode: MODES['custom'] }> }[NonNullable<T['custom']>[number]][]
    }
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