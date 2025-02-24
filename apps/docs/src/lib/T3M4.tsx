import { Config, Props } from '@t3m4/react/types'
import { NextThemesProvider, useNextThemes } from '@t3m4/react'
import { FC, PropsWithChildren } from 'react'

const props = [
  { prop: 'mode', options: { light: 'custom-light', dark: 'custom-dark', system: 'custom-system', custom: ['custom-1'] } },
  { prop: 'radius', options: ['0', '0.3', '0.5', '0.75', '1'] },
  { prop: 'color', options: ['zinc', 'red', 'rose', 'orange', 'green', 'blue', 'yellow', 'violet'] },
] as const satisfies Props
type TProps = typeof props

const config = {
  mode: {
    type: 'mode',
    strategy: 'system',
    preferred: 'custom-system',
    fallback: 'custom-light',
    colorSchemes: {
      "custom-1": 'dark'
    },
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
  <NextThemesProvider<TProps, TConfig> props={props} config={config} mode={{ attribute: ['class'] }}>
    {children}
  </NextThemesProvider>
)
export const useT3M4 = useNextThemes<TProps, TConfig>
