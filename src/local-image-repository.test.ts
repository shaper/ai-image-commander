import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ImageEntry } from './image-entry';
import { LocalImageRepository } from './local-image-repository';

let tempDir: string;

beforeEach(async () => {
  tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'imagerepo-'));
});

afterEach(async () => {
  await fsPromises.rm(tempDir, { recursive: true, force: true });
});

describe('LocalImageRepository', () => {
  it('should create the base directory if it does not exist', async () => {
    const newDir = path.join(tempDir, 'nonexistent');
    expect(fs.existsSync(newDir)).toBe(false);
    new LocalImageRepository(newDir);
    expect(fs.existsSync(newDir)).toBe(true);
  });

  it('should save an image entry and its buffer', async () => {
    const repo = new LocalImageRepository(tempDir);
    const entry: ImageEntry = {
      id: 'test-123',
      createdAt: Date.now(),
      prompt: 'test prompt',
      imageFileName: undefined,
    };
    const imageBuffer = Buffer.from('test image content');

    const savedEntry = await repo.save(entry, imageBuffer);

    // Check the image file was saved
    const imageFilePath = path.join(tempDir, `image-${entry.id}.png`);
    const savedImageContent = await fsPromises.readFile(imageFilePath);
    expect(savedImageContent.equals(imageBuffer)).toBe(true);

    // Check the entry was saved with the correct filename
    const entryFilePath = path.join(tempDir, `entry-${entry.id}.json`);
    const savedEntryContent = await fsPromises.readFile(entryFilePath, 'utf8');
    const parsedEntry = JSON.parse(savedEntryContent);
    expect(parsedEntry).toEqual({
      ...entry,
      imageFileName: imageFilePath,
    });
  });

  it('should get an entry by id', async () => {
    const repo = new LocalImageRepository(tempDir);
    const entry: ImageEntry = {
      id: 'test-456',
      createdAt: Date.now(),
      prompt: 'test prompt',
      imageFileName: 'image-test-456.png',
    };

    // Save the entry directly to the filesystem
    const entryPath = path.join(tempDir, `entry-${entry.id}.json`);
    await fsPromises.writeFile(entryPath, JSON.stringify(entry));

    const retrievedEntry = await repo.get(entry.id);
    expect(retrievedEntry).toEqual(entry);
  });

  it('should return null when getting a non-existent entry', async () => {
    const repo = new LocalImageRepository(tempDir);
    const retrievedEntry = await repo.get('non-existent-id');
    expect(retrievedEntry).toBeNull();
  });

  it('should list all entries', async () => {
    const repo = new LocalImageRepository(tempDir);
    const entries: ImageEntry[] = [
      {
        id: 'test-1',
        createdAt: Date.now(),
        prompt: 'prompt 1',
        imageFileName: 'image-test-1.png',
      },
      {
        id: 'test-2',
        createdAt: Date.now(),
        prompt: 'prompt 2',
        imageFileName: 'image-test-2.png',
      },
    ];

    // Save entries directly to the filesystem
    await Promise.all(
      entries.map((entry) =>
        fsPromises.writeFile(
          path.join(tempDir, `entry-${entry.id}.json`),
          JSON.stringify(entry),
        ),
      ),
    );

    const listedEntries = await repo.list();
    expect(listedEntries).toHaveLength(2);
    expect(listedEntries).toEqual(expect.arrayContaining(entries));
  });

  it('should handle empty directory when listing', async () => {
    const repo = new LocalImageRepository(tempDir);
    const entries = await repo.list();
    expect(entries).toEqual([]);
  });
});
