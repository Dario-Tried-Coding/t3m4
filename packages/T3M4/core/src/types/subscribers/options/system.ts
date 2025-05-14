import { LinientAutoComplete } from '@t3m4/utils'
import { Primitive as Mono, Branded as Mono_Branded } from './mono'
import { Primitive as Multi, Branded as Multi_Branded } from './multi'
import { MODES } from '../../constants/modes'
import { Brand_Map } from '../brand'
import { FACETS } from '../../constants/facets'

export type Primitive = {
  light: Mono
  dark: Mono
  system?: Mono
  custom?: Multi
}

export type Suggested = {
  light: LinientAutoComplete<MODES['light']>
  dark: LinientAutoComplete<MODES['dark']>
  system?: LinientAutoComplete<MODES['system']>
  custom?: Multi
}

export type Branded<T extends Primitive, B extends Pick<Brand_Map, 'facet' | 'strat'>> = {
  light: Mono_Branded<T['light'], B & { type: FACETS['mode']; mode: MODES['light'] }>
  dark: Mono_Branded<T['dark'], B & { type: FACETS['mode']; mode: MODES['dark'] }>
} & (T['system'] extends Mono ? { system: Mono_Branded<NonNullable<T['system']>, B & { type: FACETS['mode']; mode: MODES['system'] }> } : {}) &
  (T['custom'] extends Multi ? { custom: Multi_Branded<NonNullable<T['custom']>, B & { type: FACETS['mode']; mode: MODES['custom'] }> } : {})
