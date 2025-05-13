import { Script_Args } from "./types/script";

export type Brand_Map = {
  number: 'singular' | 'plural'
}

export type Brand<T, K extends keyof Brand_Map, V extends Brand_Map[K]> = T & { [P in `__${K}`]: V }

export namespace StorageKeys {
  export namespace Modes {
    export type Singular<S extends string = string> = Brand<S, 'number', 'singular'>
    export type Plural = Brand<string, 'number', 'plural'>
  }
}

type Engine = {
  storageKeys: {
    state: string
    modes: StorageKeys.Modes.Singular
  }
}

function constructEngine({storageKey, modes, preset}: Pick<Script_Args, 'preset' | 'storageKey' | 'modes'>): Engine {
  return {
    storageKeys: {
      state: storageKey ?? preset.storageKey,
      modes: (modes?.storageKey ?? preset.modes.storageKey) as StorageKeys.Modes.Singular
    }
  }
}

export const script = (args: Script_Args) => {
  const { schema, config, constants, preset,  } = args
  

}