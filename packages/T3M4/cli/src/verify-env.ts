import path from 'path'
import fs from 'fs'
import { Language, PkgManager } from './types'

function detectPackageJson() {
  const cwd = process.cwd()

  const packagePath = path.join(cwd, 'package.json')

  const packageExists = fs.existsSync(packagePath)
  if (!packageExists) throw new Error(`No package.json found in the current directory: ${cwd}. Please run this command in the root of your project.`)

  try {
    const content = fs.readFileSync(packagePath, 'utf-8')
    const parsed = JSON.parse(content)
    console.log('✔ Preflight checks passed')
    return parsed
  } catch {
    throw new Error(`❗Failed to find package.json in the current directory. Please run this command in the root of your project.`)
  }
}

function detectLang(packageJson: any): Language {
  const cwd = process.cwd()

  const hasTsConfig = fs.existsSync(path.join(cwd, 'tsconfig.json'))

  let usesTypeScript = false
  let usesJavaScript = false

  const checkFiles = (dir: string) => {
    const files = fs.readdirSync(dir, { withFileTypes: true })
    for (const file of files) {
      const fullPath = path.join(dir, file.name)

      if (file.isDirectory()) {
        if (file.name === 'node_modules' || file.name.startsWith('.')) continue
        checkFiles(fullPath)
      } else {
        if (file.name.endsWith('.ts') && !file.name.endsWith('.d.ts')) usesTypeScript = true
        if (file.name.endsWith('.js')) usesJavaScript = true
      }
    }
  }

  checkFiles(cwd)

  let hasTsDep = false

  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
  if (deps.typescript) hasTsDep = true

  if (hasTsConfig || usesTypeScript || hasTsDep) {
    console.log('✔ Detecting language. Detected: Typescript')
    return 'typescript'
  }
  if (usesJavaScript) {
    console.log('✔ Detecting language. Detected: Javascript')
    return 'javascript'
  }
  throw new Error(`❗Failed to detect the language used in the project. Please ensure you have either TypeScript or JavaScript files in your project.`)
}

function detectPackageManager(): PkgManager {
  let dir = process.cwd()

  while (true) {
    const lockPaths = {
      pnpm: path.join(dir, 'pnpm-lock.yaml'),
      yarn: path.join(dir, 'yarn.lock'),
      bun: path.join(dir, 'bun.lockb'),
      npm: path.join(dir, 'package-lock.json'),
    }

    for (const [pkgManager, lockFile] of Object.entries(lockPaths)) {
      if (fs.existsSync(lockFile)) {
        console.log(`✔ Detecting package manager. Detected: ${pkgManager}`)
        return pkgManager as PkgManager
      }
    }

    const parent = path.dirname(dir)
    if (parent === dir) break // reached root
    dir = parent
  }

  throw new Error('❗Unable to detect package manager. Please ensure a lock file (pnpm-lock.yaml, yarn.lock, bun.lockb, or package-lock.json) exists in the project root.')
}

export function verifyEnv() {
  const packageJson = detectPackageJson()
  const lang = detectLang(packageJson)
  const pkgManager = detectPackageManager()

  return { lang, pkgManager }
}
