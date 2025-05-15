import * as Config from '../../config'

import { Color_Scheme } from '../../../constants/color-schemes'

export type { Static } from './map'
export type Dynamic<C extends Config.Island.Static['mode']> = C extends Config.Island.Mode.Facet.Mono.Static
  ? C['colorScheme']
  : C extends Config.Island.Mode.Facet.Multi.Static
    ? C['colorSchemes'][keyof C['colorSchemes']]
    : C extends Config.Island.Mode.Facet.System.Static
      ? Color_Scheme
      : undefined
