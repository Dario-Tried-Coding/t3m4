import { Schema, Schema_Polished } from "../schema"

export type Config<Sc extends Schema> = {
  [I in keyof Schema_Polished<Sc>]: Island.Dynamic<Schema.Polished<Sc>[I]>
}

export type Config_Static = {
  [island: string]: Island.Static
}

type IsMeaningfulIsland<C extends Static[keyof Static]> = C extends Island.Mode.Static ? true : C extends Island.Facets.Static ? (keyof C['facets'] extends never ? false : true) : false
export type Config_Polished<C extends Static> = {
  [I in keyof C as IsMeaningfulIsland<C[I]> extends true ? I : never]: C[I]
}
