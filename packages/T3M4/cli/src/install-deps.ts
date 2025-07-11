import { execa } from 'execa'
import { Module, PkgManager } from './types'

export async function installDeps({ pkgManager, module }:{pkgManager: PkgManager, module: Module}) {
  const cwd = process.cwd()
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