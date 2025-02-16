import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CliController } from './cli-controller';
import * as generateModule from './generate';
import type { ImageEntry } from './image-entry';
import { FakeImageStore } from './test/fake-image-store';

const mockInput = vi.fn();
const mockSelect = vi.fn();
const mockLog = vi.fn();
const mockShowNextImage = vi.fn();
const mockOpenImage = vi.fn();
const mockRunImageGeneration = vi.fn();
let controller: CliController;
let fakeImageStore: FakeImageStore;

beforeEach(() => {
  vi.clearAllMocks();
  fakeImageStore = new FakeImageStore();
  controller = new CliController({
    input: mockInput,
    select: mockSelect,
    log: mockLog,
    imageStore: fakeImageStore,
    showNextImage: mockShowNextImage,
    openImage: mockOpenImage,
    runImageGeneration: mockRunImageGeneration,
  });
});

describe('CliController', () => {
  it('should exit when "exit" command is given', async () => {
    mockInput.mockResolvedValueOnce('exit');

    await controller.runCommandLoop();

    expect(mockInput).toHaveBeenCalledTimes(1);
    expect(mockInput).toHaveBeenCalledWith({
      message: 'Enter a prompt',
      default: undefined,
    });
  });

  it('should show help when "help" command is given', async () => {
    mockInput.mockResolvedValueOnce('help').mockResolvedValueOnce('exit');

    await controller.runCommandLoop();

    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('Menu Options:'),
    );
    expect(mockInput).toHaveBeenCalledTimes(2);
  });

  it('should show next image when "next" command is given', async () => {
    const mockImage: ImageEntry = {
      imagePath: 'path/to/image.png',
      prompt: 'test prompt',
      timestamp: Date.now(),
    };

    mockInput.mockResolvedValueOnce('next').mockResolvedValueOnce('exit');
    mockShowNextImage.mockResolvedValueOnce(mockImage);

    await controller.runCommandLoop();

    expect(mockShowNextImage).toHaveBeenCalledTimes(1);
    expect(mockInput).toHaveBeenCalledTimes(2);
  });

  it('should open last image when "open" command is given', async () => {
    const mockImage: ImageEntry = {
      imagePath: 'path/to/image.png',
      prompt: 'test prompt',
      timestamp: Date.now(),
    };

    // First generate an image
    mockInput.mockResolvedValueOnce('test prompt');
    mockSelect
      .mockResolvedValueOnce({
        provider: 'test-provider',
        name: 'Test Provider',
        models: ['model1'],
      })
      .mockResolvedValueOnce('model1');

    // Then open it
    mockInput.mockResolvedValueOnce('open').mockResolvedValueOnce('exit');

    // Mock the image generation result
    mockRunImageGeneration.mockResolvedValueOnce(mockImage);

    await controller.runCommandLoop();

    expect(mockOpenImage).toHaveBeenCalledWith(mockImage.imagePath);
  });

  it('should handle image generation with valid prompt', async () => {
    const mockImage: ImageEntry = {
      imagePath: 'path/to/image.png',
      prompt: 'test prompt',
      timestamp: Date.now(),
    };

    const mockProvider = {
      provider: 'test-provider',
      name: 'Test Provider',
      models: ['model1'],
    };

    mockInput
      .mockResolvedValueOnce('create a test image')
      .mockResolvedValueOnce('exit');
    mockSelect
      .mockResolvedValueOnce(mockProvider)
      .mockResolvedValueOnce('model1');

    vi.spyOn(generateModule, 'runImageGeneration').mockResolvedValueOnce(
      mockImage,
    );

    await controller.runCommandLoop();

    expect(mockSelect).toHaveBeenCalledTimes(2);
    expect(mockSelect).toHaveBeenCalledWith({
      message: 'Choose a provider',
      choices: expect.any(Array),
    });
    expect(mockSelect).toHaveBeenCalledWith({
      message: 'Choose an image model',
      choices: expect.any(Array),
    });
  });

  it('should remember last prompt for default value', async () => {
    mockInput
      .mockResolvedValueOnce('test prompt')
      .mockResolvedValueOnce('') // Empty input should use last prompt
      .mockResolvedValueOnce('exit');

    mockSelect
      .mockResolvedValueOnce({
        provider: 'test-provider',
        name: 'Test Provider',
        models: ['model1'],
      })
      .mockResolvedValueOnce('model1')
      .mockResolvedValueOnce({
        provider: 'test-provider',
        name: 'Test Provider',
        models: ['model1'],
      })
      .mockResolvedValueOnce('model1');

    await controller.runCommandLoop();

    expect(mockInput).toHaveBeenNthCalledWith(2, {
      message: 'Enter a prompt',
      default: 'test prompt',
    });
  });

  it('should handle errors gracefully', async () => {
    mockInput.mockRejectedValueOnce(new Error('Test error'));

    await controller.runCommandLoop();

    // Should exit on error
    expect(mockInput).toHaveBeenCalledTimes(1);
  });
});
