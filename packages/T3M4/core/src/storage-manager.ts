import { Engine } from './engine'
import { EventManager } from './event-manager'
import { Main } from './main'
import { AtLeast, Brand, Brand_Info } from './types/brand'
import { State } from './types/subscribers/state'

export class StorageManager {
  private static instance: StorageManager | undefined
  private static abortController: AbortController | undefined
  private static isInternalChange = false

  public static init() {
    if (!StorageManager.instance) StorageManager.instance = new StorageManager()
  }

  public static get = {
    state: {
      serialized: () => {
        const retrieved = window.localStorage.getItem(Engine.getInstance().storage.key)
        return retrieved ?? undefined
      },
      deserialized: () => {
        const serialized = StorageManager.get.state.serialized()
        if (!serialized) return

        return Engine.utils.deserialize.state(serialized)
      },
      sanitized: () => {
        const deserialized = StorageManager.get.state.deserialized()
        if (!deserialized) return undefined

        const sanitized = Engine.utils.sanitize.state.all(deserialized)
        return sanitized as Brand<State.Static.AsMap, Omit<Brand_Info<typeof deserialized>, 'toStore'> & { toStore: 'yes' }>
      },
      normalized: () => {
        const sanitized = StorageManager.get.state.sanitized()

        const normalized = Engine.utils.normalize.state.state(sanitized ?? Engine.getInstance().fallbacks)
        return normalized
      },
    },
  }

  public static set = {
    state: {
      facet(island: string, facet: string, value: Brand<string, { validation: 'sanitized' }>) {
        if (!Engine.getInstance().storage.store) return

        const currState = Main.get.state.base()!
        const newStatePartial = Engine.utils.construct.state.fromFacet(island, facet, value)

        const newState = Engine.utils.merge.deep.state.maps.all(currState, newStatePartial)
        const newStateToStore = StorageManager.constructStateToStore(newState)
        const newStateObjToStore = Engine.utils.convert.deep.state.mapToObj(newStateToStore)
        const newSerState = JSON.stringify(newStateObjToStore) as Brand<string, Brand_Info<typeof newStateObjToStore>>

        const currSerState = StorageManager.get.state.serialized()

        const needsUpdate = currSerState !== newSerState
        if (needsUpdate) StorageManager.updateStorageState(newSerState)
      },
      island(island: string, values: Brand<State.Static.AsMap.Island, { validation: 'normalized'; coverage: 'complete' }>) {
        if (!Engine.getInstance().storage.store) return

        const currState = Main.get.state.base()!
        const newStatePartial = Engine.utils.construct.state.fromIslandValues(island, values)

        const newState = Engine.utils.merge.deep.state.maps.all(currState, newStatePartial)
        const newStateToStore = StorageManager.constructStateToStore(newState)
        const newStateObjToStore = Engine.utils.convert.deep.state.mapToObj(newStateToStore)
        const newSerState = JSON.stringify(newStateObjToStore) as Brand<string, Brand_Info<typeof newStateObjToStore>>

        const currSerState = StorageManager.get.state.serialized()

        const needsUpdate = currSerState !== newSerState
        if (needsUpdate) StorageManager.updateStorageState(newSerState)
      },
      all(state: Brand<State.Static.AsMap, { validation: 'normalized'; coverage: 'complete' }>) {
        if (!Engine.getInstance().storage.store) return

        const stateToStore = StorageManager.constructStateToStore(state)
        const stateObjToStore = Engine.utils.convert.deep.state.mapToObj(stateToStore)
        const newSerState = JSON.stringify(stateObjToStore) as Brand<string, Brand_Info<typeof stateObjToStore>>

        const currSerState = StorageManager.get.state.serialized()

        const needsUpdate = currSerState !== newSerState
        if (needsUpdate) StorageManager.updateStorageState(newSerState)
      },
    },
  }

  private static updateStorageState(serState: Brand<string, { validation: 'sanitized'; toStore: 'yes' }>) {
    if (StorageManager.isInternalChange) return

    StorageManager.isInternalChange = true
    window.localStorage.setItem(Engine.getInstance().storage.key, serState)
    StorageManager.isInternalChange = false
  }

  private static constructStateToStore(state: AtLeast<State.Static.AsMap, { validation: 'normalized'; coverage: 'complete' }>) {
    const stateToStore = Array.from(state).reduce((acc, [i, { mode, facets }]) => {
      if (!Engine.getInstance().storage.toStore.has(i)) return acc

      const islandState: State.Static.AsMap.Island = {}

      if (mode) {
        const mustStore = Engine.getInstance().storage.toStore.get(i)?.mode ?? false
        if (mustStore) islandState.mode = mode
      }
      if (facets) {
        islandState.facets = Array.from(facets).reduce(
          (facetsAcc, [facet, value]) => {
            const mustStore = Engine.getInstance().storage.toStore.get(i)?.facets?.has(facet) ?? false
            if (mustStore) return facetsAcc.set(facet, value)

            return facetsAcc
          },
          new Map() as State.Static.AsMap.Island.Facets['facets']
        )
      }

      return acc.set(i, islandState)
    }, new Map() as State.Static.AsMap)

    return stateToStore as Brand<State.Static.AsMap, { validation: 'sanitized'; toStore: 'yes' }>
  }

  private static terminate() {
    StorageManager.abortController?.abort()

    if (Engine.getInstance().storage.store) localStorage.removeItem(Engine.getInstance().storage.key)

    StorageManager.instance = undefined
  }

  private constructor() {
    EventManager.on('Reset', 'StorageManager:Reset', () => StorageManager.terminate())
    EventManager.on('State:Base:Update', 'StorageManager:State:Update', (state) => StorageManager.set.state.all(Engine.utils.convert.deep.state.objToMap(state as Brand<State.Static, { validation: 'normalized'; coverage: 'complete' }>)))

    StorageManager.abortController = new AbortController()
    if (Engine.getInstance().observe.has('storage'))
      window.addEventListener(
        'storage',
        ({ key, oldValue, newValue }) => {
          if (key === Engine.getInstance().storage.key) {
            if (!Engine.getInstance().storage.store) return

            const deserNew = newValue ? Engine.utils.deserialize.state(newValue) : undefined
            const deserOld = oldValue ? Engine.utils.deserialize.state(oldValue) : undefined

            const normalized = Engine.utils.normalize.state.state(deserNew ?? deserOld, deserOld)
            StorageManager.set.state.all(normalized)
            Main.set.state.base(normalized)
          }
        },
        {
          signal: StorageManager.abortController.signal,
        }
      )
  }
}
