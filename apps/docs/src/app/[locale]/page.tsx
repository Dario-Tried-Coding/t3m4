import { Moment } from '@/components/Moment'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import { buttonVariants } from '@/components/ui/Button'
import { Link } from '@/lib/next-intl/navigation'
import { useTranslations, Locale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { use } from 'react'

interface Props {
  params: Promise<{locale: Locale}>
}
export default function Home({ params }: Props) {
  const { locale } = use(params)

  setRequestLocale(locale)
  
  const t = useTranslations('Marketing.Landing')

  return (
    <div className='container space-y-1 border-x border-dashed py-8 md:py-10 lg:py-12'>
      <h1 className='text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl'>{t('heading')}</h1>
      <h2 className='text-foreground max-w-2xl text-base font-light sm:text-lg'>{t('subheading')}</h2>
      <div className='flex gap-2 pt-2'>
        <Link href='/docs' className={buttonVariants({ size: 'sm' })}>
          {t('get-started')}
        </Link>
        {/* <ThemeSwitch /> */}
        <Moment />
      </div>
    </div>
  )
}
