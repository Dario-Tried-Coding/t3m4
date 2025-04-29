import { COLOR_SCHEMES } from "./color-schemes"

export type MODES = COLOR_SCHEMES & {
  system: 'system'
}
export type MODE = MODES[keyof MODES]
