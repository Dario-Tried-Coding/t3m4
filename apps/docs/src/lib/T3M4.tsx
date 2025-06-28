import { Config, Schema, State } from '@t3m4/next/types'
import { T3M4Provider as ThemingProvider, useT3M4 as useTheming } from '@t3m4/next'
import { FC, PropsWithChildren } from 'react'

export const schema = {
  root: {
    facets: {
      color: ['blue', 'green', 'red']
    },
    mode: { light: 'light', dark: 'dark' },
  }
} as const satisfies Schema.Suggested
export type TSchema = typeof schema

export const config = {
  root: {
    facets: {
      color: {
        strategy: 'multi',
        default: 'green'
      }
    },
    mode: {
      strategy: 'system',
      default: 'dark',
      selector: ['color-scheme', 'class']
    }
  }
} as const satisfies Config<TSchema>
export type TConfig = typeof config

export type T3M4<I extends keyof TSchema> = State<TSchema>[I]

export const T3M4Provider: FC<PropsWithChildren> = ({ children }) => (
  <ThemingProvider<TSchema, TConfig> schema={schema} config={config} store disableTransitionOnChange>
    {children}
  </ThemingProvider>
)
export const useT3M4 = <I extends keyof TSchema>(island: I) => useTheming<TSchema, TConfig, I>(island)
