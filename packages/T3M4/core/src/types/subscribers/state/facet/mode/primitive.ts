import * as Options from '../../../options';
import * as Schema from '../../../schema'

import { MODES } from '../../../../constants/modes';

import * as Facet from '../primitive'

export type Static = Facet.Static

export type Dynamic<Sc extends Schema.Island.Mode.Facet.Primitive> = Sc extends Schema.Island.Facets.Facet.Primitive
  ? Facet.Dynamic<Sc>
  : Sc extends Options.System.Primitive
    ?
        | (Sc['light'] extends Options.Mono.Primitive ? Sc['light'] : MODES['light'])
        | (Sc['dark'] extends Options.Mono.Primitive ? Sc['dark'] : MODES['dark'])
        | (Sc['system'] extends Options.Mono.Primitive ? Sc['system'] : never)
        | (Sc['custom'] extends Options.Multi.Primitive ? Sc['custom'][number] : never)
  : never
    
export * as Facet from '../primitive'