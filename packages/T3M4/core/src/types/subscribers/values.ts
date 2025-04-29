import { Branded } from '@t3m4/utils'
import { MODES } from '../constants/modes'
import { Opts } from './opts'
import { Schema } from './schema'
import { STRAT, STRATS } from '../constants/strats'
import { FACET, FACETS } from '../constants/facets'

export namespace Values {
  type Typed<T, M extends FACET> = T & { __type: M }
  type Strategized<T, S extends STRAT> = T & { __strat: S }

  type System<V extends Opts.System> = [
    V['light'] extends string ? V['light'] : MODES['light'],
    V['dark'] extends string ? V['dark'] : MODES['dark'],
    V['system'] extends string ? V['system'] : MODES['system'],
    ...(V['custom'] extends string[] ? V['custom'] : []),
  ]

  export namespace Facet {
    export type Generic<Sc extends Schema.Facet.Generic, T extends FACET = FACETS['generic']> = Sc extends Opts.Mono ? Typed<Strategized<[Sc], STRATS['mono']>, T> : Sc extends Opts.Multi ? Typed<Strategized<Sc, STRATS['multi']>, T> : never
    export type Mode<Sc extends Schema.Facet.Mode> = Sc extends Schema.Facet.Generic ? Generic<Sc, FACETS['mode']> : Sc extends Opts.System ? Typed<System<Sc>, FACETS['mode']> : never
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
