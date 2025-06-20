"use strict";
(() => {
  // src/constants.ts
  var STRATS = {
    mono: "mono",
    multi: "multi",
    system: "system"
  };
  var COLOR_SCHEMES = {
    light: "light",
    dark: "dark"
  };
  var MODES = {
    light: "light",
    dark: "dark",
    system: "system",
    custom: "custom"
  };

  // src/event-manager.ts
  var EventManager = class _EventManager {
    static events = /* @__PURE__ */ new Map();
    static on(event, id, callback) {
      if (!_EventManager.events.has(event)) _EventManager.events.set(event, /* @__PURE__ */ new Map());
      const eventCallbacks = _EventManager.events.get(event);
      eventCallbacks.set(id, callback);
    }
    static emit(event, ...args) {
      _EventManager.events.get(event)?.forEach((callback) => {
        const payload = args[0];
        if (payload) callback(payload);
        else callback();
      });
    }
    static off(event, id) {
      const eventCallbacks = _EventManager.events.get(event);
      if (eventCallbacks) {
        eventCallbacks.delete(id);
        if (eventCallbacks.size === 0) _EventManager.events.delete(event);
      }
    }
    static dispose() {
      _EventManager.events.clear();
    }
  };

  // src/preset.ts
  var PRESET = {
    storage: {
      key: "T3M4",
      store: {
        values: false,
        value: true
      }
    },
    modes: {
      dom: {
        selectors: [],
        island: {
          selectors: []
        }
      }
    },
    forced_values: false,
    observe: [],
    disable_transitions_on_change: false,
    nonce: ""
  };

  // src/engine.ts
  var Engine = class _Engine {
    static instance;
    static args;
    islands;
    facets;
    values;
    fallbacks;
    nonce;
    disableTransitionOnChange;
    selectors;
    storage;
    observe;
    forcedValues;
    modes;
    static init(args) {
      _Engine.args = args;
      _Engine.instance = new _Engine();
      return _Engine.instance;
    }
    static reboot(args) {
      if (!_Engine.instance || !_Engine.args) return console.warn("[T3M4] Engine not initialized. Cannot reboot. Please call Engine.init() first.");
      if (_Engine.utils.equal.deep.generic.objects(_Engine.args, args)) return;
      EventManager.emit("Reset");
      _Engine.args = args;
      _Engine.instance = new _Engine();
      EventManager.emit("Reset:Success");
      return _Engine.instance;
    }
    static getInstance() {
      if (!_Engine.instance) throw new Error("[T3M4] Engine not initialized. Please call Engine.init() first.");
      return _Engine.instance;
    }
    static utils = {
      resolve: {
        colorScheme(island, mode) {
          const modeConfig = _Engine.instance.modes.get(island);
          if (!modeConfig) return;
          const isSystemStrat = modeConfig.strategy === STRATS.system;
          const isSystem = isSystemStrat && modeConfig.system?.mode === mode;
          if (isSystem) return _Engine.utils.miscellaneous.getSystemPref() ?? modeConfig.colorSchemes.get(modeConfig.system.fallback);
          return modeConfig.colorSchemes.get(mode);
        },
        colorSchemes(state) {
          const modes = Array.from(state).reduce((acc, [i, { mode }]) => {
            if (!mode) return acc;
            return acc.set(i, mode);
          }, /* @__PURE__ */ new Map());
          const colorSchemes = Array.from(modes).reduce((acc, [i, mode]) => {
            const resolvedScheme = _Engine.utils.resolve.colorScheme(i, mode);
            if (!resolvedScheme) return acc;
            return acc.set(i, resolvedScheme);
          }, /* @__PURE__ */ new Map());
          return colorSchemes;
        }
      },
      miscellaneous: {
        getSystemPref() {
          const supportsPref = window.matchMedia("(prefers-color-scheme)").media !== "not all";
          const systemPref = supportsPref ? window.matchMedia("(prefers-color-scheme: dark)").matches ? MODES.dark : MODES.light : void 0;
          return systemPref;
        },
        safeParse(json) {
          if (!json?.trim()) return null;
          try {
            return JSON.parse(json);
          } catch {
            return null;
          }
        }
      },
      equal: {
        deep: {
          state(state1, state2) {
            if (!state1 || !state2) return false;
            if (state1.size !== state2.size) return false;
            for (const [key, value1] of state1) {
              const value2 = state2.get(key);
              if (!value2) return false;
              if (value1.mode !== value2.mode) return false;
              const facets1 = value1.facets;
              const facets2 = value2.facets;
              if (facets1 && !facets2 || !facets1 && facets2) return false;
              if (facets1 && facets2) {
                if (facets1.size !== facets2.size) return false;
                for (const [facetKey, facetVal1] of facets1) {
                  if (facets2.get(facetKey) !== facetVal1) return false;
                }
              }
            }
            return true;
          },
          generic: {
            objects(obj1, obj2) {
              if (obj1 === obj2) return true;
              if (obj1 instanceof Map && obj2 instanceof Map) return this.maps(obj1, obj2);
              if (typeof obj1 !== "object" || typeof obj2 !== "object" || obj1 === null || obj2 === null) return false;
              const keys1 = Object.keys(obj1);
              const keys2 = Object.keys(obj2);
              if (keys1.length !== keys2.length) return false;
              for (const key of keys1) {
                if (!keys2.includes(key) || !this.objects(obj1[key], obj2[key])) return false;
              }
              return true;
            },
            maps(map1, map2) {
              if (!map1 || !map2) return false;
              if (map1 === map2) return true;
              if (map1.size !== map2.size) return false;
              for (const [key, value] of map1) {
                if (!map2.has(key) || !this.objects(value, map2.get(key))) return false;
              }
              return true;
            }
          }
        },
        shallow: {
          map: {
            string(map1, map2) {
              if (!map1 || !map2) return false;
              if (map1.size !== map2.size) return false;
              for (const [key, value] of map1) {
                if (map2.get(key) !== value) return false;
              }
              return true;
            }
          }
        }
      },
      merge: {
        shallow: {
          maps(...sources) {
            const result = /* @__PURE__ */ new Map();
            for (const source of sources) {
              if (!source) continue;
              for (const [key, value] of source) {
                result.set(key, value);
              }
            }
            return result;
          }
        },
        deep: {
          state: {
            maps: {
              island(...sources) {
                let mergedMode = void 0;
                const mergedFacets = /* @__PURE__ */ new Map();
                for (const source of sources) {
                  if (!source) continue;
                  if (source.mode) mergedMode = source.mode;
                  if (source.facets) {
                    for (const [facet, value] of source.facets) {
                      mergedFacets.set(facet, value);
                    }
                  }
                }
                return {
                  ...mergedMode ? { mode: mergedMode } : {},
                  ...mergedFacets.size > 0 ? { facets: mergedFacets } : {}
                };
              },
              all(...sources) {
                const islandStates = sources.reduce(
                  (islandStates2, source) => {
                    for (const [i, values] of source ?? []) {
                      if (!islandStates2?.has(i)) islandStates2?.set(i, /* @__PURE__ */ new Set());
                      islandStates2?.get(i)?.add(values);
                    }
                    return islandStates2;
                  },
                  /* @__PURE__ */ new Map()
                );
                const mergedState = Array.from(islandStates).reduce((mergedState2, [i, islandStates2]) => {
                  const mergedIslandState = this.island(...Array.from(islandStates2));
                  return mergedState2.set(i, mergedIslandState);
                }, /* @__PURE__ */ new Map());
                return mergedState;
              }
            }
          }
        }
      },
      convert: {
        shallow: {
          mapToObj: {
            string(map) {
              return Object.fromEntries(map);
            },
            set(map) {
              const result = {};
              for (const [key, value] of map) {
                result[key] = Array.from(value);
              }
              return result;
            }
          },
          objToMap: {
            string(obj) {
              return new Map(Object.entries(obj));
            }
          }
        },
        deep: {
          state: {
            mapToObj(state) {
              const result = {};
              for (const [key, { facets, mode }] of state) {
                const obj = {};
                if (mode) obj.mode = mode;
                if (facets) obj.facets = Object.fromEntries(facets);
                result[key] = obj;
              }
              return result;
            },
            objToMap(state) {
              const result = /* @__PURE__ */ new Map();
              for (const [key, { facets, mode }] of Object.entries(state)) {
                const obj = {};
                if (mode) obj.mode = mode;
                if (facets) {
                  const map = /* @__PURE__ */ new Map();
                  for (const [facet, value] of Object.entries(facets)) {
                    map.set(facet, value);
                  }
                  obj.facets = map;
                }
                result.set(key, obj);
              }
              return result;
            }
          },
          values: {
            mapToObj(map) {
              const result = {};
              for (const [key, { facets, mode }] of map) {
                const obj = {};
                if (mode) obj.mode = Array.from(mode);
                if (facets) {
                  const facetsObj = {};
                  for (const [facet, value] of facets) {
                    facetsObj[facet] = Array.from(value);
                  }
                  obj.facets = facetsObj;
                }
                result[key] = obj;
              }
              return result;
            }
          }
        }
      },
      construct: {
        colorSchemes(state) {
          return _Engine.utils.resolve.colorSchemes(state);
        },
        modes(state) {
          const modes = Array.from(state).reduce((acc, [i, { mode }]) => {
            if (!mode) return acc;
            return acc.set(i, mode);
          }, /* @__PURE__ */ new Map());
          return modes;
        },
        state: {
          fromMode(island, mode) {
            const state = /* @__PURE__ */ new Map([[island, { mode }]]);
            return state;
          },
          fromModes(modes) {
            const state = Array.from(modes).reduce((acc, [i, mode]) => {
              return acc.set(i, { mode });
            }, /* @__PURE__ */ new Map());
            return state;
          },
          fromFacet(island, facet, value) {
            return /* @__PURE__ */ new Map([[island, { facets: /* @__PURE__ */ new Map([[facet, value]]) }]]);
          },
          fromIslandValues(island, values) {
            return /* @__PURE__ */ new Map([[island, values]]);
          }
        }
      },
      deserialize: {
        state(string) {
          const parsed = _Engine.utils.miscellaneous.safeParse(string);
          if (!parsed) return void 0;
          const isPlainObject = _Engine.utils.isValid.type.plainObject(parsed);
          if (!isPlainObject) return void 0;
          const isStateObj = _Engine.utils.isValid.structure.state.obj(parsed);
          if (!isStateObj) return void 0;
          const dirtyState = _Engine.utils.convert.deep.state.objToMap(parsed);
          return dirtyState;
        }
      },
      sanitize: {
        state: {
          option: {
            facet(island, facet, value, backup) {
              const isIsland = _Engine.utils.isValid.value.island(island);
              if (!isIsland) return;
              const isFacet = _Engine.utils.isValid.value.facet(island, facet);
              if (!isFacet) return;
              const isOption = _Engine.utils.isValid.value.option.facet(island, facet, value);
              const isBackupOption = backup ? _Engine.utils.isValid.value.option.facet(island, facet, backup) : false;
              const fallback = _Engine.instance.fallbacks.get(island).facets.get(facet);
              return isOption ? value : isBackupOption ? backup : fallback;
            },
            mode(island, value, backup) {
              const isIsland = _Engine.utils.isValid.value.island(island);
              if (!isIsland) return;
              const hasMode = _Engine.instance.values.get(island).mode !== void 0;
              if (!hasMode) return;
              const isOption = _Engine.utils.isValid.value.option.mode(island, value);
              const isBackupOption = backup ? _Engine.utils.isValid.value.option.mode(island, backup) : false;
              const fallback = _Engine.instance.fallbacks.get(island).mode;
              return isOption ? value : isBackupOption ? backup : fallback;
            }
          },
          island(island, values, backup) {
            const isIsland = _Engine.utils.isValid.value.island(island);
            if (!isIsland) return;
            const obj = {};
            if (values.facets) {
              const facets = /* @__PURE__ */ new Map();
              for (const [facet, value] of values.facets) {
                const sanFacet = _Engine.utils.sanitize.state.option.facet(island, facet, value, backup?.facets?.get(facet));
                if (sanFacet) facets.set(facet, sanFacet);
              }
              if (facets.size !== 0) obj.facets = facets;
            }
            if (values.mode) {
              const mode = _Engine.utils.sanitize.state.option.mode(island, values.mode, backup?.mode);
              if (mode) obj.mode = mode;
            }
            return obj;
          },
          all(state, backup) {
            const sanState = /* @__PURE__ */ new Map();
            for (const [island, values] of state) {
              const sanIsland = _Engine.utils.sanitize.state.island(island, values, backup?.get(island));
              if (!sanIsland) continue;
              sanState.set(island, sanIsland);
            }
            return sanState;
          }
        },
        modes: {
          mode(island, value, backup) {
            const isIsland = _Engine.utils.isValid.value.island(island);
            if (!isIsland) return;
            const hasMode = !!_Engine.instance.values.get(island).mode;
            if (!hasMode) return;
            const isMode = _Engine.utils.isValid.value.option.mode(island, value);
            const isBackupMode = backup ? _Engine.utils.isValid.value.option.mode(island, backup) : false;
            const fallback = _Engine.instance.fallbacks.get(island).mode;
            return isMode ? value : isBackupMode ? backup : fallback;
          },
          all(modes, backup) {
            const sanModes = /* @__PURE__ */ new Map();
            for (const [island, value] of modes) {
              const sanMode = _Engine.utils.sanitize.modes.mode(island, value, backup?.get(island));
              if (!sanMode) continue;
              sanModes.set(island, sanMode);
            }
            return sanModes;
          }
        }
      },
      normalize: {
        state: {
          island(island, values, backup) {
            const isIsland = _Engine.utils.isValid.value.island(island);
            if (!isIsland) return;
            const normalized = {};
            for (const [facet, fallback] of _Engine.instance.fallbacks.get(island).facets ?? []) {
              if (!normalized.facets) normalized.facets = /* @__PURE__ */ new Map();
              normalized.facets.set(facet, fallback);
            }
            if (_Engine.instance.fallbacks.get(island).mode) normalized.mode = _Engine.instance.fallbacks.get(island).mode;
            if (backup) {
              const sanBackup = _Engine.utils.sanitize.state.island(island, backup);
              if (sanBackup.facets) {
                for (const [facet, value] of sanBackup.facets) {
                  normalized.facets?.set(facet, value);
                }
              }
              if (sanBackup.mode) normalized.mode = sanBackup.mode;
            }
            const sanValues = _Engine.utils.sanitize.state.island(island, values, backup);
            if (sanValues.facets) {
              for (const [facet, value] of sanValues.facets) {
                normalized.facets?.set(facet, value);
              }
            }
            if (sanValues.mode) normalized.mode = sanValues.mode;
            return normalized;
          },
          state(state, backup) {
            const normalized = /* @__PURE__ */ new Map();
            for (const [island, values] of _Engine.instance.fallbacks) {
              normalized.set(island, values);
            }
            for (const [island, values] of backup ?? []) {
              const normIsland = _Engine.utils.normalize.state.island(island, values);
              if (!normIsland) continue;
              normalized.set(island, normIsland);
            }
            for (const [island, values] of state ?? []) {
              const normIsland = _Engine.utils.normalize.state.island(island, values, backup?.get(island));
              if (!normIsland) continue;
              normalized.set(island, normIsland);
            }
            return normalized;
          }
        },
        modes: {
          mode: (island, value, backup) => {
            return _Engine.utils.sanitize.modes.mode(island, value, backup);
          },
          all: (values, backup) => {
            const normalized = /* @__PURE__ */ new Map();
            for (const [island, value] of _Engine.utils.construct.modes(_Engine.instance.fallbacks)) {
              normalized.set(island, value);
            }
            if (backup) {
              for (const [island, value] of backup) {
                const sanValue = _Engine.utils.sanitize.modes.mode(island, value);
                if (!sanValue) continue;
                normalized.set(island, sanValue);
              }
            }
            for (const [island, value] of values ?? []) {
              const sanValue = _Engine.utils.sanitize.modes.mode(island, value, backup?.get(island));
              if (!sanValue) continue;
              normalized.set(island, sanValue);
            }
            return normalized;
          }
        }
      },
      isValid: {
        value: {
          island(value) {
            if (!value) return false;
            return _Engine.instance.islands.has(value);
          },
          facet(island, value) {
            if (!value) return false;
            return _Engine.instance.values.get(island)?.facets?.has(value) ?? false;
          },
          mode(island, value) {
            if (!value) return false;
            const isMode = value === "mode";
            const islandHasMode = _Engine.instance.values.get(island)?.mode ?? false;
            if (isMode && islandHasMode) return true;
            return false;
          },
          option: {
            facet(island, facet, value) {
              if (!value) return false;
              return _Engine.instance.values.get(island)?.facets?.get(facet)?.has(value) ?? false;
            },
            mode(island, value) {
              if (!value) return false;
              return _Engine.instance.values.get(island)?.mode?.has(value) ?? false;
            }
          }
        },
        structure: {
          state: {
            obj(obj) {
              for (const [, value] of Object.entries(obj)) {
                if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
                const { facets, mode } = value;
                if (facets !== void 0 && (typeof facets !== "object" || facets === null || Array.isArray(facets))) return false;
                if (facets !== void 0) {
                  for (const fKey in facets) {
                    if (typeof facets[fKey] !== "string") return false;
                  }
                }
                if (mode !== void 0 && typeof mode !== "string") return false;
              }
              return true;
            }
          },
          modes: {
            obj(obj) {
              return Object.values(obj).every((v) => typeof v === "string");
            }
          }
        },
        type: {
          string(value) {
            return typeof value === "string";
          },
          plainObject(val) {
            return val !== null && val !== void 0 && typeof val === "object" && !Array.isArray(val) && Object.prototype.toString.call(val) === "[object Object]";
          }
        }
      }
    };
    constructor() {
      const schema = Object.fromEntries(
        Object.entries(_Engine.args.schema).flatMap(([island, { facets, mode }]) => {
          const hasValidFacets = facets && Object.keys(facets).length > 0;
          const hasMode = !!mode;
          if (!hasValidFacets && !hasMode) return [];
          const polished = {
            ...mode ? { mode } : {},
            ...hasValidFacets ? { facets } : {}
          };
          return [[island, polished]];
        })
      );
      this.islands = new Set(Object.entries(schema).map(([k]) => k));
      this.facets = Object.entries(schema).reduce(
        (acc, [i, { mode, facets }]) => {
          const obj = {};
          obj.facets = Object.keys(facets ?? {}).reduce((acc2, facet) => acc2.add(facet), /* @__PURE__ */ new Set());
          if (mode) obj.mode = true;
          return acc.set(i, obj);
        },
        /* @__PURE__ */ new Map()
      );
      this.values = Object.entries(schema).reduce(
        (acc, [i, { facets, mode }]) => {
          const islandValues = {};
          if (facets)
            islandValues.facets = Object.entries(facets).reduce(
              (acc2, [f, v]) => {
                const facetsValues = /* @__PURE__ */ new Set();
                if (typeof v === "string") facetsValues.add(v);
                else v.forEach((v2) => facetsValues.add(v2));
                return acc2.set(f, facetsValues);
              },
              /* @__PURE__ */ new Map()
            );
          if (mode) islandValues.mode = new Set(typeof mode === "string" ? [mode] : Array.isArray(mode) ? mode : [mode.light, mode.dark, ...mode.system ? [mode.system] : [], ...mode.custom ? mode.custom : []]);
          return acc.set(i, islandValues);
        },
        /* @__PURE__ */ new Map()
      );
      this.fallbacks = Object.entries(_Engine.args.config).reduce(
        (acc, [i, { facets, mode }]) => {
          const islandFallbacks = {};
          if (facets)
            islandFallbacks.facets = Object.entries(facets).reduce(
              (acc2, [f, stratObj]) => {
                return acc2.set(f, stratObj.default);
              },
              /* @__PURE__ */ new Map()
            );
          if (mode) islandFallbacks.mode = mode.default;
          return acc.set(i, islandFallbacks);
        },
        /* @__PURE__ */ new Map()
      );
      this.storage = {
        key: _Engine.args.storageKey || PRESET.storage.key,
        store: _Engine.args.store ?? PRESET.storage.store.values,
        toStore: Object.entries(_Engine.args.config).reduce(
          (acc, [i, { mode, facets }]) => {
            const islandObj = {};
            if (mode) islandObj.mode = _Engine.args.config[i].mode.store ?? PRESET.storage.store.value;
            if (facets) {
              const facetsToStore = Object.entries(facets).reduce(
                (acc2, [facet, stratObj]) => {
                  const mustStore = stratObj.store ?? PRESET.storage.store.value;
                  if (mustStore) return acc2.add(facet);
                  return acc2;
                },
                /* @__PURE__ */ new Set()
              );
              if (facetsToStore.size > 0) islandObj.facets = facetsToStore;
            }
            if (Object.keys(islandObj).length > 0) return acc.set(i, islandObj);
            return acc;
          },
          /* @__PURE__ */ new Map()
        )
      };
      this.selectors = {
        types: {
          dataAttributes: {
            island: "data-island",
            computed: {
              facet: (facet) => `data-facet-${facet}`,
              mode: "data-mode"
            },
            forced: {
              facet: (island, facet) => `data-force-${island}-facet-${facet}`,
              mode: (island) => `data-force-${island}-mode`
            },
            colorScheme: "data-color-scheme"
          }
        },
        observe: {
          dataAttributes: {
            island: "data-island",
            forced: Object.entries(schema).reduce(
              (acc, [i, { facets, mode }]) => {
                if (facets) Object.keys(facets).forEach((f) => acc.add(`data-force-${i}-facet-${f}`));
                if (mode) acc.add(`data-force-${i}-mode`);
                return acc;
              },
              /* @__PURE__ */ new Set()
            ),
            computed: Object.entries(schema).reduce(
              (acc, [, { facets, mode }]) => {
                if (facets) Object.keys(facets).forEach((f) => acc.add(`data-facet-${f}`));
                if (mode) acc.add("data-mode");
                return acc;
              },
              /* @__PURE__ */ new Set()
            ),
            colorScheme: "data-color-scheme"
          },
          class: "class",
          colorScheme: "style"
        }
      };
      this.modes = Object.entries(schema).reduce(
        (acc, [i, { mode }]) => {
          if (!mode) return acc;
          const stratObj = _Engine.args.config[i].mode;
          const obj = {
            selectors: /* @__PURE__ */ new Set([...PRESET.modes.dom.selectors, ...typeof stratObj.selector === "string" ? [stratObj.selector] : Array.isArray(stratObj.selector) ? stratObj.selector : PRESET.modes.dom.island.selectors]),
            strategy: stratObj.strategy,
            colorSchemes: stratObj.strategy === STRATS.mono ? /* @__PURE__ */ new Map([[stratObj.default, stratObj.colorScheme]]) : stratObj.strategy === STRATS.multi ? new Map(Object.entries(stratObj.colorSchemes)) : new Map([[mode.light, COLOR_SCHEMES.light], [mode.dark, COLOR_SCHEMES.dark], ...Object.entries(stratObj.colorSchemes ?? {})]),
            system: void 0
          };
          if (stratObj.strategy === STRATS.system)
            obj.system = {
              mode: mode.system,
              fallback: stratObj.fallback
            };
          return acc.set(i, obj);
        },
        /* @__PURE__ */ new Map()
      );
      this.nonce = _Engine.args.nonce || PRESET.nonce;
      this.disableTransitionOnChange = _Engine.args.disableTransitionOnChange ?? PRESET.disable_transitions_on_change;
      this.forcedValues = _Engine.args.forcedValues ?? PRESET.forced_values;
      this.observe = new Set(_Engine.args.observe ? typeof _Engine.args.observe === "string" ? [_Engine.args.observe] : _Engine.args.observe : PRESET.observe);
    }
  };

  // src/storage-manager.ts
  var StorageManager = class _StorageManager {
    static instance;
    static abortController;
    static isInternalChange = false;
    static init() {
      if (!_StorageManager.instance) _StorageManager.instance = new _StorageManager();
    }
    static get = {
      state: {
        serialized: () => {
          const retrieved = window.localStorage.getItem(Engine.getInstance().storage.key);
          return retrieved ?? void 0;
        },
        deserialized: () => {
          const serialized = _StorageManager.get.state.serialized();
          if (!serialized) return;
          return Engine.utils.deserialize.state(serialized);
        },
        sanitized: () => {
          const deserialized = _StorageManager.get.state.deserialized();
          if (!deserialized) return void 0;
          const sanitized = Engine.utils.sanitize.state.all(deserialized);
          return sanitized;
        },
        normalized: () => {
          const sanitized = _StorageManager.get.state.sanitized();
          const normalized = Engine.utils.normalize.state.state(sanitized ?? Engine.getInstance().fallbacks);
          return normalized;
        }
      }
    };
    static set = {
      state: {
        facet(island, facet, value) {
          if (!Engine.getInstance().storage.store) return;
          const currState = Main.get.state.base();
          const newStatePartial = Engine.utils.construct.state.fromFacet(island, facet, value);
          const newState = Engine.utils.merge.deep.state.maps.all(currState, newStatePartial);
          const newStateToStore = _StorageManager.constructStateToStore(newState);
          const newStateObjToStore = Engine.utils.convert.deep.state.mapToObj(newStateToStore);
          const newSerState = JSON.stringify(newStateObjToStore);
          const currSerState = _StorageManager.get.state.serialized();
          const needsUpdate = currSerState !== newSerState;
          if (needsUpdate) _StorageManager.updateStorageState(newSerState);
        },
        island(island, values) {
          if (!Engine.getInstance().storage.store) return;
          const currState = Main.get.state.base();
          const newStatePartial = Engine.utils.construct.state.fromIslandValues(island, values);
          const newState = Engine.utils.merge.deep.state.maps.all(currState, newStatePartial);
          const newStateToStore = _StorageManager.constructStateToStore(newState);
          const newStateObjToStore = Engine.utils.convert.deep.state.mapToObj(newStateToStore);
          const newSerState = JSON.stringify(newStateObjToStore);
          const currSerState = _StorageManager.get.state.serialized();
          const needsUpdate = currSerState !== newSerState;
          if (needsUpdate) _StorageManager.updateStorageState(newSerState);
        },
        all(state) {
          if (!Engine.getInstance().storage.store) return;
          const stateToStore = _StorageManager.constructStateToStore(state);
          const stateObjToStore = Engine.utils.convert.deep.state.mapToObj(stateToStore);
          const newSerState = JSON.stringify(stateObjToStore);
          const currSerState = _StorageManager.get.state.serialized();
          const needsUpdate = currSerState !== newSerState;
          if (needsUpdate) _StorageManager.updateStorageState(newSerState);
        }
      }
    };
    static updateStorageState(serState) {
      if (_StorageManager.isInternalChange) return;
      _StorageManager.isInternalChange = true;
      window.localStorage.setItem(Engine.getInstance().storage.key, serState);
      _StorageManager.isInternalChange = false;
    }
    static constructStateToStore(state) {
      const stateToStore = Array.from(state).reduce((acc, [i, { mode, facets }]) => {
        if (!Engine.getInstance().storage.toStore.has(i)) return acc;
        const islandState = {};
        if (mode) {
          const mustStore = Engine.getInstance().storage.toStore.get(i)?.mode ?? false;
          if (mustStore) islandState.mode = mode;
        }
        if (facets) {
          islandState.facets = Array.from(facets).reduce(
            (facetsAcc, [facet, value]) => {
              const mustStore = Engine.getInstance().storage.toStore.get(i)?.facets?.has(facet) ?? false;
              if (mustStore) return facetsAcc.set(facet, value);
              return facetsAcc;
            },
            /* @__PURE__ */ new Map()
          );
        }
        return acc.set(i, islandState);
      }, /* @__PURE__ */ new Map());
      return stateToStore;
    }
    static terminate() {
      _StorageManager.abortController?.abort();
      if (Engine.getInstance().storage.store) localStorage.removeItem(Engine.getInstance().storage.key);
      _StorageManager.instance = void 0;
    }
    constructor() {
      EventManager.on("Reset", "StorageManager:Reset", () => _StorageManager.terminate());
      EventManager.on("State:Base:Update", "StorageManager:State:Update", ({ state }) => _StorageManager.set.state.all(Engine.utils.convert.deep.state.objToMap(state)));
      _StorageManager.abortController = new AbortController();
      if (Engine.getInstance().observe.has("storage"))
        window.addEventListener(
          "storage",
          ({ key, oldValue, newValue }) => {
            if (key === Engine.getInstance().storage.key) {
              if (!Engine.getInstance().storage.store) return;
              const deserNew = newValue ? Engine.utils.deserialize.state(newValue) : void 0;
              const deserOld = oldValue ? Engine.utils.deserialize.state(oldValue) : void 0;
              const normalized = Engine.utils.normalize.state.state(deserNew ?? deserOld, deserOld);
              _StorageManager.set.state.all(normalized);
              Main.set.state.base(normalized);
            }
          },
          {
            signal: _StorageManager.abortController.signal
          }
        );
    }
  };

  // src/dom-manager.ts
  var DomManager = class _DomManager {
    static instance;
    static observer;
    static isPerfomingMutation = false;
    static init() {
      if (!_DomManager.instance) _DomManager.instance = new _DomManager();
    }
    static findDeepest(attr) {
      let deepest = null;
      let maxDepth = -1;
      const dfs = (node, depth) => {
        if (node.hasAttribute(attr)) {
          if (depth > maxDepth) {
            maxDepth = depth;
            deepest = node;
          }
        }
        for (const child of node.children) dfs(child, depth + 1);
      };
      dfs(document.documentElement, 0);
      return deepest;
    }
    static get = {
      islands: {
        byIsland(island) {
          const elements = document.querySelectorAll(`[${Engine.getInstance().selectors.types.dataAttributes.island}=${island}]`);
          if (elements.length === 0) return void 0;
          return new Set(elements);
        },
        all() {
          const elements = Array.from(Engine.getInstance().islands).reduce(
            (acc, island) => {
              const elements2 = _DomManager.get.islands.byIsland(island);
              if (!elements2) return acc;
              return acc.set(island, elements2);
            },
            /* @__PURE__ */ new Map()
          );
          return elements;
        }
      },
      state: {
        computed: {
          island: {
            dirty: (island, el) => {
              const isIsland = Engine.utils.isValid.value.island(island);
              if (!isIsland) return void 0;
              const { mode, facets } = Engine.getInstance().facets.get(island);
              const state = {};
              if (facets && facets.size > 0) {
                const facetsMap = Array.from(facets).reduce(
                  (acc, facet) => {
                    const facetValue = el.getAttribute(Engine.getInstance().selectors.types.dataAttributes.computed.facet(facet));
                    if (!facetValue) return acc;
                    return acc.set(facet, facetValue);
                  },
                  /* @__PURE__ */ new Map()
                );
                state.facets = facetsMap;
              }
              if (mode) {
                const modeValue = el.getAttribute(Engine.getInstance().selectors.types.dataAttributes.computed.mode);
                if (modeValue) state.mode = modeValue;
              }
              return state;
            },
            sanitized(island, el, backup) {
              const dirty = _DomManager.get.state.computed.island.dirty(island, el);
              if (!dirty) return void 0;
              const sanitized = Engine.utils.sanitize.state.island(island, dirty, backup);
              return sanitized;
            },
            normalized: (island, el, backup) => {
              const sanitized = _DomManager.get.state.computed.island.sanitized(island, el, backup);
              if (!sanitized) return void 0;
              const normalized = Engine.utils.normalize.state.island(island, sanitized, backup);
              return normalized;
            }
          },
          all: {
            dirty: () => {
              const islands = _DomManager.get.islands.all();
              const states = Array.from(islands).reduce(
                (states2, [i, els]) => {
                  const islandStates = Array.from(els).reduce(
                    (islandStates2, el) => {
                      const state = _DomManager.get.state.computed.island.dirty(i, el);
                      if (state && Object.keys(state).length > 0) return islandStates2.set(el, state);
                      return islandStates2;
                    },
                    /* @__PURE__ */ new Map()
                  );
                  if (islandStates.size > 0) return states2.set(i, islandStates);
                  return states2;
                },
                /* @__PURE__ */ new Map()
              );
              return states;
            },
            sanitized: () => {
              const islands = _DomManager.get.islands.all();
              const states = Array.from(islands).reduce(
                (states2, [i, els]) => {
                  const islandStates = Array.from(els).reduce(
                    (islandStates2, el) => {
                      const state = _DomManager.get.state.computed.island.sanitized(i, el);
                      if (state) return islandStates2.set(el, state);
                      return islandStates2;
                    },
                    /* @__PURE__ */ new Map()
                  );
                  if (islandStates.size > 0) return states2.set(i, islandStates);
                  return states2;
                },
                /* @__PURE__ */ new Map()
              );
              return states;
            },
            normalized: () => {
              const islands = _DomManager.get.islands.all();
              const states = Array.from(islands).reduce(
                (states2, [i, els]) => {
                  const islandStates = Array.from(els).reduce(
                    (islandStates2, el) => {
                      const state = _DomManager.get.state.computed.island.normalized(i, el);
                      if (state) return islandStates2.set(el, state);
                      return islandStates2;
                    },
                    /* @__PURE__ */ new Map()
                  );
                  if (islandStates.size > 0) return states2.set(i, islandStates);
                  return states2;
                },
                /* @__PURE__ */ new Map()
              );
              return states;
            }
          }
        },
        forced: {
          island: {
            dirty: (island) => {
              const isIsland = Engine.utils.isValid.value.island(island);
              if (!isIsland) return void 0;
              if (!Engine.getInstance().forcedValues) return {};
              const { mode, facets } = Engine.getInstance().facets.get(island);
              const state = {};
              if (facets)
                state.facets = Array.from(facets).reduce(
                  (facets2, facet) => {
                    const deepestEl = _DomManager.findDeepest(Engine.getInstance().selectors.types.dataAttributes.forced.facet(island, facet));
                    if (!deepestEl) return facets2;
                    const forcedValue = deepestEl.getAttribute(Engine.getInstance().selectors.types.dataAttributes.forced.facet(island, facet));
                    if (!forcedValue) return facets2;
                    return facets2.set(facet, forcedValue);
                  },
                  /* @__PURE__ */ new Map()
                );
              if (mode) {
                const deepestEl = _DomManager.findDeepest(Engine.getInstance().selectors.types.dataAttributes.forced.mode(island));
                if (deepestEl) {
                  const forcedValue = deepestEl.getAttribute(Engine.getInstance().selectors.types.dataAttributes.forced.mode(island));
                  if (forcedValue) state.mode = forcedValue;
                }
              }
              return state;
            },
            sanitized: (island) => {
              const dirty = _DomManager.get.state.forced.island.dirty(island);
              if (!dirty) return void 0;
              if (!Engine.getInstance().forcedValues) return {};
              const sanitized = {};
              if (dirty.facets && dirty.facets.size > 0)
                sanitized.facets = Array.from(dirty.facets).reduce(
                  (facets, [facet, value]) => {
                    const isValid = Engine.utils.isValid.value.option.facet(island, facet, value);
                    if (!isValid) return facets;
                    return facets.set(facet, value);
                  },
                  /* @__PURE__ */ new Map()
                );
              if (dirty.mode) {
                const isValid = Engine.utils.isValid.value.option.mode(island, dirty.mode);
                if (isValid) sanitized.mode = dirty.mode;
              }
              return sanitized;
            }
          },
          all: {
            dirty: () => {
              if (!Engine.getInstance().forcedValues) return /* @__PURE__ */ new Map();
              const state = Array.from(Engine.getInstance().islands).reduce((state2, island) => {
                const islandState = _DomManager.get.state.forced.island.dirty(island);
                if (islandState && Object.keys(islandState).length > 0) return state2.set(island, islandState);
                return state2;
              }, /* @__PURE__ */ new Map());
              return state;
            },
            sanitized: () => {
              if (!Engine.getInstance().forcedValues) return /* @__PURE__ */ new Map();
              const state = Array.from(Engine.getInstance().islands).reduce((state2, island) => {
                const islandState = _DomManager.get.state.forced.island.sanitized(island);
                if (islandState && Object.keys(islandState).length > 0) return state2.set(island, islandState);
                return state2;
              }, /* @__PURE__ */ new Map());
              return state;
            }
          }
        }
      }
    };
    static disableTransitions() {
      _DomManager.isPerfomingMutation = true;
      const css = document.createElement("style");
      if (Engine.getInstance().nonce) css.setAttribute("nonce", Engine.getInstance().nonce);
      css.appendChild(document.createTextNode(`*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`));
      document.head.appendChild(css);
      return () => {
        ;
        (() => window.getComputedStyle(document.body))();
        setTimeout(() => {
          document.head.removeChild(css);
          _DomManager.isPerfomingMutation = false;
        }, 1);
      };
    }
    static set = {
      state: {
        computed: {
          island: (island, state, opts) => {
            const enableBackTransitions = Engine.getInstance().disableTransitionOnChange && opts?.isUserMutation ? _DomManager.disableTransitions() : void 0;
            const els = opts?.elements ?? new Set(_DomManager.get.islands.byIsland(island));
            els.forEach((el) => {
              const elCurrState = _DomManager.get.state.computed.island.dirty(island, el);
              if (state.facets)
                state.facets.forEach((value, facet) => {
                  const needsUpdate = elCurrState?.facets?.get(facet) !== value;
                  if (needsUpdate) el.setAttribute(Engine.getInstance().selectors.types.dataAttributes.computed.facet(facet), value);
                });
              if (state.mode) {
                const needsUpdate = elCurrState?.mode !== state.mode;
                if (needsUpdate) el.setAttribute(Engine.getInstance().selectors.types.dataAttributes.computed.mode, state.mode);
                const colorScheme = Engine.utils.resolve.colorScheme(island, state.mode);
                _DomManager.set.mode.set(island, el, colorScheme);
              }
            });
            enableBackTransitions?.();
          },
          all: (state, opts) => {
            const els = opts?.elements ?? _DomManager.get.islands.all();
            els.forEach((islandEls, island) => {
              const islandState = state.get(island);
              _DomManager.set.state.computed.island(island, islandState, { elements: islandEls, isUserMutation: opts?.isUserMutation });
            });
          }
        }
      },
      mode: {
        dataAttribute: (island, el, value) => {
          if (!Engine.getInstance().modes.get(island)?.selectors.has("data-attribute")) return;
          if (!(el instanceof HTMLElement)) return;
          const currValue = el.getAttribute(Engine.getInstance().selectors.types.dataAttributes.colorScheme);
          const needsUpdate = currValue !== value;
          if (needsUpdate) el.setAttribute(Engine.getInstance().selectors.types.dataAttributes.colorScheme, value);
        },
        colorScheme: (island, el, value) => {
          if (!Engine.getInstance().modes.get(island)?.selectors.has("color-scheme")) return;
          if (!(el instanceof HTMLElement)) return;
          const currValue = el.style.colorScheme;
          const needsUpdate = currValue !== value;
          if (needsUpdate) el.style.colorScheme = value;
        },
        class: (island, el, value) => {
          if (!Engine.getInstance().modes.get(island)?.selectors.has("class")) return;
          if (!(el instanceof HTMLElement)) return;
          const currValue = el.classList.contains(MODES.light) ? MODES.light : el.classList.contains(MODES.dark) ? MODES.dark : void 0;
          const needsUpdate = currValue !== value;
          if (needsUpdate) {
            const other = value === MODES.light ? MODES.dark : MODES.light;
            el.classList.replace(other, value) || el.classList.add(value);
          }
        },
        set: (island, el, value) => {
          if (!(el instanceof HTMLElement)) return;
          if (Engine.getInstance().modes.get(island)?.selectors.has("data-attribute")) _DomManager.set.mode.dataAttribute(island, el, value);
          if (Engine.getInstance().modes.get(island)?.selectors.has("color-scheme")) _DomManager.set.mode.colorScheme(island, el, value);
          if (Engine.getInstance().modes.get(island)?.selectors.has("class")) _DomManager.set.mode.class(island, el, value);
        }
      }
    };
    static terminate() {
      _DomManager.observer?.disconnect();
      const islands = _DomManager.get.islands.all();
      for (const [island, elements] of islands) {
        for (const element of elements) {
          const { mode, facets } = Engine.getInstance().facets.get(island);
          if (facets) {
            for (const facet of facets) {
              element.removeAttribute(Engine.getInstance().selectors.types.dataAttributes.computed.facet(facet));
            }
          }
          if (mode) {
            element.removeAttribute(Engine.getInstance().selectors.types.dataAttributes.computed.mode);
            if (element instanceof HTMLElement) {
              element.style.colorScheme = "";
              element.removeAttribute(Engine.getInstance().selectors.types.dataAttributes.colorScheme);
              element.classList.remove(MODES.light, MODES.dark);
            }
          }
        }
      }
      _DomManager.instance = void 0;
    }
    static constructAttributeFilters() {
      return [
        Engine.getInstance().selectors.observe.dataAttributes.island,
        ...Array.from(Engine.getInstance().selectors.observe.dataAttributes.computed),
        ...Engine.getInstance().selectors.observe.dataAttributes.forced,
        Engine.getInstance().selectors.observe.dataAttributes.colorScheme,
        Engine.getInstance().selectors.observe.class,
        Engine.getInstance().selectors.observe.colorScheme
      ];
    }
    constructor() {
      EventManager.on("Reset", "DomManager:Reset", () => _DomManager.terminate());
      EventManager.on(
        "State:Computed:Update",
        "DomManager:State:Update",
        ({ state, isUserMutation }) => _DomManager.set.state.computed.all(Engine.utils.convert.deep.state.objToMap(state), { isUserMutation })
      );
      const handleMutations = (mutations) => {
        for (const { type, oldValue, attributeName, target } of mutations) {
          if (_DomManager.isPerfomingMutation) continue;
          if (type === "attributes" && target instanceof HTMLElement && attributeName && Engine.getInstance().observe.has("DOM")) {
            if (attributeName === Engine.getInstance().selectors.types.dataAttributes.island) {
              const newIsland = target.getAttribute(Engine.getInstance().selectors.types.dataAttributes.island);
              const isIsland = Engine.utils.isValid.value.island(newIsland);
              if (!isIsland) {
                const isOldIsland = Engine.utils.isValid.value.island(oldValue);
                if (isOldIsland) target.setAttribute(Engine.getInstance().selectors.types.dataAttributes.island, oldValue);
              }
              if (isIsland) {
                const compState = Main.get.state.computed()?.get(newIsland);
                const currState = _DomManager.get.state.computed.island.normalized(newIsland, target);
                const newIslandState = Engine.utils.merge.deep.state.maps.island(currState, compState);
                _DomManager.set.state.computed.island(newIsland, newIslandState);
              }
              continue;
            }
            if (Engine.getInstance().selectors.observe.dataAttributes.forced.has(attributeName)) {
              if (!Engine.getInstance().forcedValues) continue;
              const parts = attributeName.split("-");
              const island = parts[2];
              const facetType = parts[3];
              const facet = parts[4];
              const newOption = target.getAttribute(attributeName);
              if (facetType === "facet") {
                const isNewOption = newOption ? Engine.utils.isValid.value.option.facet(island, facet, newOption) : false;
                if (!isNewOption) {
                  const isOldOption = oldValue ? Engine.utils.isValid.value.option.facet(island, facet, oldValue) : false;
                  if (isOldOption) target.setAttribute(attributeName, oldValue);
                }
              }
              if (facetType === "mode") {
                const isNewOption = newOption ? Engine.utils.isValid.value.option.mode(island, newOption) : false;
                if (!isNewOption) {
                  const isOldOption = oldValue ? Engine.utils.isValid.value.option.mode(island, oldValue) : false;
                  if (isOldOption) target.setAttribute(attributeName, oldValue);
                }
              }
              const newForcedState = _DomManager.get.state.forced.all.sanitized();
              Main.set.state.forced(newForcedState);
              continue;
            }
            if (Engine.getInstance().selectors.observe.dataAttributes.computed.has(attributeName)) {
              const island = target.getAttribute(Engine.getInstance().selectors.types.dataAttributes.island);
              const isIsland = Engine.utils.isValid.value.island(island);
              if (!isIsland) continue;
              const parts = attributeName.split("-");
              const facetType = parts[1];
              const facet = parts[2];
              const newOption = target.getAttribute(attributeName);
              if (facetType === "facet" && facet) {
                const revertToComputed = (oldValue2) => {
                  const currCompValue = Main.get.state.computed()?.get(island)?.facets?.get(facet);
                  const isOldOption = Engine.utils.isValid.value.option.facet(island, facet, oldValue2);
                  const isOldCurrCompValue = isOldOption && currCompValue === oldValue2;
                  if (isOldCurrCompValue) target.setAttribute(attributeName, oldValue2);
                  else target.setAttribute(attributeName, currCompValue);
                };
                const isNewOption = Engine.utils.isValid.value.option.facet(island, facet, newOption);
                if (!isNewOption) {
                  revertToComputed(oldValue);
                  continue;
                }
                const isEffectiveUpdate = oldValue !== newOption;
                if (!isEffectiveUpdate) continue;
                const isFacetCurrForced = Main.get.state.forced()?.get(island)?.facets?.has(facet);
                if (isFacetCurrForced) {
                  revertToComputed(oldValue);
                  continue;
                }
                const currBaseValue = Main.get.state.base()?.get(island)?.facets?.get(facet);
                const isNewAlreadySet = currBaseValue === newOption;
                if (isNewAlreadySet) continue;
                const newStatePartial = Engine.utils.construct.state.fromFacet(island, facet, newOption);
                Main.set.state.base(newStatePartial);
                continue;
              }
              if (facetType === "mode") {
                const revertToComputed = (oldValue2) => {
                  const currCompValue = Main.get.state.computed()?.get(island)?.mode;
                  const isOldOption = Engine.utils.isValid.value.option.mode(island, oldValue2);
                  const isOldCurrCompValue = isOldOption && currCompValue === oldValue2;
                  if (isOldCurrCompValue) target.setAttribute(attributeName, oldValue2);
                  else target.setAttribute(attributeName, currCompValue);
                };
                const isNewOption = Engine.utils.isValid.value.option.mode(island, newOption);
                if (!isNewOption) {
                  revertToComputed(oldValue);
                  continue;
                }
                const isEffectiveUpdate = oldValue !== newOption;
                if (!isEffectiveUpdate) continue;
                const isModeCurrForced = !!Main.get.state.forced()?.get(island)?.mode;
                if (isModeCurrForced) {
                  revertToComputed(oldValue);
                  continue;
                }
                const currBaseValue = Main.get.state.base()?.get(island)?.mode;
                const isNewAlreadySet = currBaseValue === newOption;
                if (isNewAlreadySet) continue;
                const newStatePartial = Engine.utils.construct.state.fromMode(island, newOption);
                Main.set.state.base(newStatePartial);
                continue;
              }
            }
            if (attributeName === Engine.getInstance().selectors.observe.colorScheme) {
              const island = target.getAttribute(Engine.getInstance().selectors.types.dataAttributes.island);
              const isIsland = Engine.utils.isValid.value.island(island);
              if (!isIsland) continue;
              const isSelectorEnabled = Engine.getInstance().modes.get(island)?.selectors.has("color-scheme");
              if (!isSelectorEnabled) continue;
              const supportedColorSchemes = new Set(Engine.getInstance().modes.get(island)?.colorSchemes.values() ?? []);
              const revertToComputed = (oldValue2) => {
                const currCompValue = Main.get.colorSchemes.computed()?.get(island);
                const isOldColorScheme = supportedColorSchemes.has(oldValue2);
                const isOldCurrCompColorScheme = isOldColorScheme && currCompValue === oldValue2;
                if (isOldCurrCompColorScheme) target.style.colorScheme = oldValue2;
                else target.style.colorScheme = currCompValue;
              };
              const newColorScheme = target.style.colorScheme;
              const isNewColorScheme = supportedColorSchemes.has(newColorScheme);
              if (!isNewColorScheme) {
                revertToComputed(oldValue);
                continue;
              }
              const isEffectiveUpdate = oldValue !== newColorScheme;
              if (!isEffectiveUpdate) continue;
              const isModeCurrForced = !!Main.get.state.forced()?.get(island)?.mode;
              if (isModeCurrForced) {
                revertToComputed(oldValue);
                continue;
              }
              const isSystemStrat = Engine.getInstance().modes.get(island).strategy === "system";
              if (!isSystemStrat) {
                revertToComputed(oldValue);
                continue;
              }
              const traceBackMode = (colorScheme) => {
                for (const [mode, cs] of Engine.getInstance().modes.get(island).colorSchemes) {
                  if (cs === colorScheme) return mode;
                }
              };
              const corrMode = traceBackMode(newColorScheme);
              const currBaseMode = Main.get.state.base()?.get(island)?.mode;
              const isCurrBaseModeSystem = Engine.getInstance().modes.get(island)?.system?.mode === currBaseMode;
              if (isCurrBaseModeSystem) {
                const isNewPrefColorScheme = newColorScheme === Engine.utils.miscellaneous.getSystemPref();
                if (isNewPrefColorScheme) continue;
              }
              const isNewAlreadySet = currBaseMode === corrMode;
              if (isNewAlreadySet) continue;
              const newStatePartial = Engine.utils.construct.state.fromMode(island, corrMode);
              Main.set.state.base(newStatePartial);
              continue;
            }
            if (attributeName === Engine.getInstance().selectors.observe.dataAttributes.colorScheme) {
              const island = target.getAttribute(Engine.getInstance().selectors.types.dataAttributes.island);
              const isIsland = Engine.utils.isValid.value.island(island);
              if (!isIsland) continue;
              const isSelectorEnabled = Engine.getInstance().modes.get(island)?.selectors.has("data-attribute");
              if (!isSelectorEnabled) continue;
              const supportedColorSchemes = new Set(Engine.getInstance().modes.get(island)?.colorSchemes.values() ?? []);
              const revertToComputed = (oldValue2) => {
                const currCompValue = Main.get.colorSchemes.computed()?.get(island);
                const isOldColorScheme = supportedColorSchemes.has(oldValue2);
                const isOldCurrCompColorScheme = isOldColorScheme && currCompValue === oldValue2;
                if (isOldCurrCompColorScheme) target.setAttribute(Engine.getInstance().selectors.types.dataAttributes.colorScheme, oldValue2);
                else target.setAttribute(Engine.getInstance().selectors.types.dataAttributes.colorScheme, currCompValue);
              };
              const newColorScheme = target.getAttribute(Engine.getInstance().selectors.types.dataAttributes.colorScheme);
              const isNewColorScheme = supportedColorSchemes.has(newColorScheme);
              if (!isNewColorScheme) {
                revertToComputed(oldValue);
                continue;
              }
              const isEffectiveUpdate = oldValue !== newColorScheme;
              if (!isEffectiveUpdate) continue;
              const isModeCurrForced = !!Main.get.state.forced()?.get(island)?.mode;
              if (isModeCurrForced) {
                revertToComputed(oldValue);
                continue;
              }
              const isSystemStrat = Engine.getInstance().modes.get(island).strategy === "system";
              if (!isSystemStrat) {
                revertToComputed(oldValue);
                continue;
              }
              const traceBackMode = (colorScheme) => {
                for (const [mode, cs] of Engine.getInstance().modes.get(island).colorSchemes) {
                  if (cs === colorScheme) return mode;
                }
              };
              const corrMode = traceBackMode(newColorScheme);
              const currBaseMode = Main.get.state.base()?.get(island)?.mode;
              const isCurrBaseModeSystem = Engine.getInstance().modes.get(island)?.system?.mode === currBaseMode;
              if (isCurrBaseModeSystem) {
                const isNewPrefColorScheme = newColorScheme === Engine.utils.miscellaneous.getSystemPref();
                if (isNewPrefColorScheme) continue;
              }
              const isNewAlreadySet = currBaseMode === corrMode;
              if (isNewAlreadySet) continue;
              const newStatePartial = Engine.utils.construct.state.fromMode(island, corrMode);
              Main.set.state.base(newStatePartial);
              continue;
            }
            if (attributeName === Engine.getInstance().selectors.observe.class) {
              const island = target.getAttribute(Engine.getInstance().selectors.types.dataAttributes.island);
              const isIsland = Engine.utils.isValid.value.island(island);
              if (!isIsland) continue;
              const isSelectorEnabled = Engine.getInstance().modes.get(island)?.selectors.has("class");
              if (!isSelectorEnabled) continue;
              const supportedColorSchemes = new Set(Engine.getInstance().modes.get(island)?.colorSchemes.values() ?? []);
              const revertToComputed = () => {
                const currCompColorScheme = Main.get.colorSchemes.computed()?.get(island);
                const currColorScheme = target.classList.contains(MODES.light) ? MODES.light : target.classList.contains(MODES.dark) ? MODES.dark : void 0;
                const from = currColorScheme ?? MODES.light;
                target.classList.replace(from, currCompColorScheme) || target.classList.add(currCompColorScheme);
              };
              const newColorScheme = target.classList.contains(MODES.light) ? MODES.light : target.classList.contains(MODES.dark) ? MODES.dark : void 0;
              const isNewColorScheme = newColorScheme ? supportedColorSchemes.has(newColorScheme) : false;
              if (!isNewColorScheme) {
                revertToComputed();
                continue;
              }
              const isEffectiveUpdate = oldValue !== newColorScheme;
              if (!isEffectiveUpdate) continue;
              const isModeCurrForced = !!Main.get.state.forced()?.get(island)?.mode;
              if (isModeCurrForced) {
                revertToComputed();
                continue;
              }
              const isSystemStrat = Engine.getInstance().modes.get(island).strategy === "system";
              if (!isSystemStrat) {
                revertToComputed();
                continue;
              }
              const traceBackMode = (colorScheme) => {
                for (const [mode, cs] of Engine.getInstance().modes.get(island).colorSchemes) {
                  if (cs === colorScheme) return mode;
                }
              };
              const corrMode = traceBackMode(newColorScheme);
              const currBaseMode = Main.get.state.base()?.get(island)?.mode;
              const isCurrBaseModeSystem = Engine.getInstance().modes.get(island)?.system?.mode === currBaseMode;
              if (isCurrBaseModeSystem) {
                const isNewPrefColorScheme = newColorScheme === Engine.utils.miscellaneous.getSystemPref();
                if (isNewPrefColorScheme) continue;
              }
              const isNewAlreadySet = currBaseMode === corrMode;
              if (isNewAlreadySet) continue;
              const newStatePartial = Engine.utils.construct.state.fromMode(island, corrMode);
              Main.set.state.base(newStatePartial);
              continue;
            }
          }
          if (type === "childList") {
            const forcedState = _DomManager.get.state.forced.all.sanitized();
            Main.set.state.forced(forcedState);
            const currCompState = Main.get.state.computed();
            _DomManager.set.state.computed.all(currCompState);
          }
        }
      };
      _DomManager.observer = new MutationObserver(handleMutations);
      _DomManager.observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: _DomManager.constructAttributeFilters(),
        attributeOldValue: true,
        subtree: true,
        childList: true
      });
    }
  };

  // src/main.ts
  var Main = class _Main {
    static instance;
    static init() {
      if (_Main.instance) return console.warn("[T3M4]: Main - Already initialized, skipping initialization.");
      _Main.instance = new _Main();
    }
    static reboot() {
      _Main.instance = new _Main();
    }
    static get = {
      state: {
        base: () => _Main.instance.state.base,
        forced: () => _Main.instance.state.forced,
        computed: () => {
          const base = _Main.get.state.base();
          if (!base) return void 0;
          const forced = _Main.get.state.forced();
          const computed = Engine.utils.merge.deep.state.maps.all(base, forced);
          return computed;
        }
      },
      colorSchemes: {
        base() {
          const state = _Main.get.state.base();
          if (!state) return void 0;
          const colorSchemes = Engine.utils.construct.colorSchemes(state);
          return colorSchemes;
        },
        forced() {
          const state = _Main.get.state.forced();
          if (!state) return void 0;
          const colorSchemes = Engine.utils.construct.colorSchemes(state);
          return colorSchemes;
        },
        computed() {
          const base = _Main.get.colorSchemes.base();
          if (!base) return void 0;
          const forced = _Main.get.colorSchemes.forced();
          const computed = Engine.utils.merge.shallow.maps(base, forced);
          return computed;
        }
      },
      modes: {
        base() {
          const state = _Main.get.state.base();
          if (!state) return void 0;
          const modes = Engine.utils.construct.modes(state);
          return modes;
        },
        forced() {
          const state = _Main.get.state.forced();
          if (!state) return void 0;
          const modes = Engine.utils.construct.modes(state);
          return modes;
        },
        computed() {
          const base = _Main.get.modes.base();
          if (!base) return void 0;
          const forced = _Main.get.modes.forced();
          const computed = Engine.utils.merge.shallow.maps(base, forced);
          return computed;
        }
      }
    };
    static set = {
      state: {
        base: (state, opts) => {
          const currState = _Main.get.state.base();
          if (!currState) return console.warn("[T3M4]: Library not initialized");
          const mergedState = Engine.utils.merge.deep.state.maps.all(currState, state);
          _Main.smartUpdateNotify.state.base(mergedState, opts);
        },
        forced: (state, opts) => {
          _Main.smartUpdateNotify.state.forced(state, opts);
        }
      }
    };
    static smartUpdateNotify = {
      state: {
        base(newState, opts) {
          const currState = _Main.get.state.base();
          if (!currState) return console.warn("[T3M4] Library not initialized.");
          const isEqual = Engine.utils.equal.deep.state(currState, newState);
          if (isEqual) return;
          _Main.instance.state.base = newState;
          _Main.notifyUpdate.state.base(newState);
          const computedState = _Main.get.state.computed();
          _Main.notifyUpdate.state.computed(computedState, opts);
        },
        forced(newState, opts) {
          const currState = _Main.get.state.forced();
          if (!currState) return console.warn("[T3M4] Library not initialized.");
          const isEqual = Engine.utils.equal.deep.state(currState, newState);
          if (isEqual) return;
          _Main.instance.state.forced = newState;
          _Main.notifyUpdate.state.forced(newState);
          const computedState = _Main.get.state.computed();
          _Main.notifyUpdate.state.computed(computedState, opts);
        }
      }
    };
    static notifyUpdate = {
      state: {
        base: (state) => {
          const colorSchemes = Engine.utils.construct.colorSchemes(state);
          EventManager.emit("State:Base:Update", { state: Engine.utils.convert.deep.state.mapToObj(state), colorScheme: Engine.utils.convert.shallow.mapToObj.string(colorSchemes) });
        },
        forced: (state) => {
          const colorSchemes = Engine.utils.construct.colorSchemes(state);
          EventManager.emit("State:Forced:Update", { state: Engine.utils.convert.deep.state.mapToObj(state), colorScheme: Engine.utils.convert.shallow.mapToObj.string(colorSchemes) });
        },
        computed: (state, opts) => {
          const colorSchemes = Engine.utils.construct.colorSchemes(state);
          EventManager.emit("State:Computed:Update", { state: Engine.utils.convert.deep.state.mapToObj(state), colorScheme: Engine.utils.convert.shallow.mapToObj.string(colorSchemes), isUserMutation: opts?.isUserMutation });
        }
      }
    };
    state = {
      base: void 0,
      forced: void 0
    };
    constructor() {
      StorageManager.init();
      DomManager.init();
      const storageState = StorageManager.get.state.normalized();
      const baseState = storageState;
      this.state.base = baseState;
      _Main.notifyUpdate.state.base(baseState);
      const forcedState = DomManager.get.state.forced.all.sanitized();
      this.state.forced = forcedState;
      _Main.notifyUpdate.state.forced(forcedState);
      const computedState = Engine.utils.merge.deep.state.maps.all(baseState, forcedState);
      _Main.notifyUpdate.state.computed(computedState);
    }
  };

  // src/T3M4.ts
  var T3M4 = class {
    get = {
      state: {
        base: () => {
          const state = Main.get.state.base();
          if (!state) return void 0;
          return Engine.utils.convert.deep.state.mapToObj(state);
        },
        forced: () => {
          const state = Main.get.state.forced();
          if (!state) return void 0;
          return Engine.utils.convert.deep.state.mapToObj(state);
        },
        computed: () => {
          const state = Main.get.state.computed();
          if (!state) return void 0;
          return Engine.utils.convert.deep.state.mapToObj(state);
        }
      },
      colorSchemes: {
        base: () => {
          const colorSchemes = Main.get.colorSchemes.base();
          if (!colorSchemes) return void 0;
          return Engine.utils.convert.shallow.mapToObj.string(colorSchemes);
        },
        forced: () => {
          const colorSchemes = Main.get.colorSchemes.forced();
          if (!colorSchemes) return void 0;
          return Engine.utils.convert.shallow.mapToObj.string(colorSchemes);
        },
        computed: () => {
          const colorSchemes = Main.get.colorSchemes.computed();
          if (!colorSchemes) return void 0;
          return Engine.utils.convert.shallow.mapToObj.string(colorSchemes);
        }
      },
      values: () => Engine.utils.convert.deep.values.mapToObj(Engine.getInstance().values)
    };
    set = {
      state: (state) => {
        const stateMap = Engine.utils.convert.deep.state.objToMap(state);
        Main.set.state.base(stateMap, { isUserMutation: true });
      }
    };
    subscribe(e, id, cb) {
      EventManager.on(e, id, cb);
    }
    init(args) {
      Engine.init(args);
      Main.init();
    }
    reboot(newArgs) {
      const newEngine = Engine.reboot(newArgs);
      if (newEngine) Main.reboot();
    }
  };

  // src/index.ts
  window.T3M4 = new T3M4();
})();
