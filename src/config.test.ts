import * as fs from 'node:fs';
import type { PathLike } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ProviderV1 } from '@ai-sdk/provider';
import { input } from '@inquirer/prompts';
import dotenv from 'dotenv';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ensureConfigFile,
  getConfigPath,
  initConfig,
  runConfigWizard,
} from './config';
import { listProviders } from './providers';

// Mock all external dependencies
vi.mock('node:fs');
vi.mock('node:fs/promises');
vi.mock('@inquirer/prompts');
vi.mock('dotenv');
vi.mock('./providers');

describe('Configuration Management', () => {
  const tempConfigPath = join(tmpdir(), 'test-aic.conf');

  beforeEach(() => {
    vi.resetAllMocks();

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    // Setup default mock implementations
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.readFileSync).mockReturnValue('EXAMPLE_KEY=example_value');
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);
    vi.mocked(readFile).mockResolvedValue('EXISTING_KEY=existing_value');
    vi.mocked(writeFile).mockResolvedValue(undefined);
    vi.mocked(dotenv.parse).mockReturnValue({ EXISTING_KEY: 'existing_value' });
    const mockProvider: ProviderV1 = {
      languageModel: vi.fn(),
      textEmbeddingModel: vi.fn(),
    };
    vi.mocked(listProviders).mockReturnValue([
      {
        name: 'TestProvider',
        provider: mockProvider,
        models: ['test-model'],
        apiKeyNames: ['TEST_API_KEY'],
        website: 'https://testprovider.com',
      },
    ]);
    vi.mocked(input).mockResolvedValue('test_input_value');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initConfig', () => {
    it('should create new config file when none exists', () => {
      const result = initConfig(tempConfigPath);

      expect(result).toBe(false);
      expect(fs.existsSync).toHaveBeenCalledWith(tempConfigPath);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        tempConfigPath,
        'EXAMPLE_KEY=example_value',
        { encoding: 'utf8' },
      );
    });

    it('should return true when config already exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const result = initConfig(tempConfigPath);

      expect(result).toBe(true);
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('runConfigWizard', () => {
    it('should load existing config and prompt for values', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      await runConfigWizard(tempConfigPath);

      expect(readFile).toHaveBeenCalledWith(tempConfigPath, 'utf8');
      expect(dotenv.parse).toHaveBeenCalled();
      expect(input).toHaveBeenCalledWith({
        message:
          'Enter your TEST_API_KEY for TestProvider (https://testprovider.com):',
        default: '',
      });
      expect(writeFile).toHaveBeenCalledWith(
        tempConfigPath,
        'EXISTING_KEY=existing_value\nTEST_API_KEY=test_input_value',
        { encoding: 'utf8' },
      );
    });

    it('should create new config when none exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await runConfigWizard(tempConfigPath);

      expect(readFile).not.toHaveBeenCalled();
      expect(dotenv.parse).not.toHaveBeenCalled();
      expect(input).toHaveBeenCalled();
      expect(writeFile).toHaveBeenCalledWith(
        tempConfigPath,
        'TEST_API_KEY=test_input_value',
        { encoding: 'utf8' },
      );
    });

    it('should not write empty config when no input is provided', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(input).mockResolvedValue('');

      await runConfigWizard(tempConfigPath);

      expect(writeFile).toHaveBeenCalledWith(tempConfigPath, 'TEST_API_KEY=', {
        encoding: 'utf8',
      });
    });

    it('should preserve existing values when updating config', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(dotenv.parse).mockReturnValue({
        EXISTING_KEY: 'existing_value',
        TEST_API_KEY: 'old_test_value',
      });

      await runConfigWizard(tempConfigPath);

      expect(input).toHaveBeenCalledWith({
        message:
          'Enter your TEST_API_KEY for TestProvider (https://testprovider.com):',
        default: 'old_test_value',
      });
      expect(writeFile).toHaveBeenCalledWith(
        tempConfigPath,
        'EXISTING_KEY=existing_value\nTEST_API_KEY=test_input_value',
        { encoding: 'utf8' },
      );
    });
  });

  describe('runConfigWizard with import configuration', () => {
    const importFile = join(tmpdir(), 'imported.env');

    it('should import configuration from provided file when creating new config', async () => {
      // Simulate that the main config file does not exist, but the import file does.
      vi.mocked(fs.existsSync).mockImplementation((path: PathLike) => {
        if (path.toString() === importFile) return true;
        return false;
      });

      vi.mocked(readFile).mockImplementation(async (filePath, encoding) => {
        if (filePath === importFile) return 'TEST_API_KEY=imported_value';
        return '';
      });

      // Mock dotenv.parse to handle the imported content
      vi.mocked(dotenv.parse).mockReturnValue({
        TEST_API_KEY: 'imported_value',
      });

      await runConfigWizard(tempConfigPath, importFile);

      // The prompt should use the imported value as default.
      expect(input).toHaveBeenCalledWith({
        message:
          'Enter your TEST_API_KEY for TestProvider (https://testprovider.com):',
        default: 'imported_value',
      });
      expect(writeFile).toHaveBeenCalledWith(
        tempConfigPath,
        'TEST_API_KEY=test_input_value',
        { encoding: 'utf8' },
      );
    });

    it('should warn and ignore missing import file if it does not exist', async () => {
      const missingImportFile = join(tmpdir(), 'missing.env');
      // Simulate that neither the main config nor the import file exist.
      vi.mocked(fs.existsSync).mockImplementation(() => false);

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await runConfigWizard(tempConfigPath, missingImportFile);

      expect(warnSpy).toHaveBeenCalledWith(
        `Import file ${missingImportFile} does not exist.`,
      );
      expect(input).toHaveBeenCalledWith({
        message:
          'Enter your TEST_API_KEY for TestProvider (https://testprovider.com):',
        default: '',
      });
      expect(writeFile).toHaveBeenCalledWith(
        tempConfigPath,
        'TEST_API_KEY=test_input_value',
        { encoding: 'utf8' },
      );
    });

    it('should merge imported config with existing config when updating an existing config file', async () => {
      // Simulate that both the main config and the import file exist.
      vi.mocked(fs.existsSync).mockImplementation((path: PathLike) => {
        if (
          path.toString() === tempConfigPath ||
          path.toString() === importFile
        )
          return true;
        return false;
      });

      vi.mocked(readFile).mockImplementation(async (filePath, encoding) => {
        if (filePath === tempConfigPath) {
          // Existing config contains two keys.
          return 'EXISTING_KEY=existing_value\nTEST_API_KEY=old_test_value';
        }
        if (filePath === importFile) {
          // The import file provides a new value for TEST_API_KEY.
          return 'TEST_API_KEY=imported_value';
        }
        return '';
      });

      // Override dotenv.parse so that it dynamically parses the file content.
      vi.mocked(dotenv.parse).mockImplementation((content: string | Buffer) => {
        return content
          .toString()
          .split('\n')
          .reduce(
            (acc, line) => {
              const [key, ...vals] = line.split('=');
              acc[key] = vals.join('=');
              return acc;
            },
            {} as Record<string, string>,
          );
      });

      await runConfigWizard(tempConfigPath, importFile);

      // After merging, the imported value should override the old value.
      expect(input).toHaveBeenCalledWith({
        message:
          'Enter your TEST_API_KEY for TestProvider (https://testprovider.com):',
        default: 'imported_value',
      });
      // The final written config should preserve EXISTING_KEY from the original config
      // and update TEST_API_KEY with the user prompt input (test_input_value).
      expect(writeFile).toHaveBeenCalledWith(
        tempConfigPath,
        'EXISTING_KEY=existing_value\nTEST_API_KEY=test_input_value',
        { encoding: 'utf8' },
      );
    });
  });

  describe('ensureConfigFile', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return isNew true when configuration file was just created (file did not exist)', () => {
      // Simulate that the config file does not exist so that existsSync returns false.
      vi.spyOn(require('node:fs'), 'existsSync').mockReturnValue(false);

      const result = ensureConfigFile();
      expect(result.isNew).toBe(true);
      expect(result.configPath).toBe(getConfigPath());
    });

    it('should return isNew false when configuration file already exists (file exists)', () => {
      const spy = vi.spyOn(fs, 'existsSync').mockReturnValue(true);

      const result = ensureConfigFile();
      expect(result.isNew).toBe(false);
      expect(result.configPath).toBe(getConfigPath());
    });
  });
});
