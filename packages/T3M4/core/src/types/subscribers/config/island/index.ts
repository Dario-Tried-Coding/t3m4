import * as Schema from '../../schema'

import * as Facets from './facets'
import * as Mode from './mode'

export type Static = Partial<Facets.Static & Mode.Static>
export type Dynamic<Sc extends Schema.Island.Primitive> = (Sc extends Schema.Island.Facets.Primitive ? Facets.Dynamic<Sc['facets']> : {}) & (Sc extends Schema.Island.Mode.Primitive ? Mode.Dynamic<Sc['mode']> : {})

export * as Facets from './facets'
export * as Mode from './mode'
