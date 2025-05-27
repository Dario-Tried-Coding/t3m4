import { T3M4Provider as ThemingProvider, useT3M4 as useTheming } from '@t3m4/next'
import { Config, Schema, Modes } from '@t3m4/next/types'
import { FC, PropsWithChildren } from 'react'

const schema = {
  root: {
    mode: { light: 'light', dark: 'dark', system: 'system' },
    facets: {
      color: ['zinc', 'blue', 'red', 'rose', 'orange', 'green', 'yellow', 'violet'],
      radius: ['0', '0.3', '0.5', '0.75', '1'],
    },
  },
  switch: {
    mode: ['custom1', 'custom2'],
  },
  footer: {
    facets: {
      font: ['sans', 'serif', 'mono'],
    },
  },
} as const satisfies Schema.Suggested
export type TSchema = typeof schema

const config = {
  root: {
    mode: {
      strategy: 'system',
      default: 'system',
      fallback: 'dark'
    },
    facets: {
      color: {
        strategy: 'multi',
        default: 'violet',
      },
      radius: {
        strategy: 'multi',
        default: '0.5',
      },
    },
  },
  switch: {
    mode: {
      strategy: 'multi',
      default: 'custom1',
      colorSchemes: {
        custom1: 'dark',
        custom2: 'light',
      },
    },
  },
  footer: {
    facets: {
      font: {
        strategy: 'multi',
        default: 'sans',
      },
    },
  },
} as const satisfies Config<TSchema>
export type TConfig = typeof config

const modes = {
  store: true,
  strategy: 'split',
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
