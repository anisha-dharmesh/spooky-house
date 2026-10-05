// A small glTF 2.0 writer (binary .glb) with no dependencies, plus the geometry helpers it needs.
// Y is up, the front of a model faces +Z, 1 unit = 1 metre.

export const MATERIALS = {
  white: { c: [0.9, 0.9, 0.9], r: 0.85 },
  light: { c: [0.72, 0.72, 0.72], r: 0.9 },
  edge: { c: [0.58, 0.58, 0.58], r: 0.8 },
  mid: { c: [0.42, 0.42, 0.42], r: 0.9 },
  dark: { c: [0.22, 0.22, 0.23], r: 0.9 },
  black: { c: [0.07, 0.07, 0.08], r: 0.7 },
  glow: { c: [0.95, 0.95, 0.95], r: 0.6, e: [0.9, 0.9, 0.85] },
};

/** "#rrggbb" (as seen in a picture, sRGB) -> glTF linear colour. */
export function hex(h) {
  const n = parseInt(h.replace('#', ''), 16);
  const lin = (v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return [lin((n >> 16) & 255), lin((n >> 8) & 255), lin(n & 255)];
}

// ---------- tiny vector / quaternion maths ----------

export function quatFromEuler(rx = 0, ry = 0, rz = 0) {
  // applied in the order Z, then X, then Y (so yaw is outermost)
  const q = (ax, a) => {
    const s = Math.sin(a / 2);
    return [ax[0] * s, ax[1] * s, ax[2] * s, Math.cos(a / 2)];
  };
  return mulQ(q([0, 1, 0], ry), mulQ(q([1, 0, 0], rx), q([0, 0, 1], rz)));
}

function mulQ(a, b) {
  return [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
  ];
}

function rotateByQ(q, v) {
  const [x, y, z, w] = q;
  const [vx, vy, vz] = v;
  const tx = 2 * (y * vz - z * vy);
  const ty = 2 * (z * vx - x * vz);
  const tz = 2 * (x * vy - y * vx);
  return [vx + w * tx + (y * tz - z * ty), vy + w * ty + (z * tx - x * tz), vz + w * tz + (x * ty - y * tx)];
}

/** Moves / turns / scales a piece of geometry. xf = { t:[x,y,z], rx, ry, rz, s:[sx,sy,sz] | number } */
export function transform(g, xf = {}) {
  const q = quatFromEuler(xf.rx, xf.ry, xf.rz);
  const s = typeof xf.s === 'number' ? [xf.s, xf.s, xf.s] : xf.s ?? [1, 1, 1];
  const t = xf.t ?? [0, 0, 0];
  const pos = new Array(g.pos.length);
  const nor = new Array(g.nor.length);
  for (let i = 0; i < g.pos.length; i += 3) {
    const p = rotateByQ(q, [g.pos[i] * s[0], g.pos[i + 1] * s[1], g.pos[i + 2] * s[2]]);
    pos[i] = p[0] + t[0];
    pos[i + 1] = p[1] + t[1];
    pos[i + 2] = p[2] + t[2];
    // normals use the inverse scale so non-uniform scaling stays correct
    let n = rotateByQ(q, [g.nor[i] / s[0], g.nor[i + 1] / s[1], g.nor[i + 2] / s[2]]);
    const len = Math.hypot(n[0], n[1], n[2]) || 1;
    nor[i] = n[0] / len;
    nor[i + 1] = n[1] / len;
    nor[i + 2] = n[2] / len;
  }
  return { pos, nor, idx: g.idx.slice() };
}

export function merge(parts) {
  const out = { pos: [], nor: [], idx: [] };
  for (const g of parts) {
    const base = out.pos.length / 3;
    out.pos.push(...g.pos);
    out.nor.push(...g.nor);
    for (const i of g.idx) out.idx.push(i + base);
  }
  return out;
}

/** Makes every triangle face the way its normals point (counter-clockwise from outside). */
export function fixWinding(g) {
  const idx = g.idx;
  for (let i = 0; i < idx.length; i += 3) {
    const [a, b, c] = [idx[i], idx[i + 1], idx[i + 2]];
    const p = (k) => [g.pos[k * 3], g.pos[k * 3 + 1], g.pos[k * 3 + 2]];
    const [pa, pb, pc] = [p(a), p(b), p(c)];
    const e1 = [pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]];
    const e2 = [pc[0] - pa[0], pc[1] - pa[1], pc[2] - pa[2]];
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const avg = [0, 1, 2].map((k) => g.nor[a * 3 + k] + g.nor[b * 3 + k] + g.nor[c * 3 + k]);
    if (n[0] * avg[0] + n[1] * avg[1] + n[2] * avg[2] < 0) {
      idx[i + 1] = c;
      idx[i + 2] = b;
    }
  }
  return g;
}

