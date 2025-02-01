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
   * Reads and returns the welcome content from the specified public directory.
   */
  static getWelcomeContent(publicDir: string): string | null {
    const welcomeFilePath = path.join(publicDir, 'welcome.txt');
    return fs.existsSync(welcomeFilePath)
      ? fs.readFileSync(welcomeFilePath, 'utf8')
      : null;
  }
}
