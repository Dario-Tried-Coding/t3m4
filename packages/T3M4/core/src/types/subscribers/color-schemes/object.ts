import * as Config from '../config'

import * as Island from './island/object'

export type Static = {
  [island: string]: Island.Static
}

export type Dynamic<C extends Config.Static> = {
  [I in keyof C as 'mode' extends keyof C[I] ? I : never]: C[I] extends Config.Island.Mode.Static ? Island.Dynamic<C[I]['mode']> : never
}

export * as Island from './island/object'
