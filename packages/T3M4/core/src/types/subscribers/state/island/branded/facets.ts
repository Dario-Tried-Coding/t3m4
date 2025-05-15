import * as Schema from '../../../schema'

import { FACETS } from '../../../../constants/facets'

import * as Facet from '../../facet/branded'

export type Static = {
  facets: {
    [facet: string]: Facet.Static
  }
}

export type Dynamic<Sc extends Schema.Island.Facets.Primitive['facets']> = {
  readonly facets: {
    [F in keyof Sc]: Facet.Dynamic<Sc[F], { facet: Extract<F, string>; type: FACETS['generic'] }>
  }
}

export * as Facet from '../../facet/branded'