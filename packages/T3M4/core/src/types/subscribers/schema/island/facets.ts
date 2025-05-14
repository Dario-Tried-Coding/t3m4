import * as Facet from '../facet'

export type Primitive = {
  facets: {
    [facet: string]: Facet.Primitive
  }
}

export type Suggested = {
  facets: {
    [facet: string]: Facet.Suggested
  }
}

export * as Facet from '../facet'