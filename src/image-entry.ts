import { randomUUID } from 'node:crypto';

export interface ImageEntry {
  id: string;
  createdAt: number;
  prompt: string | undefined;
  imageFileName: string | undefined;
  metadata?: Record<string, unknown>;
}

export function createImageEntry(
  prompt: string | undefined,
  metadata?: Record<string, unknown>,
): ImageEntry {
  return {
    id: randomUUID(),
    createdAt: Date.now(),
    prompt,
    imageFileName: undefined,
    metadata,
  };
}
