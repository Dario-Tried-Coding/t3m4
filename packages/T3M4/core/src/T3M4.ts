import { Engine } from './engine.js'
import { EventManager } from './event-manager.js'
import { Main } from './main.js'
import { Args } from './types/args.js'
import { Brand } from './types/brand.js'
import { CallbackID, EventMap } from './types/events.js'
import { Color_Schemes } from './types/subscribers/color-schemes.js'
import { State } from './types/subscribers/state.js'
import type { T3M4 as T_T3M4 } from './types/T3M4.js'

export class T3M4 implements T_T3M4 {
  public get = {
    state: {
      base: () => {
        const state = Main.get.state.base()
        if (!state) return undefined
        return Engine.utils.convert.deep.state.mapToObj(state)
      },
      forced: () => {
        const state = Main.get.state.forced()
        if (!state) return undefined
        return Engine.utils.convert.deep.state.mapToObj(state)
      },
      computed: () => {
        const state = Main.get.state.computed()
        if (!state) return undefined
        return Engine.utils.convert.deep.state.mapToObj(state)
      },
    },
    colorSchemes: {
      base: () => {
        const colorSchemes = Main.get.colorSchemes.base()
        if (!colorSchemes) return undefined
        return Engine.utils.convert.shallow.mapToObj.string(colorSchemes) as Color_Schemes.Static
      },
      forced: () => {
        const colorSchemes = Main.get.colorSchemes.forced()
        if (!colorSchemes) return undefined
        return Engine.utils.convert.shallow.mapToObj.string(colorSchemes) as Color_Schemes.Static
      },
      computed: () => {
        const colorSchemes = Main.get.colorSchemes.computed()
        if (!colorSchemes) return undefined
        return Engine.utils.convert.shallow.mapToObj.string(colorSchemes) as Color_Schemes.Static
      },
    },
    values: () => Engine.utils.convert.deep.values.mapToObj(Engine.getInstance().values),
  }

  public set = {
    state: (state: State.Static) => {
      const stateMap = Engine.utils.convert.deep.state.objToMap(state as Brand<State.Static, { coverage: 'complete'; validation: 'normalized' }>)
      Main.set.state.base(stateMap, { isUserMutation: true })
    },
  }

  public subscribe<E extends keyof EventMap>(e: E, id: CallbackID, cb: (payload: EventMap[E]) => void) {
    EventManager.on(e, id, cb)
  }

  public init(args: Args.Static) {
    Engine.init(args)
    Main.init()
  }

  public reboot(newArgs: Args.Static) {
    const newEngine = Engine.reboot(newArgs)
    if (newEngine) Main.reboot()
  }
}
