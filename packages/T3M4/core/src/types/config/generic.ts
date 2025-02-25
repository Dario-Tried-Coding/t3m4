import { STRATS } from '../constants'

type Generic = { type: 'generic' }

export type GenericMono<V extends string = string> = Generic & { strategy: STRATS['MONO']; preferred: V }

export type GenericMulti<V extends string[] = string[]> = Generic & { strategy: STRATS['MULTI']; preferred: V[number] }

export type GenericProp = GenericMono | GenericMulti
