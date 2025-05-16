import { FACETS } from '../../constants/facets'
import { MODES } from '../../constants/modes'
import { STRATS } from '../../constants/strats'
import { Brand_Map } from '../brand'
import { Mono, Multi, System } from '../options'

export type Facet = Mono | Multi
export namespace Facet {
  export type Suggested = Mono.Suggested | Multi
  export type Branded<Sc extends Facet, B extends Pick<Brand_Map, 'type'> = { type: FACETS['generic'] }> = Sc extends Mono
    ? Mono.Branded<Sc, B & { strat: STRATS['mono'] }>
    : Sc extends Multi
      ? Multi.Branded<Sc, B & { strat: STRATS['multi'] }>
    : never
}

export type Mode = Facet | System
export namespace Mode {
  export type Suggested = Facet.Suggested | System.Suggested

  type System_Branded<Sc extends System> = {
    light: Mono.Branded<Sc['light'] extends Mono ? Sc['light'] : MODES['light'], { mode: MODES['light']; type: FACETS['mode']; strat: STRATS['system'] }>
    dark: Mono.Branded<Sc['dark'] extends Mono ? Sc['dark'] : MODES['dark'], { mode: MODES['dark']; type: FACETS['mode']; strat: STRATS['system'] }>
  } & (Sc['system'] extends Mono ? { system: Mono.Branded<Sc['system'], { mode: MODES['system']; type: FACETS['mode']; strat: STRATS['system'] }> } : {}) &
    (Sc['custom'] extends Multi ? { custom: Multi.Branded<Sc['custom'], { mode: MODES['custom']; type: FACETS['mode']; strat: STRATS['system'] }> } : {})
  export type Branded<Sc extends Mode> = Sc extends Facet ? Facet.Branded<Sc, { type: FACETS['mode'] }> : Sc extends System ? System_Branded<Sc> : never
}
