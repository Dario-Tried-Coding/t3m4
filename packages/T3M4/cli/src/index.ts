#!/usr/bin/env node

import { Command } from 'commander'
import pck from '../package.json'
import { init } from './init'

const program = new Command()

program.name('t3m4').description('T3M4 CLI - Get up and running fast with T3M4').version(pck.version)

program.command('init [directory]').description('Scaffold the esential boilerplate needed to start using T3M4 in your project in a matter of seconds.').action(init)

program.parse()
