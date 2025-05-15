import * as Schema from '../../../schema'
import * as State from '../../../state'


import { STRATS } from '../../../../constants/strats'

import * as Mono from './mono'
import * as Multi from './multi'
import * as System from './system'

type NoDistribute<T> = [T] extends [any] ? T : never

export type Dynamic<Sc extends Schema.Island.Mode.Facet.Primitive> =
  State.Branded.Island.Mode.Facet.Dynamic<Sc> extends Extract<State.Branded.Island.Mode.Facet.Static, { __strat: STRATS['mono'] }>
    ? Mono.Dynamic<NoDistribute<State.Branded.Island.Mode.Facet.Dynamic<Sc>>>
    : State.Branded.Island.Mode.Facet.Dynamic<Sc> extends Extract<State.Branded.Island.Mode.Facet.Static, { __strat: STRATS['multi'] }>
      ? Multi.Dynamic<NoDistribute<State.Branded.Island.Mode.Facet.Dynamic<Sc>>>
      : State.Branded.Island.Mode.Facet.Dynamic<Sc> extends Extract<State.Branded.Island.Mode.Facet.Static, { __strat: STRATS['system'] }>
        ? System.Dynamic<NoDistribute<State.Branded.Island.Mode.Facet.Dynamic<Sc>>>
        : never

export type Static = Mono.Static | Multi.Static | System.Static

export * as Mono from './mono'
export * as Multi from './multi'
export * as System from './system'
