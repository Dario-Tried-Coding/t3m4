'use client'

import { Config, Props } from '@t3m4/core/types/config'
import { ResolvedMode } from '@t3m4/core/types/constants'
import { NullOr, UndefinedOr } from '@t3m4/utils/nullables'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { T3M4Context } from './context'
import { ScriptArgs, State } from '@t3m4/core/types'

interface T3M4Props extends PropsWithChildren, ScriptArgs {}
export const T3M4Provider = <Ps extends Props, C extends Config<Ps>>({ children, ...scriptArgs }: T3M4Props) => {
  const [state, setState] = useState<NullOr<State<Ps, C>>>(null)
  const [resolvedMode, setResolvedMode] = useState<UndefinedOr<ResolvedMode>>(undefined)
  const options = useRef<T3M4Context<Ps, C>['options']>({} as T3M4Context<Ps, C>['options'])

  useEffect(() => {
    setState(Object.fromEntries(window.T3M4.state) as State<Ps, C>)
    setResolvedMode(window.T3M4.resolvedMode)
    options.current = window.T3M4.options as T3M4Context<Ps, C>['options']

    window.T3M4.subscribe('State:update', 'React:state:update', (values) => setState(Object.fromEntries(values) as State<Ps, C>))
    window.T3M4.subscribe('ResolvedMode:update', 'React:resolvedMode:update', (RM) => setResolvedMode(RM))
    window.T3M4.subscribe('State:reset', 'React:state:reset', () => {
      setState(null)
      setResolvedMode(undefined)
      options.current = {} as T3M4Context<Ps, C>['options']
    })
  }, [])

  useEffect(() => window.T3M4.reboot(scriptArgs), [JSON.stringify(scriptArgs)])

  const updateState: T3M4Context<Ps, C>['updateState'] = (state) => {
    const newState = { ...state, ...(typeof state === 'function' ? state(state as any) : state) }
    window.T3M4.state = new Map(Object.entries(newState))
  }

  return <T3M4Context.Provider value={{ state, updateState, resolvedMode, options: options.current }}>{children}</T3M4Context.Provider>
}
