import { Schema } from '../schema'
import { Generic_Config } from './generic'
import { Mode_Config } from './mode'

export namespace Config {
  export namespace Facet {
    export namespace Generic {
      export type Dynamic<S extends Schema.Facet> = Generic_Config.Dynamic<Schema.Flattened.Branded.Facet<S>>
      export type Static = Generic_Config.Static
    }

    export namespace Mode {
      export type Dynamic<S extends Schema.Facet.Mode> = Mode_Config.Dynamic<Schema.Flattened.Branded.Facet.Mode<S>>
      export type Static = Mode_Config.Static
    }
  }

  export namespace Island {
    export namespace Facets {
      export type Dynamic<S extends NonNullable<Schema.Island['facets']>> = keyof S extends never ? {} : {
        facets: {
          [F in keyof S]: Facet.Generic.Dynamic<S[F]>
        }
      }

      export type Static = {
        facets?: {
          [facet: string]: Facet.Generic.Static
        }
      }
    }

    export namespace Mode {
      export type Dynamic<S extends NonNullable<Schema.Island['mode']>> = { mode: Facet.Mode.Dynamic<S> }
      export type Static = { mode?: Facet.Mode.Static }
    }

    export type Dynamic<S extends Schema.Island> = keyof S extends never
      ? never
      : (S['facets'] extends NonNullable<Schema.Island['facets']> ? Facets.Dynamic<S['facets']> : {}) & (S['mode'] extends NonNullable<Schema.Island['mode']> ? Mode.Dynamic<S['mode']> : {})

    export type Static = Facets.Static & Mode.Static
  }

  export type Dynamic<S extends Schema> = {
    [I in keyof S as Island.Dynamic<S[I]> extends never ? never : I]: Island.Dynamic<S[I]>
  }

  export type Static = {
    [island: string]: Island.Static
  }
}

const schema = {
  root: {
    // facets: {
    //   color: ['blue', 'red', 'green'],
    //   radius: 'custom-default',
    // },
    // mode: 'custom-mode',
  },
  island: {
    facets: {
      font: ['sans', 'serif'],
    },
    mode: { light: 'light', dark: 'dark', system: 'system' },
  },
  island2: {
    mode: ['mode1', 'mode2'],
    facets: {}
  },
} as const satisfies Schema

const config = {
  island: {
    mode: {
      strategy: 'system',
      default: 'system',
      fallback: 'dark',
    },
    facets: {
      font: {
        strategy: 'multi',
        default: 'sans'
      }
    }
  },
  island2: {
    mode: {
      strategy: 'multi',
      default: 'mode1',
      colorSchemes: {
        mode1: 'dark',
        mode2: 'light'
      }
    },
    facets: {

    }
  }
} as const satisfies Config.Dynamic<typeof schema>