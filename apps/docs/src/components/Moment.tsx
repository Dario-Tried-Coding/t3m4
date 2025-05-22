'use client'

import { useT3M4 } from '@/lib/T3M4'

export function Moment() {
  const { state, updateState, colorScheme, values } = useT3M4('root')

  return (
    <div>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <hr />
      <pre>colorScheme: {JSON.stringify(colorScheme, null, 2)}</pre>
      <hr />
      <pre>{JSON.stringify(values, null, 2)}</pre>
      <hr />
      <button onClick={() => updateState.base(({ mode }) => ({ mode: mode === 'custom-light' ? 'dark' : 'custom-light' }))}>mode: {state.base?.mode}</button>
    </div>
  )
}
