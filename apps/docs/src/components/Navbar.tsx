import { Link } from '@/lib/next-intl/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import { Icons } from '@/components/Icons'
import { ModeSwitch } from './ModeSwitch'
import { navLinks } from '@/config/navigation.config'
import { siteConfig } from '@/config/site.config'
import { buttonVariants } from '@/components/ui/Button'

export const Navbar: FC = () => {
  const t = useTranslations('Navbar.Links')

  return (
    <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 w-full border-b border-dashed backdrop-blur'>
      <div className='h-nav container h-14 px-4 md:px-8 m-auto flex items-center border-x border-dashed'>
        <div className='hidden gap-4 md:flex lg:gap-6'>
          <Link href='/' className='flex items-center gap-3'>
            <Icons.logo className='h-5 w-5' />
            <span className='hidden font-bold lg:inline-block'>T3M4</span>
          </Link>
          <nav className='text-foreground/80 flex items-center gap-4 text-sm xl:gap-6'>
            {navLinks
              .filter((i) => i.showIn.includes('header'))
              .map(({ href, label, disabled }) => (
                <Link key={href} href={href} className={cn({ 'text-muted-foreground/80 pointer-events-none': disabled })}>
                  {t(label)}
                </Link>
              ))}
          </nav>
        </div>
        <div className='flex flex-1 items-center justify-between gap-2 md:justify-end'>
          {/* <CommandMenu /> */}
          <div className='flex gap-0.5'>
            <Link href={siteConfig.repo.url} target='_blank' className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
              <Icons.github />
            </Link>
            <ModeSwitch />
          </div>
        </div>
      </div>
    </header>
  )
}
