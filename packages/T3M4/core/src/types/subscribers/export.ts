import * as Sub from "."

export type Schema = Sub.Schema.Primitive
export namespace Schema {
  export type Island = Sub.Schema.Island.Primitive
}

export type Config<Sc extends Schema> = Sub.Config.Dynamic<Sc>

export type State<Sc extends Schema> = Sub.State.Primitive.Dynamic<Sc>
export namespace State {
  export type Island<Sc extends Sub.Schema.Island.Primitive> = Sub.State.Primitive.Island.Dynamic<Sc>
}

export type Values<Sc extends Schema> = Sub.Values.Object.Dynamic<Sc>
export namespace Values {
  export type Island<Sc extends Sub.Schema.Island.Primitive> = Sub.Values.Object.Island.Dynamic<Sc>
}

export type Islands<Sc extends Schema> = Sub.Islands.Array.Dynamic<Sc>

export type ColorSchemes<C extends Sub.Config.Static> = Sub.Color_Schemes.Object.Dynamic<C>
export namespace ColorSchemes {
  export type Island<C extends Sub.Config.Island.Static> = Sub.Color_Schemes.Object.Island.Dynamic<C>
}