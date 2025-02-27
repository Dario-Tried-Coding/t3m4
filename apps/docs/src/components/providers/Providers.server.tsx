import { T3M4Provider } from '@/lib/T3M4'
import { FC, PropsWithChildren } from 'react'
import { NextIntlProvider } from '@/components/providers/NextIntl'

interface Props extends PropsWithChildren {
  locale: string
}
export const Providers: FC<Props> = ({ children, locale }) => {
  return (
    <NextIntlProvider locale={locale}>
      <T3M4Provider>{children}</T3M4Provider>
    </NextIntlProvider>
  )
}
