import { existsSync } from 'node:fs';
import { readFileSync, writeFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import { resolve } from 'node:path';
import { ExitPromptError } from '@inquirer/core';
import { input } from '@inquirer/prompts';
import dotenv from 'dotenv';
import { listProviders } from './providers';

export const getConfigPath = () => resolve(os.homedir(), '.aic.conf');

/**
 * Synchronously initializes the configuration file.
 * Returns true if config already existed, false if it was newly created.
 */
export function initConfig(configPath: string): boolean {
  if (!existsSync(configPath)) {
    const examplePath = resolve(__dirname, 'aic.conf.example');
    try {
      const exampleContent = readFileSync(examplePath, 'utf8');
      writeFileSync(configPath, exampleContent, { encoding: 'utf8' });
      console.log(
        `Initialized configuration file at ${configPath} using template ${examplePath}`,
      );
      return false;
    } catch (error) {
      console.error(`Failed to initialize config file: ${error}`);
      throw error;
    }
  }
  return true;
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
  try {
    for (const provider of providers) {
      for (const apiKeyName of provider.apiKeyNames) {
        const apiKey = await input({
          message: `Enter your ${apiKeyName} for ${provider.name} (${provider.website}):`,
          default: currentConfig[apiKeyName] || '',
        });
        currentConfig[apiKeyName] = apiKey;
      }
    }
  } catch (error) {
    if (!(error instanceof ExitPromptError)) {
      console.error(`Error configuring providers: ${error}`);
    }
    return;
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
