'use client'

import { PropsWithChildren } from 'react'
import { T3M4Provider as Provider, Script } from '@t3m4/react'
import { Config, Options, ScriptArgs } from '@t3m4/react/types'

interface T3M4Props<O extends Options.Schema, C extends Config.Dynamic<O>> extends PropsWithChildren, ScriptArgs {
  options: O
  config: C
}
export const T3M4Provider = <O extends Options.Schema, C extends Config.Dynamic<O>>({ children, ...scriptArgs }: T3M4Props<O, C>) => {
  return (
    <Provider {...scriptArgs}>
      <Script scriptArgs={scriptArgs} />
      {children}
    </Provider>
  )
}
