import { FACETS } from '../constants/facets'
import { STRATS } from '../constants/strats'
import { Brand_Map } from './brand'
import { Opts } from './opts'

export namespace Schema {
  export namespace Primitive {
    export namespace Facet {
      export type Generic = Opts.Primitive.Suggested.Mono | Opts.Primitive.Multi
      export type Mode = Generic | Opts.Primitive.Suggested.System
    }

    export type Island = {
      facets?: {
        [facet: string]: Facet.Generic
      }
      mode?: Facet.Mode
    }

    export type All = {
      [island: string]: Island
    }
  }

  export namespace Branded {
    export namespace Facet {
      export type Generic<V extends Primitive.Facet.Generic, B extends Pick<Brand_Map, 'facet'>, T extends Brand_Map['type'] = FACETS['generic']> = V extends Opts.Primitive.Mono
        ? Opts.Branded.Mono<V, { type: T; strat: STRATS['mono'] } & B>
        : V extends Opts.Primitive.Multi
          ? Opts.Branded.Multi<V, { type: T; strat: STRATS['multi'] } & B>
          : never

      export type Mode<V extends Primitive.Facet.Mode, B extends Pick<Brand_Map, 'facet'>> = V extends Primitive.Facet.Generic
        ? Generic<V, B, FACETS['mode']>
        : V extends Opts.Primitive.System
          ? V['system'] extends Opts.Primitive.Mono
            ? Opts.Branded.System<V, { strat: STRATS['system'] } & B>
            : Opts.Branded.System<V, { strat: STRATS['system'] | STRATS['light_dark'] } & B>
          : never
    }

    export type Island<S extends Primitive.Island> = (S['facets'] extends Primitive.Island['facets']
      ? {
          facets: {
            [F in keyof S['facets'] as S['facets'][F] extends Primitive.Facet.Generic ? F : never]: S['facets'][F] extends Primitive.Facet.Generic ? Facet.Generic<S['facets'][F], { facet: Extract<F, string> }> : never
          }
        }
      : {}) &
      (S['mode'] extends Primitive.Island['mode']
        ? {
            mode: S['mode'] extends Primitive.Facet.Mode ? Facet.Mode<S['mode'], { facet: 'mode' }> : never
          }
        : {})

    export type All<S extends Primitive.All> = {
      [I in keyof S]: S[I] extends Primitive.Island ? Island<S[I]> : never
    }
  }
}
