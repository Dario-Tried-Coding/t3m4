import { UndefinedOr } from '@repo/typescript-utils/nullable'
import { Options, State } from '../script'
import { Config, Props } from './config'
import { ResolvedMode, Selector } from './config/mode'
import { EventMap } from './events'

export type Observer = 'storage' | 'DOM-attrs'

export type ScriptArgs = {
  storageKey?: string
  props: Props
  config: Config
  mode?: {
    attribute?: Selector[]
    store?: boolean
    storageKey?: string
  }
  observe?: Observer[]
  nonce?: string
  disableTransitionOnChange?: boolean
}

export type DEFAULTS = Required<Omit<ScriptArgs, 'props' | 'config'>> & { mode: Required<ScriptArgs['mode']> }

export interface NextThemes {
  state: State
  resolvedMode: UndefinedOr<ResolvedMode>
  options: Options
  subscribe: <E extends keyof EventMap>(e: E, cb: (payload: EventMap[E]) => void) => void
  update: (prop: string, value: string) => void
}
