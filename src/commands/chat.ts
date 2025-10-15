import { Command } from 'commander';
import { requireAuth } from '../utils/config';
import { Skald } from '@skald-labs/skald-node';

export const chatCommand = new Command('chat')
  .description('Chat with your knowledge base');

chatCommand
  .command('ask')
  .description('Ask a question to your knowledge base')
  .argument('<question>', 'The question to ask')
  .action(async (question) => {
    // Check authentication first
    const apiKey = requireAuth('skald chat ask');
    const skald = new Skald(apiKey);

    try {
      console.log('🤔 Thinking...\n');

      const stream = skald.streamedChat({
        query: question
      });

      for await (const event of stream) {
        if (event.type === 'token') {
          // Write each token as it arrives
          if (event.content) {
            process.stdout.write(event.content);
          }
        } else if (event.type === 'done') {
          console.log('\n\n✅ Done!');
        }
      }

    } catch (error) {
      console.error('❌ Error chatting:', error);
      process.exit(1);
    }
  });
