import { LinientAutoComplete } from '@t3m4/utils'
import { COLOR_SCHEME, COLOR_SCHEMES } from '../../constants/color-schemes'
import { FACETS } from '../../constants/facets'
import { DEFAULT } from '../../constants/miscellaneous'
import { MODES } from '../../constants/modes'
import { SELECTOR } from '../../constants/selectors'
import { STRAT, STRATS } from '../../constants/strats'
import { Schema } from '../schema'
    
export namespace Mode_Config {
  type ColorSchemes<V extends string[] | undefined> = V extends string[] ? { colorSchemes: Record<V[number], COLOR_SCHEME> } : {}

  type Base = Partial<{ name?: LinientAutoComplete<FACETS['mode']>; selector?: SELECTOR | SELECTOR[]; store?: boolean }>

  export namespace Mono {
    export type Dynamic<V extends Schema.Opts.Mono> = Base & { strategy: STRATS['mono']; default: V; colorScheme: COLOR_SCHEME }
    export type Default = Dynamic<DEFAULT>
    export type Static = Base & { strategy: STRATS['mono']; default: string; colorScheme: COLOR_SCHEME }
  }

  export namespace Multi {
    export type Dynamic<V extends Schema.Opts.Multi> = Base & { strategy: STRATS['multi']; default: V[number] } & ColorSchemes<V>
    export type Static = Base & { strategy: STRATS['multi']; default: string; colorSchemes?: Record<string, COLOR_SCHEME> }
  }

  export namespace Light_Dark {
    export type Dynamic<V extends Schema.Opts.Light_Dark> = Base & {
      strategy: STRATS['light_dark']
      default: System_Values<V, 'default'>
    } & ColorSchemes<V['custom']>

    export type Default = Dynamic<COLOR_SCHEMES>

    export type Static = Base & {
      strategy: STRATS['light_dark']
      default: string
      colorSchemes?: Record<string, COLOR_SCHEME>
    }
  }

  export namespace System {
    export type Dynamic<V extends Schema.Opts.System> = Base & {
      strategy: STRATS['system']
      default: System_Values<V, 'default'>
      fallback: System_Values<V, 'fallback'>
    } & ColorSchemes<V['custom']>

    export type Default = Dynamic<MODES>

    export type Static = Base & {
      strategy: STRATS['system']
      default: string
      fallback: string
      colorSchemes?: Record<string, COLOR_SCHEME>
    }
  }

  export namespace All {
    export type Dynamic<O extends Schema.Facet.Mode> = O extends Schema.Opts.Implicit
      ? Mono.Default | Light_Dark.Default | System.Default
      : O extends Schema.Opts.Mono
        ? Mono.Dynamic<O>
        : O extends Schema.Opts.Multi
          ? Multi.Dynamic<O>
          : O extends Schema.Opts.Light_Dark
            ? Light_Dark.Dynamic<O> | System.Dynamic<O>
            : O extends Schema.Opts.System
              ? System.Dynamic<O>
              : never

    export type Static = Mono.Static | Multi.Static | Light_Dark.Static | System.Static
  }
}
