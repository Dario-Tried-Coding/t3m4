import { T3M4 } from "./interface"

declare global {
  interface Window {
    T3M4: T3M4
  }
  interface HTMLElement {
    priorityValue?: number
  }
}

export {}
