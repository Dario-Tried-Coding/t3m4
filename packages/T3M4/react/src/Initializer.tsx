import { Args } from '@t3m4/core/types'
import { ScriptHTMLAttributes } from 'react'

function initT3M4(args: Args.Static) {
  window.T3M4.init(args)
}

interface InitializerProps extends Omit<ScriptHTMLAttributes<HTMLScriptElement>, 'nonce'> {
  args: Args.Static
}
export const Initializer = ({ args, ...props }: InitializerProps) => {
  const stringArgs = JSON.stringify(args)
  return <script suppressHydrationWarning nonce={args.nonce} dangerouslySetInnerHTML={{ __html: `(${initT3M4.toString()})(${stringArgs})` }} {...props} />
}
