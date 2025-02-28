import { useTranslations } from 'next-intl'
import { allPosts } from 'content-collections'

export default function Home() {
  const t = useTranslations('Index')

  return (
    <div>
      <h1>{t('test')}</h1>
      <ul>
        {allPosts.map((p) => (
          <li key={p._meta.path}>{p.title}</li>
        ))}
      </ul>
    </div>
  )
}
