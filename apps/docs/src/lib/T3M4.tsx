import { Config, Schema, Islands } from '@t3m4/next/types'
import { T3M4Provider as ThemingProvider, useT3M4 as useTheming } from '@t3m4/next'
import { FC, PropsWithChildren } from 'react'

const schema = {
  root: {
    mode: { light: 'custom-light' },
    radius: ['0', '0.3', '0.5', '0.75', '1'],
    color: ['zinc', 'red', 'rose', 'orange', 'green', 'blue', 'yellow', 'violet'],
  },
  test: {
    mode: true,
  }
} as const satisfies Schema
type TSchema = typeof schema

const config = {
  root: {
    mode: {
      type: 'mode',
      strategy: 'system',
      preferred: 'custom-light',
      fallback: 'custom-light',
      selector: 'data-attribute',
    },
    color: {
      type: 'facet',
      strategy: 'multi',
      preferred: 'orange',
    },
    radius: {
      type: 'facet',
      strategy: 'multi',
      preferred: '0.3',
    },
  },
  test: {
    mode: {
      type: 'mode',
      strategy: 'system',
      preferred: 'system',
      fallback: 'dark'
    }
  }
} as const satisfies Config<TSchema>
type TConfig = typeof config

export const T3M4Provider: FC<PropsWithChildren> = ({ children }) => (
  <ThemingProvider<TSchema, TConfig> schema={schema} config={config} mode={{ store: true }}>
    {children}
  </ThemingProvider>
)
export const useT3M4 = <I extends Islands<TSchema>>(island: I) => useTheming<TSchema, TConfig, I>(island)