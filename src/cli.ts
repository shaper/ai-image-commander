import { resolve } from 'node:path';
import { ExitPromptError } from '@inquirer/core';
import { input } from '@inquirer/prompts';
import { select } from '@inquirer/prompts';
import { Command } from 'commander';
import { config } from 'dotenv';
import open from 'open';
import { runImageGeneration } from './generate';
import type { ImageEntry } from './image-entry';
import { ImageStore } from './image-store';
import { hasApiKey, listProviders } from './providers';
import { showNextImage } from './welcome';
import { getConfigPath, initConfig, runConfigWizard } from './config';

const configPath = getConfigPath();
initConfig(configPath);
config({ path: configPath });

const DEFAULT_SAVE_DIR = 'saved-images';
const program = new Command()
  .name('aic')
  .version('0.0.1')
  .description('A CLI tool for generating AI images')
  .option(
    '-d, --dir <directory>',
    'Directory where images are stored',
    DEFAULT_SAVE_DIR,
  );

program
  .command('config')
  .description('View or update your configuration settings')
  .action(async () => {
    console.log('Launching the configuration wizard...');
    await runConfigWizard(configPath);
  });

const options = program.opts();
const saveDir: string = options.dir || DEFAULT_SAVE_DIR;

const imageStore = new ImageStore(saveDir);

function printHelp() {
  console.log('\nMenu Options:');
  console.log(
    '  - [prompt text] : Generate an AI image with the given prompt.',
  );
  console.log("  - 'next' or 'n' : Show next image in the store.");
  console.log("  - 'open' or 'o' : Open the last generated image.");
  console.log("  - 'help', 'h' or '?' : Show this help message.");
  console.log("  - 'exit' or 'e' : Exit the application.");
  console.log('');
}

async function main() {
  let latestImageEntry: ImageEntry | undefined;
  let running = true;
  let lastCommand = '';
  let lastPrompt = '';
  printHelp();

  while (running) {
    try {
      let prompt = '';
      prompt = await input({
        message: 'Enter a prompt',
        default: lastPrompt.trim() || undefined,
      });
      const command = prompt.trim().toLowerCase() || lastCommand;
      switch (command) {
        case 'e':
        case 'exit':
          running = false;
          break;
        case 'n':
        case 'next':
          latestImageEntry = await showNextImage(imageStore);
          break;
        case 'o':
        case 'open':
          if (latestImageEntry) {
            open(latestImageEntry.imagePath);
          }
          break;
        case 'help':
        case 'h':
        case '?':
          printHelp();
          break;
        default: {
          lastPrompt = prompt;
          const chosenProvider = await select({
            message: 'Choose a provider',
            choices: listProviders().map((provider) => ({
              name: provider.name,
              value: provider,
              description: 'The provider to use for image generation',
              disabled: !hasApiKey(provider) ? '🔒 No API key set' : false,
            })),
          });
          const chosenModel = await select({
            message: 'Choose an image model',
            choices: chosenProvider.models.map((model) => ({
              name: model,
              value: model,
            })),
          });
          latestImageEntry = await runImageGeneration(
            imageStore,
            prompt,
            chosenProvider.provider,
            chosenModel,
          );
        }
      }
      lastCommand = command;
    } catch (err) {
      if (err instanceof ExitPromptError) {
        running = false;
      }
    }
  }
}

program.action(async () => {
  try {
    await main();
  } catch (err) {
    console.error('Error in main:', err);
    process.exit(1);
  }
});

program.parseAsync(process.argv).catch((err) => {
  console.error('Failed to run the application:', err);
});
