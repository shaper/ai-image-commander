import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ImageStore } from './image-store';

let tempDir: string;

beforeEach(async () => {
  // Create a unique temporary directory for testing.
  tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'imagestore-'));
});

afterEach(async () => {
  // Cleanup the temporary directory.
  await fsPromises.rm(tempDir, { recursive: true, force: true });
});

describe('ImageStore', () => {
  it('should create the base directory if it does not exist', async () => {
    const newDir = path.join(tempDir, 'nonexistent');
    expect(fs.existsSync(newDir)).toBe(false);

    // Constructing the ImageStore should create newDir.
    new ImageStore(newDir);
    expect(fs.existsSync(newDir)).toBe(true);
  });

  it('timestampFromPath should extract the timestamp from a filename', () => {
    const imageStore = new ImageStore(tempDir);
    const timestamp = imageStore.timestampFromPath('image-123456789.png');
    expect(timestamp).toBe(123456789);
  });

  it('saveImage should create an image file and return its path', async () => {
    const imageStore = new ImageStore(tempDir);
    const testBuffer = Buffer.from('test image content');
    const testTimestamp = Date.now();

    const filePath = await imageStore.saveImage(testTimestamp, testBuffer);
    expect(filePath).toBe(path.join(tempDir, `image-${testTimestamp}.png`));

    const fileContent = await fsPromises.readFile(filePath);
    expect(fileContent.equals(testBuffer)).toBe(true);
  });

  it('savePrompt should create a prompt file and return its path', async () => {
    const imageStore = new ImageStore(tempDir);
    const testPrompt = 'This is a test prompt';
    const testTimestamp = 123456;

    const filePath = await imageStore.savePrompt(testTimestamp, testPrompt);
    expect(filePath).toBe(path.join(tempDir, `prompt-${testTimestamp}.txt`));

    const fileContent = await fsPromises.readFile(filePath, 'utf8');
    expect(fileContent).toBe(testPrompt);
  });

  it('listImages should return only PNG files in the directory', async () => {
    const imageStore = new ImageStore(tempDir);
    // Create some files, including ones that are not PNG images.
    const validImage1 = path.join(tempDir, 'image-1.png');
    const validImage2 = path.join(tempDir, 'image-2.png');
    const invalidFile = path.join(tempDir, 'note.txt');
    await Promise.all([
      fsPromises.writeFile(validImage1, 'dummy1'),
      fsPromises.writeFile(validImage2, 'dummy2'),
      fsPromises.writeFile(invalidFile, 'invalid'),
    ]);

    const files = await imageStore.listImages();
    expect(files).toContain(validImage1);
    expect(files).toContain(validImage2);
    expect(files).not.toContain(invalidFile);
  });

  it('loadPromptForImage should return the prompt content if the file exists', async () => {
    const imageStore = new ImageStore(tempDir);
    const imageFileName = 'image-100.png';
    // loadPromptForImage expects to replace "image" with "prompt" and ".png" with ".txt"
    const promptFileName = 'prompt-100.txt';
    const promptFilePath = path.join(tempDir, promptFileName);
    const promptContent = 'Sample prompt text';
    await fsPromises.writeFile(promptFilePath, promptContent, 'utf8');

    const loadedPrompt = await imageStore.loadPromptForImage(imageFileName);
    expect(loadedPrompt).toBe(promptContent);
  });

  it('loadPromptForImage should return undefined if the prompt file does not exist', async () => {
    const imageStore = new ImageStore(tempDir);
    const imageFileName = 'image-200.png';

    const loadedPrompt = await imageStore.loadPromptForImage(imageFileName);
    expect(loadedPrompt).toBeUndefined();
  });
});
