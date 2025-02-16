import { input } from '@inquirer/prompts';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import os from 'node:os';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'node:fs';
import { listProviders } from './providers';

export const getConfigPath = () => resolve(os.homedir(), '.aic.conf');

/**
 * Synchronously initializes the configuration file.
 *
 * If the config file (~/.aic.conf) doesn’t exist, this function will
 * copy the contents of aic.conf.example (assumed to be in the repo root)
 * to the target location.
 */
export function initConfig(configPath: string): void {
  if (!existsSync(configPath)) {
    const examplePath = resolve(__dirname, 'aic.conf.example');
    try {
      const exampleContent = readFileSync(examplePath, 'utf8');
      writeFileSync(configPath, exampleContent, { encoding: 'utf8' });
      console.log(
        `Initialized configuration file at ${configPath} using template ${examplePath}`,
      );
    } catch (error) {
      console.error(`Failed to initialize config file: ${error}`);
    }
  }
}
/**
 * Runs an interactive configuration wizard.
 * It loads an existing config (if available), prompts for missing values,
 * and saves the configuration to ~/.aic.conf.
 */
export async function runConfigWizard(configPath: string): Promise<void> {
  let currentConfig: Record<string, string> = {};

  // Check if the config file already exists and load it if so.
  if (existsSync(configPath)) {
    try {
      const fileContent = await readFile(configPath, 'utf8');
      currentConfig = dotenv.parse(fileContent);
      console.log(`Loaded existing configuration from ${configPath}`);
    } catch (error) {
      console.error(
        `Error reading existing configuration, starting fresh. Error: ${error}`,
      );
    }
  } else {
    console.log(
      `No existing configuration found. Creating new configuration at ${configPath}`,
    );
  }

  // Prompt for API keys for each provider.
  const providers = listProviders();
  for (const provider of providers) {
    for (const apiKeyName of provider.apiKeyNames) {
      const apiKey = await input({
        message: `Enter your ${apiKeyName} for ${provider.name}:`,
        default: currentConfig[apiKeyName] || '',
      });
      currentConfig[apiKeyName] = apiKey;
    }
  }

  // Build the content in dotenv format.
  const newConfigContent = Object.entries(currentConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  try {
    await writeFile(configPath, newConfigContent, { encoding: 'utf8' });
    console.log(`Configuration saved successfully to ${configPath}`);
  } catch (error) {
    console.error(`Error saving configuration: ${error}`);
  }
}
