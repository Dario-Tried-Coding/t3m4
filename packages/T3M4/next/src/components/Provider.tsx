'use client'

import { PropsWithChildren } from 'react'
import { T3M4Provider as Provider, Script } from '@t3m4/react'
import { Config, Props, ScriptArgs } from '@t3m4/react/types'

interface T3M4Props<Ps extends Props, C extends Config<Ps>> extends PropsWithChildren, ScriptArgs {
  props: Ps
  config: C
}
export const T3M4Provider = <Ps extends Props, C extends Config<Ps>>({ children, ...scriptArgs }: T3M4Props<Ps, C>) => {
  return (
    <Provider {...scriptArgs}>
      <Script scriptArgs={scriptArgs} />
      {children}
    </Provider>
  )
}
