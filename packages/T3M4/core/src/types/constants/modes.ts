import { COLOR_SCHEMES } from "./color-schemes"

export type MODES = COLOR_SCHEMES & {
  system: 'system'
  custom: 'custom'
}
export type Mode = MODES[keyof MODES]