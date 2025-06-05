'use client'

import { useT3M4 } from '@/lib/T3M4'
import { GalleryHorizontal } from 'lucide-react'
import { Button } from './ui/Button'

export function LayoutSwitch() {
  const { updateState, state } = useT3M4('root')

  return (
    <Button variant='ghost' size='icon' disabled={!state.computed || !!state.forced?.facets?.layout} onClick={() => updateState({ facets: { layout: state.computed?.facets.layout === 'full' ? 'fixed' : 'full' } })}>
      <GalleryHorizontal />
    </Button>
  )
}
