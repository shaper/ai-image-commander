import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import type { ImageEntry } from './image-entry';
import type { ImageRepository } from './image-repository';

export class LocalImageRepository implements ImageRepository {
  constructor(private readonly baseDir: string) {
    // Ensure that the base directory exists.
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private getImageFilePath(id: string): string {
    return path.join(this.baseDir, `image-${id}.png`);
  }

  private getEntryFilePath(id: string): string {
    return path.join(this.baseDir, `entry-${id}.json`);
  }

  async save(entry: ImageEntry, imageBuffer: Buffer): Promise<ImageEntry> {
    // Write image file to disk
    const imageFilePath = this.getImageFilePath(entry.id);
    await fsPromises.writeFile(imageFilePath, imageBuffer);
    // Store the full path in the entry
    entry.imageFileName = imageFilePath;
    // Write entry metadata to disk as JSON
    const entryFilePath = this.getEntryFilePath(entry.id);
    await fsPromises.writeFile(entryFilePath, JSON.stringify(entry, null, 2));
    return entry;
  }

  async get(id: string): Promise<ImageEntry | null> {
    const entryFilePath = this.getEntryFilePath(id);
    try {
      const data = await fsPromises.readFile(entryFilePath, 'utf8');
      return JSON.parse(data) as ImageEntry;
    } catch {
      return null;
    }
  }

  async list(): Promise<ImageEntry[]> {
    try {
      const files = await fsPromises.readdir(this.baseDir);
      // Filter JSON files that match our entry naming convention
      const entryFiles = files.filter(
        (file) => file.startsWith('entry-') && file.endsWith('.json'),
      );
      const entries = await Promise.all(
        entryFiles.map(async (file) => {
          const filePath = path.join(this.baseDir, file);
          try {
            const data = await fsPromises.readFile(filePath, 'utf8');
            return JSON.parse(data) as ImageEntry;
          } catch (err) {
            console.error(`Error reading entry from file ${file}:`, err);
            return null;
          }
        }),
      );
      return entries.filter((entry): entry is ImageEntry => entry !== null);
    } catch (error) {
      console.error('Error listing entries in', this.baseDir, error);
      return [];
    }
  }
}
