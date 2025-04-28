import { T3M4 } from './interface'

export type EventMap = {
  'Reset': void
  'State:base:update': NonNullable<ReturnType<T3M4['get']['state']['base']['all']>>
  'State:forced:update': NonNullable<ReturnType<T3M4['get']['state']['forced']['all']>>
  'State:computed:update': NonNullable<ReturnType<T3M4['get']['state']['computed']['all']>>
  'ColorSchemes:update': NonNullable<ReturnType<T3M4['get']['colorSchemes']['all']>>
}

export type CallbackID = 'DOMManager:state:update' | 'DOMManager:resolvedMode:update' | 'StorageManager:state:update' | 'React:state:update' | 'React:resolvedMode:update' | 'React:reset'
