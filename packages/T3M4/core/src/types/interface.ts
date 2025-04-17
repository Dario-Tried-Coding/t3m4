import { RESOLVED_MODE } from './constants/modes'
import { CallbackID, EventMap } from './events'
import { ConstructedScriptArgs } from './script'
import { Options } from './subscribers/options'
import { State } from './subscribers/state'

export interface T3M4 {
  state: State
  update: {
    state: (island: string, state: State[keyof State]) => void
  }
  resolvedModes: Record<string, RESOLVED_MODE>
  options: Options
  subscribe: <E extends keyof EventMap>(e: E, id: CallbackID, cb: (payload: EventMap[E]) => void) => void
  reboot: (args: ConstructedScriptArgs) => void
}
