'use client'

import { useT3M4 } from "@/lib/T3M4"

export function Moment() {
  const { forced: { state } } = useT3M4('root')

  return <pre>{ JSON.stringify(state, null, 2)}</pre>
}