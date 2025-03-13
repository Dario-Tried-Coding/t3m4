import { RESOLVED_MODE } from './constants'
import { Unsafe_State as State } from './state'

export type EventMap = {
  'DOM:state:update': State
  'DOM:resolvedMode:update': RESOLVED_MODE
  'Storage:state:update': State
  'Storage:mode:update': string
  'State:update': State
  'State:reset': void
  'ResolvedMode:update': RESOLVED_MODE
}

export type CallbackID = 'Main:state:update' | 'Main:resolvedMode:update' | 'StorageManager:state:update' | 'DOMManager:state:update' | 'DOMManager:resolvedMode:update' | 'React:state:update' | 'React:state:reset' | 'React:resolvedMode:update'