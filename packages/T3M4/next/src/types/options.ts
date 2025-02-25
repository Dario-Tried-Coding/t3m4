import { Config, Props } from '@t3m4/core/types/config'
import { Prettify } from '@t3m4/utils'
import { State } from './state'

export type Options<Ps extends Props, C extends Config<Ps>, S extends State<Ps, C>> = Prettify<{
  [P in keyof S]: S[P][]
}>