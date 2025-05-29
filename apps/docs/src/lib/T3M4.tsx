import { Config, Schema } from '@t3m4/next/types'
import { T3M4Provider as ThemingProvider, useT3M4 as useTheming } from '@t3m4/next'
import { FC, PropsWithChildren } from 'react'

const schema = {
  root: {
    mode: { light: 'light', dark: 'dark', system: 'system' },
  },
  island: {
    mode: 'default'
  }
} as const satisfies Schema.Suggested
export type TSchema = typeof schema

const config = {
  root: {
    mode: {
      strategy: 'system',
      default: 'system',
      fallback: 'dark',
      selector: 'data-attribute',
    },
  },
  island: {
    mode: {
      strategy: 'mono',
      default: 'default',
      colorScheme: 'dark',
    },
  },
} as const satisfies Config<TSchema>
export type TConfig = typeof config

export const T3M4Provider: FC<PropsWithChildren> = ({ children }) => (
  <ThemingProvider<TSchema, TConfig> schema={schema} config={config}>
    {children}
  </ThemingProvider>
)
export const useT3M4 = <I extends keyof TSchema>(island: I) => useTheming<TSchema, TConfig, I>(island)