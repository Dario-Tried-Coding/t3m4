import { RESOLVED_MODE } from './constants'
import { Unsafe_State as State } from './state'

export type EventMap = {
  'DOM:state:update': State
  'DOM:resolvedMode:update': RESOLVED_MODE
  'Storage:state:update': State
  'Storage:mode:update': string
  'State:update': State
  'State:reset': void
}