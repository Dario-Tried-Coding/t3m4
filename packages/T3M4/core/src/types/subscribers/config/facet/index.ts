import * as Schema from '../../schema'
import * as State from '../../state'

import { STRATS } from '../../../constants/strats'

import * as Mono from './mono'
import * as Multi from './multi'

export type Dynamic<Sc extends Schema.Island.Facets.Facet.Primitive> =
  State.Branded.Island.Facets.Facet.Dynamic<Sc> extends Extract<State.Branded.Island.Facets.Facet.Static, { __strat: STRATS['mono'] }>
    ? Mono.Dynamic<State.Branded.Island.Facets.Facet.Dynamic<Sc>>
    : State.Branded.Island.Facets.Facet.Dynamic<Sc> extends Extract<State.Branded.Island.Facets.Facet.Static, { __strat: STRATS['multi'] }>
      ? Multi.Dynamic<State.Branded.Island.Facets.Facet.Dynamic<Sc>>
      : never

export type Static = Mono.Static | Multi.Static

export * as Mono from './mono'
export * as Multi from './multi'
