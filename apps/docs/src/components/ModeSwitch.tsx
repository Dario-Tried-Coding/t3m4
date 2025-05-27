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
  const { base, forced, computed, values } = useT3M4('root')
  const t = useTranslations('ThemeSwitch')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={!computed.state || !!forced.state} asChild>
        <Button variant='ghost' size='icon'>
          {!computed.colorScheme ? <Loader2 className='animate-spin' /> : <Icon mode={computed.colorScheme} />}
          <span className='sr-only'>{computed.state ? t(`Mode.${computed.state.mode}`) : t('loading')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {values?.mode.map((m) => (
          <DropdownMenuItem onClick={() => base.updateState({ mode: m })} key={m}>
            <Icon mode={m} />
            <span>{t(`Mode.${m}`)}</span>
            {base.state?.mode === m && <Check className='ml-auto' />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
