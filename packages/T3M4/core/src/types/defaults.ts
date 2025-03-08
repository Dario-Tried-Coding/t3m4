import { ScriptArgs } from './script'

export type DEFAULTS = Required<Omit<ScriptArgs, 'props' | 'config' | 'target'>> & { mode: Required<ScriptArgs['mode']> }