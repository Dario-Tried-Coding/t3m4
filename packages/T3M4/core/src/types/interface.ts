import { Color_Schemes, State, Values } from './subscribers'
import { CallbackID, EventMap } from './events'
import { Script_Args } from './script'

export interface T3M4 {
  get: {
    state: {
      base: () => State.Primitive.Static | undefined
      forced: () => State.Primitive.Static
      computed: () => State.Primitive.Static | undefined
    }
    colorSchemes: {
      base: () => Color_Schemes.Object.Static | undefined
      forced: () => Color_Schemes.Object.Static
      computed: () => Color_Schemes.Object.Static | undefined
    }
    values: () => Values.Object.Static
  }
  set: {
    state: {
      base: (state: State.Primitive.Static) => void
      forced: (state: State.Primitive.Static) => void
    }
  }
  subscribe: <E extends keyof EventMap>(e: E, id: CallbackID, cb: (payload: EventMap[E]) => void) => void
  reboot: (args: Script_Args) => void
}
