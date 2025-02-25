import { ScriptArgs } from './script'

export type DEFAULTS = Required<Omit<ScriptArgs, 'props' | 'config'>> & { mode: Required<ScriptArgs['mode']> }