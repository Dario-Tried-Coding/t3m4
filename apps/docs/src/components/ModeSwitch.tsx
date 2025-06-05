'use client'

import { Button } from '@/components/ui/Button'
import { T3M4, useT3M4 } from '@/lib/T3M4'
import { Laptop, LucideProps, Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FC } from 'react'

interface IconProps extends LucideProps {
  mode: T3M4<'root'>['mode']
}
const Icon: FC<IconProps> = ({ mode, ...rest }) => {
  const icons = {
    light: <Sun {...rest} />,
    dark: <Moon {...rest} />,
    system: <Laptop {...rest} />,
  }

  return icons[mode]
}

export const ModeSwitch: FC = ({}) => {
  const { state, colorSchemes, updateState, values } = useT3M4('root')
  const t = useTranslations('ThemeSwitch')

  return (
    <Button variant='ghost' size='icon' disabled={!state.computed || !!state.forced?.mode} onClick={() => updateState({ mode: state.computed?.mode === 'light' ? 'dark' : 'light' })}>
      <svg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='size-4.5'>
        <path d='M0 0h24v24H0z' stroke='none' />
        <path d='M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0' />
        <path d='M12 3l0 18' />
        <path d='M12 9l4.65 -4.65' />
        <path d='M12 14.3l7.37 -7.37' />
        <path d='M12 19.6l8.85 -8.85' />
      </svg>
      {state.computed && <span className='sr-only'>{t(`Mode.${state.computed.mode}`)}</span>}
    </Button>
  )
}
