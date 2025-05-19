import { Expand } from '@t3m4/utils'
import { Schema } from './schema'

// #region State
export type State<Sc extends Schema> = {
  [I in keyof Schema.Polished<Sc>]: State.Island<Sc[I]>
}
export namespace State {
  // #region State.Island
  export type Island<Sc extends Schema.Island> = (Sc extends Schema.Island.Facets ? Island.Facets<Sc['facets']> : {}) & (Sc extends Schema.Island.Mode ? Island.Mode<Sc['mode']> : {})
  export namespace Island {
    // #region State.Island.Facets
    export type Facets<Sc extends Schema.Island.Facets['facets']> = {
      readonly facets: {
        [F in keyof Sc]: Facets.Facet<Sc[F]>
      }
    }
    export namespace Facets {
      // #region State.Island.Facets.Facet
      export type Facet<Sc extends Schema.Island.Facets.Facet> = Sc extends Schema.Island.Facets.Facet.Mono ? Facet.Mono<Sc> : Sc extends Schema.Island.Facets.Facet.Multi ? Facet.Multi<Sc> : never
      export namespace Facet {
        export type Mono<Sc extends Schema.Island.Facets.Facet.Mono> = Sc
        export type Multi<Sc extends Schema.Island.Facets.Facet.Multi> = Sc[number]
      }
    }

    // #region State.Island.Mode
    export type Mode<Sc extends Schema.Island.Mode['mode']> = {
      readonly mode: Mode.Facet<Sc>
    }
    export namespace Mode {
      // #region State.Island.Mode.Facet
      export type Facet<Sc extends Schema.Island.Mode.Facet> = Sc extends Schema.Island.Mode.Facet.Mono
        ? Facet.Mono<Sc>
        : Sc extends Schema.Island.Mode.Facet.Multi
          ? Facet.Multi<Sc>
          : Sc extends Schema.Island.Mode.Facet.System
            ? Expand.Union<Facet.System<Sc>>
            : never
      export namespace Facet {
        export type Mono<Sc extends Schema.Island.Mode.Facet.Mono> = Sc
        export type Multi<Sc extends Schema.Island.Mode.Facet.Multi> = Sc[number]
        export type System<Sc extends Schema.Island.Mode.Facet.System> =
          | Sc['light']
          | Sc['dark']
          | (Sc extends Required<Pick<Schema.Island.Mode.Facet.System, 'system'>> ? Sc['system'] : never)
          | (Sc extends Required<Pick<Schema.Island.Mode.Facet.System, 'custom'>> ? Sc['custom'][number] : never)
      }
    }
  }

  // #region State.Optional
  export type Optional<Sc extends Schema> = {
    [I in keyof Schema.Polished<Sc>]: Optional.Island<Sc[I]>
  }
  export namespace Optional {
    // #region State.Optional.Island
    export type Island<Sc extends Schema.Island> = (Sc extends Schema.Island.Facets ? Island.Facets<Sc['facets']> : {}) & (Sc extends Schema.Island.Mode ? Island.Mode<Sc['mode']> : {})
    export namespace Island {
      // #region State.Optional.Island.Facets
      export type Facets<Sc extends Schema.Island.Facets['facets']> = {
        readonly facets?: {
          [F in keyof Sc]?: Facets.Facet<Sc[F]>
        }
      }
      export namespace Facets {
        // #region State.Optional.Island.Facets.Facet
        export type Facet<Sc extends Schema.Island.Facets.Facet> = Sc extends Schema.Island.Facets.Facet.Mono ? Facet.Mono<Sc> : Sc extends Schema.Island.Facets.Facet.Multi ? Facet.Multi<Sc> : never
        export namespace Facet {
          export type Mono<Sc extends Schema.Island.Facets.Facet.Mono> = Sc
          export type Multi<Sc extends Schema.Island.Facets.Facet.Multi> = Sc[number]
        }
      }

      // #region State.Optional.Island.Mode
      export type Mode<Sc extends Schema.Island.Mode['mode']> = {
        readonly mode?: Mode.Facet<Sc>
      }
      export namespace Mode {
        // #region State.Optional.Island.Mode.Facet
        export type Facet<Sc extends Schema.Island.Mode.Facet> = Sc extends Schema.Island.Mode.Facet.Mono
          ? Facet.Mono<Sc>
          : Sc extends Schema.Island.Mode.Facet.Multi
            ? Facet.Multi<Sc>
            : Sc extends Schema.Island.Mode.Facet.System
              ? Expand.Union<Facet.System<Sc>>
              : never
        export namespace Facet {
          export type Mono<Sc extends Schema.Island.Mode.Facet.Mono> = Sc
          export type Multi<Sc extends Schema.Island.Mode.Facet.Multi> = Sc[number]
          export type System<Sc extends Schema.Island.Mode.Facet.System> =
            | Sc['light']
            | Sc['dark']
            | (Sc extends Required<Pick<Schema.Island.Mode.Facet.System, 'system'>> ? Sc['system'] : never)
            | (Sc extends Required<Pick<Schema.Island.Mode.Facet.System, 'custom'>> ? Sc['custom'][number] : never)
        }
      }
    }
  }

  // #region State.Static
  export type Static = {
    [island: string]: Static.Island
  }
  export namespace Static {
    // #region State.Static.Island
    export type Island = Partial<Island.Facets & Island.Mode>
    export namespace Island {
      // #region State.Static.Island.Facets
      export type Facets = {
        facets: {
          [facet: string]: Facets.Facet
        }
      }
      export namespace Facets {
        // #region State.Static.Island.Facets.Facet
        export type Facet = string
      }

      // #region State.Static.Island.Mode
      export type Mode = {
        mode: Mode.Facet
      }
      export namespace Mode {
        // #region State.Static.Island.Mode.Facet
        export type Facet = string
      }
    }

    // #region State.Static.AsMap
    export type AsMap = Map<string, AsMap.Island>
    export namespace AsMap {
      // #region State.Static.AsMap.Island
      export type Island = Partial<Island.Facets & Island.Mode>
      export namespace Island {
        // #region State.Static.AsMap.Island.Facets
        export type Facets = {
          facets: Map<string, Facets.Facet>
        }
        export namespace Facets {
          // #region State.Static.AsMap.Island.Facets.Facet
          export type Facet = string
        }

        // #region State.Static.AsMap.Island.Mode
        export type Mode = {
          mode: Mode.Facet
        }
        export namespace Mode {
          // #region State.Static.AsMap.Island.Mode.Facet
          export type Facet = string
        }
      }
    }
  }
}
