import { Color_Scheme } from '../constants/color-schemes'
import { Config } from './config'

export type Color_Schemes<C extends Config.Static> = {
  [I in keyof Config.Polished.Mode<C>]: Color_Schemes.Island<C[I]>
}
export namespace Color_Schemes {
  export type Island<C extends Config.Static.Island> = {
    [K in keyof C as C extends Config.Static.Island.Mode ? K : never]: C['mode'] extends Config.Static.Island.Mode.Facet.Mono
      ? C['mode']['colorScheme']
      : C['mode'] extends Config.Static.Island.Mode.Facet.Multi
        ? C['mode']['colorSchemes'][keyof C['mode']['colorSchemes']]
        : C['mode'] extends Config.Static.Island.Mode.Facet.System
          ? Color_Scheme
          : never
  }
  export namespace Island {
    export type Static = Color_Scheme
  }

  export type Static = {
    [island: string]: Color_Scheme
  }
  export namespace Static {
    export type Island = Color_Scheme

    export type AsMap = Map<string, Color_Scheme>
    export namespace AsMap {
      export type Island = Color_Scheme
    }
  }
}
