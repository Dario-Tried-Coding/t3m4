import { Expand } from '@t3m4/utils'
import { MODES } from '../constants/modes'
import { Opts } from './options'
import { Schema } from './schema'

export namespace Values {
  type HasMode<T extends { mode?: any }> = 'mode' extends keyof T ? true : false
  export type AsObj<Sc extends Schema> = {
    [I in keyof Sc as keyof Sc[I] extends never ? never : [keyof Sc[I]['facets'], HasMode<Sc[I]>] extends [never, false] ? never : I]: Expand<AsObj.Island<Sc[I]>>
  }
  export namespace AsObj {
    type Facet<Sc extends Schema.Facet> = Sc extends Opts.Primitive.Mono ? [Sc] : Sc extends Opts.Primitive.Multi ? Sc : never
    namespace Facet {
      export type Mode<Sc extends Schema.Facet.Mode> = Sc extends Schema.Facet
        ? Facet<Sc>
        : Sc extends Opts.Primitive.System
          ? [
              Sc['light'] extends Opts.Primitive.Mono ? Sc['light'] : MODES['light'],
              Sc['dark'] extends Opts.Primitive.Mono ? Sc['dark'] : MODES['dark'],
              ...(Sc['system'] extends Opts.Primitive.Mono ? [Sc['system']] : []),
              ...(Sc['custom'] extends Opts.Primitive.Multi ? Sc['custom'] : []),
            ]
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
          [facet: string]: string[]
        }
        mode?: string[]
      }
    }
  }

  export type AsMap = Map<string, { facets?: Map<string, Set<string>>; mode: Set<string> }>
}
