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
export async function runConfigWizard(
  configPath: string,
  importFrom?: string,
): Promise<void> {
  // Load existing config using the helper.
  let currentConfig: Record<string, string> =
    await loadExistingConfig(configPath);

  // If an import file is provided, use the helper to load and merge its filtered settings.
  if (importFrom) {
    const filteredImportedConfig = await importConfigFromFile(importFrom);
    currentConfig = { ...currentConfig, ...filteredImportedConfig };
  }

  // Prompt for API keys for each provider.
  currentConfig = await promptForApiKeys(currentConfig);

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

/**
 * Load an existing configuration from file if it exists, otherwise returns an empty object.
 * @param configPath - The file path of the configuration.
 * @returns The parsed configuration or an empty object if the file doesn't exist or fails to parse.
 */
async function loadExistingConfig(
  configPath: string,
): Promise<Record<string, string>> {
  if (existsSync(configPath)) {
    try {
      const fileContent = await readFile(configPath, 'utf8');
      const parsed = dotenv.parse(fileContent);
      console.log(`Loaded existing configuration from ${configPath}`);
      return parsed;
    } catch (error) {
      console.error(
        `Error reading existing configuration, starting fresh. Error: ${error}`,
      );
      return {};
    }
  } else {
    console.log(
      `No existing configuration found. Creating new configuration at ${configPath}`,
    );
    return {};
  }
}

/**
 * Import and filter configuration from an existing file (e.g. .env).
 * Only keys that are part of our known set (providers' keys) will be imported.
 *
 * @param importFrom - The file path to import config from.
 * @returns A promise resolving to a filtered configuration object.
 */
async function importConfigFromFile(
  importFrom: string,
): Promise<Record<string, string>> {
  if (!existsSync(importFrom)) {
    console.warn(`Import file ${importFrom} does not exist.`);
    return {};
  }

  try {
    const importedContent = await readFile(importFrom, 'utf8');
    const importedConfig = dotenv.parse(importedContent);
    console.log(`Imported configuration from ${importFrom}`);

    // Get the set of known keys from our providers.
    const providers = listProviders();
    const knownKeys = new Set(
      providers.flatMap((provider) => provider.apiKeyNames),
    );

    // Filter the imported configuration to only include keys in the known set.
    return Object.keys(importedConfig)
      .filter((key) => knownKeys.has(key))
      .reduce(
        (acc, key) => {
          acc[key] = importedConfig[key];
          return acc;
        },
        {} as Record<string, string>,
      );
  } catch (error) {
    console.error(`Error importing config from ${importFrom}: ${error}`);
    return {};
  }
}

async function promptForApiKeys(
  currentConfig: Record<string, string>,
): Promise<Record<string, string>> {
  const providers = listProviders();
  for (const provider of providers) {
    for (const apiKeyName of provider.apiKeyNames) {
      const apiKey = await input({
        message: `Enter your ${apiKeyName} for ${provider.name} (${provider.website}):`,
        default: currentConfig[apiKeyName] || '',
      });
      currentConfig[apiKeyName] = apiKey;
    }
  }
  return currentConfig;
}
