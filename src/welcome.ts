import { AssetStore } from './asset-store';
import { ImageStore } from './image-store';
import { shuffleArray } from './utils';
import terminalImage from 'terminal-image';

async function showRandomPriorImage(imageStore: ImageStore) {
  console.log("Look at the incredible work you've been doing, my friend.");
  const availableFiles = await imageStore.listFullResolutionImages();
  if (availableFiles.length === 0) {
    return false;
  }
  const shuffledFiles = shuffleArray(availableFiles);
  const randomFile = shuffledFiles[0];
  const terminalOutput = await terminalImage.file(randomFile, {
    height: '75%',
    width: '75%',
  });
  console.log(terminalOutput);
  return true;
}

export async function greetUser(
  imageStore: ImageStore,
  assetStore: AssetStore,
) {
  console.log('Welcome to AI Image Commander!');
  if (!(await showRandomPriorImage(imageStore))) {
    const welcomeContent = assetStore.loadResource('welcome.txt');
    if (welcomeContent) {
      console.log(welcomeContent);
    }
  }
}
