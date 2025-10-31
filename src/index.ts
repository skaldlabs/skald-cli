#!/usr/bin/env node

import { Command } from 'commander';
import { authCommand } from './commands/auth';
import { memoCommand } from './commands/memo';
import { chatCommand } from './commands/chat';

const program = new Command();

program
  .name('skald')
  .description('Skald CLI')
  .version('0.1.3');

// Register commands
program.addCommand(authCommand);
program.addCommand(memoCommand);
program.addCommand(chatCommand);

program.parse(process.argv);
