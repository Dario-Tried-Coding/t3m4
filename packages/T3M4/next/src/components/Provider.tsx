'use client'

import { T3M4Provider as Provider, Script } from '@t3m4/react'
import { Config, Schema, T3M4ProviderProps } from '@t3m4/react/types'
import { PropsWithChildren } from 'react'

interface T3M4Props<Sc extends Schema, C extends Config<Sc>> extends PropsWithChildren, T3M4ProviderProps<Sc, C> {}
export const T3M4Provider = <Sc extends Schema, C extends Config<Sc>>({ children, ...scriptProps }: T3M4Props<Sc, C>) => {
  return (
    <Provider {...scriptProps}>
      {children}
      <Script scriptProps={scriptProps} />
    </Provider>
  )
}