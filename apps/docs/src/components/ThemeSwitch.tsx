'use client'

import { useT3M4 } from '@/lib/T3M4'
import { FC } from 'react'

interface Props {}
export const ThemeSwitch: FC<Props> = ({}) => {
  const { updateState, state, options } = useT3M4()

  return (
    <div>
      <hr />
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <hr />
      <button onClick={() => updateState('mode', (prev) => (prev === 'custom-dark' ? 'custom-light' : 'custom-dark'))}>mode</button>
      <button onClick={() => updateState('color', (prev) => (prev === 'zinc' ? 'blue' : 'zinc'))}>color</button>
    </div>
  )
}
