import { resolve } from 'path';

// Resolved from this file's location (src/common or dist/common) instead of
// process.cwd(), so the app works no matter which directory it is started from.
const PROJECT_ROOT = resolve(__dirname, '..', '..');

export const ASSETS_DIR = process.env.ASSETS_DIR
  ? resolve(process.env.ASSETS_DIR)
  : resolve(PROJECT_ROOT, 'assets');

export const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? resolve(process.env.UPLOADS_DIR)
  : resolve(PROJECT_ROOT, 'uploads');
