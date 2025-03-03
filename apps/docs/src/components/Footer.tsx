import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { FC } from 'react'
import { siteConfig } from '../../config/site.config'

export const Footer: FC = () => {
  const t = useTranslations('Footer')

  return (
    <footer className='border-t border-dashed py-10 md:p-4'>
      <div className='container'>
        <span className='text-muted-foreground text-balance text-center text-sm leading-loose md:text-left'>
          {t.rich('tagline', {
            Author: () => (
              <Link href={siteConfig.author.github.profile} target='_blank' className='font-medium underline underline-offset-4'>
                {siteConfig.author.github.username}
              </Link>
            ),
            Repo: () => (
              <Link href={siteConfig.repo.url} target='_blank' className='font-medium underline underline-offset-4'>
                GitHub
              </Link>
            ),
          })}
        </span>
      </div>
    </footer>
  )
}
