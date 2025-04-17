'use client'

import { ScriptArgs, T3M4 } from '@t3m4/core/types'
import { Config, Schema, State } from '@t3m4/core/types/subscribers'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { T3M4Context } from './context'
import { constructScriptArgs } from '@t3m4/core'

interface T3M4Props extends PropsWithChildren, ScriptArgs {}
export const T3M4Provider = <Sc extends Schema, C extends Config<Sc>>({ children, ...scriptArgs }: T3M4Props) => {
  const [state, setState] = useState<T3M4Context<Sc, C>['state']>(null)
  const [colorSchemes, setColorSchemes] = useState<T3M4Context<Sc, C>['colorSchemes']>(undefined)
  const options = useRef({} as T3M4Context<Sc, C>['options'])

  useEffect(() => {
    setState(window.T3M4.state as T3M4Context<Sc, C>['state'])
    setColorSchemes(window.T3M4.resolvedModes as T3M4Context<Sc, C>['colorSchemes'])
    options.current = window.T3M4.options as T3M4Context<Sc, C>['options']

    window.T3M4.subscribe('State:update', 'React:state:update', (values) => setState(values as State<Sc, C>))
    window.T3M4.subscribe('ResolvedModes:update', 'React:resolvedMode:update', (RMs) => {
      console.log('RMs', RMs)
      setColorSchemes(RMs as T3M4Context<Sc, C>['colorSchemes'])
    })
    window.T3M4.subscribe('State:reset', 'React:state:reset', () => {
      setState(null)
      setColorSchemes(undefined)
      options.current = {} as T3M4Context<Sc, C>['options']
    })
  }, [])

  useEffect(() => window.T3M4.reboot(constructScriptArgs(scriptArgs)), [JSON.stringify(scriptArgs)])

  const updateState: T3M4Context<Sc, C>['updateState'] = (island, state) => {
    const newState = { ...state, ...(typeof state === 'function' ? state(state as any) : state) }
    window.T3M4.update.state(island as Parameters<T3M4['update']['state']>[0], newState as Parameters<T3M4['update']['state']>[1])
  }

  return <T3M4Context.Provider value={{ state, updateState, colorSchemes, options: options.current }}>{children}</T3M4Context.Provider>
}
