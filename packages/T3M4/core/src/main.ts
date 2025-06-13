import { EventManager } from './event-manager'
import { AtLeast } from './types/brand'
import { State } from './types/subscribers/state'
import { StorageManager } from './storage-manager'
import { DomManager } from './dom-manager'
import { Color_Schemes } from './types/subscribers/color-schemes'
import { Engine } from './engine'

export class Main {
  private static instance: Main

  public static init() {
    if (Main.instance) return console.warn('[T3M4]: Main - Already initialized, skipping initialization.')
    Main.instance = new Main()
  }

  public static reboot() {
    Main.instance = new Main()
  }

  public static get = {
    state: {
      base: () => Main.instance.state.base,
      forced: () => Main.instance.state.forced,
      computed: () => {
        const base = Main.get.state.base()
        if (!base) return undefined

        const forced = Main.get.state.forced()
        const computed = Engine.utils.merge.deep.state.maps.all(base, forced)

        return computed
      },
    },
    colorSchemes: {
      base() {
        const state = Main.get.state.base()
        if (!state) return undefined

        const colorSchemes = Engine.utils.construct.colorSchemes(state)
        return colorSchemes
      },
      forced() {
        const state = Main.get.state.forced()
        if (!state) return undefined

        const colorSchemes = Engine.utils.construct.colorSchemes(state)
        return colorSchemes
      },
      computed() {
        const base = Main.get.colorSchemes.base()
        if (!base) return undefined

        const forced = Main.get.colorSchemes.forced()
        const computed = Engine.utils.merge.shallow.maps(base, forced)

        return computed
      },
    },
    modes: {
      base() {
        const state = Main.get.state.base()
        if (!state) return undefined

        const modes = Engine.utils.construct.modes(state)
        return modes
      },
      forced() {
        const state = Main.get.state.forced()
        if (!state) return undefined

        const modes = Engine.utils.construct.modes(state)
        return modes
      },
      computed() {
        const base = Main.get.modes.base()
        if (!base) return undefined

        const forced = Main.get.modes.forced()
        const computed = Engine.utils.merge.shallow.maps(base, forced)

        return computed
      },
    },
  }

  public static set = {
    state: {
      base: (state: AtLeast<State.Static.AsMap, { coverage: 'partial'; validation: 'sanitized' }>) => {
        const currState = Main.get.state.base()
        if (!currState) return console.warn('[T3M4]: Library not initialized')

        const mergedState = Engine.utils.merge.deep.state.maps.all(currState, state)
        Main.smartUpdateNotify.state.base(mergedState)
      },
      forced: (state: AtLeast<State.Static.AsMap, { coverage: 'partial'; validation: 'sanitized' }>) => {
        Main.smartUpdateNotify.state.forced(state)
      },
    },
  }

  private static smartUpdateNotify = {
    state: {
      base(newState: AtLeast<State.Static.AsMap, { coverage: 'complete'; validation: 'normalized' }>) {
        const currState = Main.get.state.base()
        if (!currState) return console.warn('[T3M4] Library not initialized.')

        const isEqual = Engine.utils.equal.deep.state(currState, newState)
        if (isEqual) return

        Main.instance.state.base = newState
        Main.notifyUpdate.state.base(newState)

        const computedState = Main.get.state.computed()!
        Main.notifyUpdate.state.computed(computedState)
      },
      forced(newState: AtLeast<State.Static.AsMap, { coverage: 'partial'; validation: 'sanitized' }>) {
        const currState = Main.get.state.forced()
        if (!currState) return console.warn('[T3M4] Library not initialized.')

        const isEqual = Engine.utils.equal.deep.state(currState, newState)
        if (isEqual) return

        Main.instance.state.forced = newState
        Main.notifyUpdate.state.forced(newState)

        const computedState = Main.get.state.computed()!
        Main.notifyUpdate.state.computed(computedState)
      },
    },
  }

  private static notifyUpdate = {
    state: {
      base: (state: AtLeast<State.Static.AsMap, { coverage: 'complete'; validation: 'normalized' }>) => {
        const colorSchemes = Engine.utils.construct.colorSchemes(state)
        EventManager.emit('State:Base:Update', Engine.utils.convert.deep.state.mapToObj(state))
        EventManager.emit('ColorSchemes:Base:Update', Engine.utils.convert.shallow.mapToObj.string(colorSchemes) as Color_Schemes.Static)
      },
      forced: (state: AtLeast<State.Static.AsMap, { coverage: 'partial'; validation: 'sanitized' }>) => {
        const colorSchemes = Engine.utils.construct.colorSchemes(state)
        EventManager.emit('State:Forced:Update', Engine.utils.convert.deep.state.mapToObj(state))
        EventManager.emit('ColorSchemes:Forced:Update', Engine.utils.convert.shallow.mapToObj.string(colorSchemes) as Color_Schemes.Static)
      },
      computed: (state: AtLeast<State.Static.AsMap, { coverage: 'complete'; validation: 'normalized' }>) => {
        const colorSchemes = Engine.utils.construct.colorSchemes(state)
        EventManager.emit('State:Computed:Update', Engine.utils.convert.deep.state.mapToObj(state))
        EventManager.emit('ColorSchemes:Computed:Update', Engine.utils.convert.shallow.mapToObj.string(colorSchemes) as Color_Schemes.Static)
      },
    },
  }

  private state: {
    base: AtLeast<State.Static.AsMap, { coverage: 'complete'; validation: 'normalized' }> | undefined
    forced: AtLeast<State.Static.AsMap, { coverage: 'partial'; validation: 'sanitized' }> | undefined
  } = {
    base: undefined,
    forced: undefined,
  }

  private constructor() {
    StorageManager.init()
    DomManager.init()

    const storageState = StorageManager.get.state.normalized()

    const baseState = storageState
    this.state.base = baseState
    Main.notifyUpdate.state.base(baseState)

    const forcedState = DomManager.get.state.forced.all.sanitized()
    this.state.forced = forcedState
    Main.notifyUpdate.state.forced(forcedState)

    const computedState = Engine.utils.merge.deep.state.maps.all(baseState, forcedState)
    Main.notifyUpdate.state.computed(computedState)
  }
}
