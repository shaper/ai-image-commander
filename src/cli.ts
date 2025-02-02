import { AssetStore } from './asset-store';
import { ImageEntry } from './image-entry';
import { ImageStore } from './image-store';
import { runImageGeneration } from './generate';
import { greetUser } from './welcome';
import { Command } from 'commander';
import 'dotenv/config';
import open from 'open';
import readline from 'readline';

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

const rl: readline.Interface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  let latestImageEntry = await greetUser(imageStore, assetStore);
  if (!latestImageEntry) {
    console.log('No image entry found. Exiting.');
    return;
  }
  rl.setPrompt('Enter an image prompt (or "exit", "open"): ');
  rl.prompt();

  for await (const input of rl) {
    switch (input.trim().toLowerCase()) {
      case 'exit':
        break;
      case 'open':
        if (latestImageEntry) {
          open(latestImageEntry.fullResolutionImagePath);
        }
        break;
      default:
        latestImageEntry = await runImageGeneration(imageStore, input);
    }
    rl.prompt();
  }

  console.log('May the wind fill your sails!');
  rl.close();
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
