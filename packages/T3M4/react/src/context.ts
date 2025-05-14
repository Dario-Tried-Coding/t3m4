'use client'

import type { ColorSchemes, Config, Schema, State, Values } from '@t3m4/core/types/subscribers'
import { Context, createContext, useContext } from 'react'

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? (T[P] extends Array<infer U> ? Array<DeepPartial<U>> : DeepPartial<T[P]>) : T[P]
}

export type T3M4Context<Sc extends Schema, C extends Config<Sc>> = {
  state: {
    base: State.AsObj<Sc> | undefined
    forced: DeepPartial<State.AsObj<Sc>>
    computed: State.AsObj<Sc> | undefined
  }
  colorSchemes: {
    base: ColorSchemes.AsObj<C> | undefined
    forced: DeepPartial<ColorSchemes.AsObj<C>>
    computed: ColorSchemes.AsObj<C> | undefined
  }
  updateState: {
    base: <I extends keyof Sc, S extends State.AsObj.Island<Sc[I]>>(island: I, state: DeepPartial<S> | ((state: S) => DeepPartial<S>)) => void
    forced: <I extends keyof Sc, S extends State.AsObj.Island<Sc[I]>>(island: I, state: DeepPartial<S> | ((state: DeepPartial<S>) => DeepPartial<S>)) => void
  }
  values: Values.AsObj<Sc> | undefined
}
export const T3M4Context = createContext<T3M4Context<Schema, Config<Schema>> | null>(null)

type useT3M4<Sc extends Schema, C extends Config<Sc>, I extends keyof Sc> = {
  state: {
    base: State.AsObj.Island<Sc[I]> | undefined
    forced: DeepPartial<State.AsObj.Island<Sc[I]>>
    computed: State.AsObj.Island<Sc[I]> | undefined
  }
  colorScheme: I extends keyof C
    ? Sc[I] extends Schema.Island.Mode
      ? {
          base: ColorSchemes.AsObj.Island<C[I]>
          forced?: ColorSchemes.AsObj.Island<C[I]>
        }
      : undefined
    : undefined
  updateState: {
    base: <S extends State.AsObj.Island<Sc[I]>>(state: DeepPartial<S> | ((state: S) => DeepPartial<S>)) => void
    forced: <S extends State.AsObj.Island<Sc[I]>>(state: DeepPartial<S> | ((state: DeepPartial<S>) => DeepPartial<S>)) => void
  }
  values: Values.AsObj.Island<Sc[I]> | undefined
}
export const useT3M4 = <Sc extends Schema, C extends Config<Sc>, I extends keyof Sc>(island: I): useT3M4<Sc, C, I> => {
  const context = useContext(T3M4Context as Context<T3M4Context<Sc, C> | null>)
  if (!context) throw new Error('useT3M4 must be used within a NextThemesProvider')

  return {
    state: {
      base: context.state.base?.[island] as unknown as State.AsObj.Island<Sc[I]> | undefined,
      forced: context.state.forced?.[island] as unknown as DeepPartial<State.AsObj.Island<Sc[I]>>,
      computed: context.state.computed?.[island] as unknown as State.AsObj.Island<Sc[I]> | undefined,
    },
    colorScheme: (context.colorSchemes.base?.[island as keyof ColorSchemes.AsObj<C>]
      ? {
          base: context.colorSchemes.base?.[island as keyof ColorSchemes.AsObj<C>],
          forced: context.colorSchemes.forced?.[island as keyof ColorSchemes.AsObj<C>],
        }
      : undefined) as useT3M4<Sc, C, I>['colorScheme'],
    updateState: {
      base: (state) => context.updateState.base(island, state),
      forced: (state) => context.updateState.forced(island, state),
    },
    values: context.values?.[island] as unknown as useT3M4<Sc, C, I>['values'],
  }
}