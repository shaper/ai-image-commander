import { vi } from 'vitest';
import type { ImageEntry } from './image-entry';
import type { ImageRepository } from './image-repository';

export class FakeImageRepository implements ImageRepository {
  baseDir = '/test';

  save = vi.fn(async (entry: ImageEntry, imageBuffer: Buffer) => {
    entry.imageFileName = `/test/image-${entry.id}.png`;
    return entry;
  });

  get = vi.fn(async (id: string) => {
    return {
      id,
      createdAt: Date.now(),
      imageFileName: `/test/image-${id}.png`,
      prompt: `Prompt for image ${id}`,
    };
  });

  list = vi.fn(async (): Promise<ImageEntry[]> => {
    return [
      {
        id: '1',
        createdAt: 123456,
        prompt: 'test prompt',
        imageFileName: '/path/to/image1.png',
      },
      {
        id: '2',
        createdAt: 123457,
        prompt: 'test prompt',
        imageFileName: '/path/to/image2.png',
      },
      {
        id: '3',
        createdAt: 123458,
        prompt: 'test prompt',
        imageFileName: '/path/to/image3.png',
      },
    ];
  });
}
