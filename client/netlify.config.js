// This file provides alternative configuration for Netlify
// It works around the ESM __dirname issue

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  clientSrcPath: path.resolve(__dirname, 'src'),
  rootPath: path.resolve(__dirname, '..'),
  assetsPath: path.resolve(__dirname, '../attached_assets'),
};