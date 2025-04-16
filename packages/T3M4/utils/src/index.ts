export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : T

declare const __brand: unique symbol
export type Branded<T, Brand> = T & { [__brand]: Brand }

export type LinientAutoComplete<T extends string> = T | string & {}