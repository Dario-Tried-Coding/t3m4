import * as Schema from '../schema'

import * as Island from './island'

export type Static = {
  [island: string]: Island.Static
}

export type Dynamic<Sc extends Schema.Primitive> = {
  [I in keyof Schema.Polished<Sc>]: Island.Dynamic<Schema.Polished<Sc>[I]>
}

type IsMeaningfulIsland<C extends Static[keyof Static]> = C extends Island.Mode.Static ? true : C extends Island.Facets.Static ? (keyof C['facets'] extends never ? false : true) : false
export type Polished<C extends Static> = {
  [I in keyof C as IsMeaningfulIsland<C[I]> extends true ? I : never]: C[I]
}

export * as Island from './island'