import { ColorSchemes as Color_Schemes, State, Values } from './subscribers'
import { CallbackID, EventMap } from './events'
import { Script_Args } from './script'

export interface T3M4 {
  get: {
    state: {
      base: () => State.Static | undefined
      forced: () => State.Static | undefined
      computed: () => State.Static | undefined
    }
    colorSchemes: {
      base: () => Color_Schemes.Static | undefined
      forced: () => Color_Schemes.Static | undefined
      computed: () => Color_Schemes.Static | undefined
    }
    values: () => Values.Static
  }
  set: {
    state: {
      base: (state: State.Static) => void
      forced: (state: State.Static) => void
    }
  }
  subscribe: <E extends keyof EventMap>(e: E, id: CallbackID, cb: (payload: EventMap[E]) => void) => void
  reboot: (args: Script_Args) => void
}
