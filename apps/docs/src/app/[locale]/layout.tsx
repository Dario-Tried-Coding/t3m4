import { Providers } from '@/components/Providers'
import { FontMono, FontSans } from '@/fonts'
import { routing } from '@/lib/next-intl/routing'
import { cn } from '@/lib/utils'
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

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({ children, params }: Readonly<Props>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  setRequestLocale(locale)

  return (
    <html suppressHydrationWarning lang={locale} data-island='root'>
      <body className={cn('flex min-h-screen flex-col font-sans', FontSans.variable, FontMono.variable)}>
        <Providers locale={locale}>
          {children}
        </Providers>
        <Toolbar />
      </body>
    </html>
  )
}
