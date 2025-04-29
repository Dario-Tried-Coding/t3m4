import { Schema } from "./schema";

export type Islands<Sc extends Schema> = keyof Sc

export namespace Islands {
  export namespace Island {
    export type Dynamic<Sc extends Schema> = keyof Sc
    export type Static = string
  }

  export namespace AsArray {
    export type Dynamic<Sc extends Schema> = Array<Island.Dynamic<Sc>>
    export type Static = Array<Island.Static>
  }

  export namespace AsSet {
    export type Common = Set<Island.Static>
  }
}