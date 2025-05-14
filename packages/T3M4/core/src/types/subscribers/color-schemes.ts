import { Color_Scheme } from '../constants/color-schemes'
import { Config } from './config'
import { Mode_Config } from './config/mode'
import { Schema } from './schema'

export namespace Color_Schemes {
  export type AsObj<C extends Config<Schema>> = {
    [I in keyof C as [AsObj.Island<C[I]>] extends [undefined] ? never : I]: AsObj.Island<C[I]>
  }
  export namespace AsObj {
    export type Island<C extends Config.Island.Mode.Static> = C['mode'] extends Mode_Config.Mono.Static
      ? C['mode']['colorScheme']
      : C['mode'] extends Mode_Config.Multi.Static
        ? C['mode']['colorSchemes'][keyof C['mode']['colorSchemes']]
        : C['mode'] extends Mode_Config.System.Static
          ? Color_Scheme
          : undefined

    export type Static = {
      [island: string]: Color_Scheme
    }
  }

  export type AsMap = Map<string, Color_Scheme>
}
