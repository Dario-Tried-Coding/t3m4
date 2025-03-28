'use client'

import { T3M4Provider as Provider, Script } from '@t3m4/react'
import { Config, Schema, ScriptArgs } from '@t3m4/react/types'
import { PropsWithChildren } from 'react'

interface T3M4Props<Sc extends Schema, C extends Config<Sc>> extends PropsWithChildren, ScriptArgs {
  schema: Sc
  config: C
}
export const T3M4Provider = <Sc extends Schema, C extends Config<Sc>>({ children, ...scriptArgs }: T3M4Props<Sc, C>) => {
  return (
    <Provider {...scriptArgs}>
      <Script scriptArgs={scriptArgs} />
      {children}
    </Provider>
  )
}
