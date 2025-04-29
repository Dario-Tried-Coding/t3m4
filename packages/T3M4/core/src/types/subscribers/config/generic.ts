import { STRATS } from '../../constants/strats'
import { Opts } from '../opts'
import { Schema } from '../schema'
import { Values } from '../values'

export namespace Generic_Config {
  export namespace Mono {
    export type Dynamic<V extends Values.Facet.Generic<Opts.Mono<'primitive'>>> = { strategy: STRATS['mono']; default: V[number] }
    export type Default = Dynamic<Values.Facet.Generic<Opts.Default>>
    export type Static = Dynamic<Values.Facet.Generic<Opts.Mono<'primitive'>>>
  }

  export namespace Multi {
    export type Dynamic<V extends Values.Facet.Generic<Opts.Multi>> = { strategy: STRATS['multi']; default: V[number] }
    export type Static = Dynamic<Values.Facet.Generic<Opts.Multi>>
  }

  export namespace Generic {
    export type Dynamic<V extends Values.Facet.Generic<Schema.Facet.Generic<'primitive'>>> = V extends Values.Facet.Generic<Opts.Mono<'primitive'>> ? Mono.Dynamic<V> : V extends Values.Facet.Generic<Opts.Multi> ? Multi.Dynamic<V> : never
    export type Static = Mono.Static | Multi.Static
  }
}

const schema = {
  root: {
    facets: {
      color: ['blue', 'red'],
      radius: 'custom-default',
    },
    mode: 'custom-mode',
  },
} as const satisfies Schema.All
type TValues = Values.All<typeof schema>

type test = Generic_Config.Multi.Dynamic<TValues['root']['facets']['color']>
const test: test = {
  strategy: 'multi',
  default: 'blue',
}
