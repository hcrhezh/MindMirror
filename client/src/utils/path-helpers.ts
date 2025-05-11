import { fileURLToPath } from 'url';
import path from 'path';

// Get directory name in ES modules context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Calculate paths relative to this file
export const clientSrcPath = path.resolve(__dirname, '..');
export const rootPath = path.resolve(clientSrcPath, '../..');
export const assetsPath = path.resolve(rootPath, 'attached_assets');

// Export function to get a path relative to the client src directory
export function getClientPath(relativePath: string): string {
  return path.resolve(clientSrcPath, relativePath);
}

// Export function to get a path relative to the project root
export function getRootPath(relativePath: string): string {
  return path.resolve(rootPath, relativePath);
}

// Function to get paths compatible with both ESM and CommonJS
export function getESMCompatiblePaths() {
  return {
    clientSrcPath,
    rootPath,
    assetsPath,
    getClientPath,
    getRootPath
  };
}