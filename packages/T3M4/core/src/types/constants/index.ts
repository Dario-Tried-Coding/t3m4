import { COLOR_SCHEMES } from "./color-schemes"
import { FACETS } from "./facets"
import { DEFAULT, LIBRARY_NAME } from "./miscellaneous"
import { MODES } from "./modes"
import { SELECTORS } from "./selectors"
import { STORE_STRATS, STRATS } from "./strats"

export type CONSTANTS = {
  libraryName: LIBRARY_NAME
  default: DEFAULT
  facets: FACETS
  modes: MODES
  selectors: SELECTORS
  strats: STRATS
  colorSchemes: COLOR_SCHEMES
  storeStrats: STORE_STRATS
}