import { T3M4Provider as ThemingProvider, useT3M4 as useTheming } from '@t3m4/next'
import { Config, Schema, Modes } from '@t3m4/next/types'
import { FC, PropsWithChildren } from 'react'

const schema = {
  root: {
    mode: { light: 'light', dark: 'dark', system: 'system' },
  },
  switch: {
    facets: {
      color: ['zinc', 'blue', 'red', 'rose', 'orange', 'green', 'yellow', 'violet'],
      radius: ['0', '0.3', '0.5', '0.75', '1'],
    },
  },
} as const satisfies Schema.Suggested
export type TSchema = typeof schema

const config = {
  root: {
    mode: {
      strategy: 'system',
      default: 'system',
      fallback: 'dark',
    },
  },
  switch: {
    facets: {
      color: {
        strategy: 'multi',
        default: 'zinc',
      },
      radius: {
        strategy: 'multi',
        default: '0.5',
      },
    },
  },
} as const satisfies Config<TSchema>
export type TConfig = typeof config

const modes = {
  islands: {
    root: {
      selectors: ['data-attribute'],
    },
  },
} as const satisfies Modes<TSchema>

export const T3M4Provider: FC<PropsWithChildren> = ({ children }) => (
  <ThemingProvider<TSchema, TConfig> schema={schema} config={config} modes={modes}>
    {children}
  </ThemingProvider>
)
export const useT3M4 = <I extends keyof TSchema>(island: I) => useTheming<TSchema, TConfig, I>(island)
