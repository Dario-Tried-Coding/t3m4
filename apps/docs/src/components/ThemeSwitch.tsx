'use client'

import { useT3M4 } from '@/lib/T3M4'
import { cn } from '@/lib/utils'
import { Check, Repeat } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import { Button } from './ui/Button'
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from './ui/Drawer'
import { Label } from './ui/Label'
import { Popover, PopoverContent, PopoverTrigger } from './ui/Popover'

export const ThemeSwitch: FC = ({}) => {
  const t = useTranslations('ThemeSwitch')

  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <Button size='sm' variant='ghost' className='md:hidden'>
            {t('Demo.trigger')}
          </Button>
        </DrawerTrigger>
        <DrawerContent className='p-6 pt-0'>
          <DrawerTitle hidden>{t('Demo.title')}</DrawerTitle>
          <Switch />
        </DrawerContent>
      </Drawer>
      <Popover>
        <PopoverTrigger asChild>
          <Button size='sm' variant='ghost' className='hidden md:block'>
            {t('Demo.trigger')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[22rem] p-6'>
          <Switch />
        </PopoverContent>
      </Popover>
    </>
  )
}

const Switch: FC = () => {
  const {
    updateState,
    values,
    colorScheme,
    state: { base, forced },
  } = useT3M4('root')
  const t = useTranslations('ThemeSwitch')

  return (
    <div className='pt-4 md:pt-0'>
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h4 className='font-semibold leading-none tracking-tight'>{t('Demo.title')}</h4>
          <p className='text-muted-foreground text-xs'>{t('Demo.description')}</p>
        </div>
        <Button variant='ghost' size='icon' onClick={() => updateState.base(({ facets: { color } }) => ({ facets: { color: color === 'zinc' ? 'blue' : 'zinc', radius: '0.5' }, mode: 'dark' }))}>
          <Repeat />
          <span className='sr-only'>{t('Demo.reset')}</span>
        </Button>
      </div>
      <div className='mt-4 space-y-6 md:mt-6'>
        <div className='space-y-1.5'>
          <Label className='text-xs'>{t('Demo.Props.Color.label')}</Label>
          <div className='grid grid-cols-3 gap-2'>
            {options.color.map((c) => {
              const isActive = state?.color === c

              return (
                <Button variant='outline' size='sm' key={c} onClick={() => updateState({ color: c })} className={cn('justify-start', isActive && 'border-primary border-2')}>
                  <span data-color={c} data-color-scheme={resolvedMode} className='bg-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full'>
                    {isActive && <Check className='h-4 w-4 text-white' />}
                  </span>
                  {t(`Demo.Props.Color.Options.${c}`)}
                </Button>
              )
            })}
          </div>
        </div>
        <div className='space-y-1.5'>
          <Label className='text-xs'>{t('Demo.Props.Radius.label')}</Label>
          <div className='grid grid-cols-5 gap-2'>
            {options.radius.map((r) => {
              const isActive = state?.radius === r

              return (
                <Button variant='outline' size='sm' key={r} onClick={() => updateState({ radius: r })} className={cn('', isActive && 'border-primary border-2')}>
                  {r}
                </Button>
              )
            })}
          </div>
        </div>
        <div className='space-y-1.5'>
          <Label className='text-xs'>{t('Demo.Props.Mode.label')}</Label>
          <div className='grid grid-cols-5 gap-2'>
            {options.mode
              .filter((m) => m !== 'system')
              .map((m) => {
                const isActive = resolvedMode === m

                return (
                  <Button variant='outline' size='sm' key={m} onClick={() => updateState({ mode: m })} className={cn('', isActive && 'border-primary border-2')}>
                    {t(`Demo.Props.Mode.Options.${m}`)}
                  </Button>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
