'use client'

import { useIsMac } from '@/hooks/use-is-mac'
import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'
import { Button } from './ui/Button'
import { useTranslations } from 'next-intl'

interface Props extends Omit<HTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> {}
export function CommandMenu({className, ...rest}:Props) {
  const isMac = useIsMac()
  const t = useTranslations('Navbar.CommandMenu')

  return (
    <Button variant='secondary' className={cn('bg-surface text-surface-foreground/60 dark:bg-card relative h-8 w-full justify-start pl-2.5 font-normal shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64', className)} disabled {...rest}>
      <span className='hidden lg:inline-flex'>{t('Trigger.Placeholder.extended')}</span>
      <span className='inline-flex lg:hidden'>{t('Trigger.Placeholder.brief')}</span>
      <div className='absolute right-1.5 top-1.5 hidden gap-1 sm:flex'>
        <CommandMenuKbd>{isMac ? '⌘' : 'Ctrl'}</CommandMenuKbd>
        <CommandMenuKbd className='aspect-square'>K</CommandMenuKbd>
      </div>
    </Button>
  )
}

function CommandMenuKbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      className={cn("bg-background text-muted-foreground pointer-events-none flex h-5 select-none items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium", className)}
      {...props}
    />
  )
}