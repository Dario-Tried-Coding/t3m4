import { Strats } from './shared'

type Generic = { type: 'generic' }

export type GenericMono<V extends string = string> = Generic & { strategy: Strats['mono']; preferred: V }

export type GenericMulti<V extends string[] = string[]> = Generic & { strategy: Strats['multi']; preferred: V[number] }

export type GenericProp = GenericMono | GenericMulti
