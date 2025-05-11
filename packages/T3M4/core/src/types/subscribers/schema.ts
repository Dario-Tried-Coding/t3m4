import { FACETS } from '../constants/facets'
import { MODES } from '../constants/modes'
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
      export type Generic<V extends Primitive.Facet.Generic, B extends Pick<Brand_Map, 'type'> = { type: FACETS['generic'] }> = V extends Opts.Primitive.Mono
        ? Opts.Branded.Mono<V, B & { strat: STRATS['mono'] }>
        : V extends Opts.Primitive.Multi
          ? Opts.Branded.Multi<V, B & { strat: STRATS['multi'] }>[number]
          : never

      type System<V extends Opts.Primitive.System> = [
        Opts.Branded.Mono<V['light'] extends Opts.Primitive.Mono ? V['light'] : MODES['light'], { mode: MODES['light']; type: FACETS['mode']; strat: STRATS['system'] }>,
        Opts.Branded.Mono<V['dark'] extends Opts.Primitive.Mono ? V['dark'] : MODES['dark'], { mode: MODES['dark']; type: FACETS['mode']; strat: STRATS['system'] }>,
        ...(V['system'] extends Opts.Primitive.Mono ? [Opts.Branded.Mono<V['system'], { mode: MODES['system']; type: FACETS['mode']; strat: STRATS['system'] }>] : []),
        ...(V['custom'] extends Opts.Primitive.Multi ? Opts.Branded.Multi<V['custom'], { mode: MODES['custom']; type: FACETS['mode']; strat: STRATS['system'] }> : []),
      ][number]

      export type Mode<V extends Primitive.Facet.Mode> = V extends Primitive.Facet.Generic ? Generic<V, { type: FACETS['mode'] }> : V extends Opts.Primitive.System ? System<V> : never
    }

    export type Island<V extends Primitive.Island> = (V['facets'] extends Primitive.Island['facets']
      ? {
          facets: {
            [F in keyof V['facets'] as V['facets'][F] extends Primitive.Facet.Generic ? F : never]: V['facets'][F] extends Primitive.Facet.Generic ? Facet.Generic<V['facets'][F], { facet: Extract<F, string>; type: FACETS['generic'] }> : never
          }
        }
      : {}) &
      (V['mode'] extends Primitive.Island['mode']
        ? {
            mode: V['mode'] extends Primitive.Facet.Mode ? Facet.Mode<V['mode']> : never
          }
        : {})

    export type All<V extends Primitive.All> = {
      [I in keyof V]: Island<V[I]>
    }
  }
}
