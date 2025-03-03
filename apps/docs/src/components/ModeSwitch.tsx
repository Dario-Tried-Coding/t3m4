'use client'

import { Button } from '@/components/ui/Button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu'
import { useT3M4 } from '@/lib/T3M4'
import { Laptop, Loader2, LucideProps, Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FC } from 'react'

interface IconProps extends LucideProps {
  mode: 'light' | 'dark' | 'system'
}
const Icon: FC<IconProps> = ({ mode, ...rest }) => {
  const icons = {
    light: <Sun {...rest} />,
    dark: <Moon {...rest} />,
    system: <Laptop {...rest} />,
  }

  return icons[mode]
}

interface Props {}
export const ModeSwitch: FC<Props> = ({}) => {
  const { state, updateState, resolvedMode } = useT3M4()
  const t = useTranslations('ThemeSwitch')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={!state} asChild>
        <Button variant='ghost' size='icon'>
          {!state ? <Loader2 className='animate-spin' /> : <Icon mode={state.mode} />}
          <span className='sr-only'>{state ? t(`Mode.${state.mode}`) : t('loading')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => updateState('mode', 'light')}>
          <Icon mode='light' />
          <span>{t('Mode.light')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateState('mode', 'dark')}>
          <Icon mode='dark' />
          <span>{t('Mode.dark')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateState('mode', 'system')}>
          <Icon mode='system' />
          <span>{t('Mode.system')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
