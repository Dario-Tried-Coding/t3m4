'use client'

import { Initializer, T3M4Provider as Provider } from '@t3m4/react'
import { Config, Schema, T3M4ProviderProps } from '@t3m4/react/types'
import { PropsWithChildren } from 'react'

interface T3M4Props<Sc extends Schema, C extends Config<Sc>> extends PropsWithChildren, T3M4ProviderProps<Sc, C> {}
export const T3M4Provider = <Sc extends Schema, C extends Config<Sc>>({ children, ...args }: T3M4Props<Sc, C>) => {
  return (
    <Provider {...args}>
      <Initializer args={args} />
      {children}
    </Provider>
  )
}