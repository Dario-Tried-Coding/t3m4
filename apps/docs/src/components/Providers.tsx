import { T3M4Provider } from '@/lib/T3M4'
import { ThemeProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import { PropsWithChildren } from 'react'

interface Props extends PropsWithChildren {}

export function Providers({ children }: Props) {
  return (
    <NextIntlClientProvider>
        <T3M4Provider>{children}</T3M4Provider>
    </NextIntlClientProvider>
  )
}
