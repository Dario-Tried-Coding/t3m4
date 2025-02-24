export type SystemValues = Partial<{ light: string; dark: string; system: string; custom: string[] }>

export type Options = string | string[] | SystemValues

export type ExplicitProp = { prop: string; options: Options }

export type Prop = string | ExplicitProp

export type Props = Prop[]