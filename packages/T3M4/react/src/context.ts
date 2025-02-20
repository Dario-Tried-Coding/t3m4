'use client'

import { Config, Props, ResolvedMode } from '@t3m4/core/types/config'
import { NullOr, UndefinedOr } from '@repo/typescript-utils/nullable'
import { Context, createContext, useContext } from 'react'
import { Options } from './types/options'
import { State } from './types/state'

export type NextThemesContext<Ps extends Props, C extends Config<Ps>> = {
  state: NullOr<State<Ps, C>>
  resolvedMode: UndefinedOr<ResolvedMode>
  updateState: <P extends keyof State<Ps, C>>(prop: P, value: State<Ps, C>[P] | ((curr: State<Ps, C>[P]) => State<Ps, C>[P])) => void
  options: Options<Ps, C, State<Ps, C>>
}
export const NextThemesContext = createContext<NullOr<NextThemesContext<any, any>>>(null)

export const useNextThemes = <Ps extends Props, C extends Config<Ps>>() => {
  const context = useContext(NextThemesContext as Context<NullOr<NextThemesContext<Ps, C>>>)
  if (!context) throw new Error('useNextThemes must be used within a NextThemesProvider')
  return context
}