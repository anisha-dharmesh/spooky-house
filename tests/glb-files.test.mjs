// Checks every .glb in godot/assets/models against the rules in docs/3D_MODEL_BRIEF.md,
// whoever made it (Claude Design, an artist, or the generator).
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { modelInfo, readGlb } from '../scripts/models/glb-info.mjs';

const DIR = path.resolve('godot/assets/models');
const items = Object.fromEntries(JSON.parse(fs.readFileSync('godot/data/pack-items.json', 'utf8')).map((i) => [i.id, i]));
const index = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8'));
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.glb')).sort();

const CHARACTERS = {
  anisha: ['idle', 'walk', 'sneak', 'pickup', 'hide'],
  scary_teacher: ['idle', 'walk', 'look_around', 'caught_you'],
};
const EXTRAS = ['shoes', ...Object.keys(CHARACTERS)];

describe('model files', () => {
  it('has a model for every Level 1 object, Anisha, the teacher and her shoes', () => {
    for (const id of ['fridge', 'counter', 'gas_stove', 'sink', 'table_dining', 'chair', 'sofa', 'tv_big', 'cupboard_big', 'piano', 'cement_bag', 'skates', 'anisha', 'scary_teacher', 'shoes'])
      expect(files).toContain(id + '.glb');
  });

  it('lists every file in index.json', () => {
    for (const f of files) expect(index[f.replace('.glb', '')], f).toBeDefined();
  });

  for (const f of files) {
    const id = f.replace('.glb', '');
    describe(id, () => {
      const info = modelInfo(readGlb(path.join(DIR, f)).json);
      const isCharacter = id in CHARACTERS;

      it('stands on the floor', () => {
        expect(info.min[1]).toBeGreaterThan(-0.02);
      });

      it('is low-poly', () => {
        expect(info.triangles).toBeLessThanOrEqual(isCharacter ? 8000 : 3000);
      });

      it('stays inside its footprint', () => {
        if (EXTRAS.includes(id)) return;
        const it = items[id];
        expect(it, `${id} is not an object in the art pack`).toBeDefined();
        expect(Math.max(-info.min[0], info.max[0]) * 2).toBeLessThanOrEqual(it.w + 0.05);
        expect(Math.max(-info.min[2], info.max[2]) * 2).toBeLessThanOrEqual(it.h + 0.05);
      });

      if (isCharacter) {
        it('has its animations, named exactly', () => {
          for (const a of CHARACTERS[id]) expect(info.animations).toContain(a);
        });
      }

      it('matches its entry in index.json', () => {
        expect(index[id].height).toBeCloseTo(info.max[1], 1);
        expect(index[id].tris).toBe(info.triangles);
      });
    });
  }
});
