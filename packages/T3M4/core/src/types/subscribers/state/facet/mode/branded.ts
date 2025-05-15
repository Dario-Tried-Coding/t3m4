import * as Options from '../../../options'
import * as Schema from '../../../schema'

import { MODES } from '../../../../constants/modes';
import { FACETS } from '../../../../constants/facets';
import { STRATS } from '../../../../constants/strats';

import * as Facet from '../branded'

type System<V extends Options.System.Primitive> = [
  Options.Mono.Branded<V['light'] extends Options.Mono.Primitive ? V['light'] : MODES['light'], { mode: MODES['light']; type: FACETS['mode']; strat: STRATS['system'] }>,
  Options.Mono.Branded<V['dark'] extends Options.Mono.Primitive ? V['dark'] : MODES['dark'], { mode: MODES['dark']; type: FACETS['mode']; strat: STRATS['system'] }>,
  ...(V['system'] extends Options.Mono.Primitive ? [Options.Mono.Branded<V['system'], { mode: MODES['system']; type: FACETS['mode']; strat: STRATS['system'] }>] : []),
  ...(V['custom'] extends Options.Multi.Primitive ? Options.Multi.Branded<V['custom'], { mode: MODES['custom']; type: FACETS['mode']; strat: STRATS['system'] }> : []),
][number]

export type Dynamic<Sc extends Schema.Island.Mode.Facet.Primitive> = Sc extends Schema.Island.Facets.Facet.Primitive ? Facet.Dynamic<Sc, { type: FACETS['mode'] }> : Sc extends Options.System.Primitive ? System<Sc> : never
export type Static = Dynamic<Options.Mono.Primitive> | Dynamic<Options.Multi.Primitive> | Dynamic<Options.System.Primitive>