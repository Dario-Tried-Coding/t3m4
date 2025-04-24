import { COLOR_SCHEME } from './constants/color-schemes'
import { CallbackID, EventMap } from './events'
import { Constructed_Script_Args } from './script'
import { Options } from './subscribers/options'
import { State } from './subscribers/state'

export interface T3M4 {
  state: State
  update: {
    state: (island: string, state: State[keyof State]) => void
  }
  colorSchemes: Record<string, COLOR_SCHEME>
  options: Options
  subscribe: <E extends keyof EventMap>(e: E, id: CallbackID, cb: (payload: EventMap[E]) => void) => void
  reboot: (args: Constructed_Script_Args) => void
}
