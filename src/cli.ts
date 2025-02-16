import { input, select } from '@inquirer/prompts';
import { Command } from 'commander';
import { config } from 'dotenv';
import open from 'open';
import { CliController } from './cli-controller';
import { getConfigPath, initConfig, runConfigWizard } from './config';
import { runImageGeneration } from './generate';
import { LocalImageStore } from './image-store';
import { hasApiKey, listProviders } from './providers';
import { showNextImage } from './show-next-image';

const DEFAULT_SAVE_DIR = 'saved-images';

const program = new Command()
  .name('aic')
  .version('0.0.1')
  .description('A CLI tool for generating AI images')
  .option(
    '-d, --dir <directory>',
    'Directory where images are stored',
    DEFAULT_SAVE_DIR,
  );

program
  .command('config')
  .description('View or update your configuration settings')
  .action(async () => {
    console.log('Launching the configuration wizard...');
    await runConfigWizard(getConfigPath());
  });

const options = program.opts();
const saveDir: string = options.dir || DEFAULT_SAVE_DIR;

program.action(async () => {
  try {
    const configPath = getConfigPath();
    const configExists = initConfig(configPath);
    if (!configExists) {
      console.log('No configuration file found. Running setup wizard...');
      await runConfigWizard(configPath);
    }
    config({ path: configPath });

    // Check if at least one provider is fully configured.
    if (!listProviders().some((provider) => hasApiKey(provider))) {
      console.error(
        'Error: No fully configured provider found (API keys missing). ' +
          'Please run "aic config" to update your configuration.',
      );
      process.exit(1);
    }

    const imageStore = new LocalImageStore(saveDir);

    const controller = new CliController({
      input,
      select,
      log: console.log,
      imageStore,
      showNextImage: () => showNextImage(imageStore),
      openImage: open,
      runImageGeneration,
    });

    await controller.runCommandLoop();
  } catch (err) {
    console.error('Error in main:', err);
    process.exit(1);
  }
});

program.parseAsync(process.argv).catch((err) => {
  console.error('Failed to run the application:', err);
});
