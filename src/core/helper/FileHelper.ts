import * as fs from "fs";
import * as path from "path";

/**
 * File Operations Helper Class
 * File system utilities
 */
export class FileHelper {
  static async readFile(filePath: string): Promise<string> {
    try {
      const data = await fs.promises.readFile(filePath, "utf-8");
      return data;
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  static async writeFile(filePath: string, data: string): Promise<void> {
    try {
      await fs.promises.writeFile(filePath, data, "utf-8");
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  static async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory: ${error.message}`);
    }
  }

  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static async delete(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  static getExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  static getFilename(filePath: string): string {
    return path.basename(filePath, path.extname(filePath));
  }

  static joinPath(...paths: string[]): string {
    return path.join(...paths);
  }

  static isValidImageType(filename: string): boolean {
    const validTypes = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    return validTypes.includes(this.getExtension(filename));
  }

  static isValidDocumentType(filename: string): boolean {
    const validTypes = [".pdf", ".doc", ".docx", ".txt", ".rtf"];
    return validTypes.includes(this.getExtension(filename));
  }

  static formatFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Bytes";

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }
}
