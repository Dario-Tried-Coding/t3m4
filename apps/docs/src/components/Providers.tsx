import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Locale, NextIntlClientProvider } from 'next-intl'
import { PropsWithChildren } from 'react'
import { FumadocsProvider } from '../../fumadocs.config'
import { SvgDefs } from './SvgDefs'
import { T3M4Provider } from '@/lib/T3M4'

interface Props extends PropsWithChildren {
  locale: Locale
}

export function Providers({ children, locale }: Props) {
  return (
    <NextIntlClientProvider>
      <T3M4Provider>
        <FumadocsProvider locale={locale}>
          <Analytics />
          <SpeedInsights />
          <SvgDefs />
          {children}
        </FumadocsProvider>
      </T3M4Provider>
    </NextIntlClientProvider>
  )
}
