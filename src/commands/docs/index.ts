import { Command } from 'commander';
import { requireAuth } from '../../utils/config';
import { Skald } from '@skald-labs/skald-node';
import { generateDocs } from './generate';
import { initDocs } from './init';

export const docsCommand = new Command('docs')
  .description('Generate documentation from your knowledge base');

docsCommand
  .command('generate')
  .description('Generate documentation')
  .option('-c, --config-path <path>', 'Path to configuration file', process.cwd())
  .option('-o, --output-path <path>', 'Path to output directory', process.cwd())
  .action(async (options) => {
    const apiKey = requireAuth('skald docs generate');
    const skald = new Skald(apiKey);
    await generateDocs(skald, options.configPath, options.outputPath);
  });

docsCommand
  .command('init')
  .description('Initialize documentation structure with example outline.yml')
  .option('-c, --config-path <path>', 'Path to configuration directory', process.cwd())
  .action((options) => {
    initDocs(options.configPath);
  });

