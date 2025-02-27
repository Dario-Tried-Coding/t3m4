import { i18nRouting } from '@/lib/next-intl/routing'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { FC, PropsWithChildren } from 'react'

interface Props extends PropsWithChildren {
  locale: string
}
export const NextIntlProvider: FC<Props> = async ({ children, locale }) => {
  if (!i18nRouting.locales.includes(locale as any)) notFound()

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  )
}
