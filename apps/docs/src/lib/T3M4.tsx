import { Config, Schema, State } from '@t3m4/next/types'
import { T3M4Provider as ThemingProvider, useT3M4 as useTheming } from '@t3m4/next'
import { FC, PropsWithChildren } from 'react'

export const schema = {
  root: {
    facets: {
      color: ['default', 'core', 'react', 'next']
    },
    mode: {light: 'light', dark: 'dark'},
  },
} as const satisfies Schema.Suggested
export type TSchema = typeof schema

export const config = {
  root: {
    facets: {
      color: {
        strategy: 'multi',
        default: 'default',
        store: false
      }
    },
    mode: {
      strategy: 'system',
      default: 'dark',
      selector: ['class', 'color-scheme']
    }
  },
} as const satisfies Config<TSchema>
export type TConfig = typeof config

export type T3M4 = State<TSchema>

export const T3M4Provider: FC<PropsWithChildren> = ({ children }) => (
  <ThemingProvider<TSchema, TConfig> schema={schema} config={config} store forcedValues>
    {children}
  </ThemingProvider>
)
export const useT3M4 = <I extends keyof TSchema>(island: I) => useTheming<TSchema, TConfig, I>(island)