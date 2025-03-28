'use client'

import { ResolvedMode } from '@t3m4/core/types/constants'
import { Config, Options, Schema, State } from '@t3m4/core/types/subscribers'
import { NullOr, UndefinedOr } from '@t3m4/utils/nullables'
import { Context, createContext, useContext } from 'react'

export type T3M4Context<Sc extends Schema, C extends Config<Sc>> = {
  state: NullOr<State<Sc, C>>
  resolvedMode: UndefinedOr<ResolvedMode>
  updateState: <S extends State<Sc, C>>(state: Partial<S> | ((state: S) => Partial<S>)) => void
  options: Options<Sc, C, State<Sc, C>>
}
export const T3M4Context = createContext<NullOr<T3M4Context<any, any>>>(null)

export const useT3M4 = <Sc extends Schema, C extends Config<Sc>>() => {
  const context = useContext(T3M4Context as Context<NullOr<T3M4Context<Sc, C>>>)
  if (!context) throw new Error('useT3M4 must be used within a NextThemesProvider')
  return context
}