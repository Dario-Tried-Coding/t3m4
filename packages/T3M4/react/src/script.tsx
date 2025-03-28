import { script as unsafeScript } from '@t3m4/core'
import { ScriptArgs as UnsafeScriptArgs } from '@t3m4/core/types'
import { Options, Config } from '@t3m4/core/types/subscribers'
import { ScriptHTMLAttributes } from 'react'

interface ScriptArgs<O extends Options.Schema, C extends Config.Dynamic<O>> extends UnsafeScriptArgs {
  options: O
  config: C
}
export const script = <O extends Options.Schema, C extends Config.Dynamic<O>>(scriptArgs: ScriptArgs<O, C>) => unsafeScript(scriptArgs)

interface ScriptProps extends Omit<ScriptHTMLAttributes<HTMLScriptElement>, 'nonce'> {
  scriptArgs: UnsafeScriptArgs
}
export const Script = ({ scriptArgs: provScriptArgs, ...props }: ScriptProps) => {
  const scriptArgs = JSON.stringify(provScriptArgs)

  return <script nonce={provScriptArgs.nonce} dangerouslySetInnerHTML={{ __html: `(${unsafeScript.toString()})(${scriptArgs})` }} {...props} />
}