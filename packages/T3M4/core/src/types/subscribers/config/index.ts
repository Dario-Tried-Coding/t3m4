import { Schema } from '../schema'
import { Island as T_Island } from './island'

export type Config<Sc extends Schema> = {
  [I in keyof Schema.Polished<Sc>]: T_Island<Sc[I]>
}
export namespace Config {
  export type Island<Sc extends Schema.Island> = T_Island<Sc>
  export namespace Island {
    export type Facets<Sc extends Schema.Island.Facets['facets']> = T_Island.Facets<Sc>
    export namespace Facets {
      export type Facet<Sc extends Schema.Island.Facets.Facet> = T_Island.Facets.Facet<Sc>
      export namespace Facet {
        export type Mono<Sc extends Schema.Island.Facets.Facet.Mono> = T_Island.Facets.Facet.Mono<Sc>
        export type Multi<Sc extends Schema.Island.Facets.Facet.Multi> = T_Island.Facets.Facet.Multi<Sc>
      }
    }

    export type Mode<Sc extends Schema.Island.Mode['mode']> = T_Island.Mode<Sc>
    export namespace Mode {
      export type Facet<Sc extends Schema.Island.Mode.Facet> = T_Island.Mode.Facet<Sc>
      export namespace Facet {
        export type Mono<Sc extends Schema.Island.Mode.Facet.Mono> = T_Island.Mode.Facet.Mono<Sc>
        export type Multi<Sc extends Schema.Island.Mode.Facet.Multi> = T_Island.Mode.Facet.Multi<Sc>
        export type System<Sc extends Schema.Island.Mode.Facet.System> = T_Island.Mode.Facet.System<Sc>
      }
    }
  }

  export type Static = {
    [island: string]: T_Island.Static
  }
  export namespace Static {
    export type Island = T_Island.Static
    export namespace Island {
      export type Facets = T_Island.Static.Facets
      export namespace Facets {
        export type Facet = T_Island.Static.Facets.Facet
        export namespace Facet {
          export type Mono = T_Island.Static.Facets.Facet.Mono
          export type Multi = T_Island.Static.Facets.Facet.Multi
        }
      }

      export type Mode = T_Island.Static.Mode
      export namespace Mode {
        export type Facet = T_Island.Static.Mode.Facet
        export namespace Facet {
          export type Mono = T_Island.Static.Mode.Facet.Mono
          export type Multi = T_Island.Static.Mode.Facet.Multi
          export type System = T_Island.Static.Mode.Facet.System
        }
      }
    }
  }
}
