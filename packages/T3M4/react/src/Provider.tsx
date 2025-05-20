'use client'

import { constructScriptArgs } from '@t3m4/core'
import { ScriptProps } from '@t3m4/core/types'
import { Config, Schema } from '@t3m4/core/types/subscribers'
import merge from 'lodash.merge'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { T3M4Context } from './context'

interface T3M4Props extends PropsWithChildren, ScriptProps {}
export const T3M4Provider = <Sc extends Schema, C extends Config<Sc>>({ children, ...scriptArgs }: T3M4Props) => {
  const [state, setState] = useState<T3M4Context<Sc, C>['state']>({ base: undefined, forced: undefined, computed: undefined })
  const [colorSchemes, setColorSchemes] = useState<T3M4Context<Sc, C>['colorSchemes']>({ base: undefined, forced: undefined, computed: undefined })
  const values = useRef({} as T3M4Context<Sc, C>['values'])

  useEffect(() => {
    setState({
      base: window.T3M4.get.state.base() as T3M4Context<Sc, C>['state']['base'],
      forced: window.T3M4.get.state.forced() as T3M4Context<Sc, C>['state']['forced'],
      computed: window.T3M4.get.state.computed() as T3M4Context<Sc, C>['state']['computed'],
    })
    setColorSchemes({
      base: window.T3M4.get.colorSchemes.base() as T3M4Context<Sc, C>['colorSchemes']['base'],
      forced: window.T3M4.get.colorSchemes.forced() as T3M4Context<Sc, C>['colorSchemes']['forced'],
      computed: window.T3M4.get.colorSchemes.computed() as T3M4Context<Sc, C>['colorSchemes']['computed'],
    })
    values.current = window.T3M4.get.values() as T3M4Context<Sc, C>['values']

    window.T3M4.subscribe('State:Base:Update', 'React:State:Update', (base) => setState((state) => ({ ...state, base: base as T3M4Context<Sc, C>['state']['base'] })))
    window.T3M4.subscribe('State:Forced:Update', 'React:State:Update', (forced) => setState((state) => ({ ...state, forced: forced as T3M4Context<Sc, C>['state']['forced'] })))
    window.T3M4.subscribe('State:Computed:Update', 'React:State:Update', (computed) => setState((state) => ({ ...state, computed: computed as T3M4Context<Sc, C>['state']['computed'] })))

    window.T3M4.subscribe('ColorSchemes:Base:Update', 'React:ColorSchemes:Update', (base) => setColorSchemes(colorSchemes => ({ ...colorSchemes, base: base as T3M4Context<Sc, C>['colorSchemes']['base'] })))
    window.T3M4.subscribe('ColorSchemes:Forced:Update', 'React:ColorSchemes:Update', (forced) => setColorSchemes(colorSchemes => ({ ...colorSchemes, forced: forced as T3M4Context<Sc, C>['colorSchemes']['forced'] })))
    window.T3M4.subscribe('ColorSchemes:Computed:Update', 'React:ColorSchemes:Update', (computed) => setColorSchemes(colorSchemes => ({ ...colorSchemes, computed: computed as T3M4Context<Sc, C>['colorSchemes']['computed'] })))

    window.T3M4.subscribe('Reset', 'React:Reset', () => {
      setState({ base: undefined, forced: undefined, computed: undefined })
      setColorSchemes({ base: undefined, forced: undefined, computed: undefined })
      values.current = {} as T3M4Context<Sc, C>['values']
    })
  }, [])

  useEffect(() => window.T3M4.reboot(constructScriptArgs(scriptArgs)), [JSON.stringify(scriptArgs)])

  const updateState: T3M4Context<Sc, C>['updateState'] = {
    base: (island, stateUpdate) => {
      const newStatePartial = typeof stateUpdate === 'function' ? stateUpdate((state.base?.[island] ?? {}) as any) : stateUpdate
      const currState = (state.base?.[island] ?? {}) as any
      const newState = merge(currState, newStatePartial)
      window.T3M4.set.state.base({ [island]: newState })
    },
    forced: (island, stateUpdate) => {
      const newStatePartial = typeof stateUpdate === 'function' ? stateUpdate((state.forced?.[island] ?? {}) as any) : stateUpdate
      const currState = (state.forced?.[island] ?? {}) as any
      const newState = merge(currState, newStatePartial)
      window.T3M4.set.state.forced({ [island]: newState })
    },
  }

  return <T3M4Context.Provider value={{ state, updateState, colorSchemes, values: values.current }}>{children}</T3M4Context.Provider>
}
