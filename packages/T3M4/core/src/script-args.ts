import { CONSTANTS as constants } from './constants'
import { PRESET as preset } from './preset'
import { Constructed_Script_Args, Script_Args } from './types/script'

export const constructScriptArgs = (args: Script_Args) => ({ ...args, constants, preset }) as Constructed_Script_Args
