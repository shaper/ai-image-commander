import { AssetStore } from './assets-store';
import { ImageStore } from './image-store';
import { openai } from '@ai-sdk/openai';
import { experimental_generateImage as generateImage } from 'ai';
import { Command } from 'commander';
import 'dotenv/config';
import readline from 'readline';
import terminalImage from 'terminal-image';

const program = new Command();

program
  .name('ai-image')
  .version('1.0.0')
  .description('A CLI tool for generating AI images')
  .option(
    '-d, --dir <directory>',
    'Directory where full resolution images are stored',
    'saved-images',
  )
  .parse(process.argv);

const options = program.opts();
const saveDir: string = options.dir || '';

const imageStore = new ImageStore(saveDir);
const assetStore = new AssetStore();

const rl: readline.Interface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function generateAndDisplayImage(prompt: string) {
  try {
    console.log('Generating image...');
    const { images } = await generateImage({
      model: openai.image('dall-e-3'),
      prompt,
    });

    if (images && images.length > 0) {
      const imageBuffer: Buffer = Buffer.from(images[0].uint8Array);
      console.log('Rendering image...');
      const renderedImage: string = await terminalImage.buffer(imageBuffer);
      console.log(renderedImage);

      const timestamp = Date.now();
      const filePath = await imageStore.saveFullResolutionImage(
        timestamp,
        imageBuffer,
      );
      console.log(`Saved full resolution image to ${filePath}`);

      const renderedFilePath = await imageStore.saveRenderedImage(
        timestamp,
        renderedImage,
      );
      console.log(`Saved rendered image to ${renderedFilePath}`);
    } else {
      console.log('No image generated.');
    }
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error),
    );
  }
}

function promptUser(): void {
  rl.question(
    'Enter an image prompt (or "exit" to quit): ',
    async (input: string) => {
      if (input.toLowerCase() === 'exit') {
        rl.close();
        return;
      }

      await generateAndDisplayImage(input);
      promptUser();
    },
  );
}

console.log('Welcome to AI Image Commander!');
const welcomeContent = assetStore.loadResource('welcome.txt');
if (welcomeContent) {
  console.log(welcomeContent);
}

promptUser();

rl.on('close', () => {
  console.log('May the wind fill your sails!');
  process.exit(0);
});
