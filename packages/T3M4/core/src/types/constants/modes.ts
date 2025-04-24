import { COLOR_SCHEMES } from "./color-schemes"

export type MODES = COLOR_SCHEMES & {
  SYSTEM: 'system'
}
export type MODE = MODES[keyof MODES]
