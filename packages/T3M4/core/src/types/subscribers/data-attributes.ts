import { Schema } from './schema'
import { State } from './state'

export namespace Data_Attributes {
  export type Islands<Sc extends Schema> = { 'data-island'?: keyof Schema.Polished<Sc> }

  type UnionToIntersection<U> = (U extends any ? (x: U) => any : never) extends (x: infer I) => any ? I : never
  type Merge<T> = {
    [K in keyof T]: T[K]
  }
  type Flatten<T extends Record<string, Record<string, string>>> = Merge<
    UnionToIntersection<
      {
        [K in keyof T & string]: {
          [P in keyof T[K] & string]: T[K][P]
        }
      }[keyof T & string]
    >
  >

  export type Force<Sc extends Schema> = Partial<Flatten<{
    [I in keyof State<Sc>]: (State<Sc>[I] extends State.Static.Island.Facets
      ? {
          facets: {
            [F in keyof State<Sc>[I]['facets'] as `data-force-${I}-${Extract<F, string>}`]: State<Sc>[I]['facets'][F]
          }
        }['facets']
      : {}) &
      (State<Sc>[I] extends State.Static.Island.Mode
        ? {
            [A in `data-force-${I}-mode`]: State<Sc>[I]['mode']
          }
        : {})
  }>>
}