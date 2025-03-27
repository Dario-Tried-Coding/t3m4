export type System_Values = Partial<{ light: string; dark: string; system: string; custom: string[] }>

export type Mono_Opt = string
export type Multi_Opt = string[]
export type Light_Dark_Opt = Omit<System_Values, 'system'>
export type System_Opt = System_Values

export type Generic_Opt = Mono_Opt | Multi_Opt
export type Mode_Opt = Generic_Opt | Light_Dark_Opt | System_Opt

export type Implicit_Generic_Prop = string
export type Explicit_Generic_Prop = { prop: string; options?: Generic_Opt }
export type Generic_Prop = Implicit_Generic_Prop | Explicit_Generic_Prop

export type Implicit_Mode_Prop = boolean
export type Explicit_Mode_Prop = Partial<{ prop: string; options: Mode_Opt }>
export type Mode_Prop = Implicit_Mode_Prop | Explicit_Mode_Prop

export type Props = {
  [island: string]: Partial<{
    props: Generic_Prop[]
    mode: Mode_Prop
  }>
}