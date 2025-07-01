import inquirer from 'inquirer'
import { Module } from './types'

interface Opts {
  module: Module
}

export async function getPrompts(opts: Opts | undefined) {
  const module =
    opts?.module ??
    (
      (await inquirer.prompt([
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
      ])) as { module: Module }
    ).module

  return { module }
}
