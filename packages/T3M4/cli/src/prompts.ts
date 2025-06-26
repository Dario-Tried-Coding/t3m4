import inquirer from 'inquirer'
import path from 'path'

export async function getPrompts() {
  const { root }: { root: string } = await inquirer.prompt([
    {
      type: 'input',
      name: 'root',
      message: 'Where is the root of your project?',
      default: '.',
    },
  ])
  const cwd = path.resolve(process.cwd(), root)

  const { module }: { module: 'core' | 'react' | 'next' } = await inquirer.prompt([
    {
      type: 'select',
      name: 'module',
      message: 'Which T3M4 module whould you like to use?',
      choices: [
        { value: 'core', name: 'Core', disabled: true },
        { value: 'react', name: 'React' },
        { value: 'next', name: 'Next' },
      ],
    },
  ])

  const { entry }: { entry: string } = await inquirer.prompt([
    {
      type: 'input',
      name: 'entry',
      message: 'Where should we generate your T3M4 entry file?',
      default: './lib',
    },
  ])
  const entryDir = path.resolve(cwd, entry)

  const { types }: { types: string } = await inquirer.prompt([
    {
      type: 'input',
      name: 'types',
      message: 'Where should we generate your T3M4 declaration types file?',
      default: './types',
    },
  ])
  const typesDir = path.resolve(cwd, types)

  return { cwd, module, entryDir, typesDir };
}