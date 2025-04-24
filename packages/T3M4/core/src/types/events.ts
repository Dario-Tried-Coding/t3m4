import { T3M4 } from './interface'

export type EventMap = {
  'State:update': T3M4['state']
  'ColorSchemes:update': T3M4['colorSchemes']
  'ForcedState:update': T3M4['forcedState']
}

export type CallbackID = 'DOMManager:state:update' | 'DOMManager:resolvedMode:update' | 'StorageManager:state:update' | 'React:state:update' | 'React:resolvedMode:update' | 'React:state:reset'
