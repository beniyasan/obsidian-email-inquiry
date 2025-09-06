/**
 * ObsidianVaultAdapter
 *
 * Adapter class that implements VaultAdapter interface for Obsidian Vault operations.
 * Provides abstraction layer between services and Obsidian API.
 */

import { Vault, FileManager, TFolder, TFile } from 'obsidian';
import { VaultAdapter } from '../../services/EmailCaptureService';

export class ObsidianVaultAdapter implements VaultAdapter {
  constructor(
    private vault: Vault,
    private fileManager: FileManager
  ) {}

  async create(path: string, content: string): Promise<void> {
    try {
      await this.vault.create(path, content);
    } catch (error) {
      throw new Error(`Failed to create file ${path}: ${error}`);
    }
  }

  async exists(path: string): Promise<boolean> {
    try {
      const file = this.vault.getAbstractFileByPath(path);
      return file !== null;
    } catch {
      return false;
    }
  }

  async createFolder(path: string): Promise<void> {
    try {
      // Create parent folders recursively if they don't exist
      const parts = path.split('/');
      let currentPath = '';

      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!await this.exists(currentPath)) {
          await this.vault.createFolder(currentPath);
        }
      }
    } catch (error) {
      throw new Error(`Failed to create folder ${path}: ${error}`);
    }
  }

  async writeFile(path: string, content: ArrayBuffer | Buffer): Promise<void> {
    try {
      // Ensure parent directory exists
      const parentDir = path.substring(0, path.lastIndexOf('/'));
      if (parentDir && !await this.exists(parentDir)) {
        await this.createFolder(parentDir);
      }

      // Convert Buffer to ArrayBuffer if needed
      let arrayBuffer: ArrayBuffer;
      if (content instanceof Buffer) {
        const buffer = new ArrayBuffer(content.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < content.length; ++i) {
          view[i] = content[i];
        }
        arrayBuffer = buffer;
      } else {
        arrayBuffer = content as ArrayBuffer;
      }

      await this.vault.createBinary(path, arrayBuffer);
    } catch (error) {
      throw new Error(`Failed to write file ${path}: ${error}`);
    }
  }

  async read(path: string): Promise<string> {
    try {
      const file = this.vault.getAbstractFileByPath(path);
      if (!file || !(file instanceof TFile)) {
        throw new Error(`File not found: ${path}`);
      }

      return await this.vault.read(file);
    } catch (error) {
      throw new Error(`Failed to read file ${path}: ${error}`);
    }
  }

  async modify(path: string, content: string): Promise<void> {
    try {
      const file = this.vault.getAbstractFileByPath(path);
      if (!file || !(file instanceof TFile)) {
        throw new Error(`File not found: ${path}`);
      }

      await this.vault.modify(file, content);
    } catch (error) {
      throw new Error(`Failed to modify file ${path}: ${error}`);
    }
  }

  async delete(path: string): Promise<void> {
    try {
      const file = this.vault.getAbstractFileByPath(path);
      if (!file) {
        throw new Error(`File not found: ${path}`);
      }

      await this.vault.delete(file);
    } catch (error) {
      throw new Error(`Failed to delete file ${path}: ${error}`);
    }
  }

  async list(folderPath: string): Promise<string[]> {
    try {
      const folder = this.vault.getAbstractFileByPath(folderPath);
      if (!folder || !(folder instanceof TFolder)) {
        return [];
      }

      const files: string[] = [];

      const processFolder = (currentFolder: TFolder) => {
        for (const child of currentFolder.children) {
          if (child instanceof TFile) {
            files.push(child.path);
          } else if (child instanceof TFolder) {
            processFolder(child);
          }
        }
      };

      processFolder(folder);
      return files;
    } catch (error) {
      throw new Error(`Failed to list folder ${folderPath}: ${error}`);
    }
  }

  getFolderPath(folder: string): string {
    // Simply return the folder name as is, since Obsidian uses relative paths
    return folder;
  }

  async getFiles(folderPath?: string): Promise<TFile[]> {
    try {
      if (folderPath) {
        const folder = this.vault.getAbstractFileByPath(folderPath);
        if (!folder || !(folder instanceof TFolder)) {
          return [];
        }

        const files: TFile[] = [];
        const processFolder = (currentFolder: TFolder) => {
          for (const child of currentFolder.children) {
            if (child instanceof TFile) {
              files.push(child);
            } else if (child instanceof TFolder) {
              processFolder(child);
            }
          }
        };

        processFolder(folder);
        return files;
      } else {
        return this.vault.getMarkdownFiles();
      }
    } catch (error) {
      throw new Error(`Failed to get files from ${folderPath}: ${error}`);
    }
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    try {
      const file = this.vault.getAbstractFileByPath(oldPath);
      if (!file) {
        throw new Error(`File not found: ${oldPath}`);
      }

      await this.fileManager.renameFile(file, newPath);
    } catch (error) {
      throw new Error(`Failed to rename ${oldPath} to ${newPath}: ${error}`);
    }
  }

  async copy(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      const sourceFile = this.vault.getAbstractFileByPath(sourcePath);
      if (!sourceFile || !(sourceFile instanceof TFile)) {
        throw new Error(`Source file not found: ${sourcePath}`);
      }

      const content = await this.vault.read(sourceFile);
      await this.create(destinationPath, content);
    } catch (error) {
      throw new Error(`Failed to copy ${sourcePath} to ${destinationPath}: ${error}`);
    }
  }
}
