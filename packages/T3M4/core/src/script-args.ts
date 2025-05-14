import { CONSTANTS as constants } from './constants'
import { PRESET as preset } from './preset'
import { Script_Args, Script_Props } from './types/script'

export const constructScriptArgs = (props: Script_Props) => ({ ...props, constants, preset }) as Script_Args