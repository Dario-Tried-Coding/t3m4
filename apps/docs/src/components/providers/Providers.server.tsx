import { NextIntlProvider } from '@/components/providers/NextIntl'
import { T3M4Provider } from '@/lib/T3M4'
import { Locale } from 'next-intl'
import { FC, PropsWithChildren } from 'react'

interface Props extends PropsWithChildren {
  locale: Locale
}
export const Providers: FC<Props> = ({ children, locale }) => {
  return (
    <NextIntlProvider locale={locale}>
      <T3M4Provider>{children}</T3M4Provider>
    </NextIntlProvider>
  )
}
