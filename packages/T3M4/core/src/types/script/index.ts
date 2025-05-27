import { PRESET, Preset } from '../../preset'
import { CONSTANTS } from '../constants'
import { Config } from '../subscribers'
import { Schema } from '../subscribers'
import { Modes } from '../subscribers/modes'

export type Script_Props = {
  schema: Schema
  config: Config.Static
  modes?: Modes.Static
} & Partial<Omit<Preset, 'modes'>>

export type Script_Args = Script_Props & {
  preset: PRESET
  constants: CONSTANTS
}
