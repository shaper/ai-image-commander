import type { ProviderV1 } from '@ai-sdk/provider';
import { experimental_generateImage as generateImage } from 'ai';
import ora from 'ora';
import terminalImage from 'terminal-image';
import type { ImageEntry } from './image-entry';
import type { ImageStore } from './image-store';

export async function runImageGeneration(
  imageStore: ImageStore,
  prompt: string,
  provider: ProviderV1,
  modelId: string,
): Promise<ImageEntry | undefined> {
  const spinner = ora('Generating image...').start();
  try {
    const model = provider.imageModel
      ? provider.imageModel(modelId)
      : undefined;
    if (!model) {
      throw new Error('No model found');
    }

    const { images } = await generateImage({
      model,
      prompt,
    });

    if (images && images.length > 0) {
      spinner.stop();

      const imageBuffer: Buffer = Buffer.from(images[0].uint8Array);
      const renderedImage: string = await terminalImage.buffer(imageBuffer);
      console.log(renderedImage);
      const timestamp = Date.now();
      return {
        timestamp,
        prompt,
        imagePath: await imageStore.saveImage(timestamp, imageBuffer),
      };
    }
  } catch (error) {
    spinner.fail('Image generation failed.');
    console.error(error instanceof Error ? error.message : String(error));
  }
}
