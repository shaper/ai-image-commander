import fs from 'fs';
import path from 'path';

export class AssetStore {
  private readonly baseDir: string;

  constructor() {
    this.baseDir = path.join(__dirname, 'public');
  }

  /**
   * Loads and returns the content of a resource located at the given relative path within the base directory.
   * @param relativePath - The relative path to the resource (e.g., 'welcome.txt').
   * @returns The file content as a string if the file exists; otherwise, null.
   */
  loadResource(relativePath: string): string | null {
    const fullPath = path.join(this.baseDir, relativePath);
    return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : null;
  }
}
