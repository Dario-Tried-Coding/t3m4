import * as Config from '../config'

import * as Island from './island/object'

export type Static = {
  [island: string]: Island.Static
}

export type Dynamic<C extends Config.Static> = {
  [I in keyof Config.Polished<C> as C[I] extends Config.Island.Mode.Static ? I : never]: Island.Dynamic<C[I]>
}

export * as Island from './island/object'
