import { UndefinedOr } from '@repo/typescript-utils/nullable'
import { SystemValues } from './props'
import { Strats as BaseStrats } from './shared'

type Strats = BaseStrats & {
  light_dark: 'light&dark'
  system: 'system'
}
export type Strat = Strats[keyof Strats]

export type Selector = 'class' | 'colorScheme'
export type ResolvedMode = 'light' | 'dark'

type Mode = { type: 'mode' }

export type ModeMono<V extends string = string> = Mode & { strategy: Strats['mono']; preferred: V; colorScheme: ResolvedMode }

export type ModeMulti<V extends string[] = string[]> = Mode & { strategy: Strats['multi']; preferred: V[number]; colorSchemes: { [K in V[number]]: ResolvedMode } }

type ColorSchemes<CustomV extends UndefinedOr<string[]>> = [CustomV] extends [undefined]
  ? {
      colorSchemes?: Record<string, ResolvedMode>
    }
  : CustomV extends string[]
    ? { colorSchemes: Record<CustomV[number], ResolvedMode> }
    : {}

export type ModeLightDark<V extends Omit<SystemValues, 'system'> = { light: undefined; dark: undefined; custom: undefined }> = Mode & {
  strategy: Strats['light_dark']
  preferred: [V['light'], V['dark'], V['custom']] extends [undefined, undefined, undefined]
    ? string
    : (V['light'] extends string ? V['light'] : 'light') | (V['dark'] extends string ? V['dark'] : 'dark') | (V['custom'] extends string[] ? V['custom'][number] : never)
} & ColorSchemes<V['custom']>

export type ModeSystem<V extends SystemValues = { light: undefined; dark: undefined; system: undefined; custom: undefined }> = Mode & {
  strategy: Strats['system']
  preferred: [V['light'], V['dark'], V['system'], V['custom']] extends [undefined, undefined, undefined, undefined]
    ? string
    : (V['light'] extends string ? V['light'] : 'light') | (V['dark'] extends string ? V['dark'] : 'dark') | (V['system'] extends string ? V['system'] : 'system') | (V['custom'] extends string[] ? V['custom'][number] : never)
  fallback: [V['light'], V['dark'], V['system'], V['custom']] extends [undefined, undefined, undefined, undefined]
    ? string
    : (V['light'] extends string ? V['light'] : 'light') | (V['dark'] extends string ? V['dark'] : 'dark') | (V['custom'] extends string[] ? V['custom'][number] : never)
} & ColorSchemes<V['custom']>

export type ModeProp = ModeMono | ModeMulti | ModeLightDark | ModeSystem