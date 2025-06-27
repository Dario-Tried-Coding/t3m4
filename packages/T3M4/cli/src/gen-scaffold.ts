import fs from 'fs-extra'
import { Module } from './types'
import path from 'path'
import ejs from 'ejs'

export async function genScaffold({ entryDir, typesDir, cwd, module }: { cwd: string; entryDir: string; typesDir: string; module: Module }) {
  const scaffoldPath = path.join(cwd, 'node_modules', '@t3m4', module, 'dist', 'scaffold')
  const entryFilePath = path.join(entryDir, 'T3M4.tsx')
  const typesFilePath = path.join(typesDir, 'T3M4.d.ts')

  try {
    const relPathToEntryFile = './' + path.relative(typesDir, path.join(entryDir, 'T3M4')).replace(/\\/g, '/')

    const tsxOutput = await fs.readFile(path.join(scaffoldPath, 'T3M4.tsx.ejs'), 'utf-8')

    const dtsScaffold = await fs.readFile(path.join(scaffoldPath, 'T3M4.d.ts.ejs'), 'utf-8')
    const dtsOutput = ejs.render(dtsScaffold, {
      relPathToEntryFile,
      module,
    })

    await fs.ensureDir(entryDir)
    await fs.ensureDir(typesDir)

    await fs.writeFile(entryFilePath, tsxOutput)
    await fs.writeFile(typesFilePath, dtsOutput)

    return { entryFilePath, typesFilePath }
  } catch (err) {
    console.error(`❌ Failed to scaffold T3M4 files for module: ${module}`)
    console.error(err)
    throw err
  }
}
