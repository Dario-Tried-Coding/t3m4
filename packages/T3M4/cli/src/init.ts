import { genScaffold } from './gen-scaffold'
import { installDeps } from './install-deps'
import { getPrompts } from './prompts'
import { validateOpts } from './validate-opts'
import { verifyEnv } from './verify-env'

export interface Opts {  
  module?: string
}
export async function init(opts: Opts) {
  try {
    const validOpts = validateOpts(opts)

    const env = verifyEnv()
    const prompts = await getPrompts(validOpts)

    const args = { ...env, ...prompts }

    await installDeps(args)
    await genScaffold(args)
  } catch (error) {
    console.error('❌ Initialization failed...')
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
