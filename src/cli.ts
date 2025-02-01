import { experimental_generateImage as generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';
import terminalImage from 'terminal-image';
import readline from 'readline';
import 'dotenv/config';

interface ImageResponse {
  images: Array<{
    uint8Array: Uint8Array;
  }>;
}

const rl: readline.Interface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function generateAndDisplayImage(prompt: string): Promise<void> {
  try {
    console.log('Generating image...');
    const { images }: ImageResponse = await generateImage({
      model: openai.image('dall-e-3'),
      prompt: prompt,
    });

    if (images && images.length > 0) {
      const imageBuffer: Buffer = Buffer.from(images[0].uint8Array);
      console.log('Rendering image...');
      const renderedImage: string = await terminalImage.buffer(imageBuffer);
      console.log(renderedImage);
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

console.log('Welcome to AI Image Commander!');
promptUser();

rl.on('close', () => {
  console.log('May the wind fill your sails!');
  process.exit(0);
});