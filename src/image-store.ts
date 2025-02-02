import fs from 'fs';
import path from 'path';

export class ImageStore {
  constructor(private readonly baseDir: string) {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  /**
   * Saves the full resolution image (PNG) to the base directory using the provided timestamp.
   */
  async saveFullResolutionImage(
    timestamp: number,
    imageBuffer: Buffer,
  ): Promise<string> {
    const fileName = `image-${timestamp}.png`;
    const filePath = path.join(this.baseDir, fileName);
    await fs.promises.writeFile(filePath, imageBuffer);
    return filePath;
  }

  /**
   * Saves the rendered image (TXT) to the base directory using the provided timestamp.
   */
  async saveRenderedImage(
    timestamp: number,
    renderedImage: string,
  ): Promise<string> {
    const fileName = `image-${timestamp}-rendered.txt`;
    const filePath = path.join(this.baseDir, fileName);
    await fs.promises.writeFile(filePath, renderedImage);
    return filePath;
  }

  /**
   * Lists all rendered image files (TXT format) in the base directory.
   */
  async listRenderedImages(): Promise<string[]> {
    try {
      const files = await fs.promises.readdir(this.baseDir);
      return files.filter(file => file.endsWith('.txt'));
    } catch (error) {
      console.error('Error listing rendered images:', error);
      return [];
    }
  }

  /**
   * Loads the content of a rendered image file.
   */
  async loadRenderedImage(fileName: string): Promise<string> {
    const filePath = path.join(this.baseDir, fileName);
    return fs.promises.readFile(filePath, 'utf8');
  }

  /**
   * Lists all full resolution image files (PNG format) in the base directory.
   * Returns the full paths so they can be directly used by terminalFile.
   */
  async listFullResolutionImages(): Promise<string[]> {
    try {
      const files = await fs.promises.readdir(this.baseDir);
      return files
        .filter(file => file.endsWith('.png'))
        .map(file => path.join(this.baseDir, file));
    } catch (error) {
      console.error('Error listing full resolution images:', error);
      return [];
    }
  }
}
