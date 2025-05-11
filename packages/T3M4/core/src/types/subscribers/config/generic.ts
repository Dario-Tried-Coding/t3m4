import { FACETS } from '../../constants/facets'
import { STRATS } from '../../constants/strats'
import { Brand, Unbrand } from '../brand'
import { Opts } from '../opts'
import { Schema } from '../schema'

export namespace Generic_Config {
  export namespace Mono {
    export type Dynamic<S extends Brand<Opts.Primitive.Mono, { type: FACETS['generic']; strat: STRATS['mono'] }>> = { strategy: STRATS['mono']; default: Unbrand<S> }
    export type Default = Dynamic<Schema.Branded.Facet.Generic<Opts.Default>>
    export type Static = Dynamic<Schema.Branded.Facet.Generic<Opts.Primitive.Mono>>
  }

  export namespace Multi {
    export type Dynamic<S extends Brand<Opts.Primitive.Mono, { type: FACETS['generic']; strat: STRATS['multi'] }>> = { strategy: STRATS['multi']; default: Unbrand<S> }
    export type Static = Dynamic<Schema.Branded.Facet.Generic<Opts.Primitive.Multi>>
  }

  export type Dynamic<S extends Brand<Opts.Primitive.Mono, { type: FACETS['generic'] }>> =
    S extends Brand<Opts.Primitive.Mono, { strat: STRATS['mono'] }> ? Mono.Dynamic<S> : S extends Brand<Opts.Primitive.Mono, { strat: STRATS['multi'] }> ? Multi.Dynamic<S> : never
  export type Static = Mono.Static | Multi.Static
}
