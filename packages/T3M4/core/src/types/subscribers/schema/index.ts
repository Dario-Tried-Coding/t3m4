import {Facet as T_Facet, Mode as T_Mode} from './facet'
import {Island as T_Island, Suggested as T_Suggested, Branded as T_Branded} from './island'

export type Schema = {
  [island: string]: T_Island
}
export namespace Schema {
  export type Island = T_Island
  export namespace Island {
    export type Facets = T_Island.Facets
    export namespace Facets {
      export type Facet = T_Facet
    }

    export type Mode = T_Island.Mode
    export namespace Mode {
      export type Facet = T_Mode
    }
  }

  export type Suggested = {
    [island: string]: T_Suggested
  }

  type IsMeaningfulIsland<I extends Island> = I extends Schema.Island.Mode ? true : I extends Schema.Island.Facets ? (keyof I['facets'] extends never ? false : true) : false
  export type Polished<Sc extends Schema> = {
    [I in keyof Sc as IsMeaningfulIsland<Sc[I]> extends true ? I : never]: Sc[I]
  }

  export type Branded<Sc extends Schema> = {
    [I in keyof Sc]: T_Branded<Sc[I]>
  }
}
