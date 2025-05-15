import * as Island from './island'

export type Primitive = {
  [island: string]: Island.Primitive
}

export type Suggested = {
  [island: string]: Island.Suggested
}

type IsMeaningfulIsland<I extends Island.Primitive> = I extends Island.Mode.Primitive ? true : I extends Island.Facets.Primitive ? (keyof I['facets'] extends never ? false : true) : false
export type Polished<Sc extends Primitive> = {
  [I in keyof Sc as IsMeaningfulIsland<Sc[I]> extends true ? I : never]: Sc[I]
}

export * as Island from './island'