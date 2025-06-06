import { T3M4Provider } from '@/lib/T3M4'
import { NextIntlClientProvider } from 'next-intl'
import { PropsWithChildren } from 'react'

export function Providers({ children }: PropsWithChildren) {
  return (
    <NextIntlClientProvider>
      <T3M4Provider>{children}</T3M4Provider>
    </NextIntlClientProvider>
  )
}
