import fs from 'node:fs';
import path from 'node:path';

export class ImageStore {
  constructor(private readonly baseDir: string) {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  timestampFromPath(filePath: string): number {
    const fileName = path.basename(filePath);
    const timestamp = fileName.split('-')[1];
    return Number.parseInt(timestamp);
  }

  /**
   * Saves the full resolution image (PNG) to the base directory using the provided timestamp.
   */
  async saveImage(timestamp: number, imageBuffer: Buffer): Promise<string> {
    const fileName = `image-${timestamp}.png`;
    const filePath = path.join(this.baseDir, fileName);
    await fs.promises.writeFile(filePath, imageBuffer);
    return filePath;
  }

  /**
   * Saves the prompt (TXT) to the base directory using the provided timestamp.
   */
  async savePrompt(timestamp: number, prompt: string): Promise<string> {
    const fileName = `prompt-${timestamp}.txt`;
    const filePath = path.join(this.baseDir, fileName);
    await fs.promises.writeFile(filePath, prompt);
    return filePath;
  }

  /**
   * Lists all full resolution image files (PNG format) in the base directory.
   * Returns the full paths so they can be directly used by terminalFile.
   */
  async listImages(): Promise<string[]> {
    try {
      const files = await fs.promises.readdir(this.baseDir);
      return files
        .filter((file) => file.endsWith('.png'))
        .map((file) => path.join(this.baseDir, file));
    } catch (error) {
      console.error('Error listing full resolution images:', error);
      return [];
    }
  }

  /**
   * Loads the prompt for a full resolution image.
   */
  async loadPromptForImage(imageFileName: string): Promise<string | undefined> {
    const promptFileName = imageFileName
      .replace('image', 'prompt')
      .replace('.png', '.txt');
    const filePath = path.join(this.baseDir, promptFileName);
    return fs.existsSync(filePath)
      ? fs.promises.readFile(filePath, 'utf8')
      : undefined;
  }
}
