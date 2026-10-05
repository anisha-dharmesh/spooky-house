// Takes a picture of every generated model, a set at a time (for docs/art/3d-batch2/sheets/).
//   node scripts/make-sheets.mjs [outDir]
// Needs Godot installed (a window opens for a moment for each picture).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.argv[2] ?? 'docs/art/3d-batch2/sheets');
fs.mkdirSync(out, { recursive: true });
const SETS = {
  'little-house': ['home', 0],
  'granny-house': ['granny', 0],
  park: ['park', 0],
  pool: ['pool', 0],
  school: ['school', 0],
  hospital: ['hospital', 0],
  palace: ['palace', 0],
  vehicles: ['vehicles', 55],
  items: ['items', 0],
  streets: ['env', 0],
  characters: ['characters', 0],
  buildings: ['buildings', 25],
};
const PER_SHEET = 15;
execFileSync('node', ['scripts/make-models.mjs'], { stdio: 'ignore' });
execFileSync('godot', ['--headless', '--path', 'godot', '--import'], { stdio: 'ignore' });
for (const [name, [file, yaw]] of Object.entries(SETS)) {
  const { RECIPES } = await import(`./models/sets/${file}.mjs`);
  const ids = Object.keys(RECIPES);
  const parts = Math.ceil(ids.length / PER_SHEET);
  for (let i = 0; i < parts; i++) {
    const chunk = ids.slice(i * PER_SHEET, (i + 1) * PER_SHEET);
    const file = path.join(out, parts > 1 ? `${name}-${i + 1}.png` : `${name}.png`);
    const cols = Math.min(5, Math.ceil(Math.sqrt(chunk.length * 1.6)));
    execFileSync('node', ['scripts/sheet.mjs', '--no-build', '--out', file, '--size', '1280x720', '--cols', String(cols), ...(yaw ? ['--yaw', String(yaw)] : []), ...chunk], { stdio: 'inherit' });
  }
}
