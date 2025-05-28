import { Navbar } from '@/components/Navbar'
import { Providers } from '@/components/Providers'
import { FontMono, FontSans } from '@/fonts'
import { routing } from '@/lib/next-intl/routing'
import { cn } from '@/lib/utils'
import '@/styles/globals.css'
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

export async function generateMetadata({ params }: Omit<Props, 'children'>) {
  const { locale } = await params
  const t = await getTranslations({ locale })

  return {
    title: t('Site.title'),
    description: t('Site.description'),
  }
}

export default async function RootLayout({ children, params }: Readonly<Props>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  setRequestLocale(locale)

  return (
    <html suppressHydrationWarning lang={locale} data-island='root'>
      <body className={cn('flex min-h-svh flex-col antialiased', FontSans.variable, FontMono.variable)}>
        <Providers>
          <Navbar />
          <main className='flex-1'>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
