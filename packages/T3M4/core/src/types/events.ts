import { RESOLVED_MODE } from './constants'
import { Unsafe_State as State } from './state'

export type EventMap = {
  'DOM:state:update': State
  'Storage:state:update': State
  'Storage:mode:update': string
  'State:update': State
  'State:reset': void
  'ResolvedMode:update': RESOLVED_MODE
}