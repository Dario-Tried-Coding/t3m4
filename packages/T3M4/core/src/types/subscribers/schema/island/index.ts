import * as Facets from "./facets"
import * as Mode from './mode'

export type Primitive = Partial<Facets.Primitive & Mode.Primitive>
export type Suggested = Partial<Facets.Suggested & Mode.Suggested>

export * as Facets from "./facets"
export * as Mode from './mode'