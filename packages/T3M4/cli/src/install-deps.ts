import { execa } from 'execa'
import { Module, PkgManager } from './types'

export async function installDeps({ pkgManager, module, cwd }:{pkgManager: PkgManager, module: Module, cwd: string}) {
  const pkgName = `@t3m4/${module}`

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
  } catch (error) {
    throw error
  }
}