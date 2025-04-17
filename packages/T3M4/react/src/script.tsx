import { constructScriptArgs, script as unsafeScript } from '@t3m4/core'
import { ScriptArgs as UnsafeScriptArgs } from '@t3m4/core/types'
import { Config, Schema } from '@t3m4/core/types/subscribers'
import { ScriptHTMLAttributes } from 'react'

interface ScriptArgs<Sc extends Schema, C extends Config<Sc>> extends UnsafeScriptArgs {
  schema: Sc
  config: C
}
export const script = <Sc extends Schema, C extends Config<Sc>>(scriptArgs: ScriptArgs<Sc, C>) => {
  const constructedScriptArgs = constructScriptArgs(scriptArgs)
  return unsafeScript(constructedScriptArgs)
}

interface ScriptProps extends Omit<ScriptHTMLAttributes<HTMLScriptElement>, 'nonce'> {
  scriptArgs: UnsafeScriptArgs
}
export const Script = ({ scriptArgs: provScriptArgs, ...props }: ScriptProps) => {
  const constructedScriptArgs = constructScriptArgs(provScriptArgs)
  const stringifiedScriptArgs = JSON.stringify(constructedScriptArgs)

  return <script nonce={provScriptArgs.nonce} dangerouslySetInnerHTML={{ __html: `(${unsafeScript.toString()})(${stringifiedScriptArgs})` }} {...props} />
}