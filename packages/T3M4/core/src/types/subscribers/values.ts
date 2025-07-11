import { MODES } from '../constants'
import { Schema } from './schema'

// #region Values
export type Values<Sc extends Schema> = {
  [I in keyof Schema.Polished<Sc>]: Values.Island<Sc[I]>
}
export namespace Values {
  // #region Values.Island
  export type Island<Sc extends Schema.Island> = (Sc extends Schema.Island.Facets ? Island.Facets<Sc['facets']> : {}) & (Sc extends Schema.Island.Mode ? Island.Mode<Sc['mode']> : {})
  export namespace Island {
    // #region Values.Island.Facets
    export type Facets<Sc extends Schema.Island.Facets['facets']> = {
      readonly facets: {
        [F in keyof Sc]: Facets.Facet<Sc[F]>
      }
    }
    export namespace Facets {
      // #region Values.Island.Facets.Facet
      export type Facet<Sc extends Schema.Island.Facets.Facet> = Sc extends Schema.Island.Facets.Facet.Mono ? Facet.Mono<Sc> : Sc extends Schema.Island.Facets.Facet.Multi ? Facet.Multi<Sc> : never
      export namespace Facet {
        export type Mono<Sc extends Schema.Island.Facets.Facet.Mono> = [Sc]
        export type Multi<Sc extends Schema.Island.Facets.Facet.Multi> = Sc
      }
    }

    // #region Values.Island.Mode
    export type Mode<Sc extends Schema.Island.Mode['mode']> = {
      readonly mode: Mode.Facet<Sc>
    }
    export namespace Mode {
      // #region Values.Island.Mode.Facet
      export type Facet<Sc extends Schema.Island.Mode.Facet> = Sc extends Schema.Island.Mode.Facet.Mono
        ? Facet.Mono<Sc>
        : Sc extends Schema.Island.Mode.Facet.Multi
          ? Facet.Multi<Sc>
          : Sc extends Schema.Island.Mode.Facet.System
            ? Facet.System<Sc>
            : never
      export namespace Facet {
        export type Mono<Sc extends Schema.Island.Mode.Facet.Mono> = [Sc]
        export type Multi<Sc extends Schema.Island.Mode.Facet.Multi> = Sc
        export type System<Sc extends Schema.Island.Mode.Facet.System> = [
          Sc['light'] extends string ? Sc['light'] : MODES['light'],
          Sc['dark'] extends string ? Sc['dark'] : MODES['dark'],
          ...(Sc['system'] extends string ? [Sc['system']] : []),
          ...(Sc['custom'] extends string[] ? Sc['custom'] : []),
        ]
      }
    }
  }

  // #region Values.Static
  export type Static = {
    [island: string]: Static.Island
  }
  export namespace Static {
    // #region Values.Static.Island
    export type Island = Partial<Island.Facets & Island.Mode>
    export namespace Island {
      // #region Values.Static.Island.Facets
      export type Facets = {
        facets: {
          [facet: string]: Facets.Facet
        }
      }
      export namespace Facets {
        // #region Values.Static.Island.Facets.Facet
        export type Facet = string[]
      }

      // #region Values.Static.Island.Mode
      export type Mode = {
        mode: Mode.Facet
      }
      export namespace Mode {
        // #region Values.Static.Island.Mode.Facet
        export type Facet = string[]
      }
    }

    // #region Values.Static.AsMap
    export type AsMap = Map<string, AsMap.Island>
    export namespace AsMap {
      // #region Values.Static.AsMap.Island
      export type Island = Partial<Island.Facets & Island.Mode>
      export namespace Island {
        // #region Values.Static.AsMap.Island.Facets
        export type Facets = {
          facets: Map<string, Facets.Facet>
        }
        export namespace Facets {
          // #region Values.Static.AsMap.Island.Facets.Facet
          export type Facet = Set<string>
        }

        // #region Values.Static.AsMap.Island.Mode
        export type Mode = {
          mode: Mode.Facet
        }
        export namespace Mode {
          // #region Values.Static.AsMap.Island.Mode.Facet
          export type Facet = Set<string>
        }
      }
    }
  }
}
