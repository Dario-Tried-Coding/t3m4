import { STRATS } from '../constants'

export type Generic_Strat = { type: 'facet'}

export type Generic_Mono_Strat_Obj<V extends string = string> = Generic_Strat & { strategy: STRATS['MONO']; preferred: V }

export type Generic_Multi_Strat_Obj<V extends string[] = string[]> = Generic_Strat & { strategy: STRATS['MULTI']; preferred: V[number] }

export type Generic_Strat_Obj = Generic_Mono_Strat_Obj | Generic_Multi_Strat_Obj