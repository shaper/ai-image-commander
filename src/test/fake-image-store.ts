import { vi } from 'vitest';
import type { ImageStore } from '../image-store';

export class FakeImageStore implements ImageStore {
  baseDir = '/test';

  timestampFromPath = vi.fn((filePath: string) => {
    const fileName = filePath.split('/').pop() ?? '';
    const parts = fileName.split('-');
    return Number.parseInt(parts[1]);
  });

  saveImage = vi.fn(async (timestamp: number, imageBuffer: Buffer) => {
    return `/test/image-${timestamp}.png`;
  });

  savePrompt = vi.fn(async (timestamp: number, prompt: string) => {
    return `/test/prompt-${timestamp}.txt`;
  });

  listImages = vi.fn(async () => {
    return [];
  });

  loadPromptForImage = vi.fn(async (imageFileName: string) => {
    return undefined;
  });
}
