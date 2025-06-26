import fs from 'fs-extra'
import path from 'path'

export function detectPackageManager(cwd: string): 'pnpm' | 'npm' | 'yarn' | 'bun' {
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm'
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn'
  if (fs.existsSync(path.join(cwd, 'bun.lockb'))) return 'bun'
  return 'npm'
}
