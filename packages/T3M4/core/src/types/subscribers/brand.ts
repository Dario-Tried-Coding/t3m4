import { Facet } from '../constants/facets'
import { Mode } from '../constants/modes'
import { Strat } from '../constants/strats'

export type Brand_Map = {
  type: Facet
  strat: Strat
  facet: string
  mode: Mode
}
export type Brand<T, B extends Partial<Brand_Map>> = T & { [K in keyof B as K extends string ? `__${K}` : never]: B[K] }

type Brandable = bigint | boolean | number | string | symbol
type BrandableOf<T> = T extends bigint ? bigint : T extends boolean ? boolean : T extends number ? number : T extends string ? string : T extends symbol ? symbol : never

export type Unbrand<T> = T extends Brandable
  ? T extends infer U &
      (
        | {
            [Key in keyof T as Key extends keyof BrandableOf<T> ? never : Key]: T[Key]
          }
        | object
      )
    ? U
    : never
  : T