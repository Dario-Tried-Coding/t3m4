'use client'

import { ColorSchemes, Config, Options, Pick_IslandColorScheme, Pick_IslandOptions, Pick_IslandState, Schema, State } from '@t3m4/core/types/subscribers'
import { NullOr, UndefinedOr } from '@t3m4/utils/nullables'
import { Context, createContext, useContext } from 'react'

export type T3M4Context<Sc extends Schema, C extends Config<Sc>> = {
  state: UndefinedOr<State<Sc, C>>
  colorSchemes: UndefinedOr<ColorSchemes<Sc, C>>
  updateState: <I extends keyof Sc, S extends Pick_IslandState<Sc, C, State<Sc, C>, I>>(island: I, state: Partial<S> | ((state: S) => Partial<S>)) => void
  options: Options<Sc, C, State<Sc, C>>
}
export const T3M4Context = createContext<NullOr<T3M4Context<any, any>>>(null)

export const useT3M4 = <Sc extends Schema, C extends Config<Sc>, I extends keyof Sc>(island: I) => {
  const context = useContext(T3M4Context as Context<NullOr<T3M4Context<Sc, C>>>)
  if (!context) throw new Error('useT3M4 must be used within a NextThemesProvider')

  return {
    state: (context.state?.[island] as unknown as NullOr<Pick_IslandState<Sc, C, State<Sc, C>, I>>) ?? null,
    colorScheme: ((context.colorSchemes?.[island] as unknown as Pick_IslandColorScheme<Sc, C, ColorSchemes<Sc, C>, I>) ?? undefined) as UndefinedOr<Pick_IslandColorScheme<Sc, C, ColorSchemes<Sc, C>, I>>,
    updateState: <S extends Pick_IslandState<Sc, C, State<Sc, C>, I>>(state: Partial<S> | ((state: S) => Partial<S>)) => context.updateState(island, state),
    options: ((context.options?.[island] as unknown as Pick_IslandOptions<Sc, C, State<Sc, C>, Options<Sc, C, State<Sc, C>>, I>) ?? undefined) as UndefinedOr<Pick_IslandOptions<Sc, C, State<Sc, C>, Options<Sc, C, State<Sc, C>>, I>>,
  }
}
