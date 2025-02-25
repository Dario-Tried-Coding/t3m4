import { script as unsafeScript } from '@t3m4/core'
import { ScriptArgs as UnsafeScriptArgs } from '@t3m4/core/types'
import { Config, Props } from '@t3m4/core/types/config'

interface ScriptArgs<Ps extends Props, C extends Config<Ps>> extends UnsafeScriptArgs {
  props: Ps
  config: C
}
export const T3M4Script = <Ps extends Props, C extends Config<Ps>>(scriptArgs: ScriptArgs<Ps, C>) => unsafeScript(scriptArgs)