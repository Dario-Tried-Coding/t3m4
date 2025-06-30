import { TSchema } from '@/lib/T3M4'
import { DataAttributes } from '@t3m4/next/types'

import 'react'

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface HTMLAttributes extends DataAttributes<TSchema> {}
}
