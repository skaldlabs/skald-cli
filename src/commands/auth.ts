import { Command } from 'commander';
import prompts from 'prompts';
import * as fs from 'fs';
import * as path from 'path';
import { getConfigPath } from '../utils/config';

export const authCommand = new Command('auth')
  .description('Authenticate with your Skald project API key');

authCommand
  .action(async () => {
    try {
      const response = await prompts({
        type: 'password',
        name: 'apiKey',
        message: 'Enter your project API key:',
        validate: (value: string) => value.length > 0 ? true : 'API key cannot be empty'
      });

      if (!response.apiKey) {
        console.log('❌ Authentication cancelled.');
        return;
      }

      const configPath = getConfigPath();
      const configDir = path.dirname(configPath);

      // Create directory if it doesn't exist
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      // Store the API key
      const config = {
        apiKey: response.apiKey,
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      console.log('✅ API key saved successfully!');
      console.log(`📁 Config location: ${configPath}`);
    } catch (error) {
      console.error('❌ Error saving API key:', error);
      process.exit(1);
    }
  });

