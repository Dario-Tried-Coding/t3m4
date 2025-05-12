import { FACETS } from '../constants/facets'
import { MODES } from '../constants/modes'
import { STRATS } from '../constants/strats'
import { Brand, Brand_Map } from './brand'
import { Opts } from './opts'
import { Schema } from './schema'

// export namespace Values {
//   type Strat<S extends Opts.Primitive.Mono | undefined> = S extends Opts.Primitive.Mono ? STRATS['system'] : STRATS['light_dark'] | STRATS['system']
//   type System<V extends Opts.Primitive.System> = [
//     Opts.Branded.Mono<V['light'] extends Opts.Primitive.Mono ? V['light'] : MODES['light'], { mode: MODES['light']; type: FACETS['mode']; strat: Strat<V['system']> }>,
//     Opts.Branded.Mono<V['dark'] extends Opts.Primitive.Mono ? V['dark'] : MODES['dark'], { mode: MODES['dark']; type: FACETS['mode']; strat: Strat<V['system']> }>,
//     ...(V['system'] extends Opts.Primitive.Mono ? [Opts.Branded.Mono<V['system'], { mode: MODES['system']; type: FACETS['mode']; strat: Strat<V['system']> }>] : []),
//     ...(V['custom'] extends Opts.Primitive.Multi ? Opts.Branded.Multi<V['custom'], { mode: MODES['custom']; type: FACETS['mode']; strat: Strat<V['system']> }> : []),
//   ]

//   export namespace Facet {
//     export type Generic<V extends Schema.Primitive.Facet.Generic, B extends Pick<Brand_Map, 'type'>> = V extends Opts.Primitive.Mono
//       ? [Opts.Branded.Mono<V, B & { strat: STRATS['mono'] }>]
//       : V extends Opts.Primitive.Multi
//         ? Opts.Branded.Multi<V, B & { strat: STRATS['multi'] }>
//         : never

//     export type Mode<V extends Schema.Primitive.Facet.Mode> = V extends Schema.Primitive.Facet.Generic ? Generic<V, { type: FACETS['mode'] }> : V extends Opts.Primitive.System ? System<V> : never
//   }

//   export type Island<V extends Schema.Primitive.Island> = (V['facets'] extends Schema.Primitive.Island['facets']
//     ? {
//         facets: {
//           [F in keyof V['facets'] as V['facets'][F] extends Schema.Primitive.Facet.Generic ? F : never]: V['facets'][F] extends Schema.Primitive.Facet.Generic
//             ? Facet.Generic<V['facets'][F], { facet: Extract<F, string>; type: FACETS['generic'] }>
//             : never
//         }
//       }
//     : {}) &
//     (V['mode'] extends Schema.Primitive.Island['mode']
//       ? {
//           mode: V['mode'] extends Schema.Primitive.Facet.Mode ? Facet.Mode<V['mode']> : never
//         }
//       : {})

//   export type All<V extends Schema.Primitive.All> = {
//     [I in keyof V]: Island<V[I]>
//   }
// }

export namespace Values {
  export namespace AsArr {
    export type Dynamic
  }
}