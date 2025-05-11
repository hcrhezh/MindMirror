// This is a simple shim to avoid __dirname not defined errors in ES module scope
import { fileURLToPath } from 'url';
import path from 'path';

// Get directory name in ES modules context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export { __dirname, __filename };