import type { ProviderV1 } from '@ai-sdk/provider';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type ProviderEntry, hasApiKey, listProviders } from './providers';
describe('Providers', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore process.env after each test
    process.env = originalEnv;
  });

  describe('listProviders', () => {
    it('should return a non-empty array of providers', () => {
      const providers = listProviders();
      expect(providers).toBeInstanceOf(Array);
      expect(providers.length).toBeGreaterThan(0);
    });

    it('should have required properties for each provider', () => {
      const providers = listProviders();
      for (const provider of providers) {
        expect(provider).toHaveProperty('name');
        expect(provider).toHaveProperty('provider');
        expect(provider).toHaveProperty('models');
        expect(provider).toHaveProperty('apiKeyNames');
        expect(provider.models).toBeInstanceOf(Array);
        expect(provider.apiKeyNames).toBeInstanceOf(Array);
      }
    });

    it('should include known providers', () => {
      const providers = listProviders();
      const providerNames = providers.map((p) => p.name);

      // Test for presence of major providers
      expect(providerNames).toContain('openai');
      expect(providerNames).toContain('deepinfra');
      expect(providerNames).toContain('replicate');
    });
  });

  describe('hasApiKey', () => {
    it('should return true when all required API keys are present', () => {
      const mockProvider: ProviderEntry = {
        name: 'test-provider',
        provider: {} as ProviderV1,
        models: ['model1'],
        apiKeyNames: ['TEST_API_KEY'],
      };

      process.env.TEST_API_KEY = 'test-key';

      expect(hasApiKey(mockProvider)).toBe(true);
    });

    it('should return false when any API key is missing', () => {
      const mockProvider: ProviderEntry = {
        name: 'test-provider',
        provider: {} as ProviderV1,
        models: ['model1'],
        apiKeyNames: ['MISSING_API_KEY'],
      };

      expect(hasApiKey(mockProvider)).toBe(false);
    });

    it('should return false when API key is empty', () => {
      const mockProvider: ProviderEntry = {
        name: 'test-provider',
        provider: {} as ProviderV1,
        models: ['model1'],
        apiKeyNames: ['EMPTY_API_KEY'],
      };

      process.env.EMPTY_API_KEY = '';

      expect(hasApiKey(mockProvider)).toBe(false);
    });

    it('should handle multiple API key requirements', () => {
      const mockProvider: ProviderEntry = {
        name: 'test-provider',
        provider: {} as ProviderV1,
        models: ['model1'],
        apiKeyNames: ['KEY1', 'KEY2', 'KEY3'],
      };

      // Test when all keys are present
      process.env.KEY1 = 'value1';
      process.env.KEY2 = 'value2';
      process.env.KEY3 = 'value3';
      expect(hasApiKey(mockProvider)).toBe(true);

      // Test when one key is missing
      process.env.KEY2 = undefined;
      expect(hasApiKey(mockProvider)).toBe(false);
    });

    it('should handle providers with no API key requirements', () => {
      const mockProvider: ProviderEntry = {
        name: 'test-provider',
        provider: {} as ProviderV1,
        models: ['model1'],
        apiKeyNames: [],
      };

      expect(hasApiKey(mockProvider)).toBe(true);
    });
  });
});
