import * as Options from '../../options'
import * as Schema from '../../schema'

import { Brand_Map } from '../../brand'

import { FACETS } from '../../../constants/facets'
import { STRATS } from '../../../constants/strats'


export type Dynamic<Sc extends Schema.Island.Facets.Facet.Primitive, B extends Pick<Brand_Map, 'type'> = { type: FACETS['generic'] }> = Sc extends Options.Mono.Primitive
  ? Options.Mono.Branded<Sc, B & { strat: STRATS['mono'] }>
  : Sc extends Options.Multi.Primitive
    ? Options.Multi.Branded<Sc, B & { strat: STRATS['multi'] }>[number]
    : never

export type Static = Dynamic<Options.Mono.Primitive> | Dynamic<Options.Multi.Primitive>