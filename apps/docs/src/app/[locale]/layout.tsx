import { Providers } from '@/components/Providers'
import { routing } from '@/lib/next-intl/routing'
import '@/styles/globals.css'
import { Toolbar } from 'basehub/next-toolbar'
import { hasLocale, Locale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  params: Promise<{ locale: Locale }>
}

export default async function RootLayout({ children, params }: Readonly<Props>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  setRequestLocale(locale)

  return (
    <html suppressHydrationWarning lang={locale} data-island='root'>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script crossOrigin='anonymous' src={process.env.NODE_ENV === 'production' ? '//unpkg.com/@t3m4/core/dist/index.global.js' : '/index.global.js'} />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Toolbar />
      </body>
    </html>
  )
}
