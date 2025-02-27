import { useTranslations } from 'next-intl'

export default function Home() {
  const t = useTranslations('Index')

  return (
    <div>
      <h1>{t('test')}</h1>
    </div>
  )
}
