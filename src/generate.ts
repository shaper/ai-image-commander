import type { ProviderV1 } from '@ai-sdk/provider';
import { experimental_generateImage as generateImage } from 'ai';
import imageType from 'image-type';
import ora from 'ora';
import sharp from 'sharp';
import terminalImage from 'terminal-image';
import { type ImageEntry, createImageEntry } from './image-entry';
import type { ImageRepository } from './image-repository';

export async function runImageGeneration(
  imageRepo: ImageRepository,
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

      let imageBuffer: Buffer = Buffer.from(images[0].uint8Array);

      // Determine the format of the image.
      const format = await imageType(imageBuffer);
      const extension = format?.ext;
      if (!extension) {
        throw new Error('Unknown image format');
      }

      if (extension === 'webp') {
        // `terminal-image` doesn't support WebP, so convert to PNG.
        imageBuffer = await sharp(imageBuffer).png().toBuffer();
      }

      // Render the image to the terminal.
      console.log(await terminalImage.buffer(imageBuffer));

      return imageRepo.save(createImageEntry(prompt), imageBuffer);
    }
  } catch (error) {
    spinner.fail('Image generation failed.');
    console.error(error instanceof Error ? error.message : String(error));
  }
}
