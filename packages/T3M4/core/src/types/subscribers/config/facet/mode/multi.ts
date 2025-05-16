import * as Options from '../../../options'
import * as State from '../../../state'

import { Brand, Unbrand } from '../../../brand'

import { FACETS } from '../../../../constants/facets'
import { STRATS } from '../../../../constants/strats'
import { Color_Scheme } from '../../../../constants/color-schemes'

import { Base } from './base'

export type Dynamic<S extends Brand<Options.Mono.Primitive, { type: FACETS['mode']; strat: STRATS['multi'] }>> = Base & { strategy: STRATS['multi']; default: Unbrand<S>; colorSchemes: Record<Unbrand<S>, Color_Scheme> }
export type Static = Dynamic<State.Branded.Island.Mode.Facet.Dynamic<Options.Multi.Primitive>>
