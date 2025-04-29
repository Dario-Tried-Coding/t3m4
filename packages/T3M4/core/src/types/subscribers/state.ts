import { FACETS } from "../constants/facets"
import { Config } from "./config"
import { Schema } from "./schema"


export namespace State {
  export namespace Facet {
    export type Static = string

    export namespace Dynamic {
      export type Generic<Sc extends Schema.All, C extends Config.All.Dynamic<Sc>, I extends keyof Sc, F extends keyof Sc[I]['facets']> = I extends keyof C
        ? C[I] extends Config.Island.Facets.Dynamic<Sc, I>
          ? F extends keyof C[I]['facets']
            ? C[I]['facets'][F]['default']
            : 'F does not extend keyof C[I]["facets"]'
          : 'No facets defined in this island'
        : 'I does note extend keyof C'

      export type Mode<Sc extends Schema.All, C extends Config.All.Dynamic<Sc>, I extends keyof Sc> = I extends keyof C
        ? C[I] extends Config.Island.Mode.Dynamic<Sc, I>
          ? C[I]['mode']['default']
          : 'No mode defined in this island'
        : 'I does not extend keyof C'
    }
  }

  export namespace Island {
    export namespace AsObj {
      type Mode_Facet_Name<N extends string | undefined> = N extends string ? N : FACETS['mode']

      export type Dynamic<Sc extends Schema.All, C extends Config.All.Dynamic<Sc>, I extends keyof Sc> = I extends keyof C
        ? (C[I] extends Config.Island.Facets.Dynamic<Sc, I> ? { [F in keyof C[I]['facets']]: C[I]['facets'][F]['default'] } : {}) &
            (C[I] extends Config.Island.Mode.Dynamic<Sc, I> ? { readonly [N in Mode_Facet_Name<C[I]['mode']['name']>]: C[I]['mode']['default'] } : {})
        : 'I does not extend keyof C'

      export type Static = {
        facets?: {
          [facet: string]: State.Facet.Static
        },
        mode?: State.Facet.Static
      }
    }
  }

  export namespace All {
    export namespace AsObj {
      export type Dynamic<Sc extends Schema.All, C extends Config.All.Dynamic<Sc>> = {
        [I in keyof Sc]: Island.AsObj.Dynamic<Sc, C, I>
      }
    }
  }
}
