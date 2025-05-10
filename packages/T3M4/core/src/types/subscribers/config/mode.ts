import { LinientAutoComplete } from '@t3m4/utils'
import { Color_Scheme } from '../../constants/color-schemes'
import { FACETS } from '../../constants/facets'
import { Mode, MODES } from '../../constants/modes'
import { Selector } from '../../constants/selectors'
import { STRATS } from '../../constants/strats'
import { Unbrand } from '../brand'
import { Opts } from '../opts'
import { Schema } from '../schema'

export namespace Mode_Config {
  type Base = Partial<{ name: LinientAutoComplete<FACETS['mode']>; selector: Selector | Selector[]; store: boolean }>

  export namespace Mono {
    export type Dynamic<S extends Schema.Branded.Facet.Mode<Opts.Primitive.Mono>> = Base & { strategy: STRATS['mono']; default: Unbrand<S>; colorScheme: Color_Scheme }
    export type Default = Dynamic<Schema.Branded.Facet.Mode<Opts.Default>>
    export type Static = Dynamic<Schema.Branded.Facet.Mode<Opts.Primitive.Mono>>
  }

  export namespace Multi {
    export type Dynamic<S extends Schema.Branded.Facet.Mode<Opts.Primitive.Multi>> = Base & { strategy: STRATS['multi']; default: Unbrand<S>; colorSchemes: Record<Unbrand<S>, Color_Scheme> }
    export type Static = Dynamic<Schema.Branded.Facet.Mode<Opts.Primitive.Multi>>
  }

  export namespace System {
    type Fallback<S extends string> = [Extract<S, { __mode: MODES['system'] }>] extends [never] ? {} : { fallback: Unbrand<Exclude<S, { __mode: MODES['system'] }>> }
    type Color_Schemes<S extends string> = [Extract<S, { __mode: MODES['custom'] }>] extends [never] ? {} : { colorSchemes: Record<Unbrand<Extract<S, { __mode: MODES['custom'] }>>, Color_Scheme> }

    export type Dynamic<S extends Schema.Branded.Facet.Mode<Required<Opts.Primitive.System>>> = Base & { strategy: STRATS['system']; default: Unbrand<S> } & Fallback<S> & Color_Schemes<S>
    export type Default = Base & { strategy: STRATS['system']; default: Exclude<Mode, MODES['custom']> }
    export type Static = Base & { strategy: STRATS['system']; default: string; colorSchemes?: Record<string, Color_Scheme> }
  }

  export type Dynamic<S> =
    S extends Schema.Branded.Facet.Mode<Opts.Primitive.Mono>
      ? Mono.Dynamic<S>
      : S extends Schema.Branded.Facet.Mode<Opts.Primitive.Multi>
        ? Multi.Dynamic<S>
        : S extends Schema.Branded.Facet.Mode<Required<Opts.Primitive.System>>
          ? System.Dynamic<S>
          : never
  export type Static = Mono.Static | Multi.Static | System.Static
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
    mode: { light: 'light', dark: 'dark', system: 'system-custom', custom: ['custom1', 'custom2'] },
  },
  island2: {
    mode: ['mode1', 'mode2'],
  },
} as const satisfies Schema.Primitive.All

type test = Schema.Branded.All<typeof schema>['root']['mode']
type test2 = Extract<test, { __mode: MODES['system'] }>
type test3 = Extract<test, { __mode: MODES['custom'] }>
type config = Mode_Config.Dynamic<test>
const config: config = {
  strategy: 'mono',
  default: 'custom-mode',
  colorScheme: 'dark'
}
