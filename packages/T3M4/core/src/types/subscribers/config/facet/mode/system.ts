import * as Options from '../../../options'

import { Brand, Unbrand } from '../../../brand'

import { Mode, MODES } from '../../../../constants/modes'
import { FACETS } from '../../../../constants/facets'
import { STRATS } from '../../../../constants/strats'
import { Color_Scheme } from '../../../../constants/color-schemes'

import { Base } from './base'

type Fallback<S extends Options.Mono.Primitive> = [Extract<S, { __mode: MODES['system'] }>] extends [never] ? {} : { fallback: Unbrand<Exclude<S, { __mode: MODES['system'] }>> }
type Color_Schemes<S extends Options.Mono.Primitive> = [Extract<S, { __mode: MODES['custom'] }>] extends [never] ? {} : { colorSchemes: Record<Unbrand<Extract<S, { __mode: MODES['custom'] }>>, Color_Scheme> }

export type Dynamic<S extends Brand<Options.Mono.Primitive, { type: FACETS['mode']; strat: STRATS['system'] }>> = Base & { strategy: STRATS['system']; default: Unbrand<S> } & Fallback<S> & Color_Schemes<S>
export type Default = Base & { strategy: STRATS['system']; default: Exclude<Mode, MODES['custom']> }
export type Static = Base & { strategy: STRATS['system']; default: string; colorSchemes?: Record<string, Color_Scheme> }