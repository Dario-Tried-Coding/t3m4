'use client'

import { T3M4Provider as Provider, Script } from '@t3m4/react'
import { Config, Schema, ScriptProps } from '@t3m4/react/types'
import { PropsWithChildren } from 'react'

interface T3M4Props<Sc extends Schema, C extends Config<Sc>> extends PropsWithChildren, ScriptProps {
  schema: Sc
  config: C
}
export const T3M4Provider = <Sc extends Schema, C extends Config<Sc>>({ children, ...scriptProps }: T3M4Props<Sc, C>) => {
  return (
    <Provider {...scriptProps}>
      <Script scriptProps={scriptProps} />
      {children}
    </Provider>
  )
}
