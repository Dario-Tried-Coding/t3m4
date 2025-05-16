import * as Schema from '../schema'

import * as Island from './island/array'

export type Static = Array<Island.Static>
export type Dynamic<I extends Schema.Primitive> = Array<Island.Dynamic<I>>

export * as Island from './island/array'
