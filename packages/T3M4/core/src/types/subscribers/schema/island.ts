import {Facet, Mode as Mode_Facet} from "./facet"

export type Island = Partial<Island.Facets & Island.Mode>
export namespace Island {
  export type Facets = {
    facets: {
      [facet: string]: Facet
    }
  }
  
  export type Mode = {
    mode: Mode_Facet
  }
}

export type Suggested = Partial<Suggested.Facets & Suggested.Mode>
export namespace Suggested {
  export type Facets = {
    facets: {
      [facet: string]: Facet.Suggested
    }
  }

  export type Mode = {
    mode: Mode_Facet.Suggested
  }
}

export type Branded<Sc extends Island> = (Sc extends Island.Facets ? Branded.Facets<Sc['facets']> : {}) & (Sc extends Island.Mode ? Branded.Mode<Sc['mode']> : {})
export namespace Branded {
  export type Facets<Sc extends Island.Facets['facets']> = {
    facets: {
      [F in keyof Sc]: Facet.Branded<Sc[F]>
    }
  }

  export type Mode<Sc extends Island.Mode['mode']> = {
    mode: Mode_Facet.Branded<Sc>
  }
}