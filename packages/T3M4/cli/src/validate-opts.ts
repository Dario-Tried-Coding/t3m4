import { MODULES } from './constants'
import { Opts } from './init'
import { z } from 'zod/v4'

const schema = z.object({
  module: z.enum(MODULES),
})

export function validateOpts(opts: Opts) {
  const result = schema.safeParse(opts)
  if (opts.module && result.error?.issues.filter(i => i.path[0] === 'module')) throw new Error("❗Unavailable module. You'll be prompted to choose one again.")
  return result.data
}
