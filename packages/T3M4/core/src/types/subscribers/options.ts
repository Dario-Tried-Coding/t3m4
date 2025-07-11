import { LinientAutoComplete } from '@t3m4/utils'
import { DEFAULT, MODES } from '../constants'

export namespace Options {
  export type Mono = string
  export namespace Mono {
    export type Suggested = LinientAutoComplete<DEFAULT>
  }
  
  export type Multi = Mono[]
  
  export type System = {
    light: Mono
    dark: Mono
    system?: Mono
    custom?: Multi
  }
  export namespace System {
    export type Suggested = {
      light: LinientAutoComplete<MODES['light']>
      dark: LinientAutoComplete<MODES['dark']>
      system?: LinientAutoComplete<MODES['system']>
      custom?: Multi
    }
  }
}