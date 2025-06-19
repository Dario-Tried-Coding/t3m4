import { Navbar } from '@/components/Navbar'
import { Providers } from '@/components/Providers'
import { siteConfig } from '@/config/site.config'
import { FontMono, FontSans } from '@/fonts'
import { routing } from '@/lib/next-intl/routing'
import { cn } from '@/lib/utils'
import '@/styles/globals.css'
import { Toolbar } from 'basehub/next-toolbar'
import { Metadata } from 'next'
import { hasLocale, Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  params: Promise<{ locale: Locale }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })

  return {
    title: {
      template: `%s - ${siteConfig.name}`,
      default: siteConfig.name,
    },
    description: t('Site.description'),
  }
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
      <body className={cn('flex min-h-svh flex-col', FontSans.variable, FontMono.variable)}>
        <Providers>
          <Navbar />
          <main className='flex-1'>{children}</main>
        </Providers>
        <Toolbar />
      </body>
    </html>
  )
}
