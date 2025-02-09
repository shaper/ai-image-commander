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
import { listProviders } from './providers';
import { showNextImage } from './welcome';

const configPath = resolve(process.env.HOME || '', '.aic.conf');
config({ path: configPath });

const program = new Command()
  .name('aic')
  .version('0.0.1')
  .description('A CLI tool for generating AI images')
  .option(
    '-d, --dir <directory>',
    'Directory where images are stored',
    'saved-images',
  );

const options = program.opts();
const saveDir: string = options.dir || '';

const imageStore = new ImageStore(saveDir);

async function main() {
  let latestImageEntry: ImageEntry | undefined;
  let running = true;
  let lastCommand = '';
  while (running) {
    let prompt = '';
    try {
      prompt = await input({ message: 'Enter a prompt' });
    } catch (err) {
      if (err instanceof ExitPromptError) {
        running = false;
        continue;
      }
    }
    const command = prompt.trim().toLowerCase() || lastCommand;
    switch (command) {
      case 'e':
      case 'exit':
        running = false;
        break;
      case 'n':
      case 'next':
        console.log('Showing next image...');
        latestImageEntry = await showNextImage(imageStore);
        break;
      case 'o':
      case 'open':
        if (latestImageEntry) {
          open(latestImageEntry.imagePath);
        }
        break;
      default: {
        const chosenProvider = await select({
          message: 'Select an image provider',
          choices: listProviders().map((provider) => ({
            name: provider.name,
            value: provider,
            description: 'The provider to use for image generation',
          })),
        });
        const chosenModel = await select({
          message: 'Select an image model',
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
