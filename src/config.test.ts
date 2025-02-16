import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { input } from '@inquirer/prompts';
import dotenv from 'dotenv';
import { listProviders } from './providers';
import { initConfig, runConfigWizard } from './config';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ProviderV1 } from '@ai-sdk/provider';

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
    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(readFileSync).mockReturnValue('EXAMPLE_KEY=example_value');
    vi.mocked(writeFileSync).mockImplementation(() => undefined);
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
      expect(existsSync).toHaveBeenCalledWith(tempConfigPath);
      expect(writeFileSync).toHaveBeenCalledWith(
        tempConfigPath,
        'EXAMPLE_KEY=example_value',
        { encoding: 'utf8' },
      );
    });

    it('should return true when config already exists', () => {
      vi.mocked(existsSync).mockReturnValue(true);

      const result = initConfig(tempConfigPath);

      expect(result).toBe(true);
      expect(writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('runConfigWizard', () => {
    it('should load existing config and prompt for values', async () => {
      vi.mocked(existsSync).mockReturnValue(true);

      await runConfigWizard(tempConfigPath);

      expect(readFile).toHaveBeenCalledWith(tempConfigPath, 'utf8');
      expect(dotenv.parse).toHaveBeenCalled();
      expect(input).toHaveBeenCalledWith({
        message: 'Enter your TEST_API_KEY for TestProvider:',
        default: '',
      });
      expect(writeFile).toHaveBeenCalledWith(
        tempConfigPath,
        'EXISTING_KEY=existing_value\nTEST_API_KEY=test_input_value',
        { encoding: 'utf8' },
      );
    });

    it('should create new config when none exists', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

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
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(input).mockResolvedValue('');

      await runConfigWizard(tempConfigPath);

      expect(writeFile).toHaveBeenCalledWith(tempConfigPath, 'TEST_API_KEY=', {
        encoding: 'utf8',
      });
    });

    it('should preserve existing values when updating config', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(dotenv.parse).mockReturnValue({
        EXISTING_KEY: 'existing_value',
        TEST_API_KEY: 'old_test_value',
      });

      await runConfigWizard(tempConfigPath);

      expect(input).toHaveBeenCalledWith({
        message: 'Enter your TEST_API_KEY for TestProvider:',
        default: 'old_test_value',
      });
      expect(writeFile).toHaveBeenCalledWith(
        tempConfigPath,
        'EXISTING_KEY=existing_value\nTEST_API_KEY=test_input_value',
        { encoding: 'utf8' },
      );
    });
  });
});