// ---------- the model ----------

export class Model {
  constructor(name) {
    this.name = name;
    this.nodes = [];
    this.animations = [];
    this.materials = {}; // this model's own colours, by name: { c: linear rgb, r: roughness, e: emissive, a: alpha }
    this.skeleton = null; // set by Rig (characters): the joints, in order
    this.root = this.node('root');
  }

  /** Defines a colour from a picture. `mat('wood', '#b9824a')`, then use 'wood' in add(). Options: r (roughness), e (glow colour), a (alpha). */
  mat(name, color, opts = {}) {
    this.materials[name] = { c: hex(color), r: opts.r ?? 0.8, ...(opts.e ? { e: hex(opts.e) } : {}), ...(opts.a !== undefined ? { a: opts.a } : {}) };
    return name;
  }

  node(name, parent = null, opts = {}) {
    const n = { name, children: [], t: opts.t, r: opts.r, s: opts.s, prims: new Map() };
    this.nodes.push(n);
    if (parent) parent.children.push(n);
    return n;
  }

  /** Adds a piece of geometry to a node. `mat` is a name from MATERIALS or mat(), or a "#rrggbb" colour used directly. */
  add(node, geom, mat, xf) {
    if (typeof mat === 'string' && mat.startsWith('#') && !this.materials[mat]) this.mat(mat, mat);
    const g = xf ? transform(geom, xf) : geom;
    const list = node.prims.get(mat) ?? [];
    list.push(g);
    node.prims.set(mat, list);
    return this;
  }

  /** tracks: [{ node, path: 'translation'|'rotation', times:[], values:[[...]] }] */
  animate(name, tracks) {
    this.animations.push({ name, tracks });
  }

  triangles() {
    let n = 0;
    for (const node of this.nodes) for (const list of node.prims.values()) for (const g of list) n += g.idx.length / 3;
    return n;
  }

  /** Bounding box of the model in its rest pose. */
  bounds() {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    const walk = (node, parentPos, parentQ) => {
      const t = node.t ?? [0, 0, 0];
      const q = node.r ?? [0, 0, 0, 1];
      const nodePos = (v) => {
        const r = rotateByQ(parentQ, v);
        return [r[0] + parentPos[0], r[1] + parentPos[1], r[2] + parentPos[2]];
      };
      const origin = nodePos(t);
      const qq = mulQ(parentQ, q);
      for (const list of node.prims.values()) {
        for (const g of list) {
          for (let i = 0; i < g.pos.length; i += 3) {
            const r = rotateByQ(qq, [g.pos[i], g.pos[i + 1], g.pos[i + 2]]);
            for (let k = 0; k < 3; k++) {
              min[k] = Math.min(min[k], r[k] + origin[k]);
              max[k] = Math.max(max[k], r[k] + origin[k]);
            }
          }
        }
      }
      for (const c of node.children) walk(c, origin, qq);
    };
    walk(this.root, [0, 0, 0], [0, 0, 0, 1]);
    // the root can be scaled (a model that was shrunk to fit its footprint): scale about the origin, then keep its move
    if (this.root.s) {
      const t = this.root.t ?? [0, 0, 0];
      for (let k = 0; k < 3; k++) {
        min[k] = t[k] + (min[k] - t[k]) * this.root.s[k];
        max[k] = t[k] + (max[k] - t[k]) * this.root.s[k];
      }
    }
    return { min, max };
  }

