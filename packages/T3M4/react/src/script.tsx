import { constructScriptArgs, script as unsafeScript } from '@t3m4/core'
import { ScriptProps as StaticScriptProps } from '@t3m4/core/types'
import { Config, Schema } from '@t3m4/core/types/subscribers'
import { ScriptHTMLAttributes } from 'react'

interface DynamicScriptProps<Sc extends Schema, C extends Config<Sc>> extends StaticScriptProps {
  schema: Sc
  config: C
}
export const script = <Sc extends Schema, C extends Config<Sc>>(scriptProps: DynamicScriptProps<Sc, C>) => {
  const scriptArgs = constructScriptArgs(scriptProps)
  return unsafeScript(scriptArgs)
}

interface ScriptProps extends Omit<ScriptHTMLAttributes<HTMLScriptElement>, 'nonce'> {
  scriptProps: StaticScriptProps
}
export const Script = ({ scriptProps, ...props }: ScriptProps) => {
  const scriptArgs = constructScriptArgs(scriptProps)
  const stringScriptArgs = JSON.stringify(scriptArgs)

  return <script suppressHydrationWarning nonce={scriptProps.nonce} dangerouslySetInnerHTML={{ __html: `(${unsafeScript.toString()})(${stringScriptArgs})` }} {...props} />
}