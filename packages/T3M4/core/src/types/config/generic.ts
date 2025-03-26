import { STRATS } from '../constants'

export type GenericMono<V extends string = string> = { strategy: STRATS['MONO']; preferred: V }

export type GenericMulti<V extends string[] = string[]> = { strategy: STRATS['MULTI']; preferred: V[number] }

export type GenericProp = GenericMono | GenericMulti