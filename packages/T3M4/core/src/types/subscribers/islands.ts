import { Config } from "./config";
import { Schema } from "./schema";

export namespace Islands {
  type Island<C extends Config<Schema>> = keyof C
  namespace Island {
    export type Static = string
  }

  export type AsArr<C extends Config<Schema>> = Array<Island<C>>
  export namespace AsArr {
    export type Static = Array<Island.Static>
  }

  export type AsSet = Set<Island.Static>
}