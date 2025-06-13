type Brand_Stages = {
  coverage: {
    complete: 'complete'
    partial: 'partial' | Brand_Stages['coverage']['complete']
  }
  validation: {
    dirty: 'dirty' | Brand_Stages['validation']['sanitized']
    sanitized: 'sanitized' | Brand_Stages['validation']['normalized']
    normalized: 'normalized'
  }
  toStore: {
    yes: 'yes'
    no: 'no' | Brand_Stages['toStore']['yes']
  }
  type: {
    island: 'island'
    facet: 'facet'
    mode: 'mode'
    option: 'option'
  }
  option: {
    facet: 'facet'
    mode: 'mode'
  }
}

type Brand_Map = {
  [P in keyof Brand_Stages]: keyof Brand_Stages[P]
}

type Non_Primitive_Parameters = Extract<keyof Brand_Map, 'coverage'>

declare const __brand: unique symbol

export type Brand_Metadata<B extends Partial<Brand_Map>> = {
  [__brand]: {
    [P in keyof B]: B[P]
  }
}
export namespace Brand_Metadata {
  export type Static = {
    [__brand]: Partial<Brand_Map>
  }
}

export type Brand<T, B extends Partial<{ [K in keyof Brand_Stages]: keyof Brand_Stages[K] }>> =
  T extends NodeListOf<infer U>
    ? Brand.Shallow<NodeListOf<Brand.Shallow<U, Omit<B, Non_Primitive_Parameters>>>, B>
    : T extends Map<infer K, infer V>
      ? Brand.Shallow<Map<K, Brand<V, B>>, B>
      : T extends Set<infer U>
        ? Brand.Shallow<Set<Brand<U, B>>, B>
        : T extends Array<infer U>
          ? Brand.Shallow<Array<Brand<U, B>>, B>
          : T extends object
            ? Brand.Shallow<{ [K in keyof T]: Brand<T[K], B> }, B>
            : keyof Omit<B, Non_Primitive_Parameters> extends never
              ? T
              : Brand.Shallow<T, Omit<B, Non_Primitive_Parameters>>
export namespace Brand {
  export type Shallow<T, B extends Partial<Brand_Map>> = T & Brand_Metadata<B>
}

export type AtLeast<T, B extends Partial<{ [K in keyof Brand_Stages]: keyof Brand_Stages[K] }>> =
  T extends NodeListOf<infer U>
    ? Brand.Shallow<NodeListOf<Brand.Shallow<U, Omit<B, Non_Primitive_Parameters>>>, B>
    : T extends Map<infer K, infer V>
      ? AtLeast.Shallow<Map<K, AtLeast<V, B>>, B>
      : T extends Set<infer U>
        ? AtLeast.Shallow<Set<AtLeast<U, B>>, B>
        : T extends Array<infer U>
          ? AtLeast.Shallow<Array<AtLeast<U, B>>, B>
          : T extends object
            ? AtLeast.Shallow<{ [K in keyof T]: AtLeast<T[K], B> }, B>
            : keyof Omit<B, Non_Primitive_Parameters> extends never
              ? T
              : AtLeast.Shallow<T, Omit<B, Non_Primitive_Parameters>>
export namespace AtLeast {
  export type Shallow<T, B extends Partial<{ [P in keyof Brand_Stages]: keyof Brand_Stages[P] }>> = T & {
    [__brand]: {
      [P in keyof B]: P extends keyof Brand_Stages ? (B[P] extends keyof Brand_Stages[P] ? Brand_Stages[P][B[P]] : never) : never
    }
  }
}

export type Brand_Info<T> = T extends { [__brand]: infer B } ? B : never
