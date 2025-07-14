import { Providers } from '@/components/Providers'
import { FontMono, FontSans } from '@/fonts'
import { routing } from '@/lib/next-intl/routing'
import { cn } from '@/lib/utils'
import '@/styles/globals.css'
import { basehub } from 'basehub'
import { Toolbar } from 'basehub/next-toolbar'
import { Metadata } from 'next'
import { hasLocale, Locale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params
  const { settings } = await basehub({ draft: (await draftMode()).isEnabled }).query({ settings: { title: true, template: true, description: true, favicon: { url: true }, ogImage: { url: true, height: true, width: true } } })

  return {
    title: {
      template: '%s | ' + settings.template,
      default: settings.title,
    },
    description: settings.description,
    icons: {
      icon: settings.favicon.url,
      shortcut: settings.favicon.url,
      apple: settings.favicon.url,
    },
    openGraph: {
      title: settings.title,
      description: settings.description,
      siteName: settings.template,
      locale: locale,
      type: 'website',
      images: [
        {
          url: settings.ogImage.url,
          width: settings.ogImage.width,
          height: settings.ogImage.height,
        },
      ],
    },
  }
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
        <Providers locale={locale}>{children}</Providers>
        <Toolbar />
      </body>
    </html>
  )
}
