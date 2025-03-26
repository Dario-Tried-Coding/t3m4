export type SystemValues = Partial<{ light: string; dark: string; system: string; custom: string[] }>

export type MonoOpt = string
export type MultiOpt = string[]
export type LightDarkOpt = Omit<SystemValues, 'system'>
export type SystemOpt = SystemValues

export type Generic_Opt = MonoOpt | MultiOpt
export type Mode_Opt = Generic_Opt | LightDarkOpt | SystemOpt

export type Props = {
  [island: string]: Partial<{
    props: { prop: string; options?: Generic_Opt }[]
    mode: boolean | Partial<{ prop: string; options: Mode_Opt }>
  }>
}