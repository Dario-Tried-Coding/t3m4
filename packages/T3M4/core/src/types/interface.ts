import { COLOR_SCHEME } from './constants/color-schemes'
import { CallbackID, EventMap } from './events'
import { Constructed_Script_Args } from './script'
import { Options } from './subscribers/options'
import { State } from './subscribers/state'

type Island_State = State[keyof State]
type Island_State_Facet = Island_State[keyof Island_State]

type Color_Schemes = Record<string, COLOR_SCHEME>
type Island_Color_Scheme = Color_Schemes[keyof Color_Schemes]

type Island_Options = Options[keyof Options]
type Island_Facet_Options = Island_Options[keyof Island_Options]

export interface T3M4 {
  get: {
    state: {
      base: () => State | undefined
      forced: () => State
      computed: () => State | undefined
    }
    colorSchemes: {
      base: () => Color_Schemes | undefined
      forced: () => Color_Schemes
      computed: () => Color_Schemes | undefined
    }
    options: () => Options
  }
  set: {
    state: {
      base: (state: State) => void
      forced: (state: State) => void
    }
  }
  subscribe: <E extends keyof EventMap>(e: E, id: CallbackID, cb: (payload: EventMap[E]) => void) => void
  reboot: (args: Constructed_Script_Args) => void
}
