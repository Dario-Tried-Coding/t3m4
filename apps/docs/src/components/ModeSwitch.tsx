'use client'

import { Button } from '@/components/ui/Button'
import { useT3M4 } from '@/lib/T3M4'
import { useTranslations } from 'next-intl'
import { FC } from 'react'

export const ModeSwitch: FC = ({}) => {
  const { state, updateState } = useT3M4('root')
  const t = useTranslations('ThemeSwitch')

  return (
    <Button variant='ghost' size='icon' disabled={!state.base || !!state.forced?.mode} onClick={() => updateState({ mode: state.base?.mode === 'light' ? 'dark' : 'light' })}>
      <svg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='size-4.5'>
        <path d='M0 0h24v24H0z' stroke='none' />
        <path d='M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0' />
        <path d='M12 3l0 18' />
        <path d='M12 9l4.65 -4.65' />
        <path d='M12 14.3l7.37 -7.37' />
        <path d='M12 19.6l8.85 -8.85' />
      </svg>
      {state.base && <span className='sr-only'>{t(`Mode.${state.base.mode}`)}</span>}
    </Button>
  )
}
