import * as Schema from '../schema'

import * as Island from './island'

export type Static = Array<Island.Static>
export type Dynamic<I extends Island.Dynamic<Schema.Primitive>> = Array<I>