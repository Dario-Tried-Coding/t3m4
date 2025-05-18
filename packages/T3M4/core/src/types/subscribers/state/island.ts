import { Schema } from "../schema";
import { Facet as T_Facet, Mode as T_Mode } from "./facet";

export type Island<Sc extends Schema.Island> = (Sc extends Schema.Island.Facets ? Island.Facets<Sc['facets']> : {}) & (Sc extends Schema.Island.Mode ? Island.Mode<Sc['mode']> : {});
export namespace Island {
  export type Facets<Sc extends Schema.Island.Facets['facets']> = {
    facets: {
      [F in keyof Sc]: T_Facet<Sc[F]>;
    }
  }
  export namespace Facets {
    export type Facet<Sc extends Schema.Island.Facets.Facet> = T_Facet<Sc>
    export namespace Facet {
      export type Mono<Sc extends Schema.Island.Facets.Facet.Mono> = T_Facet.Mono<Sc>
      export type Multi<Sc extends Schema.Island.Facets.Facet.Multi> = T_Facet.Multi<Sc>

      export type Static = T_Facet.Static
    }
  }

  export type Mode<Sc extends Schema.Island.Mode['mode']> = {
    mode: T_Mode<Sc>
  }
  export namespace Mode {
    export type Facet<Sc extends Schema.Island.Mode.Facet> = T_Mode<Sc>
    export namespace Facet {
      export type Mono<Sc extends Schema.Island.Mode.Facet.Mono> = T_Mode.Mono<Sc>
      export type Multi<Sc extends Schema.Island.Mode.Facet.Multi> = T_Mode.Multi<Sc>
      export type System<Sc extends Schema.Island.Mode.Facet.System> = T_Mode.System<Sc>

      export type Static = T_Mode.Static
    }
  }

  export type Static = Partial<Static.Facets & Static.Mode>
  export namespace Static {
    export type Facets = {
      facets: {
        [facet: string]: Facets.Facet
      }
    }
    export namespace Facets {
      export type Facet = T_Facet.Static
    }

    export type Mode = {
      mode: Mode.Facet
    }
    export namespace Mode {
      export type Facet = T_Facet.Static
    }
  }

  export type AsMap = Partial<AsMap.Facets & AsMap.Mode>
  export namespace AsMap {
    export type Facets = {
      facets: Map<string, Facets.Facet>
    }
    export namespace Facets {
      export type Facet = T_Facet.Static
    }

    export type Mode = {
      mode: Mode.Facet
    }
    export namespace Mode {
      export type Facet = T_Facet.Static
    }
  }
}