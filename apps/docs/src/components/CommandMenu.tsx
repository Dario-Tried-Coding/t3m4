import { cn } from '@/lib/utils'
import { Button } from './ui/Button'
import { useTranslations } from 'next-intl'

export const CommandMenu = () => {
  const t = useTranslations('CommandMenu')

  return (
    <Button variant='outline' size='sm' className={cn('bg-muted/50 text-muted-foreground relative w-full justify-start rounded-md text-sm font-normal shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64')}>
      <span className='hidden lg:inline-flex'>{t('search-verbose')}</span>
      <span className='inline-flex lg:hidden'>{t('search')}</span>
      <kbd className='bg-muted pointer-events-none absolute right-1.5 hidden h-[65%] select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex'>
        <span className='text-xs'>⌘</span>K
      </kbd>
    </Button>
  )
}
