import { T3M4 } from './interface'

export type EventMap = {
  'Reset': void
  'State:Base:Update': NonNullable<ReturnType<T3M4['get']['state']['base']>>
  'State:Forced:Update': NonNullable<ReturnType<T3M4['get']['state']['forced']>>
  'State:Computed:Update': NonNullable<ReturnType<T3M4['get']['state']['computed']>>
  'ColorSchemes:Base:Update': NonNullable<ReturnType<T3M4['get']['colorSchemes']['base']>>
  'ColorSchemes:Forced:Update': NonNullable<ReturnType<T3M4['get']['colorSchemes']['forced']>>
  'ColorSchemes:Computed:Update': NonNullable<ReturnType<T3M4['get']['colorSchemes']['computed']>>
}

export type CallbackID = 'React:State:Update' | 'React:ColorSchemes:Update' | 'React:Reset'
