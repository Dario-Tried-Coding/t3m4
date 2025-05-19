import type { Options } from './options'

// #region Schema
export type Schema = {
  [island: string]: Schema.Island
}
export namespace Schema {
  // #region Schema.Island
  export type Island = Partial<Island.Facets & Island.Mode>
  export namespace Island {
    // #region Schema.Island.Facets
    export type Facets = {
      facets: {
        [facet: string]: Facets.Facet
      }
    }
    export namespace Facets {
      // #region Schema.Island.Facets.Facet
      export type Facet = Facet.Mono | Facet.Multi
      export namespace Facet {
        export type Mono = Options.Mono
        export type Multi = Options.Multi
      }
    }

    // #endregion Schema.Island.Mode
    export type Mode = {
      mode: Mode.Facet
    }
    export namespace Mode {
      // #region Schema.Island.Mode.Facet
      export type Facet = Facet.Mono | Facet.Multi | Facet.System
      export namespace Facet {
        export type Mono = Options.Mono
        export type Multi = Options.Multi
        export type System = Options.System
      }
    }
  }

  // #region Schema.Suggested
  export type Suggested = {
    [island: string]: Suggested.Island
  }
  export namespace Suggested {
    // #region Schema.Suggested.Island
    export type Island = Partial<Island.Facets & Island.Mode>
    export namespace Island {
      // #region Schema.Suggested.Island.Facets
      export type Facets = {
        facets: {
          [facet: string]: Facets.Facet
        }
      }
      export namespace Facets {
        // #region Schema.Suggested.Island.Facets.Facet
        export type Facet = Facet.Mono | Facet.Multi
        export namespace Facet {
          export type Mono = Options.Mono.Suggested
          export type Multi = Options.Multi
        }
      }

      // #endregion Schema.Suggested.Island.Mode
      export type Mode = {
        mode: Mode.Facet
      }
      export namespace Mode {
        // #region Schema.Suggested.Island.Mode.Facet
        export type Facet = Facet.Mono | Facet.Multi | Facet.System
        export namespace Facet {
          export type Mono = Options.Mono.Suggested
          export type Multi = Options.Multi
          export type System = Options.System.Suggested
        }
      }
    }
  }

  // #region Schema.Polished
  type IsMeaningfulIsland<I extends Island> = I extends Schema.Island.Mode ? true : I extends Schema.Island.Facets ? (keyof I['facets'] extends never ? false : true) : false
  export type Polished<Sc extends Schema> = {
    [I in keyof Sc as IsMeaningfulIsland<Sc[I]> extends true ? I : never]: Sc[I]
  }
}
