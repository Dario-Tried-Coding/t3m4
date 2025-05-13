import { CONSTANTS as constants } from './constants'
import { PRESET as preset } from './preset'
import { Script_Args, Script_Props } from './types/script'

export const constructScriptArgs = (args: Script_Props) => ({ ...args, constants, preset }) as Script_Args