export type SystemValues = Partial<{ light: string; dark: string; system: string; custom: string[] }>

export type MonoOption = string
export type MultiOption = string[]
export type LightDarkOption = Omit<SystemValues, 'system'>
export type SystemOption = SystemValues
export type Options = MonoOption | MultiOption | LightDarkOption | SystemOption

export type ImplicitProp = string
export type ExplicitProp = { prop: string; options: Options }
export type Prop = ImplicitProp | ExplicitProp

export type Props = Prop[]