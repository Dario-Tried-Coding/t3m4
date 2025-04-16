'use client'

import { useT3M4 } from "@/lib/T3M4"

export function Moment() {
  const { state, updateState, colorScheme, options } = useT3M4('root')
  
  return <div>
    <pre>{JSON.stringify(state, null, 2)}</pre>
    <hr />
    <pre>{colorScheme}</pre>
    <hr />
    <pre>{JSON.stringify(options, null, 2)}</pre>
  </div>
}