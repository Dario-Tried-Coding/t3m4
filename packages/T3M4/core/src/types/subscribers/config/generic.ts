import { STRATS } from '../../constants/strats'
import { Opts } from '../opts'
import { Schema } from '../schema'
import { Values } from '../values'

export namespace Generic_Config {
  export namespace Mono {
    export type Dynamic<V extends Values.Facet.Generic<Opts.Primitive.Mono>> = { strategy: STRATS['mono']; default: V[number] }
    export type Default = Dynamic<Values.Facet.Generic<Opts.Default>>
    export type Static = Dynamic<Values.Facet.Generic<Opts.Primitive.Mono>>
  }

  export namespace Multi {
    export type Dynamic<V extends Values.Facet.Generic<Opts.Primitive.Multi>> = { strategy: STRATS['multi']; default: V[number] }
    export type Static = Dynamic<Values.Facet.Generic<Opts.Primitive.Multi>>
  }

  export namespace Generic {
    export type Dynamic<V extends Values.Facet.Generic<Schema.Facet.Generic>> = V extends Values.Facet.Generic<Opts.Primitive.Mono> ? Mono.Dynamic<V> : V extends Values.Facet.Generic<Opts.Primitive.Multi> ? Multi.Dynamic<V> : never
    export type Static = Mono.Static | Multi.Static
  }
}