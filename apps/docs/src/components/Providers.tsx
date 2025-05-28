import { NextIntlClientProvider } from 'next-intl'
import { PropsWithChildren } from 'react'

interface Props extends PropsWithChildren {}

export function Providers({ children }: Props) {
  return <NextIntlClientProvider>{children}</NextIntlClientProvider>
}
