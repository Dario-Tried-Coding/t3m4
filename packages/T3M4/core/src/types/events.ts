import { RESOLVED_MODE } from './constants'

export type EventMap = {
  'DOM:state:update': Map<string, string>
  'DOM:resolvedMode:update': RESOLVED_MODE
  'Storage:update': Map<string, string>
  'State:update': Map<string, string>
  'State:reset': void
}
