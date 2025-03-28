import { UndefinedOr } from '@t3m4/utils/nullables'
import { RESOLVED_MODE } from './constants/modes'
import { CallbackID, EventMap } from './events'
import { ScriptArgs } from './script'
import { State } from './subscribers/state'
import { Options } from './subscribers/options'

export interface T3M4 {
  state: State.Static
  resolvedMode: UndefinedOr<RESOLVED_MODE>
  options: Options.Static
  subscribe: <E extends keyof EventMap>(e: E, id: CallbackID, cb: (payload: EventMap[E]) => void) => void
  reboot: (args: ScriptArgs) => void
}
