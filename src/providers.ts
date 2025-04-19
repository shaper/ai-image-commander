import { deepinfra } from '@ai-sdk/deepinfra';
import { fal } from '@ai-sdk/fal';
import { fireworks } from '@ai-sdk/fireworks';
import { vertex } from '@ai-sdk/google-vertex';
import { luma } from '@ai-sdk/luma';
import { openai } from '@ai-sdk/openai';
import type { ProviderV1 } from '@ai-sdk/provider';
import { replicate } from '@ai-sdk/replicate';
import { togetherai } from '@ai-sdk/togetherai';
import { xai } from '@ai-sdk/xai';
import { deepFreeze } from './utils';

export interface ProviderEntry {
  name: string;
  provider: ProviderV1;
  models: string[];
  apiKeyNames: string[];
  website: string;
}

export function hasApiKey(provider: ProviderEntry): boolean {
  return provider.apiKeyNames.every((keyName) => process.env[keyName]);
}

export function listProviders(): ReadonlyArray<ProviderEntry> {
  return PROVIDERS;
}

const PROVIDERS: ReadonlyArray<ProviderEntry> = deepFreeze([
  {
    name: 'deepinfra',
    provider: deepinfra,
    models: [
      'stabilityai/sd3.5',
      'black-forest-labs/FLUX-1.1-pro',
      'black-forest-labs/FLUX-1-schnell',
      'black-forest-labs/FLUX-1-dev',
      'black-forest-labs/FLUX-pro',
      'stabilityai/sd3.5-medium',
      'stabilityai/sdxl-turbo',
    ],
    apiKeyNames: ['DEEPINFRA_API_KEY'],
    website: 'https://deepinfra.com',
  },
  {
    name: 'fal',
    provider: fal,
    models: [
      'fal-ai/aura-flow',
      'fal-ai/aura-sr',
      'fal-ai/bria/eraser',
      'fal-ai/bria/product-shot',
      'fal-ai/bria/text-to-image/base',
      'fal-ai/bria/text-to-image/fast',
      'fal-ai/bria/text-to-image/hd',
      'fal-ai/bria/text-to-image/turbo',
      'fal-ai/ccsr',
      'fal-ai/clarity-upscaler',
      'fal-ai/creative-upscaler',
      'fal-ai/esrgan',
      'fal-ai/fast-sdxl',
      'fal-ai/flux-general',
      'fal-ai/flux-general/differential-diffusion',
      'fal-ai/flux-general/image-to-image',
      'fal-ai/flux-general/inpainting',
      'fal-ai/flux-general/rf-inversion',
      'fal-ai/flux-lora',
      'fal-ai/flux-lora/image-to-image',
      'fal-ai/flux-lora/inpainting',
      'fal-ai/flux-pro/v1.1',
      'fal-ai/flux-pro/v1.1-ultra',
      'fal-ai/flux-pro/v1.1-ultra-finetuned',
      'fal-ai/flux-pro/v1.1-ultra/redux',
      'fal-ai/flux-pro/v1.1/redux',
      'fal-ai/flux/dev',
      'fal-ai/flux/dev/image-to-image',
      'fal-ai/flux/dev/redux',
      'fal-ai/flux/schnell',
      'fal-ai/flux/schnell/redux',
      'fal-ai/hyper-sdxl',
      'fal-ai/ideogram/v2',
      'fal-ai/ideogram/v2/remix',
      'fal-ai/ideogram/v2/turbo',
      'fal-ai/ideogram/v2/turbo/edit',
      'fal-ai/ideogram/v2/turbo/remix',
      'fal-ai/janus',
      'fal-ai/luma-photon',
      'fal-ai/luma-photon/flash',
      'fal-ai/omnigen-v1',
      'fal-ai/playground-v25',
      'fal-ai/recraft-20b',
      'fal-ai/recraft-v3',
      'fal-ai/sana',
      'fal-ai/stable-cascade',
      'fal-ai/stable-diffusion-3.5-large',
      'fal-ai/stable-diffusion-3.5-medium',
      'fashn/tryon',
    ],
    apiKeyNames: ['FAL_API_KEY'],
    website: 'https://fal.ai',
  },
  {
    name: 'fireworks',
    provider: fireworks,
    models: [
      'accounts/fireworks/models/flux-1-dev-fp8',
      'accounts/fireworks/models/flux-1-schnell-fp8',
      'accounts/fireworks/models/playground-v2-5-1024px-aesthetic',
      'accounts/fireworks/models/japanese-stable-diffusion-xl',
      'accounts/fireworks/models/playground-v2-1024px-aesthetic',
      'accounts/fireworks/models/SSD-1B',
      'accounts/fireworks/models/stable-diffusion-xl-1024-v1-0',
    ],
    apiKeyNames: ['FIREWORKS_API_KEY'],
    website: 'https://fireworks.ai',
  },
  {
    name: 'luma',
    provider: luma,
    models: ['photon-1', 'photon-flash-1'],
    apiKeyNames: ['LUMA_API_KEY'],
    website: 'https://luma.ai',
  },
  {
    name: 'openai',
    provider: openai,
    models: ['dall-e-2', 'dall-e-3'],
    apiKeyNames: ['OPENAI_API_KEY'],
    website: 'https://openai.com',
  },
  {
    name: 'replicate',
    provider: replicate,
    models: [
      'black-forest-labs/flux-1.1-pro',
      'black-forest-labs/flux-1.1-pro-ultra',
      'black-forest-labs/flux-dev',
      'black-forest-labs/flux-pro',
      'black-forest-labs/flux-schnell',
      'bytedance/sdxl-lightning-4step',
      'fofr/aura-flow',
      'fofr/latent-consistency-model',
      'fofr/realvisxl-v3-multi-controlnet-lora',
      'fofr/sdxl-emoji',
      'fofr/sdxl-multi-controlnet-lora',
      'ideogram-ai/ideogram-v2',
      'ideogram-ai/ideogram-v2-turbo',
      'lucataco/dreamshaper-xl-turbo',
      'lucataco/open-dalle-v1.1',
      'lucataco/realvisxl-v2.0',
      'lucataco/realvisxl2-lcm',
      'luma/photon',
      'luma/photon-flash',
      'nvidia/sana',
      'playgroundai/playground-v2.5-1024px-aesthetic',
      'recraft-ai/recraft-v3',
      'recraft-ai/recraft-v3-svg',
      'stability-ai/stable-diffusion-3.5-large',
      'stability-ai/stable-diffusion-3.5-large-turbo',
      'stability-ai/stable-diffusion-3.5-medium',
      'tstramer/material-diffusion',
    ],
    apiKeyNames: ['REPLICATE_API_TOKEN'],
    website: 'https://replicate.com',
  },
  {
    name: 'togetherai',
    provider: togetherai,
    models: [
      'stabilityai/stable-diffusion-xl-base-1.0',
      'black-forest-labs/FLUX.1-dev',
      'black-forest-labs/FLUX.1-dev-lora',
      'black-forest-labs/FLUX.1-schnell',
      'black-forest-labs/FLUX.1-canny',
      'black-forest-labs/FLUX.1-depth',
      'black-forest-labs/FLUX.1-redux',
      'black-forest-labs/FLUX.1.1-pro',
      'black-forest-labs/FLUX.1-pro',
      'black-forest-labs/FLUX.1-schnell-Free',
    ],
    apiKeyNames: ['TOGETHER_AI_API_KEY'],
    website: 'https://together.ai',
  },
  {
    name: 'vertex',
    provider: vertex,
    models: ['imagen-3.0-generate-001', 'imagen-3.0-fast-generate-001'],
    apiKeyNames: [
      'GOOGLE_APPLICATION_CREDENTIALS',
      'GOOGLE_VERTEX_PROJECT',
      'GOOGLE_VERTEX_LOCATION',
    ],
    website: 'https://cloud.google.com/vertex-ai',
  },
  {
    name: 'xai',
    provider: xai,
    models: ['grok-2-image'],
    apiKeyNames: ['XAI_API_KEY'],
    website: 'https://x.ai',
  },
]);
