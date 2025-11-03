import { Command } from 'commander';
import { requireAuth } from '../utils/config';
import { Skald } from '@skald-labs/skald-node';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import prompts from 'prompts';

export const memoCommand = new Command('memo')
  .description('Memo management commands');

memoCommand
  .command('add')
  .description('Add a new memo from a file')
  .requiredOption('-t, --title <title>', 'Title of the memo')
  .requiredOption('-f, --file-path <path>', 'Path to the file containing memo content')
  .option('--tags <tags>', 'Comma-separated tags for the memo')
  .option('--source <source>', 'Source of the memo (e.g., "cli", "notion")', 'cli')
  .option('--reference-id <id>', 'External reference ID for the memo')
  .action(async (options) => {
    // Check authentication first
    const apiKey = requireAuth('skald memo add');
    const skald = new Skald(apiKey);

    try {
      // Check if file exists
      if (!fs.existsSync(options.filePath)) {
        console.error(`❌ File not found: ${options.filePath}`);
        process.exit(1);
      }

      // Read file content
      const content = fs.readFileSync(options.filePath, 'utf-8');

      if (!content.trim()) {
        console.error(`❌ File is empty: ${options.filePath}`);
        process.exit(1);
      }

      // Parse tags if provided
      const tags = options.tags ? options.tags.split(',').map((tag: string) => tag.trim()) : [];

      // Create metadata
      const metadata = {
        source: options.source,
        file_path: path.resolve(options.filePath),
        created_via: 'skald-cli'
      };

      console.log(`📝 Creating memo: "${options.title}"`);
      console.log(`📁 From file: ${options.filePath}`);
      if (tags.length > 0) {
        console.log(`🏷️  Tags: ${tags.join(', ')}`);
      }
      // Create the memo
      const result = await skald.createMemo({
        title: options.title,
        content: content,
        metadata: metadata,
        reference_id: options.referenceId,
        tags: tags,
        source: options.source
      });

      if (result.memo_uuid) {
        console.log(`✅ Memo created successfully! UUID: ${result.memo_uuid}`);
      } else {
        console.error('❌ Failed to create memo:', result);
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Error creating memo:', error);
      process.exit(1);
    }
  });

memoCommand
  .command('write')
  .description('Write a new memo using vi editor')
  .option('--tags <tags>', 'Comma-separated tags for the memo')
  .option('--source <source>', 'Source of the memo (e.g., "cli", "notion")', 'cli')
  .option('--reference-id <id>', 'External reference ID for the memo')
  .action(async (options) => {
    // Check authentication first
    const apiKey = requireAuth('skald memo write');
    const skald = new Skald(apiKey);

    try {
      // Check if vi is available
      const { execSync } = require('child_process');
      try {
        execSync('which vi', { stdio: 'ignore' });
      } catch (error) {
        console.error('❌ vi editor not found. Please install vi or vim to use this command.');
        console.error('💡 Alternative: Use "skald memo add" with a file instead.');
        process.exit(1);
      }

      // Create a temporary file for editing
      const tempDir = require('os').tmpdir();
      const tempFile = path.join(tempDir, `skald-memo-${Date.now()}.md`);
      
      // Create empty file
      fs.writeFileSync(tempFile, '');

      console.log('📝 Opening vi editor...');
      console.log('💡 Write your memo content and save with :wq to continue');
      console.log('💡 If you want to cancel, use :q! to quit without saving');

      // Open vi editor
      await new Promise<void>((resolve, reject) => {
        const vi = spawn('vi', [tempFile], {
          stdio: 'inherit'
        });

        vi.on('close', (code) => {
          // vi can exit with various codes, not just 0 for success
          // Code 1 often means the user saved and quit normally
          if (code === 0 || code === 1) {
            resolve();
          } else {
            reject(new Error(`vi exited with code ${code}`));
          }
        });

        vi.on('error', (error) => {
          reject(error);
        });
      });

      // Read the content from the temporary file
      let content: string;
      try {
        content = fs.readFileSync(tempFile, 'utf-8');
      } catch (error) {
        console.error('❌ Error reading temporary file:', error);
        return;
      } finally {
        // Clean up temporary file
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
        } catch (error) {
          console.warn('⚠️  Warning: Could not clean up temporary file:', tempFile);
        }
      }

      if (!content.trim()) {
        console.error('❌ No content written. Memo creation cancelled.');
        return;
      }

      // Prompt for title
      const response = await prompts({
        type: 'text',
        name: 'title',
        message: 'Enter memo title:',
        validate: (value: string) => value.length > 0 ? true : 'Title cannot be empty'
      });

      if (!response.title) {
        console.log('❌ Memo creation cancelled.');
        return;
      }

      // Parse tags if provided
      const tags = options.tags ? options.tags.split(',').map((tag: string) => tag.trim()) : [];

      // Create metadata
      const metadata = {
        source: options.source,
        created_via: 'skald-cli-write',
        editor: 'vi'
      };

      console.log(`📝 Creating memo: "${response.title}"`);
      if (tags.length > 0) {
        console.log(`🏷️  Tags: ${tags.join(', ')}`);
      }

      // Create the memo
      const result = await skald.createMemo({
        title: response.title,
        content: content,
        metadata: metadata,
        reference_id: options.referenceId,
        tags: tags,
        source: options.source
      });

      if (result.memo_uuid) {
        console.log('✅ Memo created successfully!');
      } else {
        console.error('❌ Failed to create memo:', result);
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Error creating memo:', error);
      process.exit(1);
    }
  });
