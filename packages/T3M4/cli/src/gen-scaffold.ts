import fs from 'fs-extra'
import { Language, Module } from './types'
import path from 'path'
import ejs from 'ejs'

async function renderAndWrite(templatePath: string, outputPath: string, data: object) {
  const template = await fs.readFile(templatePath, 'utf-8')
  const output = ejs.render(template, data)
  await fs.ensureDir(path.dirname(outputPath))
  await fs.writeFile(outputPath, output)
}

export async function genScaffold({ module, lang }: { module: Module; lang: Language }) {
  const isDev = process.env.NODE_ENV === 'development'
  const cwd = process.cwd()

  const entryDir = path.join(cwd, 'src', 'lib')
  const typesDir = path.join(cwd, 'src', 'types')

  const scaffoldDir = isDev ? path.join(__dirname, '..', '..', module, 'public', 'scaffold') : path.join(cwd, 'node_modules', '@t3m4', module, 'dist', 'scaffold')

  try {
    const relPathToEntryFile = './' + path.relative(typesDir, path.join(entryDir, 'T3M4')).replace(/\\/g, '/')

    if (lang === 'typescript') {
      await renderAndWrite(path.join(scaffoldDir, 'T3M4.tsx.ejs'), path.join(entryDir, 'T3M4.tsx'), { module })
      await renderAndWrite(path.join(scaffoldDir, 'T3M4.d.ts.ejs'), path.join(typesDir, 'T3M4.d.ts'), { relPathToEntryFile, module })
    } else if (lang === 'javascript') {
      await renderAndWrite(path.join(scaffoldDir, 'T3M4.jsx.ejs'), path.join(entryDir, 'T3M4.jsx'), { module })
    }

    console.log(`✔ Scaffolded T3M4 files for module: ${module}`)
  } catch {
    throw new Error(`❗Failed to scaffold T3M4 files for module: ${module}`)
  }
}
