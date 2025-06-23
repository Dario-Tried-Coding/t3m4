'use client'

import { initializer, T3M4Provider as Provider } from '@t3m4/react'
import { Args, Config, Schema, T3M4ProviderProps } from '@t3m4/react/types'
import { PropsWithChildren, ScriptHTMLAttributes } from 'react'

interface InitializerProps extends Omit<ScriptHTMLAttributes<HTMLScriptElement>, 'nonce'> {
  args: Args.Static
}
function Initializer({ args, ...props }:InitializerProps) {
  const stringArgs = JSON.stringify(args)
  return <script suppressHydrationWarning nonce={args.nonce} dangerouslySetInnerHTML={{ __html: `(${initializer.toString()})(${stringArgs})` }} {...props} />
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
