import { ScriptArgs } from './script'

export type CONFIG = Required<Omit<ScriptArgs, 'props' | 'config' | 'target'>> & { mode: Required<ScriptArgs['mode']> }