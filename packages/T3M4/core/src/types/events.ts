import { T3M4 } from './T3M4'

export type EventMap = {
  Reset: void
  'Reset:Success': void
  'State:Base:Update': { state: NonNullable<ReturnType<T3M4['get']['state']['base']>>; colorScheme: NonNullable<ReturnType<T3M4['get']['colorSchemes']['base']>> }
  'State:Forced:Update': { state: NonNullable<ReturnType<T3M4['get']['state']['forced']>>; colorScheme: NonNullable<ReturnType<T3M4['get']['colorSchemes']['forced']>> }
  'State:Computed:Update': { state: NonNullable<ReturnType<T3M4['get']['state']['computed']>>; colorScheme: NonNullable<ReturnType<T3M4['get']['colorSchemes']['computed']>>; isUserMutation?: boolean }
}

export type CallbackID = 'React:State:Update' | 'React:ColorSchemes:Update' | 'React:Reset' | 'StorageManager:Reset' | 'DomManager:Reset' | 'StorageManager:State:Update' | 'DomManager:State:Update'
