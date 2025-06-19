'use client'

import type { ColorSchemes, Config, Schema, State, Values } from '@t3m4/core/types/subscribers'
import { Expand } from '@t3m4/utils'
import { Context, createContext, useContext } from 'react'

// #region T3M4Context
export type T3M4Context<Sc extends Schema, C extends Config<Sc>> = {
  state: {
    base: State<Sc> | undefined
    forced: State.Optional<Sc> | undefined
  }
  colorSchemes: {
    base: ColorSchemes<C> | undefined
    forced: ColorSchemes<C> | undefined
  }
  updateState: <I extends keyof Sc, S extends State.Island<Sc[I]>>(island: I, state: S | ((state: S) => State.Optional.Island<Sc[I]>)) => void
  values: Values<Sc> | undefined
}
export const T3M4Context = createContext<T3M4Context<Schema, Config<Schema>> | null>(null)

// #region useT3M4
export type useT3M4<Sc extends Schema, C extends Config<Sc>, I extends keyof Schema.Polished<Sc>> = {
  updateState: (state: Expand<State.Optional.Island<Sc[I]>> | ((state: Expand<State.Island<Sc[I]>>) => Expand<State.Optional.Island<Sc[I]>>)) => void
  state: {
    base: Expand<State.Island<Sc[I]>> | undefined
    forced: Expand<State.Optional.Island<Sc[I]>> | undefined
  },
  colorSchemes: {
    base: I extends keyof C ? (Sc[I] extends Schema.Island.Mode ? ColorSchemes.Island<C[I]> | undefined : undefined) : undefined
    forced: I extends keyof C ? (Sc[I] extends Schema.Island.Mode ? ColorSchemes.Island<C[I]> | undefined : undefined) : undefined
  }
  values: Expand<Values.Island<Sc[I]>> | undefined
}
export const useT3M4 = <Sc extends Schema, C extends Config<Sc>, I extends keyof Schema.Polished<Sc>>(island: I): useT3M4<Sc, C, I> => {
  const context = useContext(T3M4Context as Context<T3M4Context<Sc, C> | null>)
  if (!context) throw new Error('useT3M4 must be used within a NextThemesProvider')

  return {
    updateState: (state) => context.updateState(island, state as State.Island<Sc[typeof island]>),
    state: {
      base: context.state.base?.[island] as useT3M4<Sc, C, I>['state']['base'],
      forced: (context.state.forced ? context.state.forced?.[island] ?? {} : undefined) as useT3M4<Sc, C, I>['state']['forced'],
    },
    colorSchemes: {
      base: context.colorSchemes.base?.[island as keyof Config.Polished.Mode<C>] as useT3M4<Sc, C, I>['colorSchemes']['base'],
      forced: context.colorSchemes.forced?.[island as keyof Config.Polished.Mode<C>] as useT3M4<Sc, C, I>['colorSchemes']['forced'],
    },
    values: context.values?.[island] as useT3M4<Sc, C, I>['values'],
  }
}
