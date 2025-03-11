import { Prettify } from '@t3m4/utils'
import { Config, Props } from './config/index'
import { State } from './state'

export type Options<Ps extends Props, C extends Config<Ps>, S extends State<Ps, C>> = Prettify<{
  [P in keyof S]: S[P][]
}>
export type Unsafe_Options = Map<string, { preferred: string; options: Set<string> }>