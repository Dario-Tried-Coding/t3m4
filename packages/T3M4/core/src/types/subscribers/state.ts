import { DEFAULT } from '../constants/miscellaneous'
import { MODES } from '../constants/modes'
import { Config } from './config'
import { Generic_Strat } from './config/generic'
import { Mode_Light_Dark_Strat_Obj, Mode_Mono_Strat_Obj, Mode_Strat, Mode_System_Strat_Obj } from './config/mode'
import { Implicit_Opt, Light_Dark_Opt, Mono_Opt, Multi_Opt, Schema, System_Opt } from './schema'

export namespace State {
  export namespace Facet {
    export type Dynamic<Sc extends Schema, C extends Config.All.Dynamic<Sc>, I extends keyof Sc, F extends keyof Sc[I]> = I extends keyof C
      ? F extends keyof C[I]
        ? C[I][F] extends Generic_Strat
          ? Sc[I][F] extends Implicit_Opt
            ? DEFAULT
            : Sc[I][F] extends Mono_Opt
              ? Sc[I][F]
              : Sc[I][F] extends Multi_Opt
                ? Sc[I][F][number]
                : never
          : C[I][F] extends Mode_Strat
            ? Sc[I][F] extends Implicit_Opt
              ? C[I][F] extends Mode_Mono_Strat_Obj
                ? DEFAULT
                : C[I][F] extends Mode_Light_Dark_Strat_Obj
                  ? MODES['LIGHT'] | MODES['DARK']
                  : C[I][F] extends Mode_System_Strat_Obj
                    ? MODES['LIGHT'] | MODES['DARK'] | MODES['SYSTEM']
                    : never
              : Sc[I][F] extends Mono_Opt
                ? Sc[I][F]
                : Sc[I][F] extends Multi_Opt
                  ? Sc[I][F][number]
                  : Sc[I][F] extends Light_Dark_Opt
                    ? (Sc[I][F]['light'] extends string ? Sc[I][F]['light'] : MODES['LIGHT']) | (Sc[I][F]['dark'] extends string ? Sc[I][F]['dark'] : MODES['DARK']) | (Sc[I][F]['custom'] extends string[] ? Sc[I][F]['custom'][number] : never)
                    : Sc[I][F] extends System_Opt
                      ?
                          | (Sc[I][F]['light'] extends string ? Sc[I][F]['light'] : MODES['LIGHT'])
                          | (Sc[I][F]['dark'] extends string ? Sc[I][F]['dark'] : MODES['DARK'])
                          | (Sc[I][F]['system'] extends string ? Sc[I][F]['system'] : MODES['SYSTEM'])
                          | (Sc[I][F]['custom'] extends string[] ? Sc[I][F]['custom'][number] : never)
                      : never
            : never
        : 'F does not extends keyof C[I]'
      : 'I does not extend keyof C'

    export type Static = string
  }

  export namespace Island {
    export namespace AsObj {
      export type Dynamic<Sc extends Schema, C extends Config.All.Dynamic<Sc>, I extends keyof Sc> = I extends keyof C ? { [F in keyof Sc[I] as Sc[I][F] extends false ? never : F]: State.Facet.Dynamic<Sc, C, I, F> } : 'I does not extends keyof C'

      export type Static = {
        [facet: string]: State.Facet.Static
      }
    }

    export namespace AsMap {
      export type Common = Map<string, State.Facet.Static>
    }
  }

  export namespace All {
    export namespace AsObj {
      export type Dynamic<Sc extends Schema, C extends Config.All.Dynamic<Sc>> = {
        [I in keyof C]: I extends keyof Sc ? State.Island.AsObj.Dynamic<Sc, C, I> : 'I does not extends keyof Sc'
      }

      export type Static = {
        [island: string]: State.Island.AsObj.Static
      }
    }

    export namespace AsMap {
      export type Common = Map<string, State.Island.AsMap.Common>

      export type Dirty = Common & { readonly __stage: 'dirty' }
      export type Sanitized = Common & { readonly __stage: 'sanitized' }
      export type Normalized = Common & { readonly __stage: 'normalized' }
      export type Partial = Common & { readonly __stage: 'partial' }
    }
  }
}
