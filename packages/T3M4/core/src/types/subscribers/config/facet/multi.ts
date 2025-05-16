import * as Options from '../../options'
import * as State from '../../state'

import { Brand, Unbrand } from '../../brand'

import { FACETS } from '../../../constants/facets'
import { STRATS } from '../../../constants/strats'

export type Dynamic<S extends Brand<Options.Mono.Primitive, { type: FACETS['generic']; strat: STRATS['multi'] }>> = { strategy: STRATS['multi']; default: Unbrand<S> }
export type Static = Dynamic<State.Branded.Island.Facets.Facet.Dynamic<Options.Multi.Primitive>>
