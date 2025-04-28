import { T3M4 } from './interface'

export type EventMap = {
  'Reset': void
  'State:base:update': NonNullable<ReturnType<T3M4['get']['state']['base']>>
  'State:forced:update': NonNullable<ReturnType<T3M4['get']['state']['forced']>>
}

export type CallbackID = 'DomManager:State:Base:Update'
