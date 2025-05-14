import { Expand } from '@t3m4/utils'
import { Schema } from './schema'
import { Opts } from './options'
import { MODES } from '../constants/modes'
import { STRATS } from '../constants/strats'
import { Brand_Map } from './brand'
import { FACETS } from '../constants/facets'

export namespace State {
  type HasMode<T extends { mode?: any }> = 'mode' extends keyof T ? true : false
  export type AsObj<Sc extends Schema> = {
    [I in keyof Sc as keyof Sc[I] extends never ? never : [keyof Sc[I]['facets'], HasMode<Sc[I]>] extends [never, false] ? never : I]: Expand<AsObj.Island<Sc[I]>>
  }
  export namespace AsObj {
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

    export type Island<Sc extends Schema.Island> = (Sc extends Schema.Island.Facets ? (keyof Sc['facets'] extends never ? {} : Island.Facets<Sc['facets']>) : {}) & (Sc extends Schema.Island.Mode ? Island.Mode<Sc['mode']> : {})
    namespace Island {
      export type Facets<Sc extends Schema.Island.Facets['facets']> = {
        readonly facets: {
          [F in keyof Sc as keyof Sc[F] extends never ? never : F]: Facet<Sc[F]>
        }
      }
      export type Mode<Sc extends Schema.Island.Mode['mode']> = {
        readonly mode: Facet.Mode<Sc>
      }
    }

    export type Static = {
      [island: string]: {
        facets?: {
          [facet: string]: string
        }
        mode?: string
      }
    }
    export namespace Static {
      export type Island = Partial<Island.Facets & Island.Mode>
      export namespace Island {
        export type Facets = {
          facets: {
            [facet: string]: string
          }
        }

        export type Mode = {
          mode: string
        }
      }
    }

    export type Branded<V extends Schema> = {
      [I in keyof V as keyof V[I] extends never ? never : [keyof V[I]['facets'], HasMode<V[I]>] extends [never, false] ? never : I]: Expand<Branded.Island<V[I]>>
    }
    export namespace Branded {
      export type Facet<V extends Schema.Facet, B extends Pick<Brand_Map, 'type'> = { type: FACETS['generic'] }> = V extends Opts.Primitive.Mono
        ? Opts.Branded.Mono<V, B & { strat: STRATS['mono'] }>
        : V extends Opts.Primitive.Multi
          ? Opts.Branded.Multi<V, B & { strat: STRATS['multi'] }>[number]
          : never
      export namespace Facet {
        type System<V extends Opts.Primitive.System> = [
          Opts.Branded.Mono<V['light'] extends Opts.Primitive.Mono ? V['light'] : MODES['light'], { mode: MODES['light']; type: FACETS['mode']; strat: STRATS['system'] }>,
          Opts.Branded.Mono<V['dark'] extends Opts.Primitive.Mono ? V['dark'] : MODES['dark'], { mode: MODES['dark']; type: FACETS['mode']; strat: STRATS['system'] }>,
          ...(V['system'] extends Opts.Primitive.Mono ? [Opts.Branded.Mono<V['system'], { mode: MODES['system']; type: FACETS['mode']; strat: STRATS['system'] }>] : []),
          ...(V['custom'] extends Opts.Primitive.Multi ? Opts.Branded.Multi<V['custom'], { mode: MODES['custom']; type: FACETS['mode']; strat: STRATS['system'] }> : []),
        ][number]

        export type Mode<V extends Schema.Facet.Mode> = V extends Schema.Facet ? Facet<V, { type: FACETS['mode'] }> : V extends Opts.Primitive.System ? System<V> : never
      }

      export type Island<V extends Schema.Island> = (V extends Schema.Island.Facets ? (keyof V['facets'] extends never ? {} : Island.Facets<V['facets']>) : {}) & (V['mode'] extends NonNullable<Schema.Island['mode']> ? Island.Mode<V['mode']> : {})
      namespace Island {
        export type Facets<V extends Schema.Island.Facets['facets']> = {
          readonly facets: {
            [F in keyof V as keyof V[F] extends never ? never : F]: V[F] extends Schema.Facet ? Facet<V[F], { facet: Extract<F, string>; type: FACETS['generic'] }> : never
          }
        }

        export type Mode<V extends Schema.Island.Mode['mode']> = { mode: Facet.Mode<V> }
      }
    }
  }

  export type AsMap = Map<string, { facets?: Map<string, string>; mode?: string }>
}
