// Builds the low-poly .glb models in godot/assets/models from simple shapes (no drawing needed).
//   npm run models
// The rules every model follows are in docs/3D_MODEL_BRIEF.md.
import fs from 'node:fs';
import path from 'node:path';
import { Model } from './models/gltf.mjs';
import { RECIPES } from './models/recipes.mjs';

const items = Object.fromEntries(JSON.parse(fs.readFileSync('src/data/pack-items.json', 'utf8')).map((i) => [i.id, i]));
const MARGIN = 0.04;
const MAX_TRIS = 3000;

export function buildModel(id) {
  const recipe = RECIPES[id];
  const it = items[id];
  const [w, d] = recipe.foot ?? [it.w, it.h]; // native footprint in metres (1 tile = 1 m)
  const m = new Model(id);
  recipe.build(m, { w, d, W: w - 2 * MARGIN, D: d - 2 * MARGIN });
  return { model: m, foot: [w, d], kind: recipe.kind ?? 'object' };
}

export function allModels() {
  return Object.keys(RECIPES).map((id) => ({ id, ...buildModel(id) }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const out = path.resolve('godot/assets/models');
  fs.mkdirSync(out, { recursive: true });
  const index = {};
  const rows = [];
  for (const { id, model, foot, kind } of allModels()) {
    fs.writeFileSync(path.join(out, id + '.glb'), model.toGLB());
    const b = model.bounds();
    const height = +b.max[1].toFixed(3);
    const tris = model.triangles();
    index[id] = { height, foot, tris, kind };
    rows.push(`| \`${id}\` | ${items[id]?.name ?? id} | ${foot[0]} × ${foot[1]} | ${height} | ${tris} | ${model.animations.map((a) => a.name).join(', ') || '-'} |`);
    if (tris > (RECIPES[id].maxTris ?? MAX_TRIS)) console.warn(`  ${id}: ${tris} triangles is over the limit`);
  }
  fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index, null, 1));

  const made = new Set(Object.keys(RECIPES));
  const boxes = Object.keys(items).filter((id) => !made.has(id));
  fs.writeFileSync(
    path.join(out, 'MODELS.md'),
    `# Generated models\n\nMade by \`npm run models\` (scripts/make-models.mjs). Rules: docs/3D_MODEL_BRIEF.md. Do not edit the .glb files by hand: edit the recipe and run it again.\n\n## Made (${rows.length})\n\n| id | Name | Footprint (m) | Height (m) | Triangles | Animations |\n| --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n\n## Still a plain grey box in the game (${boxes.length})\n\n${boxes.map((b) => '`' + b + '`').join(', ')}\n`,
  );
  console.log(`Wrote ${rows.length} models to ${out} (${boxes.length} objects are still plain boxes)`);
}
