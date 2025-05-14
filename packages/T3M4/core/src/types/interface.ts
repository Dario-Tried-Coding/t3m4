import { State } from './subscribers/state'
import { Color_Schemes } from './subscribers/color-schemes'
import { Values } from './subscribers/values'
import { Schema } from './subscribers/schema'
import { CallbackID, EventMap } from './events'
import { Script_Args } from './script'

export interface T3M4 {
  get: {
    state: {
      base: () => State.AsObj.Static | undefined
      forced: () => State.AsObj.Static
      computed: () => State.AsObj.Static | undefined
    }
    colorSchemes: {
      base: () => Color_Schemes.AsObj.Static | undefined
      forced: () => Color_Schemes.AsObj.Static
      computed: () => Color_Schemes.AsObj.Static | undefined
    }
    values: () => Values.AsObj.Static
  }
  set: {
    state: {
      base: (state: State.AsObj.Static) => void
      forced: (state: State.AsObj.Static) => void
    }
  }
  subscribe: <E extends keyof EventMap>(e: E, id: CallbackID, cb: (payload: EventMap[E]) => void) => void
  reboot: (args: Script_Args) => void
}
