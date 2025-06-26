import { genScaffold } from './gen-scaffold'
import { detectPackageManager } from './helpers/detectPkgManager'
import { installDeps } from './install-deps'
import { getPrompts } from './prompts'

export async function init() {
  const prompts = await getPrompts()

  const pkgManager = detectPackageManager(prompts.cwd)

  await installDeps({ ...prompts, pkgManager })
  await genScaffold(prompts)
}
