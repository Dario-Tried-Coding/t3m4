import { LinientAutoComplete } from '@t3m4/utils'
import { COLOR_SCHEME } from '../../constants/color-schemes'
import { FACETS } from '../../constants/facets'
import { MODE_TYPES, MODES } from '../../constants/modes'
import { SELECTOR } from '../../constants/selectors'
import { STRATS } from '../../constants/strats'
import { Opts } from '../opts'
import { Schema } from '../schema'
import { Branded, Values } from '../values'
import { Unbrand } from '../../moment'

export namespace Mode_Config {
  type Base = Partial<{ name: LinientAutoComplete<FACETS['mode']>; selector: SELECTOR | SELECTOR[]; store: boolean }>
  type Color_Schemes<S extends Opts.Primitive.Mono | never> = S extends Opts.Primitive.Mono ? { colorSchemes: Record<S, COLOR_SCHEME> } : {}

  export namespace Mono {
    export type Dynamic<O extends Opts.Primitive.Mono, V extends Values.Facet.Mode<O>> = Base & { strategy: STRATS['mono']; default: V[number]; colorScheme: COLOR_SCHEME }
    export type Default = Dynamic<Opts.Default, Values.Facet.Mode<Opts.Default>>
    export type Static = Dynamic<Opts.Primitive.Mono, Values.Facet.Mode<Opts.Primitive.Mono>>
  }

  export namespace Multi {
    export type Dynamic<O extends Opts.Primitive.Multi, V extends Values.Facet.Mode<O>> = Base & { strategy: STRATS['multi']; default: V[number]; colorSchemes: Record<V[number], COLOR_SCHEME> }
    export type Static = Dynamic<Opts.Primitive.Multi, Values.Facet.Mode<Opts.Primitive.Multi>>
  }

  export namespace Light_Dark {
    export type Dynamic<V extends Values.Facet.Mode<Omit<Required<Opts.Primitive.System>, MODES['system']>>> = Base & { strategy: STRATS['light_dark']; default: Unbrand<V[number]> } & Color_Schemes<Unbrand<Extract<V[number], Branded<string, { mode: MODE_TYPES['custom'] }>>>>
    export type Default = Dynamic<Values.Facet.Mode<Omit<MODES, MODE_TYPES['system']>>>
    export type Static = Base & { strategy: STRATS['light_dark']; default: string; colorSchemes?: Record<string, COLOR_SCHEME> }
  }

  export namespace System {
    export type Dynamic<O extends Opts.Primitive.System, V extends Values.Facet.Mode<O>> = Base & { strategy: STRATS['system']; default: V[number]; fallback: Exclude<V[number], O['system']> } & ColorSchemes<V, O>
    export type Default = Dynamic<MODES, Values.Facet.Mode<MODES>>
    export type Static = Base & { strategy: STRATS['system']; default: string; colorSchemes?: Record<string, COLOR_SCHEME> }
  }
}