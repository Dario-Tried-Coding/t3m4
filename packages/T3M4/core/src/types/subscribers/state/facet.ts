import { Facet as Schema_Facet, Mode as Schema_Mode } from '../schema/facet'

export type Facet<Sc extends Schema_Facet> = Sc extends Schema_Facet.Mono ? Facet.Mono<Sc> : Sc extends Schema_Facet.Multi ? Facet.Multi<Sc> : never
export namespace Facet {
  export type Mono<Sc extends Schema_Facet.Mono> = Sc
  export type Multi<Sc extends Schema_Facet.Multi> = Sc[number]

  export type Static = string
}

export type Mode<Sc extends Schema_Mode> = Sc extends Schema_Mode.Mono ? Mode.Mono<Sc> : Sc extends Schema_Mode.Multi ? Mode.Multi<Sc> : Sc extends Schema_Mode.System ? Mode.System<Sc> : never
export namespace Mode {
  export type Mono<Sc extends Schema_Mode.Mono> = Sc
  export type Multi<Sc extends Schema_Mode.Multi> = Sc[number]
  
  type Flatten<Sc extends Schema_Mode.System> = Sc['light'] | Sc['dark'] | (Sc extends Required<Pick<Schema_Mode.System, 'system'>> ? Sc['system'] : never) | (Sc extends Required<Pick<Schema_Mode.System, 'custom'>> ? Sc['custom'][number] : never)
  export type System<Sc extends Schema_Mode.System> = Flatten<Sc>

  export type Static = string
}
