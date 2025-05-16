import { FACETS } from '../../constants/facets'
import { MODES } from '../../constants/modes'
import { STRATS } from '../../constants/strats'
import { Brand_Map } from '../brand'
import { Mono, Mono_Branded, Multi, Multi_Branded, System } from '../options'
import { Facet as Schema_Facet, Mode as Schema_Mode } from '../schema/facet'

export type Facet<Sc extends Schema_Facet> = Sc extends Mono ? Sc : Sc extends Multi ? Sc[number] : never
export type Facet_Static = Mono
export type Facet_Branded<Sc extends Schema_Facet, B extends Pick<Brand_Map, 'type'> = { type: FACETS['generic'] }> = Sc extends Mono
  ? Mono_Branded<Sc, B & { strat: STRATS['mono'] }>
  : Sc extends Multi
    ? Multi_Branded<Sc, B & { strat: STRATS['multi'] }>[number]
    : never

export type Mode<Sc extends Schema_Mode> = Sc extends Schema_Facet
  ? Facet<Sc>
  : Sc extends System
    ? (Sc['light'] extends Mono ? Sc['light'] : MODES['light']) | (Sc['dark'] extends Mono ? Sc['dark'] : MODES['dark']) | (Sc['system'] extends Mono ? Sc['system'] : never) | (Sc['custom'] extends Multi ? Sc['custom'][number] : never)
    : never
export type Mode_Static = Facet_Static

type Branded_System<V extends System> = [
  Mono_Branded<V['light'] extends Mono ? V['light'] : MODES['light'], { mode: MODES['light']; type: FACETS['mode']; strat: STRATS['system'] }>,
  Mono_Branded<V['dark'] extends Mono ? V['dark'] : MODES['dark'], { mode: MODES['dark']; type: FACETS['mode']; strat: STRATS['system'] }>,
  ...(V['system'] extends Mono ? [Mono_Branded<V['system'], { mode: MODES['system']; type: FACETS['mode']; strat: STRATS['system'] }>] : []),
  ...(V['custom'] extends Multi ? Multi_Branded<V['custom'], { mode: MODES['custom']; type: FACETS['mode']; strat: STRATS['system'] }> : []),
][number]
export type Mode_Branded<Sc extends Schema_Mode> = Sc extends Schema_Facet ? Facet_Branded<Sc, { type: FACETS['mode'] }> : Sc extends System ? Branded_System<Sc> : never
