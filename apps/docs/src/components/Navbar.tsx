import { Icons } from '@/components/Icons'
import { buttonVariants } from '@/components/ui/Button'
import { navLinks } from '@/config/navigation.config'
import { Link } from '@/lib/next-intl/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import { Github } from './Github'
import { Separator } from './ui/Separator'
import { LayoutSwitch } from './LayoutSwitch'
import { ModeSwitch } from './ModeSwitch'
import { CommandMenu } from './CommandMenu'

export const Navbar: FC = () => {
  const t = useTranslations('Navbar.Links')

  return (
    <header className='bg-background sticky top-0 z-50 w-full'>
      <div className='container-wrapper 3xl:fixed:px-0 px-6'>
        <div className='3xl:fixed:container flex h-14 items-center gap-2 **:data-[slot=separator]:!h-4'>
          <Link href='/' className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'hideen lg:flex' })}>
            <Icons.logo className='h-5 w-5' />
          </Link>
          <nav className='hidden items-center gap-0.5 lg:flex'>
            {navLinks
              .filter((i) => i.showIn.includes('header'))
              .map(({ href, label, disabled }) => (
                <Link key={href} href={href} className={buttonVariants({ variant: 'ghost', size: 'sm', className: cn(disabled && 'pointer-events-none opacity-50') })}>
                  {t(label)}
                </Link>
              ))}
          </nav>
          <div className='ml-auto flex items-center gap-2 md:flex-1 md:justify-end'>
            <CommandMenu className='hidden md:flex md:flex-none' />
            <Separator orientation='vertical' className='ml-2 hidden lg:block' />
            <Github />
            <Separator orientation='vertical' className='' />
            <LayoutSwitch className='3xl:flex hidden' />
            <Separator orientation='vertical' className='3xl:flex hidden' />
            <ModeSwitch />
          </div>
        </div>
      </div>
    </header>
  )
}
