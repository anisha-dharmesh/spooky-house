// Keeps godot/assets/models up to date.
//   npm run models            builds every model from its recipe and refreshes index.json and MODELS.md
//
// Two sources of models:
//  - Made by Claude Design: godot/assets/models/batch1.manifest.json lists them (31 objects, Anisha, the scary teacher).
//    Those .glb files are used as they are; this script only reads their sizes into index.json.
//    (Anisha and the teacher are redone from the reference pictures: a recipe with the same id replaces the Design file.)
//  - Generated here from shapes (scripts/models/sets/*.mjs): everything else, matched to the reference pictures in
//    docs/art/reference/.
// The rules every model follows are in docs/3D_MODEL_BRIEF.md.
import fs from 'node:fs';
import path from 'node:path';
import { Model } from './models/gltf.mjs';
import { RECIPES } from './models/recipes.mjs';
import { modelInfo, readGlb } from './models/glb-info.mjs';

const OUT = path.resolve('godot/assets/models');
const items = Object.fromEntries(JSON.parse(fs.readFileSync('godot/data/pack-items.json', 'utf8')).map((i) => [i.id, i]));
const MARGIN = 0.04;
export const MAX_TRIS = { object: 3000, character: 8000, vehicle: 6000, building: 20000, item: 1500, extra: 3000 };

const EPS = 0.021; // a model may not stick out of its footprint by more than 2 cm

export function buildModel(id) {
  const recipe = RECIPES[id];
  const it = items[id];
  const kind = recipe.kind ?? 'object';
  let [w, d] = recipe.foot ?? [it.w, it.h]; // native footprint in metres (1 tile = 1 m)
  const m = new Model(id);
  recipe.build(m, { w, d, W: w - 2 * MARGIN, D: d - 2 * MARGIN });
  const reach = (b) => [Math.max(-b.min[0], b.max[0]) * 2, Math.max(-b.min[2], b.max[2]) * 2];
  if (kind === 'object') {
    // an object of the art pack must fit its tiles: if it is a little too big, shrink it evenly to fit
    const [ex, ez] = reach(m.bounds());
    const f = Math.min(1, (w + 2 * EPS) / ex, (d + 2 * EPS) / ez);
    if (f < 1) m.root.s = [f, f, f];
  } else if (kind !== 'character') {
    // everything else reports the space it really takes, rounded up to 10 cm
    const [ex, ez] = reach(m.bounds());
    w = Math.max(w, Math.ceil(ex * 10 - 1e-6) / 10);
    d = Math.max(d, Math.ceil(ez * 10 - 1e-6) / 10);
  }
  // Lumpy shapes (rocks, foliage, sand) can dip a hair under the floor: sit the whole model on the floor.
  const low = m.bounds().min[1];
  if (low < -0.005 && low > -0.25) m.root.t = [0, -low, 0];
  return { model: m, foot: [w, d], kind };
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
  ].filter((o) => !RECIPES[o.id]); // a recipe replaces the Design file
}

/** Writes a file only when its bytes changed, so Godot does not re-import models that did not change. */
function writeIfChanged(file, bytes) {
  if (fs.existsSync(file) && Buffer.compare(fs.readFileSync(file), bytes) === 0) return false;
  fs.writeFileSync(file, bytes);
  return true;
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
  let changed = 0;
  for (const { id, model, foot, kind } of allModels()) {
    if (writeIfChanged(path.join(OUT, id + '.glb'), model.toGLB())) changed++;
    const b = model.bounds();
    const height = +b.max[1].toFixed(3);
    const tris = model.triangles();
    const mount = RECIPES[id].mount;
    const limit = RECIPES[id].maxTris ?? MAX_TRIS[kind] ?? 3000;
    index[id] = { height, foot, tris, kind, limit, source: 'generated', ...(mount ? { mount_y: mount.y, wall: !!mount.wall, min_z: +b.min[2].toFixed(3) } : {}) };
    rows.push(`| \`${id}\` | ${items[id]?.name ?? RECIPES[id].name ?? id} | ${foot[0]} × ${foot[1]} | ${height} | ${tris} | ${model.animations.map((a) => a.name).join(', ') || '-'} | generated |`);
    if (tris > limit) console.warn(`  ${id}: ${tris} triangles is over the limit of ${limit}`);
    if (b.min[1] < -0.02) console.warn(`  ${id}: goes ${(-b.min[1]).toFixed(2)} m below the floor`);
  }
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1));

  const made = new Set(Object.keys(index));
  const boxes = Object.keys(items).filter((id) => !made.has(id));
  fs.writeFileSync(
    path.join(OUT, 'MODELS.md'),
    `# Models\n\nWritten by \`npm run models\`. Rules: docs/3D_MODEL_BRIEF.md. Pictures of batch 1: docs/art/3d-batch1/. The newer models are built to match docs/art/reference/.\n\n## Made (${rows.length})\n\n| id | Name | Footprint (m) | Height (m) | Triangles | Animations | Made by |\n| --- | --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n\n## Still a plain grey box in the game (${boxes.length})\n\n${boxes.map((b) => '`' + b + '`').join(', ')}\n`,
  );
  console.log(`Models: ${rows.length} made (${external.length} by Claude Design), ${changed} files written, ${boxes.length} objects are still plain boxes`);
}
