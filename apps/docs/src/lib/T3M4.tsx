import { Config, Props } from '@t3m4/next/types'
import { T3M4Provider as ThemingProvider, useT3M4 as useTheming } from '@t3m4/next'
import { FC, PropsWithChildren } from 'react'

const props = [
  'mode',
  { prop: 'radius', options: ['0', '0.3', '0.5', '0.75', '1'] },
  { prop: 'color', options: ['zinc', 'red', 'rose', 'orange', 'green', 'blue', 'yellow', 'violet'] },
] as const satisfies Props
type TProps = typeof props

const config = {
  mode: {
    type: 'mode',
    strategy: 'system',
    preferred: 'system',
    fallback: 'dark'
  },
  radius: {
    type: 'generic',
    strategy: 'multi',
    preferred: '0.5',
  },
  color: {
    type: 'generic',
    strategy: 'multi',
    preferred: 'zinc',
  },
} as const satisfies Config<TProps>
type TConfig = typeof config

export const T3M4Provider: FC<PropsWithChildren> = ({ children }) => (
  <ThemingProvider<TProps, TConfig> props={props} config={config} mode={{ selector: ['data-attribute'], store: false }} observe={['DOM', 'storage']} >
    {children}
  </ThemingProvider>
)
export const useT3M4 = useTheming<TProps, TConfig>
