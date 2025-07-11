import { COLOR_SCHEME } from '../constants'
import { Config } from './config'

export type Color_Schemes<C extends Config.Static> = {
  [I in keyof Config.Polished.Mode<C>]: Color_Schemes.Island<C[I]>
}
export namespace Color_Schemes {
  export type Island<C extends Config.Static.Island> = C extends Config.Static.Island.Mode
    ? C['mode'] extends Config.Static.Island.Mode.Facet.Mono
      ? C['mode']['colorScheme']
      : C['mode'] extends Config.Static.Island.Mode.Facet.Multi
        ? C['mode']['colorSchemes'][keyof C['mode']['colorSchemes']]
        : C['mode'] extends Config.Static.Island.Mode.Facet.System
          ? COLOR_SCHEME
          : never
    : never

  export type Static = {
    [island: string]: COLOR_SCHEME
  }
  export namespace Static {
    export type Island = COLOR_SCHEME

    export type AsMap = Map<string, COLOR_SCHEME>
    export namespace AsMap {
      export type Island = COLOR_SCHEME
    }
  }
}
