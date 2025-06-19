'use client'

import { Args } from '@t3m4/core/types'
import { Config, Schema } from '@t3m4/core/types/subscribers'
import merge from 'lodash.merge'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { T3M4Context } from './context'
import { Initializer } from './Initializer'

export interface T3M4ProviderProps<Sc extends Schema, C extends Config<Sc>> extends PropsWithChildren, Args<Sc, C> {}
export const T3M4Provider = <Sc extends Schema, C extends Config<Sc>>({ children, ...args }: T3M4ProviderProps<Sc, C>) => {
  const [state, setState] = useState<T3M4Context<Sc, C>['state']>({ base: undefined, forced: undefined })
  const [colorSchemes, setColorSchemes] = useState<T3M4Context<Sc, C>['colorSchemes']>({ base: undefined, forced: undefined })
  const values = useRef({} as T3M4Context<Sc, C>['values'])

  useEffect(() => {
    setState({
      base: window.T3M4.get.state.base() as T3M4Context<Sc, C>['state']['base'],
      forced: window.T3M4.get.state.forced() as T3M4Context<Sc, C>['state']['forced'],
    })
    setColorSchemes({
      base: window.T3M4.get.colorSchemes.base() as T3M4Context<Sc, C>['colorSchemes']['base'],
      forced: window.T3M4.get.colorSchemes.forced() as T3M4Context<Sc, C>['colorSchemes']['forced'],
    })
    values.current = window.T3M4.get.values() as T3M4Context<Sc, C>['values']

    window.T3M4.subscribe('State:Forced:Update', 'React:State:Update', ({ state: forced, colorScheme }) => {
      setState((state) => ({ ...state, forced: forced as T3M4Context<Sc, C>['state']['forced'] }))
      setColorSchemes((colorSchemes) => ({ ...colorSchemes, forced: colorScheme as T3M4Context<Sc, C>['colorSchemes']['forced'] }))
    })
    window.T3M4.subscribe('State:Computed:Update', 'React:State:Update', ({ state: base, colorScheme }) => {
      setState((state) => ({ ...state, base: base as T3M4Context<Sc, C>['state']['base'] }))
      setColorSchemes((colorSchemes) => ({ ...colorSchemes, computed: colorScheme as T3M4Context<Sc, C>['colorSchemes']['base'] }))
    })

    window.T3M4.subscribe('Reset', 'React:Reset', () => {
      setState({ base: undefined, forced: undefined })
      setColorSchemes({ base: undefined, forced: undefined })
      values.current = {} as T3M4Context<Sc, C>['values']
    })

    window.T3M4.subscribe('Reset:Success', 'React:Reset', () => (values.current = window.T3M4.get.values() as T3M4Context<Sc, C>['values']))
  }, [])

  useEffect(() => window.T3M4.reboot(args), [JSON.stringify(args)])

  const updateState: T3M4Context<Sc, C>['updateState'] = (island, stateUpdate) => {
    const newStatePartial = typeof stateUpdate === 'function' ? stateUpdate((state.base?.[island] ?? {}) as any) : stateUpdate
    const currState = (state.base?.[island] ?? {}) as any
    const newState = merge(currState, newStatePartial)
    window.T3M4.set.state({ [island]: newState })
  }

  return (
    <T3M4Context.Provider value={{ state, updateState, colorSchemes, values: values.current }}>
      <Initializer args={args} />
      {children}
    </T3M4Context.Provider>
  )
}
