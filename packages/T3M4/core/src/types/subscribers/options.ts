import { LinientAutoComplete } from '@t3m4/utils'
import { Config } from './config'
import { State } from './state'
import { DEFAULT } from '../constants/miscellaneous'

export type System_Values = Partial<{ light: string; dark: string; system: string; custom: string[] }>

export type Implicit_Opt = boolean
export type Mono_Opt = LinientAutoComplete<DEFAULT>
export type Multi_Opt = string[]
export type Light_Dark_Opt = Omit<System_Values, 'system'>
export type System_Opt = System_Values

export type Explicit_Opt = Mono_Opt | Multi_Opt | Light_Dark_Opt | System_Opt

export type Opt = Implicit_Opt | Explicit_Opt

export namespace Options {
  export type Schema = {
    [island: string]: {
      [facet: string]: Opt
    }
  }

  export type Dynamic<O extends Options.Schema, C extends Config.Dynamic<O>, S extends State.Dynamic<O, C>> = {
    [I in keyof S]: {
      [F in keyof S[I]]: S[I][F][]
    }
  }

  export type Static = {
    [island: string]: {
      [facet: string]: string[]
    }
  }
}
