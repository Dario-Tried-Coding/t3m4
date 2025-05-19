export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : T
export namespace Expand {
  export type Union<T> = T extends unknown ? T : never
}

export type Branded<T, P extends string, V> = T & { [K in `__${P}`]: V }

export type LinientAutoComplete<T extends string> = T | (string & {})
