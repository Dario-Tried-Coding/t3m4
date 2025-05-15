'use client'

import type { ColorSchemes, Config, Schema, State, Values } from '@t3m4/core/types/subscribers'
import { Expand } from '@t3m4/utils'
import { Context, createContext, useContext } from 'react'

// #region T3M4Context
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? (T[P] extends Array<infer U> ? Array<DeepPartial<U>> : DeepPartial<T[P]>) : T[P]
}

export type T3M4Context<Sc extends Schema, C extends Config<Sc>> = {
  state: {
    base: State<Sc> | undefined
    forced: DeepPartial<State<Sc>>
    computed: State<Sc> | undefined
  }
  colorSchemes: {
    base: ColorSchemes<C> | undefined
    forced: DeepPartial<ColorSchemes<C>>
    computed: ColorSchemes<C> | undefined
  }
  updateState: {
    base: <I extends keyof Sc, S extends State.Island<Sc[I]>>(island: I, state: DeepPartial<S> | ((state: S) => DeepPartial<S>)) => void
    forced: <I extends keyof Sc, S extends State.Island<Sc[I]>>(island: I, state: DeepPartial<S> | ((state: DeepPartial<S>) => DeepPartial<S>)) => void
  }
  values: Values<Sc> | undefined
}
export const T3M4Context: Context<T3M4Context<Schema, Config<Schema>> | null> = createContext<T3M4Context<Schema, Config<Schema>> | null>(null)

// #region useT3M4
type useT3M4<Sc extends Schema, C extends Config<Sc>, I extends keyof Sc> = {
  state: {
    base: Expand<State.Island<Sc[I]>> | undefined
    forced: Expand<DeepPartial<State.Island<Sc[I]>>>
    computed: Expand<State.Island<Sc[I]>> | undefined
  }
  colorScheme: I extends keyof C
    ? Sc[I] extends NonNullable<Pick<Schema.Island, 'mode'>>
      ? {
          base: ColorSchemes.Island<C[I]>
          forced?: ColorSchemes.Island<C[I]>
        } | undefined
      : undefined
    : undefined
  updateState: {
    base: <S extends State.Island<Sc[I]>>(state: DeepPartial<S> | ((state: S) => DeepPartial<S>)) => void
    forced: <S extends State.Island<Sc[I]>>(state: DeepPartial<S> | ((state: DeepPartial<S>) => DeepPartial<S>)) => void
  }
  values: Expand<Values.Island<Sc[I]>> | undefined
}
export const useT3M4 = <Sc extends Schema, C extends Config<Sc>, I extends keyof Sc>(island: I): useT3M4<Sc, C, I> => {
  const context = useContext(T3M4Context as Context<T3M4Context<Sc, C> | null>)
  if (!context) throw new Error('useT3M4 must be used within a NextThemesProvider')

  return {
    state: {
      base: context.state.base?.[island] as unknown as useT3M4<Sc, C, I>['state']['base'],
      forced: context.state.forced?.[island] as unknown as useT3M4<Sc, C, I>['state']['forced'],
      computed: context.state.computed?.[island] as unknown as useT3M4<Sc, C, I>['state']['computed'],
    },
    colorScheme: (context.colorSchemes.base?.[island as keyof ColorSchemes<C>]
      ? {
          base: context.colorSchemes.base?.[island as keyof ColorSchemes<C>],
          forced: context.colorSchemes.forced?.[island as keyof ColorSchemes<C>],
        }
      : undefined) as useT3M4<Sc, C, I>['colorScheme'],
    updateState: {
      base: (state) => context.updateState.base(island, state),
      forced: (state) => context.updateState.forced(island, state),
    },
    values: context.values?.[island] as unknown as useT3M4<Sc, C, I>['values'],
  }
}