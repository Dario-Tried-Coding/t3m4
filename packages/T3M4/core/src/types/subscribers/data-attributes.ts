import { Expand } from '@t3m4/utils'
import { Schema } from './schema'
import { State } from './state'

export type Data_Attributes<Sc extends Schema> = Data_Attributes.Islands<Sc> & Data_Attributes.Force<Sc> & Data_Attributes.Target<Sc>
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

  export type Force<Sc extends Schema> = Partial<
    Flatten<{
      [I in keyof State<Sc>]: (State<Sc>[I] extends State.Static.Island.Facets
        ? {
            facets: {
              [F in keyof State<Sc>[I]['facets'] as `data-force-${I}-facet-${Extract<F, string>}`]: State<Sc>[I]['facets'][F]
            }
          }['facets']
        : {}) &
        (State<Sc>[I] extends State.Static.Island.Mode
          ? {
              readonly [A in `data-force-${I}-mode`]: State<Sc>[I]['mode']
            }
          : {})
    }>
  >

  type AllFacets<T> = T extends Record<string, infer R> ? (R extends Record<string, any> ? keyof R : never) : never
  type FacetValues<T, F extends PropertyKey> = {
    [K in keyof T]: T[K] extends Record<F, infer V> ? V : never
  }[keyof T]
  type MergeFacets<T extends Record<string, Record<string, string> | undefined>> = {
    [F in AllFacets<T>]: Expand<FacetValues<T, F>>
  }

  export type Target<Sc extends Schema> = Partial<
    MergeFacets<{
      [I in keyof State<Sc>]: (State<Sc>[I] extends State.Static.Island.Facets
        ? {
            facets: {
              [F in keyof State<Sc>[I]['facets'] as `data-facet-${Extract<F, string>}`]: State<Sc>[I]['facets'][F]
            }
          }['facets']
        : {}) &
        (State<Sc>[I] extends State.Static.Island.Mode
          ? {
              readonly [A in `data-mode`]: State<Sc>[I]['mode']
            }
          : {})
    }>
  >
}