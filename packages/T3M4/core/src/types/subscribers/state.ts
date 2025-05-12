import { Schema } from './schema'

export namespace State {
  export namespace AsObj {
    type Island<Sc extends Schema.Flattened.Island<Schema.Island>> = keyof Sc extends never
      ? never
      : (Sc extends Schema.Flattened.Island.Facets<Schema.Island.Facets> ? (keyof Sc['facets'] extends never ? {} : Sc['facets']) : {}) & (Sc extends Schema.Flattened.Island.Mode<Schema.Island.Mode> ? { readonly mode: Sc['mode'] } : {})

    export type Dynamic<Sc extends Schema> = {
      [I in keyof Schema.Flattened<Sc> as keyof Island<Schema.Flattened<Sc>[I]> extends never ? never : I]: Island<Schema.Flattened<Sc>[I]>
    }

    export type Static = {
      [island: string]: {
        facets?: {
          [facet: string]: string
        }
        mode?: string
      }
    }
  }

  export type AsMap = Map<string, { facets?: Map<string, string>; mode?: string }>
}
