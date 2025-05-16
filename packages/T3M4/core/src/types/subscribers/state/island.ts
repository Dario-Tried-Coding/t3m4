import { FACETS } from "../../constants/facets"
import { Island_Facets as Schema_Island_Facets, Island_Mode as Schema_Island_Mode, Island as Schema_Island } from "../schema/island"
import { Facet, Facet_Static, Facet_Branded, Mode, Mode_Static, Mode_Branded } from "./facet"

export type Island_Facets<Sc extends Schema_Island_Facets['facets']> = {
  readonly facets: {
    [F in keyof Sc]: Facet<Sc[F]>
  }
}
export type Island_Facets_Static = {
  facets: {
    [facet: string]: Facet_Static
  }
}
export type Island_Facets_Branded<Sc extends Schema_Island_Facets['facets']> = {
  readonly facets: {
    [F in keyof Sc]: Facet_Branded<Sc[F], { facet: Extract<F, string>; type: FACETS['generic'] }>
  }
}

export type Island_Mode<Sc extends Schema_Island_Mode['mode']> = {
  readonly mode: Mode<Sc>
}
export type Island_Mode_Static = {
  mode: Mode_Static
}
export type Island_Mode_Branded<Sc extends Schema_Island_Mode['mode']> = {
  readonly mode: Mode_Branded<Sc>
}

export type Island<Sc extends Schema_Island> = (Sc extends Schema_Island_Facets ? Island_Facets<Sc['facets']> : {}) & (Sc extends Schema_Island_Mode ? Island_Mode<Sc['mode']> : {})
export type Island_Static = Partial<Island_Facets_Static & Island_Mode_Static>
export type Island_Branded<Sc extends Schema_Island> = (Sc extends Schema_Island_Facets ? Island_Facets_Branded<Sc['facets']> : {}) & (Sc extends Schema_Island_Mode ? Island_Mode_Branded<Sc['mode']> : {})