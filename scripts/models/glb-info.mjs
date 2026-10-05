// Reads a .glb file and reports what the game cares about: size, triangles, animations, skin.
import fs from 'node:fs';

export function readGlb(file) {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error(`${file}: not a glb file`);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));
  return { json, buf };
}

// 4x4 column-major matrices
const ident = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function mul(a, b) {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
}
function trs(n) {
  if (n.matrix) return n.matrix;
  const [x, y, z, w] = n.rotation ?? [0, 0, 0, 1];
  const [sx, sy, sz] = n.scale ?? [1, 1, 1];
  const [tx, ty, tz] = n.translation ?? [0, 0, 0];
  return [
    (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
    2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
    2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
    tx, ty, tz, 1,
  ];
}

export function modelInfo(json) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  let tris = 0;
  const walk = (i, parent) => {
    const n = json.nodes[i];
    const m = mul(parent, trs(n));
    if (n.mesh !== undefined) {
      // a skinned mesh is placed by its skeleton, not by its own node transform
      const mm = n.skin !== undefined ? ident() : m;
      for (const p of json.meshes[n.mesh].primitives) {
        const acc = json.accessors[p.attributes.POSITION];
        if (acc.min && acc.max) {
          for (let c = 0; c < 8; c++) {
            const v = [c & 1 ? acc.max[0] : acc.min[0], c & 2 ? acc.max[1] : acc.min[1], c & 4 ? acc.max[2] : acc.min[2]];
            for (let k = 0; k < 3; k++) {
              const w = mm[k] * v[0] + mm[4 + k] * v[1] + mm[8 + k] * v[2] + mm[12 + k];
              min[k] = Math.min(min[k], w);
              max[k] = Math.max(max[k], w);
            }
          }
        }
        const idx = p.indices !== undefined ? json.accessors[p.indices].count : acc.count;
        tris += idx / 3;
      }
    }
    for (const c of n.children ?? []) walk(c, m);
  };
  for (const r of json.scenes[json.scene ?? 0].nodes) walk(r, ident());
  return {
    min,
    max,
    size: max.map((v, k) => v - min[k]),
    triangles: tris,
    animations: (json.animations ?? []).map((a) => a.name),
    skinned: (json.skins ?? []).length > 0,
    materials: (json.materials ?? []).map((m) => m.name),
  };
}
