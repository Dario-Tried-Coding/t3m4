import {Facet as T_Facet, Mode as T_Mode} from "./facet"

export type Island = Partial<Island.Facets & Island.Mode>
export namespace Island {
  export type Facets = {
    facets: {
      [facet: string]: Facets.Facet
    }
  }
  export namespace Facets {
    export type Facet = T_Facet
    export namespace Facet {
      export type Mono = T_Facet.Mono
      export type Multi = T_Facet.Multi
    }
  }
  
  export type Mode = {
    mode: Mode.Facet
  }
  export namespace Mode {
    export type Facet = T_Mode
    export namespace Facet {
      export type Mono = T_Mode.Mono
      export type Multi = T_Mode.Multi
      export type System = T_Mode.System
    }
  }
}

export type Suggested = Partial<Suggested.Facets & Suggested.Mode>
export namespace Suggested {
  export type Facets = {
    facets: {
      [facet: string]: T_Facet.Suggested
    }
  }
  export namespace Facets {
    export type Facet = T_Facet.Suggested
    export namespace Facet {
      export type Mono = T_Facet.Suggested.Mono
      export type Multi = T_Facet.Suggested.Multi
    }
  }

  export type Mode = {
    mode: Mode.Facet
  }
  export namespace Mode {
    export type Facet = T_Mode.Suggested
    export namespace Facet {
      export type Mono = T_Mode.Suggested.Mono
      export type Multi = T_Mode.Suggested.Multi
      export type System = T_Mode.Suggested.System
    }
  }
}