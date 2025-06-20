'use client'

import { useT3M4 } from '@/lib/T3M4'
import { GalleryHorizontal } from 'lucide-react'
import { Button } from './ui/Button'
import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function LayoutSwitch({ className, ...rest }: Omit<HTMLAttributes<HTMLButtonElement>, 'children'>) {
  const { setState, state } = useT3M4('root')

  return (
    <Button
      variant='ghost'
      size='icon'
      disabled={!state.computed || !!state.forced?.facets?.layout}
      onClick={() => setState({ facets: { layout: state.computed?.facets.layout === 'full' ? 'fixed' : 'full' } })}
      className={cn('', className)}
      {...rest}
    >
      <GalleryHorizontal />
    </Button>
  )
}
