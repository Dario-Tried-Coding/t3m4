import { Schema, Schema_Polished,  } from "../schema";
import { Island, Island_Branded, Island_Static } from "./island";

export type State<Sc extends Schema> = {
  [I in keyof Schema_Polished<Sc>]: Island<Schema_Polished<Sc>[I]>;
}
export type State_Static = {
  [island: string]: Island_Static
}
export type State_Branded<Sc extends Schema> = {
  [I in keyof Schema_Polished<Sc>]: Island_Branded<Schema_Polished<Sc>[I]>
}