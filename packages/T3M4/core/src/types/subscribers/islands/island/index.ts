import * as Options from '../../options'
import * as Schema from '../../schema'

export type Dynamic<Sc extends Schema.Primitive> = keyof Schema.Polished<Sc>
export type Static = Options.Mono.Primitive