import * as Options from '../../../options'
import * as Schema from '../../../schema'
import * as State from '../../../state'

import { STRATS } from '../../../../constants/strats'
import { Brand } from '../../../brand'

import * as Mono from './mono'
import * as Multi from './multi'
import * as System from './system'
import { FACETS } from '../../../../constants/facets'

type NoDistribute<T> = [T] extends [any] ? T : never

export type Dynamic<Sc extends Schema.Island.Mode.Facet.Primitive> =
  State.Branded.Island.Mode.Facet.Dynamic<Sc> extends Brand<Options.Mono.Primitive, { strat: STRATS['mono']; type: FACETS['mode'] }>
    ? Mono.Dynamic<NoDistribute<State.Branded.Island.Mode.Facet.Dynamic<Sc>>>
    : State.Branded.Island.Mode.Facet.Dynamic<Sc> extends Brand<Options.Mono.Primitive, { strat: STRATS['multi']; type: FACETS['mode'] }>
      ? Multi.Dynamic<NoDistribute<State.Branded.Island.Mode.Facet.Dynamic<Sc>>>
      : State.Branded.Island.Mode.Facet.Dynamic<Sc> extends Brand<Options.Mono.Primitive, { strat: STRATS['system']; type: FACETS['mode'] }>
        ? System.Dynamic<NoDistribute<State.Branded.Island.Mode.Facet.Dynamic<Sc>>>
        : never

export type Static = Mono.Static | Multi.Static | System.Static

export * as Mono from './mono'
export * as Multi from './multi'
export * as System from './system'