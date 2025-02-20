import { script } from '@t3m4/core'
import type { ScriptArgs } from '@t3m4/core/types'
import { ScriptHTMLAttributes } from 'react'

interface ScriptProps extends Omit<ScriptHTMLAttributes<HTMLScriptElement>, 'nonce'> {
  scriptArgs: ScriptArgs
}
export const Script = ({ scriptArgs: provScriptArgs, ...props }: ScriptProps) => {
  const scriptArgs = JSON.stringify(provScriptArgs)
  return <script nonce={provScriptArgs.nonce} dangerouslySetInnerHTML={{ __html: `(${script.toString()})(${scriptArgs})` }} {...props} />
}
