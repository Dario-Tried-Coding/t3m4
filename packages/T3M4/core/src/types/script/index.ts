import { PRESET, Preset } from '../../preset'
import { CONSTANTS } from '../constants'
import { Config } from '../subscribers/config'
import { Schema } from '../subscribers/schema'

export type Script_Props = {
  schema: Schema
  config: Config.Static
} & Partial<Omit<Preset, 'modes'>> & { modes?: Partial<Preset['modes']> }

export type Script_Args = Script_Props & {
  preset: PRESET
  constants: CONSTANTS
}
