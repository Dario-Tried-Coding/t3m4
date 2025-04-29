import { Schema } from '../schema'
import { State } from '../state'
import { Generic_Config } from './generic'
import { Mode_Config } from './mode'

export namespace Config {
  export namespace Facet {
    export namespace Generic {
      export type Dynamic<S extends Schema.All, I extends keyof S, F extends keyof S[I]['facets']> = S[I]['facets'][F] extends Schema.Facet.Generic ? Generic_Config.All.Dynamic<S[I]['facets'][F]> : never
      export type Static = Generic_Config.All.Static
    }

    export namespace Mode {
      export type Dynamic<S extends Schema.All, I extends keyof S> = S[I]['mode'] extends Schema.Facet.Mode ? Mode_Config.All.Dynamic<S[I]['mode']> : never
      export type Static = Mode_Config.All.Static
    }
  }

  export namespace Island {
    export namespace Facets {
      export type Dynamic<S extends Schema.All, I extends keyof S> = {
        facets: {
          [F in keyof S[I]['facets']]: Facet.Generic.Dynamic<S, I, F>
        }
      }

      export type Static = {
        facets?: {
          [facet: string]: Facet.Generic.Static
        }
      }
    }

    export namespace Mode {
      export type Dynamic<S extends Schema.All, I extends keyof S> = { mode: Facet.Mode.Dynamic<S, I> }
      export type Static = { mode?: Facet.Mode.Static }
    }

    export type Dynamic<S extends Schema.All, I extends keyof S> = (S[I]['facets'] extends NonNullable<Schema.Island['facets']> ? Facets.Dynamic<S, I> : {}) & (S[I]['mode'] extends NonNullable<Schema.Island['mode']> ? Mode.Dynamic<S, I> : {})
    export type Static = Facets.Static & Mode.Static
  }

  export namespace All {
    export type Dynamic<S extends Schema.All> = {
      [I in keyof S]: Island.Dynamic<S, I>
    }

    export type Static = {
      [island: string]: Island.Static
    }
  }
}

const schema = {
  root: {
    facets: {
      color: ['blue', 'red'],
      radius: true,
    },
    mode: 'custom-default',
  },
} as const satisfies Schema.All

const config = {
  root: {
    facets: {
      color: {
        strategy: 'multi',
        default: 'blue',
      },
      radius: {
        strategy: 'mono',
        default: 'default',
      },
    },
    mode: {
      strategy: 'mono',
      default: 'custom-default',
      colorScheme: 'dark',
    },
  },
} as const satisfies Config.All.Dynamic<typeof schema>

type state = State.All.AsObj.Dynamic<typeof schema, typeof config>
