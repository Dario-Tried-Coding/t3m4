'use client'

import { T3M4Provider as Provider, initializer } from '@t3m4/react'
import { Args, Config, Schema, T3M4ProviderProps } from '@t3m4/react/types'
import { HTMLAttributes, PropsWithChildren } from 'react'

interface InitializerProps<Sc extends Schema, C extends Config<Sc>> extends Omit<HTMLAttributes<HTMLScriptElement>, 'nonce'> {
  args: Args<Sc, C>
}
function Initializer<Sc extends Schema, C extends Config<Sc>>({args, ...props}: InitializerProps<Sc, C>) {
  return <script suppressHydrationWarning nonce={args.nonce} dangerouslySetInnerHTML={{ __html: `(${initializer.toString()})(${JSON.stringify(args)})` }} {...props} />
}

interface T3M4Props<Sc extends Schema, C extends Config<Sc>> extends PropsWithChildren, T3M4ProviderProps<Sc, C> {}
export const T3M4Provider = <Sc extends Schema, C extends Config<Sc>>({ children, ...args }: T3M4Props<Sc, C>) => {
  return (
    <Provider {...args}>
      <Initializer args={args} />
      {children}
    </Provider>
  )
}
