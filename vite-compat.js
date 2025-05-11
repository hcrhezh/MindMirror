// This file provides compatibility functions for vite.config.ts in ES modules context
import { fileURLToPath } from 'url';
import path from 'path';

// Get directory name in ES modules context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Export the resolved path for client/src
export const clientSrcPath = path.resolve(__dirname, 'client/src');

// Function to resolve paths relative to project root 
export function resolvePath(relativePath) {
  return path.resolve(__dirname, relativePath);
}