import { Config, Props } from '@t3m4/react/types'
import { NextThemesProvider, useNextThemes } from '@t3m4/react'
import { FC, PropsWithChildren } from 'react'

const props = ['mode', { prop: 'radius', values: ['0.5', '1'] }] as const satisfies Props
type TProps = typeof props

const config = {
  mode: {
    type: 'mode',
    strategy: 'system',
    base: 'dark',
    fallback: 'light',
  },
  radius: {
    type: 'generic',
    strategy: 'multi',
    base: '1',
    keys: ['0.5', '1'],
  },
} as const satisfies Config<TProps>
type TConfig = typeof config

export const ThemingProvider: FC<PropsWithChildren> = ({ children }) => (
  <NextThemesProvider<TProps, TConfig> config={config} observe={['DOM-attrs', 'storage']} mode={{ store: true, attribute: ['colorScheme'] }} disableTransitionOnChange>
    {children}
  </NextThemesProvider>
)
export const useTheming = useNextThemes<TProps, TConfig>
