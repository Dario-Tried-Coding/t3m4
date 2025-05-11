import { Schema } from '../schema'
import { Generic_Config } from './generic'
import { Mode_Config } from './mode'

export namespace Config {
  export namespace Facet {
    export namespace Generic {
      export type Dynamic<S extends Schema.Primitive.Facet.Generic> = Generic_Config.Dynamic<Schema.Branded.Facet.Generic<S>>
      export type Static = Generic_Config.Static
    }

    export namespace Mode {
      export type Dynamic<S extends Schema.Primitive.Facet.Mode> = Mode_Config.Dynamic<Schema.Branded.Facet.Mode<S>>
      export type Static = Mode_Config.Static
    }
  }

  export namespace Island {
    export namespace Facets {
      export type Dynamic<S extends NonNullable<Schema.Primitive.Island['facets']>> = {
        facets: {
          [F in keyof S]: Facet.Generic.Dynamic<S[F]>
        }
      }

      export type Static = {
        facets?: {
          [facet: string]: Facet.Generic.Static
        }
      }
    }

    export namespace Mode {
      export type Dynamic<S extends NonNullable<Schema.Primitive.Island['mode']>> = { mode: Facet.Mode.Dynamic<S> }
      export type Static = { mode?: Facet.Mode.Static }
    }

    type Clean<T> = T extends undefined ? undefined : T
    export type Dynamic<S extends Schema.Primitive.Island> = keyof S extends never
      ? never
      : (S['facets'] extends NonNullable<Schema.Primitive.Island['facets']> ? Facets.Dynamic<S['facets']> : {}) & (S['mode'] extends NonNullable<Schema.Primitive.Island['mode']> ? Mode.Dynamic<S['mode']> : {})
    export type Static = Facets.Static & Mode.Static
  }

  export type Dynamic<S extends Schema.Primitive.All> = {
    [I in keyof S as [Island.Dynamic<S[I]>] extends [never] ? never : I]: Island.Dynamic<S[I]>
  }

  export type Static = {
    [island: string]: Island.Static
  }
}