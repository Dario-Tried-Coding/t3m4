import * as Options from '../../../options'
import * as Schema from '../../../schema'

import * as Facet from '../'

import { MODES } from '../../../../constants/modes'

export type Static = Facet.Object.Static
export type Dynamic<Sc extends Schema.Island.Mode.Facet.Primitive> = Sc extends Schema.Island.Facets.Facet.Primitive
  ? Facet.Object.Dynamic<Sc>
  : Sc extends Options.System.Primitive
    ? [
        Sc['light'] extends Options.Mono.Primitive ? Sc['light'] : MODES['light'],
        Sc['dark'] extends Options.Mono.Primitive ? Sc['dark'] : MODES['dark'],
        ...(Sc['system'] extends Options.Mono.Primitive ? [Sc['system']] : []),
        ...(Sc['custom'] extends Options.Multi.Primitive ? Sc['custom'] : []),
      ]
    : never
