import { script as unsafeScript } from '@t3m4/core'
import { ScriptArgs as UnsafeScriptArgs } from '@t3m4/core/types'
import { Config, Props } from '@t3m4/core/types/config'
import { ScriptHTMLAttributes } from 'react'

interface ScriptArgs<Ps extends Props, C extends Config<Ps>> extends UnsafeScriptArgs {
  props: Ps
  config: C
}
export const script = <Ps extends Props, C extends Config<Ps>>(scriptArgs: ScriptArgs<Ps, C>) => unsafeScript(scriptArgs)

interface ScriptProps extends Omit<ScriptHTMLAttributes<HTMLScriptElement>, 'nonce'> {
  scriptArgs: UnsafeScriptArgs
}
export const Script = ({ scriptArgs: provScriptArgs, ...props }: ScriptProps) => {
  const scriptArgs = JSON.stringify(provScriptArgs)

  return <script nonce={provScriptArgs.nonce} dangerouslySetInnerHTML={{ __html: `(${unsafeScript.toString()})(${scriptArgs})` }} {...props} />
}