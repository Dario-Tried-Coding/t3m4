import { UndefinedOr } from '@t3m4/utils/nullables'
import { SystemValues } from './props'
import { RESOLVED_MODE, STRATS } from '../constants'

export type ModeMono<V extends string = string> = { strategy: STRATS['MONO']; preferred: V; colorScheme: RESOLVED_MODE }

export type ModeMulti<V extends string[] = string[]> = { strategy: STRATS['MULTI']; preferred: V[number]; colorSchemes: { [K in V[number]]: RESOLVED_MODE } }

type ColorSchemes<CustomV extends UndefinedOr<string[]>> = [CustomV] extends [undefined]
  ? {
      colorSchemes?: Record<string, RESOLVED_MODE>
    }
  : CustomV extends string[]
    ? { colorSchemes: Record<CustomV[number], RESOLVED_MODE> }
    : {}

export type ModeLightDark<V extends Omit<SystemValues, 'system'> = { light: undefined; dark: undefined; custom: undefined }> = {
  strategy: STRATS['LIGHT_DARK']
  preferred: [V['light'], V['dark'], V['custom']] extends [undefined, undefined, undefined]
    ? string
    : (V['light'] extends string ? V['light'] : 'light') | (V['dark'] extends string ? V['dark'] : 'dark') | (V['custom'] extends string[] ? V['custom'][number] : never)
} & ColorSchemes<V['custom']>

export type ModeSystem<V extends SystemValues = { light: undefined; dark: undefined; system: undefined; custom: undefined }> = {
  strategy: STRATS['SYSTEM']
  preferred: [V['light'], V['dark'], V['system'], V['custom']] extends [undefined, undefined, undefined, undefined]
    ? string
    : (V['light'] extends string ? V['light'] : 'light') | (V['dark'] extends string ? V['dark'] : 'dark') | (V['system'] extends string ? V['system'] : 'system') | (V['custom'] extends string[] ? V['custom'][number] : never)
  fallback: [V['light'], V['dark'], V['system'], V['custom']] extends [undefined, undefined, undefined, undefined]
    ? string
    : (V['light'] extends string ? V['light'] : 'light') | (V['dark'] extends string ? V['dark'] : 'dark') | (V['custom'] extends string[] ? V['custom'][number] : never)
} & ColorSchemes<V['custom']>

export type ModeProp = ModeMono | ModeMulti | ModeLightDark | ModeSystem
