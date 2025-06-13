import { T3M4 } from './T3M4'

export type EventMap = {
  'Reset': void
  'Reset:Success': void
  'State:Base:Update': NonNullable<ReturnType<T3M4['get']['state']['base']>>
  'State:Forced:Update': NonNullable<ReturnType<T3M4['get']['state']['forced']>>
  'State:Computed:Update': NonNullable<ReturnType<T3M4['get']['state']['computed']>>
  'ColorSchemes:Base:Update': NonNullable<ReturnType<T3M4['get']['colorSchemes']['base']>>
  'ColorSchemes:Forced:Update': NonNullable<ReturnType<T3M4['get']['colorSchemes']['forced']>>
  'ColorSchemes:Computed:Update': NonNullable<ReturnType<T3M4['get']['colorSchemes']['computed']>>
}

export type CallbackID = 'React:State:Update' | 'React:ColorSchemes:Update' | 'React:Reset' | 'StorageManager:Reset' | 'DomManager:Reset' | 'StorageManager:State:Update' | 'DomManager:State:Update'
