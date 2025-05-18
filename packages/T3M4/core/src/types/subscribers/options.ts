import { LinientAutoComplete } from '@t3m4/utils'
import { DEFAULT } from '../constants/miscellaneous'
import { Brand, Brand_Map } from './brand'
import { MODES } from '../constants/modes'
import { FACETS } from '../constants/facets'

export type Default = DEFAULT

export type Mono = string
export namespace Mono {
  export type Suggested = LinientAutoComplete<Default>
  export type Branded<T extends Mono, B extends Partial<Brand_Map> & Pick<Brand_Map, 'type' | 'strat'>> = Brand<T, B>
}

export type Multi = Mono[]
export namespace Multi {
  export type Branded<T extends readonly Mono[], B extends Partial<Brand_Map> & Pick<Brand_Map, 'type' | 'strat'>> = { [I in keyof T]: Brand<T[I], B> }
}

export type System = {
  light: Mono
  dark: Mono
  system?: Mono
  custom?: Multi
}
export namespace System {
  export type Suggested = {
    light: LinientAutoComplete<MODES['light']>
    dark: LinientAutoComplete<MODES['dark']>
    system?: LinientAutoComplete<MODES['system']>
    custom?: Multi
  }
  export type Branded<T extends System, B extends Pick<Brand_Map, 'strat'>> = {
    light: Mono.Branded<T['light'], B & { type: FACETS['mode']; mode: MODES['light'] }>
    dark: Mono.Branded<T['dark'], B & { type: FACETS['mode']; mode: MODES['dark'] }>
  } & (T['system'] extends Mono ? { system: Mono.Branded<NonNullable<T['system']>, B & { type: FACETS['mode']; mode: MODES['system'] }> } : {}) &
    (T['custom'] extends Multi ? { custom: Multi.Branded<NonNullable<T['custom']>, B & { type: FACETS['mode']; mode: MODES['custom'] }> } : {})
}
