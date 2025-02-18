import { input, select } from '@inquirer/prompts';
import { Command, Option } from 'commander';
import { config } from 'dotenv';
import open from 'open';
import { CliController } from './cli-controller';
import { ensureConfigFile, runConfigWizard } from './config';
import { runImageGeneration } from './generate';
import { LocalImageRepository } from './local-image-repository';
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
  )
  .addOption(
    new Option(
      '--from <file>',
      'Path to an existing .env or config file to import settings from',
    ),
  );

program
  .command('config')
  .description('View or update your configuration settings')
  .action(async (_, command) => {
    const importFrom = command.parent.opts().from;
    const { configPath } = ensureConfigFile();
    await runConfigWizard(configPath, importFrom);
  });

const options = program.opts();
const saveDir: string = options.dir || DEFAULT_SAVE_DIR;

program.action(async () => {
  try {
    const { configPath, isNew } = ensureConfigFile();
    if (isNew || options.from) {
      await runConfigWizard(configPath, options.from);
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

    const imageRepo = new LocalImageRepository(saveDir);

    const controller = new CliController({
      input,
      select,
      log: console.log,
      imageRepo,
      showNextImage: () => showNextImage(imageRepo),
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
