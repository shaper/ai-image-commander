import type { ProviderV1 } from '@ai-sdk/provider';
import type { ImageEntry } from './image-entry';
import type { ImageStore } from './image-store';
import { hasApiKey, listProviders } from './providers';

interface CliControllerConfig {
  input: (options: { message: string; default?: string }) => Promise<string>;
  select: <T>(options: {
    message: string;
    choices: Array<{
      name: string;
      value: T;
      description?: string;
      disabled?: string | boolean;
    }>;
  }) => Promise<T>;
  log: (msg: string) => void;
  imageStore: ImageStore;
  showNextImage: () => Promise<ImageEntry | undefined>;
  openImage: (path: string) => void;
  runImageGeneration: (
    imageStore: ImageStore,
    prompt: string,
    provider: ProviderV1,
    modelId: string,
  ) => Promise<ImageEntry | undefined>;
}

export class CliController {
  constructor(private readonly config: CliControllerConfig) {}

  async runCommandLoop(): Promise<void> {
    const { input, select, log, imageStore, openImage } = this.config;

    function printHelp() {
      log('\nMenu Options:');
      log('  - [prompt text] : Generate an AI image with the given prompt.');
      log("  - 'next' or 'n' : Show next image in the store.");
      log("  - 'open' or 'o' : Open the last generated image.");
      log("  - 'help', 'h' or '?' : Show this help message.");
      log("  - 'exit' or 'e' : Exit the application.\n");
    }

    let latestImageEntry: ImageEntry | undefined;
    let running = true;
    let lastCommand = '';
    let lastPrompt = '';
    printHelp();

    while (running) {
      try {
        const prompt = await input({
          message: 'Enter a prompt',
          default: lastPrompt.trim() || undefined,
        });
        const command = prompt.trim().toLowerCase() || lastCommand;
        switch (command) {
          case 'e':
          case 'exit':
            running = false;
            break;
          case 'n':
          case 'next':
            latestImageEntry = await this.config.showNextImage();
            break;
          case 'o':
          case 'open':
            if (latestImageEntry) {
              openImage(latestImageEntry.imagePath);
            }
            break;
          case 'help':
          case 'h':
          case '?':
            printHelp();
            break;
          default: {
            lastPrompt = prompt;
            const chosenProvider = await select({
              message: 'Choose a provider',
              choices: listProviders().map((provider) => ({
                name: provider.name,
                value: provider,
                description: 'The provider to use for image generation',
                disabled: !hasApiKey(provider) ? '🔒 No API key set' : false,
              })),
            });
            const chosenModel = await select({
              message: 'Choose an image model',
              choices: chosenProvider.models.map((model: string) => ({
                name: model,
                value: model,
              })),
            });
            latestImageEntry = await this.config.runImageGeneration(
              imageStore,
              prompt,
              chosenProvider.provider,
              chosenModel,
            );
          }
        }
        lastCommand = command;
      } catch (err) {
        running = false;
      }
    }
  }
}
