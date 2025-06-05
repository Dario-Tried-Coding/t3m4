import { siteConfig } from '@/config/site.config'
import { Link } from '@/lib/next-intl/navigation'
import { buttonVariants } from './ui/Button'
import { Icons } from './Icons'

async function getStars() {
  try {
    const res = await fetch(`https://api.github.com/repos/${siteConfig.author.github.username}/${siteConfig.name}`)
    if (!res.ok) throw new Error(`Github API error: ${res.status}`)

    return (await res.json()).stargazers_count as number
  } catch (error) {
    return null
  }
}

export async function Github() {
  const stars = await getStars()

  return (
    <Link href={siteConfig.repo.url} target='_blank' className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
      <Icons.github />
      {stars && <span className='text-xs text-muted-foreground tabular-nums'>{stars}</span>}
    </Link>
  )
}
