import * as Schema from '../../../schema'

import * as Facet from '../../facet/primitive'

export type Static = {
  facets: {
    [facet: string]: Facet.Static
  }
}

export type Dynamic<Sc extends Schema.Island.Facets.Primitive['facets']> = {
  readonly facets: {
    [F in keyof Sc]: Facet.Dynamic<Sc[F]>
  }
}

export * as Facet from '../../facet/primitive'
