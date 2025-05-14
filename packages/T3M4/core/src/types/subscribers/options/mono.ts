import { LinientAutoComplete } from '@t3m4/utils'
import { Default } from './default'
import { Brand, Brand_Map } from '../brand'

export type Primitive = string
export type Suggested = LinientAutoComplete<Default>
export type Branded<T extends Primitive, B extends Partial<Brand_Map> & Pick<Brand_Map, 'type' | 'strat'>> = Brand<T, B>