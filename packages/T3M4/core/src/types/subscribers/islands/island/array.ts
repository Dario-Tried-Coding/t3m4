import * as Schema from '../../schema'

export type { Static } from './map'
export type Dynamic<Sc extends Schema.Primitive> = keyof Schema.Polished<Sc>
