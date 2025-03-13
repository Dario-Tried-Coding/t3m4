import { UndefinedOr } from "@t3m4/utils/nullables"
import { Unsafe_State as State } from "./state"
import { Unsafe_Options as Options } from "./options"
import { RESOLVED_MODE } from "./constants"
import { CallbackID, EventMap } from "./events"
import { ScriptArgs } from "./script"

export interface T3M4 {
  state: State
  resolvedMode: UndefinedOr<RESOLVED_MODE>
  options: Options
  subscribe: <E extends keyof EventMap>(e: E, id: CallbackID, cb: (payload: EventMap[E]) => void) => void
  reboot: (args: ScriptArgs) => void
}
