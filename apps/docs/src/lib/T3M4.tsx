import { Config, Options } from '@t3m4/next/types'
import { T3M4Provider as ThemingProvider, useT3M4 as useTheming } from '@t3m4/next'
import { FC, PropsWithChildren } from 'react'

const options = {
  root: {
    mode: true,
    radius: ['0', '0.3', '0.5', '0.75', '1'],
    color: ['zinc', 'red', 'rose', 'orange', 'green', 'blue', 'yellow', 'violet']
  }
} as const satisfies Options.Schema
type TOptions = typeof options

const config = {
  root: {
    mode: {
      type: 'mode',
      strategy: 'system',
      preferred: 'system',
      fallback: 'dark',
    },
    radius: {
      type: 'facet',
      strategy: 'multi',
      preferred: '0.5',
    },
    color: {
      type: 'facet',
      strategy: 'multi',
      preferred: 'zinc',
    },
  },
} as const satisfies Config.Dynamic<TOptions>
type TConfig = typeof config

export const T3M4Provider: FC<PropsWithChildren> = ({ children }) => (
  <ThemingProvider<TOptions, TConfig> options={options} config={config} >
    {children}
  </ThemingProvider>
)
export const useT3M4 = useTheming<TOptions, TConfig>
