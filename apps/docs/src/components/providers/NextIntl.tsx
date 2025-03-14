import { i18nRouting } from '@/lib/next-intl/routing'
import { hasLocale, Locale, NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { FC, PropsWithChildren } from 'react'

interface Props extends PropsWithChildren {
  locale: Locale
}
export const NextIntlProvider: FC<Props> = async ({ children, locale }) => {
  if (!hasLocale(i18nRouting.locales, locale)) notFound()

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  )
}
