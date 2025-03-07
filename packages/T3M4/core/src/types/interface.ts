import { UndefinedOr } from "@t3m4/utils/nullables"
import { Unsafe_State as State } from "./state"
import { Unsafe_Options as Options } from "./options"
import { RESOLVED_MODE } from "./constants"
import { EventMap } from "./events"

export interface NextThemes {
  state: State
  resolvedMode: UndefinedOr<RESOLVED_MODE>
  options: Options
  subscribe: <E extends keyof EventMap>(e: E, cb: (payload: EventMap[E]) => void) => void
}
