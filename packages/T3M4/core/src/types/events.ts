import { RESOLVED_MODE } from './constants'
import { Unsafe_State as State } from './state'

export type EventMap = {
  'State:update': State
  'State:reset': void
  'ResolvedMode:update': RESOLVED_MODE
}

export type CallbackID = 'DOMManager:state:update' | 'DOMManager:resolvedMode:update' | 'StorageManager:state:update' | 'React:state:update' | 'React:resolvedMode:update' | 'React:state:reset'