'use client'

import { ScriptArgs } from '@t3m4/core/types'
import { Config, Schema, State } from '@t3m4/core/types/subscribers'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { T3M4Context } from './context'

interface T3M4Props extends PropsWithChildren, ScriptArgs {}
export const T3M4Provider = <Sc extends Schema, C extends Config<Sc>>({ children, ...scriptArgs }: T3M4Props) => {
  const [state, setState] = useState<T3M4Context<Sc, C>['state']>(null)
  const [resolvedMode, setResolvedMode] = useState<T3M4Context<Sc, C>['resolvedMode']>(undefined)
  const options = useRef({} as T3M4Context<Sc, C>['options'])

  useEffect(() => {
    setState(window.T3M4.state as State<Sc, C>)
    setResolvedMode(window.T3M4.resolvedMode)
    options.current = window.T3M4.options as T3M4Context<Sc, C>['options']

    window.T3M4.subscribe('State:update', 'React:state:update', (values) => setState(values as State<Sc, C>))
    window.T3M4.subscribe('ResolvedMode:update', 'React:resolvedMode:update', (RM) => setResolvedMode(RM))
    window.T3M4.subscribe('State:reset', 'React:state:reset', () => {
      setState(null)
      setResolvedMode(undefined)
      options.current = {} as T3M4Context<Sc, C>['options']
    })
  }, [])

  useEffect(() => window.T3M4.reboot(scriptArgs), [JSON.stringify(scriptArgs)])

  const updateState: T3M4Context<Sc, C>['updateState'] = (state) => {
    const newState = { ...state, ...(typeof state === 'function' ? state(state as any) : state) }
    window.T3M4.state = newState as State
  }

  return <T3M4Context.Provider value={{ state, updateState, resolvedMode, options: options.current }}>{children}</T3M4Context.Provider>
}
