import { AssetStore } from './asset-store';
import { ImageStore } from './image-store';
import { runImageGeneration } from './generate';
import { showNextImage } from './welcome';
import { Command } from 'commander';
import { input } from '@inquirer/prompts';
import 'dotenv/config';
import open from 'open';
import { select } from '@inquirer/prompts';
import { listProviders } from './providers';
const program = new Command();

program
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
const assetStore = new AssetStore();

async function main() {
  console.log('Welcome to AI Image Commander!');
  console.log("Look at the incredible work you've been doing, my friend.");
  let latestImageEntry = await showNextImage(imageStore, assetStore);

  let running = true;
  let lastCommand = '';
  while (running) {
    const prompt = await input({ message: 'Enter an image prompt (or "exit", "next", "open") ' });
    const command = prompt.trim().toLowerCase() || lastCommand;
    switch (command) {
      case 'e':
      case 'exit':
        running = false;
        break;
      case 'n':
      case 'next':
        latestImageEntry = await showNextImage(imageStore, assetStore);
        break;
      case 'o':
      case 'open':
        if (latestImageEntry) {
          open(latestImageEntry.fullResolutionImagePath);
        }
        break;
      default:
        const chosenProvider = await select({
          message: 'Select an image provider',
          choices: listProviders().map(provider => ({
            name: provider.name,
            value: provider,
            description: 'The provider to use for image generation',
          })),
        });
        const chosenModel = await select({
          message: 'Select an image model',
          choices: chosenProvider.models.map(model => ({
            name: model,
            value: model,
          })),
        });
        latestImageEntry = await runImageGeneration(imageStore, prompt, chosenProvider.provider, chosenModel);
    }
    lastCommand = command;
  }
  console.log('May the wind fill your sails!');
}

program.action(async () => {
  try {
    await main();
  } catch (err) {
    console.error('Error in main:', err);
    process.exit(1);
  }
});

program.parseAsync(process.argv).catch(err => {
  console.error('Failed to run the application:', err);
});
