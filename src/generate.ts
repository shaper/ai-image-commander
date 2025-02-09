import { ImageEntry } from './image-entry';
import { ImageStore } from './image-store';
import { ProviderV1 } from '@ai-sdk/provider';
import { experimental_generateImage as generateImage } from 'ai';
import terminalImage from 'terminal-image';

export async function runImageGeneration(
  imageStore: ImageStore,
  prompt: string,
  provider: ProviderV1,
  modelId: string,
): Promise<ImageEntry | undefined> {
  try {
    console.log('Generating image...');

    const model = provider.imageModel ? provider.imageModel(modelId) : undefined;
    if (!model) {
      throw new Error('No model found');
    }

    const { images } = await generateImage({
      model,
      prompt,
    });

    if (images && images.length > 0) {
      const imageBuffer: Buffer = Buffer.from(images[0].uint8Array);
      const renderedImage: string = await terminalImage.buffer(imageBuffer);
      console.log(renderedImage);

      const timestamp = Date.now();
      return {
        timestamp,
        prompt,
        imagePath: await imageStore.saveImage(
          timestamp,
          imageBuffer,
        ),
      };
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