  /** The glTF JSON document and its binary buffer. */
  build() {
    const chunks = [];
    let offset = 0;
    const bufferViews = [];
    const accessors = [];
    const pushBytes = (buf, target) => {
      const pad = (4 - (buf.length % 4)) % 4;
      const padded = Buffer.concat([buf, Buffer.alloc(pad)]);
      bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: buf.length, ...(target ? { target } : {}) });
      chunks.push(padded);
      offset += padded.length;
      return bufferViews.length - 1;
    };
    const accessor = (view, componentType, count, type, extra = {}) => {
      accessors.push({ bufferView: view, componentType, count, type, ...extra });
      return accessors.length - 1;
    };
    const f32 = (arr) => Buffer.from(new Float32Array(arr).buffer);
    const minMax = (arr, comps) => {
      const min = new Array(comps).fill(Infinity);
      const max = new Array(comps).fill(-Infinity);
      for (let i = 0; i < arr.length; i += comps)
        for (let k = 0; k < comps; k++) {
          min[k] = Math.min(min[k], arr[i + k]);
          max[k] = Math.max(max[k], arr[i + k]);
        }
      return { min, max };
    };

    const all = { ...MATERIALS, ...this.materials };
    const matNames = Object.keys(all);
    const materials = matNames.map((n) => {
      const m = all[n];
      return {
        name: n,
        pbrMetallicRoughness: { baseColorFactor: [...m.c, m.a ?? 1], metallicFactor: 0, roughnessFactor: m.r ?? 0.9 },
        ...(m.e ? { emissiveFactor: m.e } : {}),
        ...(m.a !== undefined && m.a < 1 ? { alphaMode: 'BLEND' } : {}),
      };
    });

    const meshes = [];
    const nodeIndex = new Map(this.nodes.map((n, i) => [n, i]));
    const skeleton = this.skeleton;
    const emitPrimitive = (g, mat, extraAttrs = () => ({})) => {
      const vcount = g.pos.length / 3;
      const pv = pushBytes(f32(g.pos), 34962);
      const nv = pushBytes(f32(g.nor), 34962);
      const big = vcount > 65535;
      const iv = pushBytes(Buffer.from((big ? new Uint32Array(g.idx) : new Uint16Array(g.idx)).buffer), 34963);
      const { min, max } = minMax(g.pos, 3);
      return {
        attributes: {
          POSITION: accessor(pv, 5126, vcount, 'VEC3', { min, max }),
          NORMAL: accessor(nv, 5126, vcount, 'VEC3'),
          ...extraAttrs(vcount),
        },
        indices: accessor(iv, big ? 5125 : 5123, g.idx.length, 'SCALAR'),
        material: matNames.indexOf(mat),
      };
    };

    const gltfNodes = this.nodes.map((n) => {
      const out = { name: n.name };
      if (n.children.length) out.children = n.children.map((c) => nodeIndex.get(c));
      if (n.t) out.translation = n.t;
      if (n.r) out.rotation = n.r;
      if (n.s) out.scale = n.s;
      if (n.prims.size && !skeleton) {
        const primitives = [];
        for (const [mat, list] of n.prims) primitives.push(emitPrimitive(merge(list), mat));
        meshes.push({ name: n.name, primitives });
        out.mesh = meshes.length - 1;
      }
      return out;
    });

    const sceneNodes = [0];
    let skins;
    if (skeleton) {
      // Rigid skinning: every piece of geometry follows exactly one bone. Rest pose has no rotations, so a bone's
      // world position is the sum of the translations above it, and its inverse bind matrix is just the opposite move.
      const world = new Map();
      const parent = new Map();
      const walk = (n, base) => {
        const t = n.t ?? [0, 0, 0];
        const w = [base[0] + t[0], base[1] + t[1], base[2] + t[2]];
        world.set(n, w);
        for (const c of n.children) {
          parent.set(c, n);
          walk(c, w);
        }
      };
      walk(this.root, [0, 0, 0]);
      const jointIdx = new Map(skeleton.joints.map((j, i) => [j, i]));
      const boneOf = (n) => {
        while (n && !jointIdx.has(n)) n = parent.get(n);
        return n ?? skeleton.joints[0];
      };
      const byMat = new Map();
      for (const n of this.nodes) {
        if (!n.prims.size) continue;
        const w = world.get(n);
        const bone = jointIdx.get(boneOf(n));
        for (const [mat, list] of n.prims) {
          const entry = byMat.get(mat) ?? { parts: [], bones: [] };
          for (const g of list) {
            const moved = { pos: g.pos.slice(), nor: g.nor, idx: g.idx };
            for (let i = 0; i < moved.pos.length; i += 3) {
              moved.pos[i] += w[0];
              moved.pos[i + 1] += w[1];
              moved.pos[i + 2] += w[2];
            }
            entry.parts.push(moved);
            entry.bones.push([bone, g.pos.length / 3]);
          }
          byMat.set(mat, entry);
        }
      }
      const primitives = [];
      for (const [mat, { parts, bones }] of byMat) {
        const joints = [];
        const weights = [];
        for (const [bone, count] of bones)
          for (let k = 0; k < count; k++) {
            joints.push(bone, 0, 0, 0);
            weights.push(1, 0, 0, 0);
          }
        primitives.push(
          emitPrimitive(merge(parts), mat, () => ({
            JOINTS_0: accessor(pushBytes(Buffer.from(new Uint8Array(joints))), 5121, joints.length / 4, 'VEC4'),
            WEIGHTS_0: accessor(pushBytes(f32(weights)), 5126, weights.length / 4, 'VEC4'),
          })),
        );
      }
      meshes.push({ name: this.name, primitives });
      const ibm = [];
      for (const j of skeleton.joints) {
        const w = world.get(j);
        ibm.push(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -w[0], -w[1], -w[2], 1);
      }
      const ibmAcc = accessor(pushBytes(f32(ibm)), 5126, skeleton.joints.length, 'MAT4');
      skins = [{ joints: skeleton.joints.map((j) => nodeIndex.get(j)), inverseBindMatrices: ibmAcc, skeleton: nodeIndex.get(skeleton.joints[0]) }];
      gltfNodes.push({ name: 'body', mesh: meshes.length - 1, skin: 0 });
      sceneNodes.push(gltfNodes.length - 1);
    }

    const animations = this.animations.map((a) => {
      const samplers = [];
      const channels = [];
      for (const t of a.tracks) {
        const comps = t.path === 'rotation' ? 4 : 3;
        const tv = pushBytes(f32(t.times));
        const { min, max } = minMax(t.times, 1);
        const input = accessor(tv, 5126, t.times.length, 'SCALAR', { min, max });
        const ov = pushBytes(f32(t.values.flat()));
        const output = accessor(ov, 5126, t.times.length, comps === 4 ? 'VEC4' : 'VEC3');
        samplers.push({ input, output, interpolation: 'LINEAR' });
        channels.push({ sampler: samplers.length - 1, target: { node: nodeIndex.get(t.node), path: t.path } });
      }
      return { name: a.name, samplers, channels };
    });

    const bin = Buffer.concat(chunks);
    const json = {
      asset: { version: '2.0', generator: "Anisha's Spooky House model generator" },
      scene: 0,
      scenes: [{ nodes: sceneNodes }],
      nodes: gltfNodes,
      meshes,
      materials,
      accessors,
      bufferViews,
      buffers: [{ byteLength: bin.length }],
      ...(skins ? { skins } : {}),
      ...(animations.length ? { animations } : {}),
    };
    return { json, bin };
  }

  toGLB() {
    const { json, bin } = this.build();
    let js = Buffer.from(JSON.stringify(json), 'utf8');
    js = Buffer.concat([js, Buffer.alloc((4 - (js.length % 4)) % 4, 0x20)]);
    const total = 12 + 8 + js.length + 8 + bin.length;
    const out = Buffer.alloc(total);
    out.writeUInt32LE(0x46546c67, 0); // "glTF"
    out.writeUInt32LE(2, 4);
    out.writeUInt32LE(total, 8);
    out.writeUInt32LE(js.length, 12);
    out.writeUInt32LE(0x4e4f534a, 16); // "JSON"
    js.copy(out, 20);
    out.writeUInt32LE(bin.length, 20 + js.length);
    out.writeUInt32LE(0x004e4942, 24 + js.length); // "BIN\0"
    bin.copy(out, 28 + js.length);
    return out;
  }
}
