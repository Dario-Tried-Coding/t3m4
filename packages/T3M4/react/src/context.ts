'use client'

import { ResolvedMode } from '@t3m4/core/types/constants'
import { Config, Props } from '@t3m4/core/types/config'
import { NullOr, UndefinedOr } from '@t3m4/utils/nullables'
import { Context, createContext, useContext } from 'react'
import { Options } from './types/options'
import { State } from './types/state'

export type T3M4Context<Ps extends Props, C extends Config<Ps>> = {
  state: NullOr<State<Ps, C>>
  resolvedMode: UndefinedOr<ResolvedMode>
  updateState: <P extends keyof State<Ps, C>>(prop: P, value: State<Ps, C>[P] | ((curr: State<Ps, C>[P]) => State<Ps, C>[P])) => void
  options: Options<Ps, C, State<Ps, C>>
}
export const T3M4Context = createContext<NullOr<T3M4Context<any, any>>>(null)

export const useT3M4 = <Ps extends Props, C extends Config<Ps>>() => {
  const context = useContext(T3M4Context as Context<NullOr<T3M4Context<Ps, C>>>)
  if (!context) throw new Error('useNextThemes must be used within a NextThemesProvider')
  return context
}