import fs from 'fs-extra'
import path from 'path'
import { PkgManager } from '../types'

function detectPackageManager(cwd: string): 'pnpm' | 'npm' | 'yarn' | 'bun' {
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm'
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn'
  if (fs.existsSync(path.join(cwd, 'bun.lockb'))) return 'bun'
  return 'npm'
}

export function isValidPackageRoot(cwd: string): PkgManager {
  const pkgManager = detectPackageManager(cwd)

  const isValidPackageRoot = fs.existsSync(path.join(cwd, 'package.json')) && pkgManager
  if (!isValidPackageRoot) throw new Error(`❌ Invalid package root: ${cwd}. Please run this command in a directory with a package.json and a lock file (pnpm-lock.yaml, yarn.lock, bun.lockb, or package-lock.json).`)

  return isValidPackageRoot
}
