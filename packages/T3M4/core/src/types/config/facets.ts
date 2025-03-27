import { LinientAutoComplete } from "@t3m4/utils";
import { DEFAULT } from "../constants";

export type System_Values = Partial<{ light: string; dark: string; system: string; custom: string[] }>

export type Implicit_Opt = boolean
export type Mono_Opt = LinientAutoComplete<DEFAULT>
export type Multi_Opt = string[]
export type Light_Dark_Opt = Omit<System_Values, 'system'>
export type System_Opt = System_Values

export type Facets = {
  [island: string]: {
    [facet: string]: Implicit_Opt | Mono_Opt | Multi_Opt | Light_Dark_Opt | System_Opt
  }
}