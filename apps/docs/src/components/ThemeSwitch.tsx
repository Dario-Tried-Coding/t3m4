'use client'

import { useT3M4 } from '@/lib/T3M4'
import { FC } from 'react'

interface Props {}
export const ThemeSwitch: FC<Props> = ({}) => {
  const { updateState } = useT3M4()

  return (
    <div>
      <button onClick={() => updateState('mode', (prev) => (prev === 'light' ? 'dark' : 'light'))}>mode</button>
      <button onClick={() => updateState('color', (prev) => (prev === 'zinc' ? 'blue' : 'zinc'))}>color</button>
    </div>
  )
}
