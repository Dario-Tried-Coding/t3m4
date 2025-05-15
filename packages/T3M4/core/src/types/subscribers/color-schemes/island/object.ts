import * as Config from '../../config'

import { Color_Scheme } from '../../../constants/color-schemes'

export type { Static } from './map'
export type Dynamic<C extends Config.Island.Static> = C extends Config.Island.Mode.Static
  ? C['mode'] extends Config.Island.Mode.Facet.Mono.Static
    ? C['mode']['colorScheme']
    : C['mode'] extends Config.Island.Mode.Facet.Multi.Static
      ? C['mode']['colorSchemes'][keyof C['mode']['colorSchemes']]
      : C['mode'] extends Config.Island.Mode.Facet.System.Static
        ? Color_Scheme
        : undefined
  : undefined
