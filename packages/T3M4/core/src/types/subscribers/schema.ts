import { Opts } from "./opts"

export namespace Schema {
  export namespace Facet {
    export type Generic<T extends 'primitive' | 'suggested' = 'suggested'> = Opts.Mono<T> | Opts.Multi
    export type Mode<T extends 'primitive' | 'suggested' = 'suggested'> = Generic<T> | Opts.System<T>
  }

  export type Island<T extends 'primitive' | 'suggested' = 'suggested'> = {
    facets?: {
      [facet: string]: Facet.Generic<T>
    }
    mode?: Facet.Mode<T>
  }

  export type All<T extends 'primitive' | 'suggested' = 'suggested'> = {
    [island: string]: Island<T>
  }
}
