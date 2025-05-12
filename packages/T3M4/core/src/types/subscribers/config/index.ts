import { Schema } from '../schema'
import { State } from '../state'
import { Generic_Config } from './generic'
import { Mode_Config } from './mode'

type HasMode<T extends { mode?: any }> = 'mode' extends keyof T ? true : false
export type Config<S extends Schema> = {
  [I in keyof S as keyof S[I] extends never ? never : [keyof S[I]['facets'], HasMode<S[I]>] extends [never, false] ? never : I]: Config.Island.Dynamic<S[I]>
}
export namespace Config {
  namespace Facet {
    export namespace Generic {
      export type Dynamic<S extends Schema.Facet> = Generic_Config.Dynamic<State.AsObj.Branded.Facet<S>>
      export type Static = Generic_Config.Static
    }

    export namespace Mode {
      export type Dynamic<S extends Schema.Facet.Mode> = Mode_Config.Dynamic<State.AsObj.Branded.Facet.Mode<S>>
      export type Static = Mode_Config.Static
    }
  }

  export namespace Island {
    export namespace Facets {
      export type Dynamic<S extends NonNullable<Schema.Island['facets']>> = keyof S extends never ? {} : {
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
      export type Dynamic<S extends NonNullable<Schema.Island['mode']>> = { mode: Facet.Mode.Dynamic<S> }
      export type Static = { mode?: Facet.Mode.Static }
    }

    export type Dynamic<S extends Schema.Island> = (S['facets'] extends NonNullable<Schema.Island['facets']> ? Facets.Dynamic<S['facets']> : {}) & (S['mode'] extends NonNullable<Schema.Island['mode']> ? Mode.Dynamic<S['mode']> : {})

    export type Static = Facets.Static & Mode.Static
  }

  export type Static = {
    [island: string]: Island.Static
  }
}