import { STRATS } from '../../constants/strats'
import { Brand_Map, Unbrand } from '../brand'
import { Opts } from '../opts'
import { Schema } from '../schema'

export namespace Generic_Config {
  export namespace Mono {
    export type Dynamic<S extends Schema.Branded.Facet.Generic<Opts.Primitive.Mono>> = { strategy: STRATS['mono']; default: Unbrand<S> }
    export type Default = Dynamic<Schema.Branded.Facet.Generic<Opts.Default>>
    export type Static = Dynamic<Schema.Branded.Facet.Generic<Opts.Primitive.Mono>>
  }

  export namespace Multi {
    export type Dynamic<S extends Schema.Branded.Facet.Generic<Opts.Primitive.Multi>> = { strategy: STRATS['multi']; default: Unbrand<S> }
    export type Static = Dynamic<Schema.Branded.Facet.Generic<Opts.Primitive.Multi>>
  }

  export namespace Generic {
    export type Dynamic<S extends Schema.Branded.Facet.Generic<Schema.Primitive.Facet.Generic>> =
      S extends Schema.Branded.Facet.Generic<Opts.Primitive.Mono> ? Mono.Dynamic<S> : S extends Schema.Branded.Facet.Generic<Opts.Primitive.Multi> ? Multi.Dynamic<S> : never
    export type Static = Mono.Static | Multi.Static
  }
}