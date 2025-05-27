'use client'

import { useT3M4 } from "@/lib/T3M4"

export function Moment() {
  const {state, forcedState} = useT3M4('root')

  return (
    <div>
      <pre>{JSON.stringify(state ?? 'no state retrieved')}</pre>
      <pre>{JSON.stringify(forcedState ?? 'no forced state retrieved')}</pre>
    </div>
  )
}