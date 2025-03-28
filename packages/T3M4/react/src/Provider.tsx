'use client'

import { ScriptArgs } from '@t3m4/core/types'
import { Config, Options, State } from '@t3m4/core/types/subscribers'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { T3M4Context } from './context'

interface T3M4Props extends PropsWithChildren, ScriptArgs {}
export const T3M4Provider = <O extends Options.Schema, C extends Config.Dynamic<O>>({ children, ...scriptArgs }: T3M4Props) => {
  const [state, setState] = useState<T3M4Context<O, C>['state']>(null)
  const [resolvedMode, setResolvedMode] = useState<T3M4Context<O, C>['resolvedMode']>(undefined)
  const options = useRef({} as T3M4Context<O, C>['options'])

  useEffect(() => {
    setState(window.T3M4.state as State.Dynamic<O, C>)
    setResolvedMode(window.T3M4.resolvedMode)
    options.current = window.T3M4.options as T3M4Context<O, C>['options']

    window.T3M4.subscribe('State:update', 'React:state:update', (values) => setState(values as State.Dynamic<O, C>))
    window.T3M4.subscribe('ResolvedMode:update', 'React:resolvedMode:update', (RM) => setResolvedMode(RM))
    window.T3M4.subscribe('State:reset', 'React:state:reset', () => {
      setState(null)
      setResolvedMode(undefined)
      options.current = {} as T3M4Context<O, C>['options']
    })
  }, [])

  useEffect(() => window.T3M4.reboot(scriptArgs), [JSON.stringify(scriptArgs)])

  const updateState: T3M4Context<O, C>['updateState'] = (state) => {
    const newState = { ...state, ...(typeof state === 'function' ? state(state as any) : state) }
    window.T3M4.state = newState as State.Static
  }

  return <T3M4Context.Provider value={{ state, updateState, resolvedMode, options: options.current }}>{children}</T3M4Context.Provider>
}
