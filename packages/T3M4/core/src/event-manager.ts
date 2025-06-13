import { CallbackID, EventMap } from './types/events'

export class EventManager {
  private static events: Map<string, Map<string, (...args: any[]) => void>> = new Map()

  public static on<K extends keyof EventMap>(event: K, id: CallbackID, callback: (payload: EventMap[K]) => void): void {
    if (!EventManager.events.has(event)) EventManager.events.set(event, new Map())

    const eventCallbacks = EventManager.events.get(event)!
    eventCallbacks.set(id, callback)
  }

  public static emit<K extends keyof EventMap>(event: K, ...args: EventMap[K] extends void ? [] : [payload: EventMap[K]]): void {
    EventManager.events.get(event)?.forEach((callback) => {
      const payload = args[0]
      if (payload) callback(payload)
      else callback()
    })
  }

  public static off<K extends keyof EventMap>(event: K, id: CallbackID): void {
    const eventCallbacks = EventManager.events.get(event)
    if (eventCallbacks) {
      eventCallbacks.delete(id)
      if (eventCallbacks.size === 0) EventManager.events.delete(event)
    }
  }

  public static dispose() {
    EventManager.events.clear()
  }
}
