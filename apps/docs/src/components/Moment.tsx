'use client'

import { useT3M4 } from '@/lib/T3M4'
import { useState } from 'react'

export function Moment() {
  const { state, updateState, colorScheme, values } = useT3M4('root')
  const [show, setShow] = useState(false)

  return (
    <div>
      <button onClick={() => setShow(!show)}>{show ? 'hide' : 'show'}</button>
      <div suppressHydrationWarning data-island='switch'>
        <pre>{JSON.stringify(state, null, 2)}</pre>
        <hr />
        <pre>colorScheme: {JSON.stringify(colorScheme, null, 2)}</pre>
        <hr />
        <pre>{JSON.stringify(values, null, 2)}</pre>
        <hr />
        <button onClick={() => updateState.base(({ mode }) => ({ mode: mode === 'custom1' ? 'custom2' : 'custom1' }))}>mode: {state.base?.mode}</button>
      </div>
      {show && <div data-force-root-facet-color='red' />}
    </div>
  )
}
