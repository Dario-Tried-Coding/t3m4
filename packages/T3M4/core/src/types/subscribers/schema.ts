import { Opts } from './opts'

export namespace Schema {
  export namespace Facet {
    export type Generic = Opts.Suggested.Mono | Opts.Primitive.Multi
    export type Mode = Generic | Opts.Suggested.System
  }

  export type Island = {
    facets?: {
      [facet: string]: Facet.Generic
    }
    mode?: Facet.Mode
  }

  export type All = {
    [island: string]: Island
  }
}

const schema = {
  root: {
    facets: {
      color: ['blue', 'red', 'green'],
      radius: 'custom-default',
    },
    mode: 'custom-mode',
  },
  island: {
    mode: { light: 'light', dark: 'dark', custom: ['custom1', 'custom2'], system: 'system' },
  },
  island2: {
    mode: ['mode1', 'mode2'],
  },
} as const satisfies Schema.All