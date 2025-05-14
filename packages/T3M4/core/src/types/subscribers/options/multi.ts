import { Brand, Brand_Map } from '../brand'
import { Primitive as Mono } from './mono'

export type Primitive = Mono[]
export type Branded<T extends readonly Mono[], B extends Partial<Brand_Map> & Pick<Brand_Map, 'type' | 'strat'>> = { [I in keyof T]: Brand<T[I], B> }