import { genScaffold } from './gen-scaffold'
import { isValidPackageRoot } from './helpers/pkgManagers'
import { installDeps } from './install-deps'
import { getPrompts } from './prompts'

export async function init() {
  try {
    const prompts = await getPrompts()
    const pkgManager = isValidPackageRoot(prompts.cwd)
  
    await installDeps({ ...prompts, pkgManager })
    await genScaffold(prompts)
  } catch (error) {
    console.error('❌ Initialization failed:', error)
    process.exit(1)
  }

}
