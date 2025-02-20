import { ResolvedMode } from "./config"

export type EventMap = {
  'DOM:state:update': Map<string, string>
  'DOM:resolvedMode:update': ResolvedMode
  'Storage:update': Map<string, string>
  'State:update': Map<string, string>
}
