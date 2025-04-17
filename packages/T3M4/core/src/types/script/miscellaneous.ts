import { CONSTANTS } from "../../constants"
import { Implicit_Opt, Light_Dark_Opt, Mono_Opt, Multi_Opt, System_Opt } from "../subscribers/schema"

export type Strat_To_Opt = {
  [CONSTANTS.STRATS.MONO]: Implicit_Opt | Mono_Opt
  [CONSTANTS.STRATS.MULTI]: Multi_Opt
  [CONSTANTS.STRATS.LIGHT_DARK]: Implicit_Opt | Light_Dark_Opt
  [CONSTANTS.STRATS.SYSTEM]: Implicit_Opt | System_Opt
}
