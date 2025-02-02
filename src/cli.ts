import { AssetStore } from './asset-store';
import { ImageStore } from './image-store';
import { runImageGeneration } from './generate';
import { greetUser } from './welcome';
import { Command } from 'commander';
import 'dotenv/config';
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
  await greetUser(imageStore, assetStore);
  rl.setPrompt('Enter an image prompt (or "exit" to quit): ');
  rl.prompt();
  for await (const input of rl) {
    if (input.trim().toLowerCase() === 'exit') {
      break;
    }
    await runImageGeneration(imageStore, input);
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
