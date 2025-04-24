'use client'

import { useT3M4 } from '@/lib/T3M4'

export function Moment() {
  const { state, updateState, colorScheme, options } = useT3M4('test')

  return (
    <div data-island='test' suppressHydrationWarning className='text-foreground bg-background'>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <hr />
      <pre>{colorScheme}</pre>
      <hr />
      <pre>{JSON.stringify(options, null, 2)}</pre>
    </div>
  )
}
