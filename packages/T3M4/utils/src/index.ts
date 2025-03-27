export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

declare const __brand: unique symbol
export type Branded<T, Brand> = T & { [__brand]: Brand }

export type LinientAutoComplete<T extends string> = T | string & {}