'use client'

import { Button } from '@/components/ui/Button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu'
import { useT3M4 } from '@/lib/T3M4'
import { Check, Laptop, Loader2, LucideProps, Moon, Sun } from 'lucide-react'
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

export const ModeSwitch: FC = ({}) => {
  const { state, updateState, colorScheme, options } = useT3M4('root')
  const t = useTranslations('ThemeSwitch')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={!state} asChild>
        <Button variant='ghost' size='icon'>
          {!resolvedMode ? <Loader2 className='animate-spin' /> : <Icon mode={resolvedMode} />}
          <span className='sr-only'>{state ? t(`Mode.${state.mode}`) : t('loading')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => updateState({ mode: 'light' })}>
          <Icon mode='light' />
          <span>{t('Mode.light')}</span>
          {state?.mode === 'light' && <Check className='ml-auto' />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateState({ mode: 'dark' })}>
          <Icon mode='dark' />
          <span>{t('Mode.dark')}</span>
          {state?.mode === 'dark' && <Check className='ml-auto' />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateState({ mode: 'system' })}>
          <Icon mode='system' />
          <span>{t('Mode.system')}</span>
          {state?.mode === 'system' && <Check className='ml-auto' />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
