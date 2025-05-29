import { script as unsafeScript } from '@t3m4/core'
import { ScriptArgs } from '@t3m4/core/types'
import { Config, Schema } from '@t3m4/core/types/subscribers'
import { ScriptHTMLAttributes } from 'react'

interface DynamicScriptArgs<Sc extends Schema, C extends Config<Sc>> extends ScriptArgs<Sc, C> {}
export const script = <Sc extends Schema, C extends Config<Sc>>(scriptArgs: DynamicScriptArgs<Sc, C>) => {
  return unsafeScript(scriptArgs)
}

interface ScriptProps extends Omit<ScriptHTMLAttributes<HTMLScriptElement>, 'nonce'> {
  scriptArgs: ScriptArgs.Static
}
export const Script = ({ scriptArgs, ...props }: ScriptProps) => {
  const stringScriptArgs = JSON.stringify(scriptArgs)
  return <script suppressHydrationWarning nonce={scriptArgs.nonce} dangerouslySetInnerHTML={{ __html: `(${unsafeScript.toString()})(${stringScriptArgs})` }} {...props} />
}