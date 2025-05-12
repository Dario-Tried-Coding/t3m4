import { LinientAutoComplete } from '@t3m4/utils'
import { Color_Scheme } from '../../constants/color-schemes'
import { FACETS } from '../../constants/facets'
import { Mode, MODES } from '../../constants/modes'
import { Selector } from '../../constants/selectors'
import { STRATS } from '../../constants/strats'
import { Brand, Unbrand } from '../brand'
import { Opts } from '../opts'
import { Schema } from '../schema'

export namespace Mode_Config {
  type Base = Partial<{ name: LinientAutoComplete<FACETS['mode']>; selector: Selector | Selector[]; store: boolean }>

  export namespace Mono {
    export type Dynamic<S extends Brand<Opts.Primitive.Mono, { type: FACETS['mode']; strat: STRATS['mono'] }>> = Base & { strategy: STRATS['mono']; default: Unbrand<S>; colorScheme: Color_Scheme }
    export type Default = Dynamic<Schema.Flattened.Branded.Facet.Mode<Opts.Default>>
    export type Static = Dynamic<Schema.Flattened.Branded.Facet.Mode<Opts.Primitive.Mono>>
  }

  export namespace Multi {
    export type Dynamic<S extends Brand<Opts.Primitive.Mono, { type: FACETS['mode']; strat: STRATS['multi'] }>> = Base & { strategy: STRATS['multi']; default: Unbrand<S>; colorSchemes: Record<Unbrand<S>, Color_Scheme> }
    export type Static = Dynamic<Schema.Flattened.Branded.Facet.Mode<Opts.Primitive.Multi>>
  }

  export namespace System {
    type Fallback<S extends Opts.Primitive.Mono> = [Extract<S, { __mode: MODES['system'] }>] extends [never] ? {} : { fallback: Unbrand<Exclude<S, { __mode: MODES['system'] }>> }
    type Color_Schemes<S extends Opts.Primitive.Mono> = [Extract<S, { __mode: MODES['custom'] }>] extends [never] ? {} : { colorSchemes: Record<Unbrand<Extract<S, { __mode: MODES['custom'] }>>, Color_Scheme> }

    export type Dynamic<S extends Brand<Opts.Primitive.Mono, { type: FACETS['mode']; strat: STRATS['system'] }>> = Base & { strategy: STRATS['system']; default: Unbrand<S> } & Fallback<S> & Color_Schemes<S>
    export type Default = Base & { strategy: STRATS['system']; default: Exclude<Mode, MODES['custom']> }
    export type Static = Base & { strategy: STRATS['system']; default: string; colorSchemes?: Record<string, Color_Scheme> }
  }

  type NoDistribute<T> = [T] extends [any] ? T : never
  export type Dynamic<S extends Brand<Opts.Primitive.Mono, { type: FACETS['mode'] }>> =
    NoDistribute<S> extends Brand<Opts.Primitive.Mono, { strat: STRATS['mono'] }>
      ? Mono.Dynamic<NoDistribute<S>>
      : NoDistribute<S> extends Brand<Opts.Primitive.Mono, { strat: STRATS['multi'] }>
        ? Multi.Dynamic<NoDistribute<S>>
        : NoDistribute<S> extends Brand<Opts.Primitive.Mono, { strat: STRATS['system'] }>
          ? System.Dynamic<NoDistribute<S>>
          : never
  export type Static = Mono.Static | Multi.Static | System.Static
}