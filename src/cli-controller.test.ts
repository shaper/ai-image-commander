import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CliController } from './cli-controller';
import { FakeImageRepository } from './fake-image-store';
import * as generateModule from './generate';
import type { ImageEntry } from './image-entry';
import type { ImageRepository } from './image-repository';

const mockInput = vi.fn();
const mockSelect = vi.fn();
const mockLog = vi.fn();
const mockShowNextImage = vi.fn();
const mockOpenImage = vi.fn();
const mockRunImageGeneration = vi.fn();
let controller: CliController;
let fakeImageRepository: FakeImageRepository;

beforeEach(() => {
  vi.clearAllMocks();
  fakeImageRepository = new FakeImageRepository();
  controller = new CliController({
    input: mockInput,
    select: mockSelect,
    log: mockLog,
    imageRepo: fakeImageRepository,
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
      id: '1',
      createdAt: Date.now(),
      prompt: 'test prompt',
      imageFileName: 'path/to/image.png',
    };

    mockInput.mockResolvedValueOnce('next').mockResolvedValueOnce('exit');
    mockShowNextImage.mockResolvedValueOnce(mockImage);

    await controller.runCommandLoop();

    expect(mockShowNextImage).toHaveBeenCalledTimes(1);
    expect(mockInput).toHaveBeenCalledTimes(2);
  });

  it('should open last image when "open" command is given', async () => {
    const mockImage: ImageEntry = {
      id: '1',
      createdAt: Date.now(),
      prompt: 'test prompt',
      imageFileName: 'path/to/image.png',
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

    expect(mockOpenImage).toHaveBeenCalledWith(mockImage.imageFileName);
  });

  it('should handle image generation with valid prompt', async () => {
    const mockImage: ImageEntry = {
      id: '1',
      createdAt: Date.now(),
      prompt: 'test prompt',
      imageFileName: 'path/to/image.png',
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

  it('should remember last provider and model for subsequent image generation', async () => {
    const providerA = {
      provider: 'providerA',
      name: 'Provider A',
      models: ['model1', 'model2'],
    };

    // Simulate two rounds of image generation.
    // Round 1: prompt "first prompt", then choose providerA and "model1".
    // Round 2: prompt "second prompt", then the provider and model select prompts should use
    // the defaults from the previous round (providerA and "model1").
    mockInput
      .mockResolvedValueOnce('first prompt') // Round 1 prompt
      .mockResolvedValueOnce('second prompt') // Round 2 prompt
      .mockResolvedValueOnce('exit'); // Exit afterwards

    // For round 1, the provider selection has no default (since lastSelectedProvider is undefined)
    // and the model selection likewise uses no default.
    // For round 2, we expect the provider selection prompt to have a default of providerA and
    // the model selection prompt to have a default of "model1".
    mockSelect
      .mockResolvedValueOnce(providerA) // Round 1: provider select (default: undefined)
      .mockResolvedValueOnce('model1') // Round 1: model select (default: undefined)
      .mockResolvedValueOnce(providerA) // Round 2: provider select (default should be providerA)
      .mockResolvedValueOnce('model1'); // Round 2: model select (default should be "model1")

    const dummyImage = {
      imagePath: 'dummy.png',
      prompt: 'dummy',
      timestamp: Date.now(),
    };
    mockRunImageGeneration.mockResolvedValue(dummyImage);

    await controller.runCommandLoop();

    // Check the select call arguments.
    // Round 1:
    const providerSelectCall1 = mockSelect.mock.calls[0][0];
    expect(providerSelectCall1.message).toEqual('Choose a provider');
    expect(providerSelectCall1.default).toBeUndefined();

    const modelSelectCall1 = mockSelect.mock.calls[1][0];
    expect(modelSelectCall1.message).toEqual('Choose an image model');
    expect(modelSelectCall1.default).toBeUndefined();

    // Round 2:
    const providerSelectCall2 = mockSelect.mock.calls[2][0];
    expect(providerSelectCall2.message).toEqual('Choose a provider');
    expect(providerSelectCall2.default).toEqual(providerA);

    const modelSelectCall2 = mockSelect.mock.calls[3][0];
    expect(modelSelectCall2.message).toEqual('Choose an image model');
    expect(modelSelectCall2.default).toEqual('model1');
  });

  it('should reset default model when provider is changed', async () => {
    const providerA = {
      provider: 'providerA',
      name: 'Provider A',
      models: ['modelA1', 'modelA2'],
    };
    const providerB = {
      provider: 'providerB',
      name: 'Provider B',
      models: ['modelB1', 'modelB2'],
    };

    // Simulate two rounds of image generation.
    // Round 1: prompt "first prompt", then choose providerA and "modelA1".
    // Round 2: prompt "second prompt", then at provider selection the default is providerA
    // but the user selects providerB instead. Since providerB is different, the model default should be cleared.
    mockInput
      .mockResolvedValueOnce('first prompt') // Round 1 prompt
      .mockResolvedValueOnce('second prompt') // Round 2 prompt
      .mockResolvedValueOnce('exit'); // Exit afterwards

    mockSelect
      .mockResolvedValueOnce(providerA) // Round 1: provider select (default: undefined)
      .mockResolvedValueOnce('modelA1') // Round 1: model select (default: undefined)
      .mockResolvedValueOnce(providerB) // Round 2: provider select (default should be providerA)
      .mockResolvedValueOnce('modelB1'); // Round 2: model select; default should be undefined because provider changed

    const dummyImage = {
      imagePath: 'dummy.png',
      prompt: 'dummy',
      timestamp: Date.now(),
    };
    mockRunImageGeneration.mockResolvedValue(dummyImage);

    await controller.runCommandLoop();

    // Check the default values used in round 2.
    const providerSelectCall2 = mockSelect.mock.calls[2][0];
    expect(providerSelectCall2.default).toEqual(providerA);

    const modelSelectCall2 = mockSelect.mock.calls[3][0];
    // Because the provider changed (from providerA to providerB), the default model should be reset.
    expect(modelSelectCall2.default).toBeUndefined();
  });
});
