import * as Schema from '../schema'

import * as Island from './island/branded'

export type Static = {
  [island: string]: Island.Static
}

export type Dynamic<Sc extends Schema.Primitive> = {
  [I in keyof Schema.Polished<Sc>]: Island.Dynamic<Schema.Polished<Sc>[I]>
}

export * as Island from './island/branded'
