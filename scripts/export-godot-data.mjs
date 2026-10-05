// Copies the shared game data into the Godot project (godot/data) so both versions play the same levels.
// Run with:  npm run godot:data
import fs from 'node:fs';
import path from 'node:path';
import { UI } from '../src/i18n.ts';

const out = path.resolve('godot/data');
fs.mkdirSync(path.join(out, 'rooms'), { recursive: true });

fs.copyFileSync('src/data/levels.json', path.join(out, 'levels.json'));
fs.copyFileSync('src/data/baddies.json', path.join(out, 'baddies.json'));
fs.writeFileSync(path.join(out, 'strings.json'), JSON.stringify(UI, null, 1));

// rooms: flat folder, one JSON per room (floor pictures are not needed in 3D)
let n = 0;
for (const loc of fs.readdirSync('public/assets/rooms')) {
  for (const f of fs.readdirSync(path.join('public/assets/rooms', loc))) {
    if (!f.endsWith('.json')) continue;
    fs.copyFileSync(path.join('public/assets/rooms', loc, f), path.join(out, 'rooms', f));
    n++;
  }
}
console.log(`Godot data updated: levels, baddies, strings, ${n} rooms`);
