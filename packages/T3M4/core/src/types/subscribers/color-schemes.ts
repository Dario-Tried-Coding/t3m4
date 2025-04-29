import { COLOR_SCHEME } from '../constants/color-schemes'
import { FACETS } from '../constants/facets'
import { Config } from './config'
import { Schema } from './schema'

export namespace Color_Schemes {
  type HasMode<T> = Extract<T, { type: FACETS['MODE'] }> extends never ? false : true

  export type Color_Scheme = COLOR_SCHEME

  export namespace AsObj {
    export type Dynamic<Sc extends Schema, C extends Config.All.Dynamic<Sc>> = {
      [I in keyof C as HasMode<{ [F in keyof C[I]]: C[I][F] }[keyof C[I]]> extends true ? I : never]: Color_Scheme
    }

    export type Static = {
      [island: string]: Color_Scheme
    }
  }

  export namespace AsMap {
    export type Common = Map<string, Color_Scheme>
  }
}