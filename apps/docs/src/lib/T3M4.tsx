import { Config, Props } from '@t3m4/react/types'
import { NextThemesProvider, useNextThemes } from '@t3m4/react'
import { FC, PropsWithChildren } from 'react'

const props = ['mode', { prop: 'radius', values: ['0', '0.3', '0.5', '0.75', '1'] }, { prop: 'color', values: ['zinc', 'red', 'rose', 'orange', 'green', 'blue', 'yellow', 'violet'] }] as const satisfies Props
type TProps = typeof props

const config = {
  mode: {
    type: 'mode',
    strategy: 'system',
    base: 'system',
    fallback: 'light',
  },
  radius: {
    type: 'generic',
    strategy: 'multi',
    base: '0.5',
    keys: ['0', '0.3', '0.5', '0.75', '1'],
  },
  color: {
    type: 'generic',
    strategy: 'multi',
    base: 'zinc',
    keys: ['zinc', 'red', 'rose', 'orange', 'green', 'blue', 'yellow', 'violet'],
  },
} as const satisfies Config<TProps>
type TConfig = typeof config

export const T3M4Provider: FC<PropsWithChildren> = ({ children }) => (
  <NextThemesProvider<TProps, TConfig> config={config} mode={{ attribute: ['class'] }}>
    {children}
  </NextThemesProvider>
)
export const useT3M4 = useNextThemes<TProps, TConfig>
