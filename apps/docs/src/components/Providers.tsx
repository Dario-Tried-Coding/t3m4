import { RootProvider } from 'fumadocs-ui/provider'
import { PropsWithChildren } from 'react'
import { Locale, NextIntlClientProvider } from 'next-intl'
import { T3M4Provider } from '@/lib/T3M4'

interface Props extends PropsWithChildren {
  locale: Locale
}

export function Providers({ children, locale }: Props) {
  return (
    <NextIntlClientProvider>
      <T3M4Provider>
        <RootProvider
          i18n={{
            locale,
            locales: [{ locale: 'en', name: 'English' }],
          }}
          theme={{ enabled: false }}
        >
          {children}
        </RootProvider>
      </T3M4Provider>
    </NextIntlClientProvider>
  )
}
