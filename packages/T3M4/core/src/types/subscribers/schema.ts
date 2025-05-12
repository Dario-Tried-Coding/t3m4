import { FACETS } from '../constants/facets'
import { MODES } from '../constants/modes'
import { STRATS } from '../constants/strats'
import { Brand_Map } from './brand'
import { Opts } from './opts'

// #region Schema
export type Schema = {
  [island: string]: Schema.Island
}
export namespace Schema {
  export namespace Facet {
    export type Mode = Facet | Opts.Primitive.System.Suggested
  }
  export type Facet = Opts.Primitive.Mono.Suggested | Opts.Primitive.Multi

  type Island_Facets = {
    facets: {
      [facet: string]: Facet
    }
  }
  type Island_Mode = {
    mode: Facet.Mode
  }
  export type Island = Partial<Island_Facets & Island_Mode>

  // #region Flattened
  export type Flattened<Sc extends Schema> = {
    [I in keyof Sc as Flattened.Island<Sc[I]> extends never ? never : I]: Flattened.Island<Sc[I]>
  }
  export namespace Flattened {
    type Facet<Sc extends Schema.Facet> = Sc extends Opts.Primitive.Mono ? Sc : Sc extends Opts.Primitive.Multi ? Sc[number] : never
    namespace Facet {
      export type Mode<Sc extends Schema.Facet.Mode> = Sc extends Schema.Facet
        ? Facet<Sc>
        : Sc extends Opts.Primitive.System
          ?
              | (Sc['light'] extends Opts.Primitive.Mono ? Sc['light'] : MODES['light'])
              | (Sc['dark'] extends Opts.Primitive.Mono ? Sc['dark'] : MODES['dark'])
              | (Sc['system'] extends Opts.Primitive.Mono ? Sc['system'] : never)
              | (Sc['custom'] extends Opts.Primitive.Multi ? Sc['custom'][number] : never)
          : never
    }

    type Island_Facets<Sc extends NonNullable<Schema.Island['facets']>> = keyof Sc extends never
      ? {}
      : {
          facets: {
            [F in keyof Sc]: Facet<Sc[F]>
          }
        }
    type Island_Mode<Sc extends NonNullable<Schema.Island['mode']>> = {
      mode: Facet.Mode<Sc>
    }
    export type Island<Sc extends Schema.Island> = keyof Sc extends never
      ? never
      : (Sc['facets'] extends NonNullable<Schema.Island['facets']> ? Island_Facets<Sc['facets']> : {}) & (Sc['mode'] extends NonNullable<Schema.Island['mode']> ? Island_Mode<Sc['mode']> : {})

    // #region Branded
    export type Branded<V extends Schema> = {
      [I in keyof V as Branded.Island<V[I]> extends never ? never : I]: Branded.Island<V[I]>
    }
    export namespace Branded {
      export namespace Facet {
        type System<V extends Opts.Primitive.System> = [
          Opts.Branded.Mono<V['light'] extends Opts.Primitive.Mono ? V['light'] : MODES['light'], { mode: MODES['light']; type: FACETS['mode']; strat: STRATS['system'] }>,
          Opts.Branded.Mono<V['dark'] extends Opts.Primitive.Mono ? V['dark'] : MODES['dark'], { mode: MODES['dark']; type: FACETS['mode']; strat: STRATS['system'] }>,
          ...(V['system'] extends Opts.Primitive.Mono ? [Opts.Branded.Mono<V['system'], { mode: MODES['system']; type: FACETS['mode']; strat: STRATS['system'] }>] : []),
          ...(V['custom'] extends Opts.Primitive.Multi ? Opts.Branded.Multi<V['custom'], { mode: MODES['custom']; type: FACETS['mode']; strat: STRATS['system'] }> : []),
        ][number]

        export type Mode<V extends Schema.Facet.Mode> = V extends Schema.Facet ? Facet<V, { type: FACETS['mode'] }> : V extends Opts.Primitive.System ? System<V> : never
      }
      export type Facet<V extends Schema.Facet, B extends Pick<Brand_Map, 'type'> = { type: FACETS['generic'] }> = V extends Opts.Primitive.Mono
        ? Opts.Branded.Mono<V, B & { strat: STRATS['mono'] }>
        : V extends Opts.Primitive.Multi
          ? Opts.Branded.Multi<V, B & { strat: STRATS['multi'] }>[number]
          : never

      namespace Island {
        export type Facets<V extends NonNullable<Schema.Island['facets']>> = keyof V extends never ? {} : {
          facets: {
            [F in keyof V as keyof V extends never ? never : F]: V[F] extends Schema.Facet ? Facet<V[F], { facet: Extract<F, string>; type: FACETS['generic'] }> : never
          }
        }

        export type Mode<V extends NonNullable<Schema.Island['mode']>> = { mode: Facet.Mode<V> }
      }
      export type Island<V extends Schema.Island> = keyof V extends never
        ? never
        : (V['facets'] extends NonNullable<Schema.Island['facets']> ? Island.Facets<V['facets']> : {}) & (V['mode'] extends NonNullable<Schema.Island['mode']> ? Island.Mode<V['mode']> : {})
    }
  }
}