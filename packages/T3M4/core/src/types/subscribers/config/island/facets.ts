import * as Schema from '../../schema'

import * as Facet from '../facet'

export type Dynamic<Sc extends Schema.Island.Facets.Primitive['facets']> = {
  facets: {
    [F in keyof Sc]: Facet.Dynamic<Sc[F]>
  }
}

export type Static = {
  facets: {
    [facet: string]: Facet.Static
  }
}

export * as Facet from '../facet'