export type RESOLVED_MODES = {
  LIGHT: 'light'
  DARK: 'dark'
}
export type RESOLVED_MODE = RESOLVED_MODES[keyof RESOLVED_MODES]

export type MODES = RESOLVED_MODES & {
  SYSTEM: 'system'
}
export type MODE = MODES[keyof MODES]
