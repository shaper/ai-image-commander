import terminalImage from 'terminal-image';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ImageStore } from './image-store';
import { showNextImage } from './show-next-image';

// Mock terminal-image
vi.mock('terminal-image', () => ({
  default: {
    file: vi.fn().mockResolvedValue('mocked terminal output'),
  },
}));

// Create individual mock functions that are properly typed
const listImagesMock = vi.fn();
const loadPromptForImageMock = vi.fn();
const timestampFromPathMock = vi.fn();
const saveImageMock = vi.fn();
const savePromptMock = vi.fn();

// Create your mock object with these mocks
const mockImageStore: ImageStore = {
  baseDir: '/mock/path',
  listImages: listImagesMock,
  loadPromptForImage: loadPromptForImageMock,
  timestampFromPath: timestampFromPathMock,
  saveImage: saveImageMock,
  savePrompt: savePromptMock,
} as unknown as ImageStore;

describe('showNextImage', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  const mockFiles = [
    '/path/to/image1.png',
    '/path/to/image2.png',
    '/path/to/image3.png',
  ];

  it('should return undefined when no images are available', async () => {
    listImagesMock.mockResolvedValueOnce([]);

    const result = await showNextImage(mockImageStore);
    expect(result).toBeUndefined();
    expect(terminalImage.file).not.toHaveBeenCalled();
  });

  it('should display an image and return image entry when images are available', async () => {
    listImagesMock.mockResolvedValueOnce(mockFiles);
    loadPromptForImageMock.mockResolvedValueOnce('test prompt');
    timestampFromPathMock.mockReturnValueOnce(new Date('2024-01-01'));

    const result = await showNextImage(mockImageStore);

    expect(result).toBeDefined();
    expect(result).toEqual({
      timestamp: new Date('2024-01-01'),
      prompt: 'test prompt',
      imagePath: expect.stringContaining('/path/to/image'),
    });
    expect(terminalImage.file).toHaveBeenCalledWith(
      expect.stringContaining('/path/to/image'),
      { height: '75%', width: '75%' },
    );
  });

  it('should handle images without prompts', async () => {
    listImagesMock.mockResolvedValueOnce(mockFiles);
    loadPromptForImageMock.mockResolvedValueOnce(null);
    timestampFromPathMock.mockReturnValueOnce(new Date('2024-01-01'));

    const consoleSpy = vi.spyOn(console, 'log');
    const result = await showNextImage(mockImageStore);

    expect(result).toBeDefined();
    expect(result?.prompt).toBeNull();
    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('"'));
  });

  it('should randomly select an image from available files', async () => {
    // Run multiple times to ensure randomization
    listImagesMock.mockResolvedValue(mockFiles);
    loadPromptForImageMock.mockResolvedValue('test prompt');
    timestampFromPathMock.mockReturnValue(new Date('2024-01-01'));

    const results = new Set();
    for (let i = 0; i < 10; i++) {
      const result = await showNextImage(mockImageStore);
      if (result) {
        results.add(result.imagePath);
      }
    }

    // We should see different images being selected
    // Note: This is probabilistic and could theoretically fail
    expect(results.size).toBeGreaterThan(1);
  });
});
