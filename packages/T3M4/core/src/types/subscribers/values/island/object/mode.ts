import * as Schema from '../../schema'

import * as Facet from '../facet/mode'

export type Static = {
  mode: Facet.Static
}

export type Dynamic<Sc extends Schema.Island.Mode.Primitive['mode']> = {
  readonly mode: Facet.Dynamic<Sc>
}

export * as Facet from '../facet/mode'
