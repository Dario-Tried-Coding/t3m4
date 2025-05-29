import { Color_Scheme } from '../constants/color-schemes'
import { MODES } from '../constants/modes'
import { Selector } from '../constants/selectors'
import { STRATS } from '../constants/strats'
import { Schema } from './schema'

// #region Config
export type Config<Sc extends Schema> = {
  [I in keyof Schema.Polished<Sc>]: Config.Island<Sc[I]>
}
export namespace Config {
  // #region Config.Island
  export type Island<Sc extends Schema.Island> = (Sc extends Schema.Island.Facets ? Island.Facets<Sc['facets']> : {}) & (Sc extends Schema.Island.Mode ? Island.Mode<Sc['mode']> : {})
  export namespace Island {
    // #region Config.Island.Facets
    export type Facets<Sc extends Schema.Island.Facets['facets']> = {
      facets: {
        [F in keyof Sc]: Facets.Facet<Sc[F]>
      }
    }
    export namespace Facets {
      // #region Config.Island.Facets.Facet
      export type Facet<Sc extends Schema.Island.Facets.Facet> = Sc extends Schema.Island.Facets.Facet.Mono ? Facet.Mono<Sc> : Sc extends Schema.Island.Facets.Facet.Multi ? Facet.Multi<Sc> : never
      export namespace Facet {
        export type Mono<Sc extends Schema.Island.Facets.Facet.Mono> = { strategy: STRATS['mono']; default: Sc }
        export type Multi<Sc extends Schema.Island.Facets.Facet.Multi> = { strategy: STRATS['multi']; default: Sc[number] }
      }
    }

    // #endregion Config.Island.Mode
    export type Mode<Sc extends Schema.Island.Mode['mode']> = {
      mode: Mode.Facet<Sc>
    }
    export namespace Mode {
      // #region Config.Island.Mode.Facet
      export type Facet<Sc extends Schema.Island.Mode.Facet> = Sc extends Schema.Island.Mode.Facet.Mono
        ? Facet.Mono<Sc>
        : Sc extends Schema.Island.Mode.Facet.Multi
          ? Facet.Multi<Sc>
          : Sc extends Schema.Island.Mode.Facet.System
            ? Facet.System<Sc>
            : never
      export namespace Facet {
        type Base = { store?: boolean; selector?: Selector | Selector[] }

        export type Mono<Sc extends Schema.Island.Mode.Facet.Mono> = Base & { strategy: STRATS['mono']; default: Sc; colorScheme: Color_Scheme }
        export type Multi<Sc extends Schema.Island.Mode.Facet.Multi> = Base & { strategy: STRATS['multi']; default: Sc[number]; colorSchemes: Record<Sc[number], Color_Scheme> }

        type Flatten<Sc extends Schema.Island.Mode.Facet.System> =
          | Sc['light']
          | Sc['dark']
          | (Sc extends Required<Pick<Schema.Island.Mode.Facet.System, 'system'>> ? Sc['system'] : never)
          | (Sc extends Required<Pick<Schema.Island.Mode.Facet.System, 'custom'>> ? Sc['custom'][number] : never)
        type Default<Sc extends Schema.Island.Mode.Facet.System> = {
          default: Flatten<Sc>
        }
        type Fallback<Sc extends Schema.Island.Mode.Facet.System> = Sc extends Required<Pick<Schema.Island.Mode.Facet.System, 'system'>> ? { fallback: Flatten<Omit<Sc, MODES['system']>> } : {}
        type Color_Schemes<Sc extends Schema.Island.Mode.Facet.System> = Sc extends Required<Pick<Schema.Island.Mode.Facet.System, 'custom'>> ? { colorSchemes: Record<Sc['custom'][number], Color_Scheme> } : {}
        export type System<Sc extends Schema.Island.Mode.Facet.System> = Base & { strategy: STRATS['system'] } & Default<Sc> & Fallback<Sc> & Color_Schemes<Sc>
      }
    }
  }

  export namespace Polished {
    type IsModeIsland<C extends Config.Static.Island> = C extends Config.Static.Island.Mode ? true : false
    export type Mode<C extends Config.Static> = {
      [I in keyof C as IsModeIsland<C[I]> extends true ? I : never]: C[I]
    }
  }

  // #region Config.Static
  export type Static = {
    [island: string]: Static.Island
  }
  export namespace Static {
    // #region Config.Static.Island
    export type Island = Partial<Island.Facets & Island.Mode>
    export namespace Island {
      // #region Config.Static.Island.Facets
      export type Facets = {
        facets: {
          [facet: string]: Facets.Facet
        }
      }
      export namespace Facets {
        // #region Config.Static.Island.Facets.Facet
        export type Facet = Facet.Mono | Facet.Multi
        export namespace Facet {
          export type Mono = { strategy: STRATS['mono']; default: string }
          export type Multi = { strategy: STRATS['multi']; default: string }
        }
      }

      // #endregion Config.Static.Island.Mode
      export type Mode = {
        mode: Mode.Facet
      }
      export namespace Mode {
        // #region Config.Static.Island.Mode.Facet
        export type Facet = Facet.Mono | Facet.Multi | Facet.System
        export namespace Facet {
          type Base = { store?: boolean; selector?: Selector | Selector[] }

          export type Mono = Base & { strategy: STRATS['mono']; default: string; colorScheme: Color_Scheme }
          export type Multi = Base & { strategy: STRATS['multi']; default: string; colorSchemes: Record<string, Color_Scheme> }
          export type System = Base & { strategy: STRATS['system']; default: string; fallback?: string; colorSchemes?: Record<string, Color_Scheme> }
        }
      }
    }
  }
}
