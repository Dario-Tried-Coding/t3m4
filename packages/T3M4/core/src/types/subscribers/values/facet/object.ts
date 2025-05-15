import * as Options from '../../options'
import * as Schema from '../../schema'

export type Static = Options.Multi.Primitive
export type Dynamic<Sc extends Schema.Island.Facets.Facet.Primitive> = Sc extends Options.Mono.Primitive ? [Sc] : Sc extends Options.Multi.Primitive ? Sc : never
