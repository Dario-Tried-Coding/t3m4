import { LinientAutoComplete } from '@t3m4/utils'
import { Color_Scheme } from '../../constants/color-schemes'
import { FACETS } from '../../constants/facets'
import { MODES } from '../../constants/modes'
import { Selector } from '../../constants/selectors'
import { STRATS } from '../../constants/strats'
import { Default as Default_Opt, Mono as Mono_Opt, Multi as Multi_Opt, System as System_Opt } from '../options'
import { Schema } from '../schema'

export type Facet<Sc extends Schema.Island.Facets.Facet> = Sc extends Mono_Opt ? Facet.Mono<Sc> : Sc extends Multi_Opt ? Facet.Multi<Sc> : never
export namespace Facet {
  export type Mono<Sc extends Mono_Opt> = { strategy: STRATS['mono']; default: Sc }
  export namespace Mono {
    export type Default = Mono<Default_Opt>
    export type Static = Mono<Mono_Opt>
  }

  export type Multi<Sc extends Multi_Opt> = { strategy: STRATS['multi']; default: Sc[number] }
  export namespace Multi {
    export type Static = Multi<Multi_Opt>
  }

  export type Static = Static.Mono | Static.Multi
  export namespace Static {
    export type Mono = Mono.Static
    export type Multi = Multi.Static
  }
}

export type Mode<Sc extends Schema.Island.Mode.Facet> = Sc extends Mono_Opt ? Mode.Mono<Sc> : Sc extends Multi_Opt ? Mode.Multi<Sc> : Sc extends System_Opt ? Mode.System<Sc> : never
export namespace Mode {
  type Base = Partial<{ name: LinientAutoComplete<FACETS['mode']>; selector: Selector | Selector[]; store: boolean }>

  export type Mono<Sc extends Mono_Opt> = Base & { strategy: STRATS['mono']; default: Sc; colorScheme: Color_Scheme }
  export namespace Mono {
    export type Default = Mono<Default_Opt>
    export type Static = Mono<Mono_Opt>
  }

  export type Multi<Sc extends Multi_Opt> = Base & { strategy: STRATS['multi']; default: Sc[number]; colorSchemes: Record<Sc[number], Color_Scheme> }
  export namespace Multi {
    export type Static = Multi<Multi_Opt>
  }

  type Flatten<Sc extends System_Opt> = Sc['light'] | Sc['dark'] | (Sc extends Required<Pick<System_Opt, 'system'>> ? Sc['system'] : never) | (Sc extends Required<Pick<System_Opt, 'custom'>> ? Sc['custom'][number] : never)
  type Default<Sc extends System_Opt> = {
    default: Flatten<Sc>
  }
  type Fallback<Sc extends System_Opt> = Sc extends Required<Pick<System_Opt, 'system'>> ? { fallback: Flatten<Omit<Sc, MODES['system']>> } : {}
  type Color_Schemes<Sc extends System_Opt> =
    Sc extends Required<Pick<System_Opt, 'custom'>> ? { colorSchemes: Record<Sc['custom'][number], Color_Scheme>} : { }
  export type System<Sc extends System_Opt> = Base & { strategy: STRATS['system'] } & Default<Sc> & Fallback<Sc> & Color_Schemes<Sc>
  export namespace System {
    export type Static = Base & { strategy: STRATS['system']; default: Mono_Opt; fallback?: Mono_Opt; colorSchemes?: Record<Mono_Opt, Color_Scheme> }
  }

  export type Static = Static.Mono | Static.Multi | Static.System
  export namespace Static {
    export type Mono = Mono.Static
    export type Multi = Multi.Static
    export type System = System.Static
  }
}