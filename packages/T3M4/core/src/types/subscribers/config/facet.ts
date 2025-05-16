import { FACETS } from "../../constants/facets";
import { STRATS } from "../../constants/strats";
import { Brand } from "../brand";
import { Default, Mono } from "../options";

export type Mono<S extends Brand<Mono, { type: FACETS['generic']; strat: STRATS['mono'] }>> = { strategy: STRATS['mono']; default: Unbrand<S> }
export type Config_Facet_Mono_Default = Config_Facet_Mono<State.Branded.Island.Facets.Facet.Dynamic<Default>>
export type Static = Dynamic<State.Branded.Island.Facets.Facet.Dynamic<Mono.Primitive>>