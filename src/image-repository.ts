import type { ImageEntry } from './image-entry';

export interface ImageRepository {
  /**
   * Save an image entry and its image file to disk.
   * @param entry - The image entry to save.
   * @param imageBuffer - The image file to save.
   * @returns The saved image entry.
   */
  save(entry: ImageEntry, imageBuffer: Buffer): Promise<ImageEntry>;

  /**
   * Get an image entry by its id.
   * @param id - The id of the image entry to get.
   * @returns The image entry or null if it does not exist.
   */
  get(id: string): Promise<ImageEntry | null>;

  /**
   * List all image entries.
   * @returns A list of all image entries.
   */
  list(): Promise<ImageEntry[]>;
}
