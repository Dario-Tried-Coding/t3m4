import { cn } from '@/lib/utils'
import { useFormatter, useTranslations } from 'next-intl'
import { ComponentProps } from 'react'

export function LastUpdated({ date, ...props }: Omit<ComponentProps<'p'>, 'children'> & { date: Date | string }) {
  const t = useTranslations('docs')
  const format = useFormatter()
  const dateTime = typeof date === 'string' ? new Date(date) : date

  const lastUpdated = format.dateTime(dateTime, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <p {...props} className={cn('text-fd-muted-foreground text-sm', props.className)}>
      {t('last-updated', { date: lastUpdated })}
    </p>
  )
}
