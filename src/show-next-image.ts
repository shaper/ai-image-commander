import terminalImage from 'terminal-image';
import type { ImageEntry } from './image-entry';
import type { ImageStore } from './image-store';
import { shuffleArray } from './utils';

export async function showNextImage(
  imageStore: ImageStore,
): Promise<ImageEntry | undefined> {
  const availableFiles = await imageStore.listImages();
  if (availableFiles.length === 0) {
    return undefined;
  }

  const shuffledFiles = shuffleArray(availableFiles);
  const randomFile = shuffledFiles[0];
  const prompt = await imageStore.loadPromptForImage(randomFile);
  if (prompt) {
    console.log(`"${prompt}"`);
  }

  const terminalOutput = await terminalImage.file(randomFile, {
    height: '75%',
    width: '75%',
  });
  console.log(terminalOutput);

  return {
    timestamp: imageStore.timestampFromPath(randomFile),
    prompt,
    imagePath: randomFile,
  };
}
