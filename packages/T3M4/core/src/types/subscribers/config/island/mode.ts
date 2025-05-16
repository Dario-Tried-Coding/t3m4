import * as Schema from '../../schema'

import * as Facet from '../facet/mode'

export type Dynamic<Sc extends Schema.Island.Mode.Primitive['mode']> = {
  mode: Facet.Dynamic<Sc>
}

export type Static = {
  mode: Facet.Static
}

export * as Facet from '../facet/mode'
