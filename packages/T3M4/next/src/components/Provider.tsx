'use client'

import { ScriptArgs, State } from '@t3m4/core/types'
import { Config, Props } from '@t3m4/core/types/config'
import { ResolvedMode } from '@t3m4/core/types/constants'
import { NullOr, UndefinedOr } from '@t3m4/utils/nullables'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { T3M4Context } from '../context'
import { Script } from './Script'

interface T3M4Props<Ps extends Props, C extends Config<Ps>> extends PropsWithChildren, ScriptArgs {
  props: Ps
  config: C
}
export const T3M4Provider = <Ps extends Props, C extends Config<Ps>>({ children, ...scriptArgs }: T3M4Props<Ps, C>) => {
  const [state, setState] = useState<NullOr<State<Ps, C>>>(null)
  const [resolvedMode, setResolvedMode] = useState<UndefinedOr<ResolvedMode>>(undefined)
  const options = useRef<T3M4Context<Ps, C>['options']>({} as T3M4Context<Ps, C>['options'])

  useEffect(() => {
    setState(Object.fromEntries(window.NextThemes.state) as State<Ps, C>)
    setResolvedMode(window.NextThemes.resolvedMode)
    options.current = Object.fromEntries(Array.from(window.NextThemes.options.entries(), ([key, { options }]) => [key, Array.from(options)])) as T3M4Context<Ps, C>['options']

    window.NextThemes.subscribe('DOM:state:update', (values) => setState(Object.fromEntries(values) as State<Ps, C>))
    window.NextThemes.subscribe('Storage:update', (values) => setState(Object.fromEntries(values) as State<Ps, C>))
    window.NextThemes.subscribe('DOM:resolvedMode:update', resolvedMode => setResolvedMode(resolvedMode))
  }, [])

  const updateState: T3M4Context<Ps, C>['updateState'] = (s) => {
    const newState = { ...state, ...(typeof s === 'function' ? s(state as any) : s) }
    window.NextThemes.state = new Map(Object.entries(newState))
  }

  return (
    <T3M4Context.Provider value={{ state, updateState, resolvedMode, options: options.current }}>
      <Script scriptArgs={scriptArgs} />
      {children}
    </T3M4Context.Provider>
  )
}
