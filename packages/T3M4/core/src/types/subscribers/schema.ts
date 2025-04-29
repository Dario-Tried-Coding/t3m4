import { LinientAutoComplete } from '@t3m4/utils'
import { DEFAULT } from '../constants/miscellaneous'

export namespace Schema {
  export type System_Values = Partial<{ light: string; dark: string; system: string; custom: string[] }>

  export namespace Opts {
    export type Implicit = true
    export type Mono = LinientAutoComplete<DEFAULT>
    export type Multi = string[]
    export type Light_Dark = Omit<System_Values, 'system'>
    export type System = System_Values
  }

  export namespace Facet {
    export type Generic = Opts.Implicit | Opts.Mono | Opts.Multi
    export type Mode = Generic | Opts.Light_Dark | Opts.System
  }

  export type Island = {
    facets?: {
      [facet: string]: Facet.Generic
    }
    mode?: Facet.Mode
  }

  export type All = {
    [island: string]: Island
  }
}
