import terminalImage from 'terminal-image';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FakeImageRepository } from './fake-image-store';
import type { ImageEntry } from './image-entry';
import { showNextImage } from './show-next-image';

describe('showNextImage', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let imageRepo: FakeImageRepository;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    imageRepo = new FakeImageRepository();
    vi.spyOn(terminalImage, 'file').mockResolvedValue('mocked terminal output');
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should return undefined when no images are available', async () => {
    imageRepo.list.mockResolvedValueOnce([]);
    const result = await showNextImage(imageRepo);
    expect(result).toBeUndefined();
    expect(terminalImage.file).not.toHaveBeenCalled();
  });

  it('should display an image and return image entry when images are available', async () => {
    const mockEntry: ImageEntry = {
      id: '1',
      createdAt: 123456,
      prompt: 'test prompt',
      imageFileName: '/path/to/image1.png',
    };
    imageRepo.list.mockResolvedValueOnce([mockEntry]);

    const result = await showNextImage(imageRepo);

    expect(result).toMatchObject({
      id: '1',
      createdAt: 123456,
      prompt: 'test prompt',
      imageFileName: expect.stringContaining('/path/to/image'),
    });
  });

  it('should handle images without prompts', async () => {
    const mockEntry: ImageEntry = {
      id: '1',
      createdAt: 123456,
      prompt: undefined,
      imageFileName: '/path/to/image1.png',
    };
    imageRepo.list.mockResolvedValueOnce([mockEntry]);

    const result = await showNextImage(imageRepo);

    expect(result).toBeDefined();
    expect(result?.prompt).toBeUndefined();
    expect(consoleLogSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('"'),
    );
  });

  it('should randomly select an image from available files', async () => {
    const mockEntries: ImageEntry[] = [
      {
        id: '1',
        createdAt: 123456,
        prompt: 'prompt 1',
        imageFileName: '/path/to/image1.png',
      },
      {
        id: '2',
        createdAt: 123457,
        prompt: 'prompt 2',
        imageFileName: '/path/to/image2.png',
      },
      {
        id: '3',
        createdAt: 123458,
        prompt: 'prompt 3',
        imageFileName: '/path/to/image3.png',
      },
    ];
    imageRepo.list.mockResolvedValueOnce(mockEntries);

    const results = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const result = await showNextImage(imageRepo);
      if (result) {
        results.add(result.id);
      }
    }

    expect(results.size).toBeGreaterThan(1);
  });
});
