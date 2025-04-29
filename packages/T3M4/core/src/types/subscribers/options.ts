import { DEFAULT } from '../constants/miscellaneous'
import { STRATS } from '../constants/strats'
import { Config } from './config'
import { Schema } from './schema'
import { State } from './state'

// export namespace Options {
//   export namespace Facet {
//     export type Dynamic<Sc extends Schema, C extends Config.All.Dynamic<Sc>, St extends State.All.AsObj.Dynamic<Sc, C>, I extends keyof Sc, F extends keyof Sc[I]> = I extends keyof St
//       ? F extends keyof St[I]
//         ? St[I][F][]
//         : 'F does not extend keyof St[I]'
//       : 'I does not extend keyof St'
//     export type Static = string[]
//   }

//   export namespace Island {
//     export namespace AsObj {
//       export type Dynamic<Sc extends Schema, C extends Config.All.Dynamic<Sc>, St extends State.All.AsObj.Dynamic<Sc, C>, I extends keyof Sc> = { [F in keyof St[I]]: I extends keyof Sc ? F extends keyof Sc[I] ? Options.Facet.Dynamic<Sc, C, St, I, F> : 'F does not extend keyof Sc[I]' : 'I does not extend keyof Sc' }
//       export type Static = {
//         [facet: string]: Options.Facet.Static
//       }
//     }

//     export namespace AsMap {
//       export type Common = Map<string, Options.Facet.Static>
//     }
//   }

//   export namespace All {
//     export namespace AsObj {
//       export type Dynamic<Sc extends Schema, C extends Config.All.Dynamic<Sc>, St extends State.All.AsObj.Dynamic<Sc, C>> = {
//         [I in keyof St]: I extends keyof Sc ? Options.Island.AsObj.Dynamic<Sc, C, St, I> : 'I does not extend keyof Sc'
//       }
//       export type Static = {
//         [island: string]: Options.Island.AsObj.Static
//       }
//     }

//     export namespace AsMap {
//       export type Common = Map<string, Options.Island.AsMap.Common>
//     }
//   }
// }

export namespace Values {
  export namespace Facet {
    export namespace Generic {
      type Implicit_Facet<Sc extends Schema.All, C extends Config.All.Dynamic<Sc>, I extends keyof Sc, F extends Schema.Opts.Implicit> = I extends keyof C
        ? C[I] extends Config.Island.Facets.Dynamic<Sc, I>
          ? F extends keyof C[I]['facets']
            ? C[I]['facets'][F]['strategy'] extends STRATS['mono']
              ? DEFAULT
              : C[I]['facets'][F]['strategy'] extends STRATS['light_dark']
                ? 'ok'
                : 'altro ok'
            : 'F does not extend keyof C[I]["facets"]'
          : 'no facets defined in this island'
        : 'I does not extend keyof C'

      export type Dynamic<Sc extends Schema.All, C extends Config.All.Dynamic<Sc>, I extends keyof Sc, F extends keyof Sc[I]> = {}
    }
  }

  export namespace Island {
    export namespace AsObj {
      export type Dynamic<Sc extends Schema.All, C extends Config.All.Dynamic<Sc>, I extends keyof Sc> = {}
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
