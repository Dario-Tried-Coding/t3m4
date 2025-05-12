import { Config } from "./config";
import { Schema } from "./schema";

export namespace Islands {
  export namespace Island {
    export type Dynamic<C extends Config.Dynamic<Schema>> = keyof C
    export type Static = string
  }

  export namespace AsArray {
    export type Dynamic<C extends Config.Dynamic<Schema>> = Array<Island.Dynamic<C>>
    export type Static = Array<Island.Static>
  }

  export namespace AsSet {
    export namespace Static {
      export type Common = Set<Island.Static>
    }
  }
}