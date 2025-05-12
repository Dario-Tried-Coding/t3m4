import { Color_Scheme } from '../constants/color-schemes'
import { Config } from './config'
import { Mode_Config } from './config/mode'

export namespace Color_Schemes {
  export type Island<C extends Config.Island.Mode.Static['mode']> = C extends Mode_Config.Mono.Static
    ? C['colorScheme']
    : C extends Mode_Config.Multi.Static
      ? C['colorSchemes'][keyof C['colorSchemes']]
      : C extends Mode_Config.System.Static
        ? Color_Scheme
        : never

  export namespace AsObj {
    export type Dynamic<C extends Config.Static> = {
      [I in keyof C as [Island<C[I]['mode']>] extends [never] ? never : I]: Island<C[I]['mode']>
    }

    export type Static = {
      [island: string]: Color_Scheme
    }
  }

  export namespace AsMap {
    export namespace Static {
      export type Common = Map<string, Color_Scheme>
    }
  }
}
