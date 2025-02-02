import { ImageStore } from './image-store';
import { openai } from '@ai-sdk/openai';
import { experimental_generateImage as generateImage } from 'ai';
import terminalImage from 'terminal-image';

export async function runImageGeneration(
  imageStore: ImageStore,
  prompt: string,
) {
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
