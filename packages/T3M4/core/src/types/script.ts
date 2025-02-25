import { UndefinedOr } from '@repo/typescript-utils/nullable'
import { Options, State } from '../script'
import { Config, Props } from './config'
import { EventMap } from './events'
import { OBSERVER, RESOLVED_MODE, SELECTOR } from './constants'

export type ScriptArgs = {
  storageKey?: string
  props: Props
  config: Config
  mode?: {
    selector?: SELECTOR[]
    store?: boolean
    storageKey?: string
  }
  observe?: OBSERVER[]
  nonce?: string
  disableTransitionOnChange?: boolean
}

export interface NextThemes {
  state: State
  resolvedMode: UndefinedOr<RESOLVED_MODE>
  options: Options
  subscribe: <E extends keyof EventMap>(e: E, cb: (payload: EventMap[E]) => void) => void
  update: (prop: string, value: string) => void
}
