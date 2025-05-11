import { Color_Scheme } from '../constants/color-schemes'
import { Config } from './config'
import { Mode_Config } from './config/mode'
import { Schema } from './schema'

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

const schema = {
  root: {
    facets: {
      color: ['blue', 'red', 'green'],
      radius: 'custom-default',
    },
    // mode: 'custom-mode',
  },
  island: {
    facets: {
      font: ['sans', 'serif'],
    },
    mode: { light: 'light', dark: 'dark', custom: ['custom1', 'custom2'] },
  },
  island2: {
    mode: ['mode1', 'mode2'],
  },
} as const satisfies Schema.Primitive.All

const config = {
  island: {
    facets: {
      font: {
        strategy: 'multi',
        default: 'sans',
      },
    },
    mode: {
      strategy: 'system',
      default: 'custom2',
      colorSchemes: {
        custom1: 'dark',
        custom2: 'light',
      },
    },
  },
  island2: {
    mode: {
      strategy: 'multi',
      default: 'mode1',
      colorSchemes: {
        mode1: 'dark',
        mode2: 'light',
      },
    },
  },
  root: {
    // mode: {
    //   strategy: 'mono',
    //   default: 'custom-mode',
    //   colorScheme: 'dark',
    // },
    facets: {
      color: {
        strategy: 'multi',
        default: 'blue',
      },
      radius: {
        strategy: 'mono',
        default: 'custom-default',
      },
    },
  },
} as const satisfies Config.Dynamic<typeof schema>

type test = Color_Schemes.AsObj.Dynamic<typeof config>
