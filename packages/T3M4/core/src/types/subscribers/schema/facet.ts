import { Mono as Mono_Opt, Multi as Multi_Opt, System as System_Opt } from '../options'

export type Facet = Facet.Mono | Facet.Multi
export namespace Facet {
  export type Mono = Mono_Opt
  export type Multi = Multi_Opt

  export type Suggested = Suggested.Mono | Suggested.Multi
  export namespace Suggested {
    export type Mono = Mono_Opt.Suggested
    export type Multi = Multi_Opt
  }
}

export type Mode = Mode.Mono | Mode.Multi | Mode.System
export namespace Mode {
  export type Mono = Facet.Mono
  export type Multi = Facet.Multi
  export type System = System_Opt

  export type Suggested = Suggested.Mono | Suggested.Multi | Suggested.System
  export namespace Suggested {
    export type Mono = Facet.Suggested.Mono
    export type Multi = Facet.Suggested.Multi
    export type System = System_Opt.Suggested
  }
}
