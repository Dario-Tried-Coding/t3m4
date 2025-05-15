import * as Options from '../../../options'
import * as State from '../../../state'

import { Brand, Unbrand } from '../../../brand'

import { FACETS } from '../../../../constants/facets'
import { STRATS } from '../../../../constants/strats'
import { Color_Scheme } from '../../../../constants/color-schemes'

import { Base } from './base'

export type Dynamic<S extends Brand<Options.Mono.Primitive, { type: FACETS['mode']; strat: STRATS['mono'] }>> = Base & { strategy: STRATS['mono']; default: Unbrand<S>; colorScheme: Color_Scheme }
export type Default = Dynamic<State.Branded.Island.Mode.Facet.Dynamic<Options.Default>>
export type Static = Dynamic<State.Branded.Island.Mode.Facet.Dynamic<Options.Mono.Primitive>>
