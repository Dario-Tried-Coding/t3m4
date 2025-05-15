import * as Schema from '../../../schema'

import * as Facet from '../../facet/mode/branded'

export type Static = {
  mode: Facet.Static
}

export type Dynamic<Sc extends Schema.Island.Mode.Facet.Primitive> = {
  readonly mode: Facet.Dynamic<Sc>
}

export * as Facet from '../../facet/mode/branded'
