import { CallbackID, EventMap } from './events'
import { Args } from './args'
import { State } from './subscribers/state'
import { Color_Schemes } from './subscribers/color-schemes'
import { Values } from './subscribers/values'

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
    state: (state: State.Static) => void
  }
  subscribe: <E extends keyof EventMap>(e: E, id: CallbackID, cb: (payload: EventMap[E]) => void) => void
  reboot: (args: Args.Static) => void
  init: (args: Args.Static) => void
}
