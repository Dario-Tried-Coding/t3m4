'use client'

import { ResolvedMode } from '@t3m4/core/types/constants'
import { Config, Props } from '@t3m4/core/types/config'
import { Options } from '@t3m4/core/types'
import { NullOr, UndefinedOr } from '@t3m4/utils/nullables'
import { Context, createContext, useContext } from 'react'
import { State } from '@t3m4/core/types'

export type T3M4Context<Ps extends Props, C extends Config<Ps>> = {
  state: NullOr<State<Ps, C>>
  resolvedMode: UndefinedOr<ResolvedMode>
  updateState: <S extends State<Ps, C>>(state: Partial<S> | ((state: S) => Partial<S>)) => void
  options: Options<Ps, C, State<Ps, C>>
}
export const T3M4Context = createContext<NullOr<T3M4Context<any, any>>>(null)

export const useT3M4 = <Ps extends Props, C extends Config<Ps>>() => {
  const context = useContext(T3M4Context as Context<NullOr<T3M4Context<Ps, C>>>)
  if (!context) throw new Error('useT3M4 must be used within a NextThemesProvider')
  return context
}