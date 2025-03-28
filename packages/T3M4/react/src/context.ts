'use client'

import { ResolvedMode } from '@t3m4/core/types/constants'
import { Config, Options, State } from '@t3m4/core/types/subscribers'
import { NullOr, UndefinedOr } from '@t3m4/utils/nullables'
import { Context, createContext, useContext } from 'react'

export type T3M4Context<O extends Options.Schema, C extends Config.Dynamic<O>> = {
  state: NullOr<State.Dynamic<O, C>>
  resolvedMode: UndefinedOr<ResolvedMode>
  updateState: <S extends State.Dynamic<O, C>>(state: Partial<S> | ((state: S) => Partial<S>)) => void
  options: Options.Dynamic<O, C, State.Dynamic<O, C>>
}
export const T3M4Context = createContext<NullOr<T3M4Context<any, any>>>(null)

export const useT3M4 = <O extends Options.Schema, C extends Config.Dynamic<O>>() => {
  const context = useContext(T3M4Context as Context<NullOr<T3M4Context<O, C>>>)
  if (!context) throw new Error('useT3M4 must be used within a NextThemesProvider')
  return context
}