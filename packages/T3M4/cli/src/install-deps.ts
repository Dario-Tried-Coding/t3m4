import {execa} from 'execa'
import ora from 'ora'
import { Module, PkgManager } from './types'

export async function installDeps({ pkgManager, module, cwd }:{pkgManager: PkgManager, module: Module, cwd: string}) {
  const pkgName = `@t3m4/${module}`
  const spinner = ora(`Installing ${pkgName} with ${pkgManager}...`).start()

  const installArgs = {
    npm: ['install', pkgName],
    pnpm: ['add', pkgName],
    yarn: ['add', pkgName],
    bun: ['add', pkgName],
  }

  try {
    await execa(pkgManager, installArgs[pkgManager], {
      cwd,
      stdio: 'inherit'
    })
    spinner.succeed('Successfully installed dependencies')
  } catch (error) {
    spinner.fail('Failed to install dependencies')
    console.error(`Error installing ${pkgName}:`, error)
    process.exit(1)
  }
}