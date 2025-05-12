import { Prettify } from '@t3m4/utils'
import { FACETS } from '../constants/facets'
import { Brand, Unbrand } from './brand'
import { Config } from './config'
import { Opts } from './opts'
import { Schema } from './schema'

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
    export type AsObj<Sc extends Schema.Branded.Island<Schema.Primitive.Island>> = (Sc extends Schema.Branded.Island.Facets<NonNullable<Schema.Primitive.Island['facets']>> ? { facets: { [F in keyof Sc['facets']]: Unbrand<Sc['facets'][F]> } } : {}) & (Sc extends Schema.Branded.Island.Mode<NonNullable<Schema.Primitive.Island['mode']>> ? { mode: Unbrand<Sc['mode']> } : {})
    // export namespace AsObj {
    //   type Mode_Facet_Name<N extends string | undefined> = N extends string ? N : FACETS['mode']

    //   export type Dynamic<Sc extends Schema.All, C extends Config.All.Dynamic<Sc>, I extends keyof Sc> = I extends keyof C
    //     ? (C[I] extends Config.Island.Facets.Dynamic<Sc, I> ? { [F in keyof C[I]['facets']]: C[I]['facets'][F]['default'] } : {}) &
    //         (C[I] extends Config.Island.Mode.Dynamic<Sc, I> ? { readonly [N in Mode_Facet_Name<C[I]['mode']['name']>]: C[I]['mode']['default'] } : {})
    //     : 'I does not extend keyof C'

    //   export type Static = {
    //     facets?: {
    //       [facet: string]: State.Facet.Static
    //     }
    //     mode?: State.Facet.Static
    //   }
    // }
  }

  export namespace AsObj {
    export type Dynamic<Sc extends Schema.Primitive> = {
      [I in keyof Schema.Branded<Sc>]: Island.AsObj<Schema.Branded<Sc>[I]>
    }
  }
}



// const config = {
//   island: {
//     facets: {
//       font: {
//         strategy: 'multi',
//         default: 'sans',
//       },
//     },
//     mode: {
//       strategy: 'system',
//       default: 'custom2',
//       colorSchemes: {
//         custom1: 'dark',
//         custom2: 'light',
//       },
//     },
//   },
//   island2: {
//     mode: {
//       strategy: 'multi',
//       default: 'mode1',
//       colorSchemes: {
//         mode1: 'dark',
//         mode2: 'light',
//       },
//     },
//   },
//   root: {
//     mode: {
//       strategy: 'mono',
//       default: 'custom-mode',
//       colorScheme: 'dark',
//     },
//     facets: {
//       color: {
//         strategy: 'multi',
//         default: 'blue',
//       },
//       radius: {
//         strategy: 'mono',
//         default: 'custom-default',
//       },
//     },
//   },
// } as const satisfies Config.Dynamic<typeof schema>
