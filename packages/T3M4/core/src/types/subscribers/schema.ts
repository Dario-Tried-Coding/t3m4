import { Expand } from '@t3m4/utils'
import { Opts } from './opts'

// #region Schema
export type Schema = {
  [island: string]: Schema.Island
}
export namespace Schema {
  export type Facet = Opts.Primitive.Mono.Suggested | Opts.Primitive.Multi
  export namespace Facet {
    export type Mode = Facet | Opts.Primitive.System.Suggested
  }

  export namespace Island {
    export type Facets = {
      facets: {
        [facet: string]: Facet
      }
    }
    export type Mode = {
      mode: Facet.Mode
    }
  }
  export type Island = Partial<Expand<Island.Facets> & Expand<Island.Mode>>
}
