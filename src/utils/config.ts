import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface SkaldConfig {
  apiKey: string;
  updatedAt: string;
}

export function getConfigPath(): string {
  const configDir = path.join(os.homedir(), '.skald');
  return path.join(configDir, 'config');
}

export function getConfig(): SkaldConfig | null {
  const configPath = getConfigPath();
  
  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading config:', error);
    return null;
  }
}

export function requireAuth(commandName?: string): string {
  const config = getConfig();
  
  if (!config || !config.apiKey) {
    const message = commandName 
      ? `❌ Authentication required. Please run "skald auth" before running "${commandName}".`
      : '❌ No API key found. Please run "skald auth" first.';
    console.error(message);
    process.exit(1);
  }

  return config.apiKey;
}

