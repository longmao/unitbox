// One-time script: generate src/lib/i18n/zh-hant.ts from zh-hans.ts using opencc-js
// (Simplified → Traditional Chinese). Run with: `node scripts/build-zh-hant.mjs`

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as OpenCC from 'opencc-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src/lib/i18n/zh-hans.ts');
const OUT = path.join(ROOT, 'src/lib/i18n/zh-hant.ts');

const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });

const src = fs.readFileSync(SRC, 'utf8');
// Replace the header comment + export name; keep the const name `ZH_HANS` as the
// exported identifier so callers can use it uniformly (semantic name doesn't matter
// for resolution — it's the keys that align).
const converted = src
  // Replace file-level banner comment
  .replace(
    /\/\/ Simplified Chinese.*$/m,
    '// Traditional Chinese (Taiwan / Hong Kong) — generated from zh-hans.ts via opencc-js (cn→tw).'
  )
  // Replace exported identifier
  .replace(/export const ZH_HANS:/, 'export const ZH_HANT:')
  // Convert each value string (between two single quotes on the same line)
  .replace(/'([^']*)'/g, (m, inner) => `'${converter(inner)}'`);

fs.writeFileSync(OUT, converted);
console.log(`wrote ${OUT} (${converted.length} bytes)`);
