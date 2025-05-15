import { Expand } from '@t3m4/utils'
import * as Schema from '../schema'

import * as Island from './island/primitive'

export type Static = {
  [island: string]: Island.Static
}
export type Dynamic<Sc extends Schema.Primitive> = {
  [I in keyof Schema.Polished<Sc>]: Island.Dynamic<Schema.Polished<Sc>[I]>
}

export * as Island from './island/primitive'

const schema = {
  island1: {},
  island2: {
    facets: undefined,
  },
  island3: {
    mode: undefined,
  },
  island4: {
    facets: {},
  },
  island5: {
    mode: 'default',
  },
  island6: {
    facets: undefined,
    mode: 'default',
  },
  island7: {
    facets: {
      facet1: 'default',
    },
    mode: undefined,
  },
  island8: {
    facets: {
      facet1: 'default',
    },
    mode: {light: 'light', dark: 'dark'},	
  },
} as const satisfies Schema.Suggested
type test = Expand<Dynamic<typeof schema>['island8']>