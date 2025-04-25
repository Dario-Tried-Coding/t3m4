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
      base: {
        all: () => State | undefined
        island: (island: string) => Island_State | undefined
        facet: (island: string, facet: string) => Island_State_Facet | undefined
      }
      forced: {
        all: () => State | undefined
        island: (island: string) => Island_State | undefined
        facet: (island: string, facet: string) => Island_State_Facet | undefined
      }
      computed: {
        all: () => State | undefined
        island: (island: string) => Island_State | undefined
        facet: (island: string, facet: string) => Island_State_Facet | undefined
      }
    }
    colorSchemes: {
      all: () => Color_Schemes | undefined
      island: (island: string) => Island_Color_Scheme | undefined
    }
    options: {
      all: () => Options | undefined
      island: (island: string) => Island_Options | undefined
      facet: (island: string, facet: string) => Island_Facet_Options | undefined
    }
  }
  set: {
    state: {
      base: {
        all: (state: State) => void
        island: (island: string, state: Island_State) => void
        facet: (island: string, facet: string, state: Island_State_Facet) => void
      }
      forced: {
        all: (state: State) => void
        island: (island: string, state: Island_State) => void
        facet: (island: string, facet: string, state: Island_State_Facet) => void
      }
    }
  }
  subscribe: <E extends keyof EventMap>(e: E, id: CallbackID, cb: (payload: EventMap[E]) => void) => void
  reboot: (args: Constructed_Script_Args) => void
}
