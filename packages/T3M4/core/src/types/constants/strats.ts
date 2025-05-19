import { Expand } from "@t3m4/utils"
import { Values } from "@t3m4/utils/objects"

export type STRATS = {
  mono: 'mono'
  multi: 'multi'
  system: 'system'
}
export type Strat = Values<STRATS>

export type STORE_STRATS = {
  unique: 'unique',
  split: 'split'
}
export type Store_Strat = Values<STORE_STRATS>