import { Color_Scheme } from '../constants/color-schemes'
import { Config } from './config'
import { Mode_Config } from './config/mode'

export namespace Color_Schemes {
  type Island<C extends Config.Island.Mode.Static['mode']> = C extends Mode_Config.Mono.Static
    ? C['colorScheme']
    : C extends Mode_Config.Multi.Static
      ? C['colorSchemes'][keyof C['colorSchemes']]
      : C extends Mode_Config.System.Static
        ? Color_Scheme
        : never

  export type AsObj<C extends Config.Static> = {
    [I in keyof C as [Island<C[I]['mode']>] extends [never] ? never : I]: Island<C[I]['mode']>
  }
  export namespace AsObj {
    export type Static = {
      [island: string]: Color_Scheme
    }
  }

  export type AsMap = Map<string, Color_Scheme>
}
