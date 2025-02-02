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

function promptUser(): void {
  rl.question(
    'Enter an image prompt (or "exit" to quit): ',
    async (input: string) => {
      if (input.toLowerCase() === 'exit') {
        rl.close();
        return;
      }

      await runImageGeneration(imageStore, input);
      promptUser();
    },
  );
}

async function main() {
  await greetUser(imageStore, assetStore);
  promptUser();
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

rl.on('close', () => {
  console.log('May the wind fill your sails!');
  process.exit(0);
});
