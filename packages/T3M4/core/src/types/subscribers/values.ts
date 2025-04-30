import { FACET, FACETS } from '../constants/facets'
import { MODE_TYPE, MODE_TYPES, MODES } from '../constants/modes'
import { STRAT, STRATS } from '../constants/strats'
import { Opts } from './opts'
import { Schema } from './schema'

export namespace Values {
  type System<V extends Opts.Primitive.System> = [
    Branded<V['light'] extends Opts.Primitive.Mono ? V['light'] : MODES['light'], { mode: MODE_TYPES['light'] }>,
    Branded<V['dark'] extends Opts.Primitive.Mono ? V['dark'] : MODES['dark'], { mode: MODE_TYPES['dark'] }>,
    V['system'] extends Opts.Primitive.Mono ? Branded<V['system'], { mode: MODE_TYPES['system'] }> : never,
    V['custom'] extends Opts.Primitive.Multi ? { [C in V['custom'][number]]: Branded<C, { mode: MODE_TYPES['custom'] }> }[V['custom'][number]] : never,
  ]

  export namespace Facet {
    export type Generic<Sc extends Schema.Facet.Generic, T extends FACET = FACETS['generic']> = Sc extends Opts.Primitive.Mono
      ? Branded<Sc[], { type: T; strat: STRATS['mono'] }>
      : Sc extends Opts.Primitive.Multi
        ? Branded<Sc, { type: T; strat: STRATS['multi'] }>
        : never
    export type Mode<Sc extends Schema.Facet.Mode> = Sc extends Schema.Facet.Generic
      ? Generic<Sc, FACETS['mode']>
      : Sc extends Opts.Primitive.System
        ? Sc['system'] extends Opts.Primitive.Mono
          ? Branded<System<Sc>[number][], { type: FACETS['mode']; strat: STRATS['system'] }>
          : Branded<System<Sc>[number][], { type: FACETS['mode']; strat: STRATS['system'] | STRATS['light_dark'] }>
        : never
  }

  export namespace Island {
    export type Facets<Sc extends NonNullable<Schema.Island['facets']>> = {
      [F in keyof Sc]: Facet.Generic<Sc[F]>
    }
    export type Mode<Sc extends NonNullable<Schema.Island['mode']>> = Facet.Mode<Sc>
  }

  export type All<Sc extends Schema.All> = {
    [I in keyof Sc]: (Sc[I]['facets'] extends NonNullable<Schema.Island['facets']> ? { facets: Island.Facets<Sc[I]['facets']> } : {}) & (Sc[I]['mode'] extends NonNullable<Schema.Island['mode']> ? { mode: Island.Mode<Sc[I]['mode']> } : {})
  }
}