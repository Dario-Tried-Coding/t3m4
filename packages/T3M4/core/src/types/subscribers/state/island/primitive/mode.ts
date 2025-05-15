import * as Options from '../../../options'
import * as Schema from '../../../schema'

import * as Facet from '../../facet/mode/primitive'

export type Static = {
  mode: Options.Mono.Primitive
}

export type Dynamic<Sc extends Schema.Island.Mode.Facet.Primitive> = {
  readonly mode: Facet.Dynamic<Sc>
}

export * as Facet from '../../facet/mode/primitive'