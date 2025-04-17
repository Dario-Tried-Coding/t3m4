import { CONSTANTS as constants } from './constants'
import { PRESET as preset } from './preset'
import { ConstructedScriptArgs, ScriptArgs } from './types/script'

export const constructScriptArgs = (args: ScriptArgs) => ({ ...args, constants, preset }) as ConstructedScriptArgs
