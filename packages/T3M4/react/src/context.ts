'use client'

import type { ColorSchemes, Config, Schema, State, Values } from '@t3m4/core/types/subscribers'
import { Expand } from '@t3m4/utils'
import { Context, createContext, useContext } from 'react'

// #region T3M4Context
export type T3M4Context<Sc extends Schema, C extends Config<Sc>> = {
  state: {
    base: State<Sc> | undefined
    forced: State.Optional<Sc> | undefined
    computed: State<Sc> | undefined
  }
  colorSchemes: {
    base: ColorSchemes<C> | undefined
    forced: ColorSchemes<C> | undefined
    computed: ColorSchemes<C> | undefined
  }
  updateState: {
    base: <I extends keyof Sc, S extends State.Island<Sc[I]>>(island: I, state: S | ((state: S) => State.Optional.Island<Sc[I]>)) => void
    forced: <I extends keyof Sc, S extends State.Optional.Island<Sc[I]>>(island: I, state: S | ((state: S) => S)) => void
  }
  values: Values<Sc> | undefined
}
export const T3M4Context = createContext<T3M4Context<Schema, Config<Schema>> | null>(null)

// #region useT3M4
export type useT3M4<Sc extends Schema, C extends Config<Sc>, I extends keyof Schema.Polished<Sc>> = {
  state: {
    base: Expand<State.Island<Sc[I]>> | undefined
    forced: Expand<State.Optional.Island<Sc[I]>> | undefined
    computed: Expand<State.Island<Sc[I]>> | undefined
  }
  colorScheme: I extends keyof C
    ? Sc[I] extends Schema.Island.Mode
      ? {
          base: ColorSchemes.Island<C[I]>
          forced: ColorSchemes.Island<C[I]> | undefined
        } | undefined
      : undefined
    : undefined
  updateState: {
    base: (state: Expand<State.Optional.Island<Sc[I]>> | ((state: Expand<State.Island<Sc[I]>>) => Expand<State.Optional.Island<Sc[I]>>)) => void
    forced: (state: Expand<State.Optional.Island<Sc[I]>> | ((state: Expand<State.Optional.Island<Sc[I]>>) => Expand<State.Optional.Island<Sc[I]>>)) => void
  }
  values: Expand<Values.Island<Sc[I]>> | undefined
}
export const useT3M4 = <Sc extends Schema, C extends Config<Sc>, I extends keyof Schema.Polished<Sc>>(island: I): useT3M4<Sc, C, I> => {
  const context = useContext(T3M4Context as Context<T3M4Context<Sc, C> | null>)
  if (!context) throw new Error('useT3M4 must be used within a NextThemesProvider')

  return {
    state: {
      base: context.state.base?.[island] as useT3M4<Sc, C, I>['state']['base'],
      forced: (context.state.forced?.[island]) as useT3M4<Sc, C, I>['state']['forced'],
      computed: context.state.computed?.[island] as useT3M4<Sc, C, I>['state']['computed'],
    },
    colorScheme: (context.colorSchemes.base?.[island as keyof Config.Polished.Mode<C>]
      ? {
          base: context.colorSchemes.base?.[island as keyof Config.Polished.Mode<C>] as NonNullable<useT3M4<Sc, C, I>['colorScheme']>['base'],
          forced: context.colorSchemes.forced?.[island as keyof Config.Polished.Mode<C>] as NonNullable<useT3M4<Sc, C, I>['colorScheme']>['forced'],
        }
      : undefined) as useT3M4<Sc, C, I>['colorScheme'],
    updateState: {
      base: (state) => context.updateState.base(island, state as State.Island<Sc[typeof island]>),
      forced: (state) => context.updateState.forced(island, state as State.Optional.Island<Sc[typeof island]>),
    },
    values: context.values?.[island] as useT3M4<Sc, C, I>['values'],
  }
}
