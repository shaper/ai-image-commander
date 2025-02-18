import terminalImage from 'terminal-image';
import type { ImageEntry } from './image-entry';
import type { ImageRepository } from './image-repository';
import { shuffleArray } from './utils';

export async function showNextImage(
  imageRepo: ImageRepository,
): Promise<ImageEntry | undefined> {
  const availableFiles = await imageRepo.list();
  if (availableFiles.length === 0) {
    return undefined;
  }

  const shuffledFiles = shuffleArray(availableFiles);
  const randomFile = shuffledFiles[0];
  const prompt = randomFile.prompt;
  if (prompt) {
    console.log(`"${prompt}"`);
  }

  if (randomFile.imageFileName) {
    const terminalOutput = await terminalImage.file(randomFile.imageFileName);
    console.log(terminalOutput);
  }

  return randomFile;
}
