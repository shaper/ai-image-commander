import { experimental_generateImage as generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Command } from 'commander';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import terminalImage from 'terminal-image';

const program = new Command();

program
  .name("ai-image")
  .version("1.0.0")
  .description("A CLI tool for generating AI images")
  .option('-d, --dir <directory>', 'Directory where full resolution images are stored')
  .parse(process.argv);

const options = program.opts();
const saveDir: string = options.dir || '';
if (saveDir && !fs.existsSync(saveDir)) {
  fs.mkdirSync(saveDir, { recursive: true });
}

// Create a public directory for assets if it doesn't exist
const publicDir: string = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const rl: readline.Interface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function generateAndDisplayImage(prompt: string) {
  try {
    console.log('Generating image...');
    const { images } = await generateImage({
      model: openai.image('dall-e-3'),
      prompt: prompt,
    });

    if (images && images.length > 0) {
      const imageBuffer: Buffer = Buffer.from(images[0].uint8Array);
      console.log('Rendering image...');
      const renderedImage: string = await terminalImage.buffer(imageBuffer);
      console.log(renderedImage);

      if (saveDir) {
        const timestamp = Date.now();

        // Save the full resolution image as a PNG file
        const fileName = `image-${timestamp}.png`;
        const filePath = path.join(saveDir, fileName);
        await fs.promises.writeFile(filePath, imageBuffer);
        console.log(`Saved full resolution image to ${filePath}`);

        // Save the rendered image string as a .txt file
        const renderedFileName = `image-${timestamp}-rendered.txt`;
        const renderedFilePath = path.join(saveDir, renderedFileName);
        await fs.promises.writeFile(renderedFilePath, renderedImage);
        console.log(`Saved rendered image to ${renderedFilePath}`);
      }
    } else {
      console.log('No image generated.');
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
}

function promptUser(): void {
  rl.question('Enter an image prompt (or "exit" to quit): ', async (input: string) => {
    if (input.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    await generateAndDisplayImage(input);
    promptUser();
  });
}

// Display a welcome image asset if available
console.log('Welcome to AI Image Commander!');

const welcomeFilePath = path.join(publicDir, 'welcome.txt');
if (fs.existsSync(welcomeFilePath)) {
  const welcomeContent = fs.readFileSync(welcomeFilePath, 'utf8');
  console.log(welcomeContent);
}

promptUser();

rl.on('close', () => {
  console.log('May the wind fill your sails!');
  process.exit(0);
});
