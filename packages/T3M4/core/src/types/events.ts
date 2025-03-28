import { RESOLVED_MODE } from './constants/modes'
import { T3M4 } from './interface'

export type EventMap = {
  'State:update': T3M4['state']
  'State:reset': void
  'ResolvedMode:update': RESOLVED_MODE
}

export type CallbackID = 'DOMManager:state:update' | 'DOMManager:resolvedMode:update' | 'StorageManager:state:update' | 'React:state:update' | 'React:resolvedMode:update' | 'React:state:reset'
