// Keeps godot/assets/models up to date.
//   npm run models
//
// Two sources of models:
//  - Made by Claude Design: godot/assets/models/batch1.manifest.json lists them (31 objects, Anisha, the scary teacher).
//    Those .glb files are used as they are; this script only reads their sizes into index.json.
//  - Generated here from simple shapes (scripts/models/recipes.mjs): only for what no one has made yet (her shoes).
// The rules every model follows are in docs/3D_MODEL_BRIEF.md.
import fs from 'node:fs';
import path from 'node:path';
import { Model } from './models/gltf.mjs';
import { RECIPES } from './models/recipes.mjs';
import { modelInfo, readGlb } from './models/glb-info.mjs';

const OUT = path.resolve('godot/assets/models');
const items = Object.fromEntries(JSON.parse(fs.readFileSync('godot/data/pack-items.json', 'utf8')).map((i) => [i.id, i]));
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

/** "wall, bottom edge at 2.1 m" -> { y: 2.1, wall: true }; "floor" -> null */
export function parseMount(text) {
  if (!text || text.startsWith('floor')) return null;
  const num = text.match(/(\d+(?:\.\d+)?)\s*m/);
  return { y: num ? +num[1] : 0, wall: text.startsWith('wall') };
}

function externalModels() {
  const file = path.join(OUT, 'batch1.manifest.json');
  if (!fs.existsSync(file)) return [];
  const man = JSON.parse(fs.readFileSync(file, 'utf8'));
  return [
    ...man.objects.map((o) => ({ ...o, kind: 'object' })),
    ...man.characters.map((o) => ({ ...o, kind: 'character' })),
  ];
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  fs.mkdirSync(OUT, { recursive: true });
  const index = {};
  const rows = [];

  // 1. models made by Claude Design
  const external = externalModels();
  for (const o of external) {
    const file = path.join(OUT, o.id + '.glb');
    if (!fs.existsSync(file)) {
      console.warn(`  ${o.id}: listed in batch1.manifest.json but ${o.id}.glb is missing`);
      continue;
    }
    const info = modelInfo(readGlb(file).json);
    const mount = parseMount(o.mount);
    index[o.id] = {
      height: +info.max[1].toFixed(3),
      foot: o.footprint_m ?? [0.8, 0.8],
      tris: info.triangles,
      kind: o.kind,
      source: 'claude-design-batch1',
      ...(mount ? { mount_y: mount.y, wall: mount.wall, min_z: +info.min[2].toFixed(3) } : {}),
    };
    rows.push(`| \`${o.id}\` | ${o.name ?? o.id} | ${index[o.id].foot.join(' × ')} | ${index[o.id].height} | ${info.triangles} | ${info.animations.join(', ') || '-'} | Claude Design |`);
  }

  // 2. models generated here
  for (const { id, model, foot, kind } of allModels()) {
    fs.writeFileSync(path.join(OUT, id + '.glb'), model.toGLB());
    const height = +model.bounds().max[1].toFixed(3);
    const tris = model.triangles();
    index[id] = { height, foot, tris, kind, source: 'generated' };
    rows.push(`| \`${id}\` | ${items[id]?.name ?? id} | ${foot[0]} × ${foot[1]} | ${height} | ${tris} | ${model.animations.map((a) => a.name).join(', ') || '-'} | generated |`);
    if (tris > (RECIPES[id].maxTris ?? MAX_TRIS)) console.warn(`  ${id}: ${tris} triangles is over the limit`);
  }
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1));

  const made = new Set(Object.keys(index));
  const boxes = Object.keys(items).filter((id) => !made.has(id));
  fs.writeFileSync(
    path.join(OUT, 'MODELS.md'),
    `# Models\n\nWritten by \`npm run models\`. Rules: docs/3D_MODEL_BRIEF.md. Pictures of batch 1: docs/art/3d-batch1/.\n\n## Made (${rows.length})\n\n| id | Name | Footprint (m) | Height (m) | Triangles | Animations | Made by |\n| --- | --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n\n## Still a plain grey box in the game (${boxes.length})\n\n${boxes.map((b) => '`' + b + '`').join(', ')}\n`,
  );
  console.log(`Models: ${rows.length} made (${external.length} by Claude Design), ${boxes.length} objects are still plain boxes`);
}
