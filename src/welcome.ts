import { AssetStore } from './asset-store';
import { ImageEntry } from './image-entry';
import { ImageStore } from './image-store';
import { shuffleArray } from './utils';
import terminalImage from 'terminal-image';

async function showRandomPriorImage(
  imageStore: ImageStore,
): Promise<ImageEntry | undefined> {
  const availableFiles = await imageStore.listFullResolutionImages();
  if (availableFiles.length === 0) {
    return undefined;
  }
  const shuffledFiles = shuffleArray(availableFiles);
  const randomFile = shuffledFiles[0];
  const prompt = await imageStore.loadPromptForFullResolutionImage(randomFile);
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
    prompt: await imageStore.loadPromptForFullResolutionImage(randomFile),
    renderedImagePath: randomFile,
    fullResolutionImagePath: randomFile,
  };
}

export async function showNextImage(
  imageStore: ImageStore,
  assetStore: AssetStore,
): Promise<ImageEntry | undefined> {
  const imageEntry = await showRandomPriorImage(imageStore);
  if (imageEntry) {
    return imageEntry;
  }
  const welcomeContent = assetStore.loadResource('welcome.txt');
  if (welcomeContent) {
    console.log(welcomeContent);
  }
}
