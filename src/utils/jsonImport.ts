import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function importJSON(path: string) {
  const fullPath = join(__dirname, '..', '..', path);
  return JSON.parse(readFileSync(fullPath, 'utf8'));
}