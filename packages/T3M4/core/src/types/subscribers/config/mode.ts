import { UndefinedOr } from '@t3m4/utils/nullables'
import { System_Values } from '../options'
import { SELECTOR } from '../../constants/selectors'
import { STRATS } from '../../constants/strats'
import { RESOLVED_MODE } from '../../constants/modes'

type Color_Schemes<Custom_Values extends UndefinedOr<string[]>> = [Custom_Values] extends [undefined]
  ? { colorSchemes?: Record<string, RESOLVED_MODE> }
  : Custom_Values extends string[]
    ? { colorSchemes: Record<Custom_Values[number], RESOLVED_MODE> }
    : {}

export type Mode_Strat = { type: 'mode'; selector?: SELECTOR[]; store?: boolean }

export type Mode_Mono_Strat_Obj<V extends string = string> = Mode_Strat & { strategy: STRATS['MONO']; preferred: V; colorScheme: RESOLVED_MODE }

export type Mode_Multi_Strat_Obj<V extends string[] = string[]> = Mode_Strat & { strategy: STRATS['MULTI']; preferred: V[number]; colorSchemes: { [K in V[number]]: RESOLVED_MODE } }

export type Mode_Light_Dark_Strat_Obj<V extends Omit<System_Values, 'system'> = { light: undefined; dark: undefined; custom: undefined }> = Mode_Strat & {
  strategy: STRATS['LIGHT_DARK']
  preferred: [V['light'], V['dark'], V['custom']] extends [undefined, undefined, undefined]
    ? string
    : (V['light'] extends string ? V['light'] : 'light') | (V['dark'] extends string ? V['dark'] : 'dark') | (V['custom'] extends string[] ? V['custom'][number] : never)
} & Color_Schemes<V['custom']>

export type Mode_System_Strat_Obj<V extends System_Values = { light: undefined; dark: undefined; system: undefined; custom: undefined }> = Mode_Strat & {
  strategy: STRATS['SYSTEM']
  preferred: [V['light'], V['dark'], V['system'], V['custom']] extends [undefined, undefined, undefined, undefined]
    ? string
    : (V['light'] extends string ? V['light'] : 'light') | (V['dark'] extends string ? V['dark'] : 'dark') | (V['system'] extends string ? V['system'] : 'system') | (V['custom'] extends string[] ? V['custom'][number] : never)
  fallback: [V['light'], V['dark'], V['system'], V['custom']] extends [undefined, undefined, undefined, undefined]
    ? string
    : (V['light'] extends string ? V['light'] : 'light') | (V['dark'] extends string ? V['dark'] : 'dark') | (V['custom'] extends string[] ? V['custom'][number] : never)
} & Color_Schemes<V['custom']>

export type Mode_Strat_Obj = Mode_Mono_Strat_Obj | Mode_Multi_Strat_Obj | Mode_Light_Dark_Strat_Obj | Mode_System_Strat_Obj
