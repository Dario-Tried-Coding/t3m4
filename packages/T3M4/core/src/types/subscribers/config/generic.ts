import { DEFAULT } from '../../constants/miscellaneous';
import { STRATS } from '../../constants/strats'
import { Schema } from '../schema';

export namespace Generic_Config {
  export namespace Mono {
    export type Dynamic<V extends Schema.Opts.Mono> = { strategy: STRATS['mono'], default: V }
    export type Default = Dynamic<DEFAULT>
    export type Static = { strategy: STRATS['mono'], default: string }
  }

  export namespace Multi {
    export type Dynamic<V extends Schema.Opts.Multi> = { strategy: STRATS['multi'], default: V[number] }
    export type Static = { strategy: STRATS['multi'], default: string }
  }

  export namespace All {
    export type Dynamic<O extends Schema.Opts.Facets.Generic> = O extends Schema.Opts.Implicit ? Mono.Default : O extends Schema.Opts.Mono ? Mono.Dynamic<O> : O extends Schema.Opts.Multi ? Multi.Dynamic<O> : never
    export type Static = Mono.Static | Multi.Static
  }

}