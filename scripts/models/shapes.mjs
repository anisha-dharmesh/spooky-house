// Low-poly building blocks. Each returns { pos, nor, idx } centred on the origin.
import { fixWinding, merge, transform } from './gltf.mjs';

export function box(w, h, d) {
  const x = w / 2;
  const y = h / 2;
  const z = d / 2;
  const faces = [
    [[0, 0, 1], [[-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]]],
    [[0, 0, -1], [[x, -y, -z], [-x, -y, -z], [-x, y, -z], [x, y, -z]]],
    [[1, 0, 0], [[x, -y, z], [x, -y, -z], [x, y, -z], [x, y, z]]],
    [[-1, 0, 0], [[-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z]]],
    [[0, 1, 0], [[-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z]]],
    [[0, -1, 0], [[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z]]],
  ];
  const g = { pos: [], nor: [], idx: [] };
  for (const [n, c] of faces) {
    const b = g.pos.length / 3;
    for (const p of c) {
      g.pos.push(...p);
      g.nor.push(...n);
    }
    g.idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  return g;
}

/** A cylinder (or cone, or frustum) along Y. */
export function cyl(rTop, rBottom, h, seg = 14, caps = true) {
  const g = { pos: [], nor: [], idx: [] };
  const slope = (rBottom - rTop) / h;
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const nl = Math.hypot(1, slope);
    g.pos.push(rBottom * c, -h / 2, rBottom * s, rTop * c, h / 2, rTop * s);
    g.nor.push(c / nl, slope / nl, s / nl, c / nl, slope / nl, s / nl);
  }
  for (let i = 0; i < seg; i++) {
    const a = i * 2;
    g.idx.push(a, a + 1, a + 3, a, a + 3, a + 2);
  }
  const cap = (y, r, ny) => {
    if (r <= 0) return;
    const b = g.pos.length / 3;
    g.pos.push(0, y, 0);
    g.nor.push(0, ny, 0);
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      g.pos.push(r * Math.cos(a), y, r * Math.sin(a));
      g.nor.push(0, ny, 0);
    }
    for (let i = 0; i < seg; i++) g.idx.push(b, b + 1 + i, b + 2 + i);
  };
  if (caps) {
    cap(h / 2, rTop, 1);
    cap(-h / 2, rBottom, -1);
  }
  return fixWinding(g);
}

export function sphere(r, ws = 12, hs = 8) {
  const g = { pos: [], nor: [], idx: [] };
  for (let j = 0; j <= hs; j++) {
    const v = (j / hs) * Math.PI;
    for (let i = 0; i <= ws; i++) {
      const u = (i / ws) * Math.PI * 2;
      const n = [Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u)];
      g.pos.push(n[0] * r, n[1] * r, n[2] * r);
      g.nor.push(...n);
    }
  }
  for (let j = 0; j < hs; j++)
    for (let i = 0; i < ws; i++) {
      const a = j * (ws + 1) + i;
      const b = a + ws + 1;
      g.idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  return fixWinding(g);
}

/** A box with rounded edges and corners (radius r). */
export function rbox(w, h, d, r, n = 3) {
  r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
  const half = [w / 2, h / 2, d / 2];
  const inner = half.map((v) => v - r);
  const g = { pos: [], nor: [], idx: [] };
  const faces = [
    [2, 1, [0, 1]], [2, -1, [0, 1]], [0, 1, [2, 1]], [0, -1, [2, 1]], [1, 1, [0, 2]], [1, -1, [0, 2]],
  ];
  for (const [axis, sign, [u, v]] of faces) {
    const base = g.pos.length / 3;
    for (let j = 0; j <= n; j++)
      for (let i = 0; i <= n; i++) {
        const p = [0, 0, 0];
        p[axis] = sign * half[axis];
        p[u] = (i / n * 2 - 1) * half[u];
        p[v] = (j / n * 2 - 1) * half[v];
        const q = p.map((val, k) => Math.max(-inner[k], Math.min(inner[k], val)));
        const dir = p.map((val, k) => val - q[k]);
        const len = Math.hypot(...dir);
        const nor = len > 1e-9 ? dir.map((x) => x / len) : [0, 0, 0].map((_, k) => (k === axis ? sign : 0));
        g.pos.push(q[0] + nor[0] * r, q[1] + nor[1] * r, q[2] + nor[2] * r);
        g.nor.push(...nor);
      }
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const a = base + j * (n + 1) + i;
        const b = a + n + 1;
        g.idx.push(a, b, a + 1, a + 1, b, b + 1);
      }
  }
  return fixWinding(g);
}

// ---------- more shapes (for the picture-matched models) ----------
// Same rule as above: each returns { pos, nor, idx } centred on the origin (y centred on the middle of its height).

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (v) => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

/** A seeded random number generator (so "random" shapes are the same every build). */
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

/** Gives every triangle its own corners and a flat normal (the faceted low-poly look). */
export function flat(g) {
  const out = { pos: [], nor: [], idx: [] };
  for (let i = 0; i < g.idx.length; i += 3) {
    const p = [0, 1, 2].map((k) => [g.pos[g.idx[i + k] * 3], g.pos[g.idx[i + k] * 3 + 1], g.pos[g.idx[i + k] * 3 + 2]]);
    const n = norm(cross(sub(p[1], p[0]), sub(p[2], p[0])));
    const b = out.pos.length / 3;
    for (const q of p) {
      out.pos.push(...q);
      out.nor.push(...n);
    }
    out.idx.push(b, b + 1, b + 2);
  }
  return out;
}

/**
 * Turns a profile (list of [radius, height] points, bottom to top) around the Y axis, like a potter's wheel.
 * Corners sharper than about 50 degrees stay crisp, gentle curves are smooth. Close the shape with [0, y] points.
 */
export function lathe(profile, seg = 16) {
  const n = profile.length;
  const segNor = [];
  for (let i = 0; i < n - 1; i++) {
    const dr = profile[i + 1][0] - profile[i][0];
    const dy = profile[i + 1][1] - profile[i][1];
    const l = Math.hypot(dr, dy) || 1;
    segNor.push([dy / l, -dr / l]); // outward, in the (radius, height) plane
  }
  const g = { pos: [], nor: [], idx: [] };
  const rings = []; // per profile point: [{ start vertex, normal }] for the segment below and above it
  const cosLimit = Math.cos((50 * Math.PI) / 180);
  for (let i = 0; i < n; i++) {
    const below = i > 0 ? segNor[i - 1] : null;
    const above = i < n - 1 ? segNor[i] : null;
    const variants = [];
    if (below && above) {
      const d = below[0] * above[0] + below[1] * above[1];
      if (d >= cosLimit) {
        const m = [below[0] + above[0], below[1] + above[1]];
        const l = Math.hypot(m[0], m[1]) || 1;
        variants.push({ nor: [m[0] / l, m[1] / l], use: 'both' });
      } else {
        variants.push({ nor: below, use: 'below' }, { nor: above, use: 'above' });
      }
    } else variants.push({ nor: below ?? above, use: below ? 'below' : 'above' });
    const made = [];
    for (const v of variants) {
      const start = g.pos.length / 3;
      for (let k = 0; k <= seg; k++) {
        const a = (k / seg) * Math.PI * 2;
        const c = Math.cos(a);
        const s = Math.sin(a);
        g.pos.push(profile[i][0] * c, profile[i][1], profile[i][0] * s);
        g.nor.push(v.nor[0] * c, v.nor[1], v.nor[0] * s);
      }
      made.push({ start, use: v.use });
    }
    rings.push(made);
  }
  const pick = (ring, side) => (ring.find((r) => r.use === side) ?? ring.find((r) => r.use === 'both') ?? ring[0]).start;
  for (let i = 0; i < n - 1; i++) {
    const lo = pick(rings[i], 'above');
    const hi = pick(rings[i + 1], 'below');
    for (let k = 0; k < seg; k++) g.idx.push(lo + k, hi + k, lo + k + 1, lo + k + 1, hi + k, hi + k + 1);
  }
  // centre the height on y = 0 like the other shapes
  const ys = profile.map((p) => p[1]);
  const mid = (Math.min(...ys) + Math.max(...ys)) / 2;
  for (let i = 1; i < g.pos.length; i += 3) g.pos[i] -= mid;
  return fixWinding(g);
}

export function torus(R, r, segR = 18, segr = 8) {
  const g = { pos: [], nor: [], idx: [] };
  for (let i = 0; i <= segR; i++) {
    const u = (i / segR) * Math.PI * 2;
    for (let j = 0; j <= segr; j++) {
      const v = (j / segr) * Math.PI * 2;
      const n = [Math.cos(v) * Math.cos(u), Math.sin(v), Math.cos(v) * Math.sin(u)];
      g.pos.push((R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u));
      g.nor.push(...n);
    }
  }
  for (let i = 0; i < segR; i++)
    for (let j = 0; j < segr; j++) {
      const a = i * (segr + 1) + j;
      const b = a + segr + 1;
      g.idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  return fixWinding(g);
}

/** A capsule along Y: radius r, straight part of length h, round ends. */
export function capsule(r, h, seg = 12, rings = 4) {
  const prof = [];
  for (let i = 0; i <= rings; i++) {
    const a = (i / rings) * (Math.PI / 2);
    prof.push([Math.sin(a) * r, -h / 2 - Math.cos(a) * r]);
  }
  for (let i = rings; i >= 0; i--) {
    const a = (i / rings) * (Math.PI / 2);
    prof.push([Math.sin(a) * r, h / 2 + Math.cos(a) * r]);
  }
  prof[0][0] = 0;
  prof[prof.length - 1][0] = 0;
  return lathe(prof, seg);
}

/** A half sphere (dome) of radius r, flat side down. Centred on its own height. */
export function dome(r, seg = 14, rings = 5, squash = 1) {
  const prof = [[0, 0]];
  for (let i = 0; i <= rings; i++) {
    const a = (i / rings) * (Math.PI / 2);
    prof.push([Math.cos(a) * r, Math.sin(a) * r * squash]);
  }
  prof[prof.length - 1][0] = 0;
  return lathe(prof, seg);
}

/** Triangulates a simple polygon (list of [x, y], any winding). Returns triangle index triples into `poly`. */
export function triangulate(poly) {
  const n = poly.length;
  const area = poly.reduce((a, p, i) => a + (p[0] * poly[(i + 1) % n][1] - poly[(i + 1) % n][0] * p[1]), 0);
  const order = [...Array(n).keys()];
  if (area < 0) order.reverse();
  const inTri = (p, a, b, c) => {
    const s = (u, v, w) => (u[0] - w[0]) * (v[1] - w[1]) - (v[0] - w[0]) * (u[1] - w[1]);
    const d1 = s(p, a, b);
    const d2 = s(p, b, c);
    const d3 = s(p, c, a);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };
  const tris = [];
  let guard = 0;
  while (order.length > 3 && guard++ < 10000) {
    let cut = false;
    for (let i = 0; i < order.length; i++) {
      const a = order[(i + order.length - 1) % order.length];
      const b = order[i];
      const c = order[(i + 1) % order.length];
      const cr = (poly[b][0] - poly[a][0]) * (poly[c][1] - poly[a][1]) - (poly[b][1] - poly[a][1]) * (poly[c][0] - poly[a][0]);
      if (cr <= 1e-12) continue;
      if (order.some((o) => o !== a && o !== b && o !== c && inTri(poly[o], poly[a], poly[b], poly[c]))) continue;
      tris.push([a, b, c]);
      order.splice(i, 1);
      cut = true;
      break;
    }
    if (!cut) break;
  }
  if (order.length === 3) tris.push([order[0], order[1], order[2]]);
  return tris;
}

/**
 * Pushes a flat polygon (list of [x, y]) into a solid. `plane`:
 *  'xy' = polygon in the XY plane, thickness along Z (a roof end, an arch, a star)
 *  'xz' = polygon on the floor, thickness along Y (a floor plan: L-shaped counter, a pool)
 * The solid is centred on the origin in its thickness direction.
 */
export function extrude(poly, thickness, plane = 'xy') {
  const g = { pos: [], nor: [], idx: [] };
  const n = poly.length;
  const h = thickness / 2;
  const P = (p, d) => (plane === 'xy' ? [p[0], p[1], d] : [p[0], d, p[1]]);
  const N = (d) => (plane === 'xy' ? [0, 0, d] : [0, d, 0]);
  const tris = triangulate(poly);
  for (const side of [1, -1]) {
    const b = g.pos.length / 3;
    for (const p of poly) {
      g.pos.push(...P(p, side * h));
      g.nor.push(...N(side));
    }
    for (const t of tris) g.idx.push(b + t[0], b + t[1], b + t[2]);
  }
  for (let i = 0; i < n; i++) {
    const a = poly[i];
    const c = poly[(i + 1) % n];
    const e = [c[0] - a[0], c[1] - a[1]];
    const l = Math.hypot(e[0], e[1]) || 1;
    const nn2 = [e[1] / l, -e[0] / l];
    const nn = plane === 'xy' ? [nn2[0], nn2[1], 0] : [nn2[0], 0, nn2[1]];
    const b = g.pos.length / 3;
    g.pos.push(...P(a, -h), ...P(c, -h), ...P(c, h), ...P(a, h));
    for (let k = 0; k < 4; k++) g.nor.push(...nn);
    g.idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  return fixWinding(g);
}

/** A box that narrows toward the top (a roof, a hopper, a tapered leg). Top can be a line (dTop = 0) or a point. */
export function frustum(wBot, dBot, wTop, dTop, h) {
  const y = h / 2;
  const b = [[-wBot / 2, -y, dBot / 2], [wBot / 2, -y, dBot / 2], [wBot / 2, -y, -dBot / 2], [-wBot / 2, -y, -dBot / 2]];
  const t = [[-wTop / 2, y, dTop / 2], [wTop / 2, y, dTop / 2], [wTop / 2, y, -dTop / 2], [-wTop / 2, y, -dTop / 2]];
  const g = { pos: [], nor: [], idx: [] };
  const quad = (a, bq, c, d) => {
    const n = norm(cross(sub(bq, a), sub(c, a)));
    const base = g.pos.length / 3;
    for (const p of [a, bq, c, d]) {
      g.pos.push(...p);
      g.nor.push(...n);
    }
    g.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };
  quad(b[0], b[1], t[1], t[0]); // front
  quad(b[2], b[3], t[3], t[2]); // back
  quad(b[1], b[2], t[2], t[1]); // right
  quad(b[3], b[0], t[0], t[3]); // left
  quad(b[3], b[2], b[1], b[0]); // bottom
  quad(t[0], t[1], t[2], t[3]); // top (degenerate when the top is a line)
  return fixWinding(g);
}

/** A flat sheet w x h facing +Z, visible from both sides (cloth, leaves, paper). */
export function sheet(w, h) {
  const a = box(w, h, 0.0001);
  return a;
}

/** A tube of radius r along a path of [x, y, z] points (rails, handles, wires, hoses). */
export function tube(path, r, seg = 6, closed = false) {
  const g = { pos: [], nor: [], idx: [] };
  const pts = path.length;
  let prev = null;
  for (let i = 0; i < pts; i++) {
    const a = path[Math.max(0, i - 1)];
    const b = path[Math.min(pts - 1, i + 1)];
    const t = norm(sub(b, a));
    let u = prev ? prev : Math.abs(t[1]) < 0.95 ? norm(cross(t, [0, 1, 0])) : norm(cross(t, [1, 0, 0]));
    // keep the ring from twisting: re-project the previous side vector onto the new ring plane
    if (prev) {
      const d = u[0] * t[0] + u[1] * t[1] + u[2] * t[2];
      u = norm([u[0] - t[0] * d, u[1] - t[1] * d, u[2] - t[2] * d]);
    }
    prev = u;
    const v = norm(cross(t, u));
    for (let k = 0; k <= seg; k++) {
      const an = (k / seg) * Math.PI * 2;
      const c = Math.cos(an);
      const s = Math.sin(an);
      const n = [u[0] * c + v[0] * s, u[1] * c + v[1] * s, u[2] * c + v[2] * s];
      g.pos.push(path[i][0] + n[0] * r, path[i][1] + n[1] * r, path[i][2] + n[2] * r);
      g.nor.push(...n);
    }
  }
  for (let i = 0; i < pts - 1; i++)
    for (let k = 0; k < seg; k++) {
      const a = i * (seg + 1) + k;
      const b = a + seg + 1;
      g.idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  if (!closed) {
    for (const [i, flip] of [[0, true], [pts - 1, false]]) {
      const base = g.pos.length / 3;
      const t = norm(sub(path[Math.min(pts - 1, i + 1)], path[Math.max(0, i - 1)]));
      const n = flip ? [-t[0], -t[1], -t[2]] : t;
      g.pos.push(...path[i]);
      g.nor.push(...n);
      for (let k = 0; k <= seg; k++) {
        const src = (i * (seg + 1) + k) * 3;
        g.pos.push(g.pos[src], g.pos[src + 1], g.pos[src + 2]);
        g.nor.push(...n);
      }
      for (let k = 0; k < seg; k++) g.idx.push(base, base + 1 + k, base + 2 + k);
    }
  }
  const out = fixWinding(g);
  // centre like the other shapes? No: paths are given where they should be, so keep them as they are.
  return out;
}

/** A lumpy faceted ball (foliage, bushes, rocks, clouds of cotton). */
export function blob(r, seed = 1, jitter = 0.18, detail = 1) {
  const t = (1 + Math.sqrt(5)) / 2;
  let v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(norm);
  let f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  for (let d = 0; d < detail; d++) {
    const cache = new Map();
    const mid = (a, b) => {
      const key = a < b ? `${a}_${b}` : `${b}_${a}`;
      if (!cache.has(key)) {
        v.push(norm([(v[a][0] + v[b][0]) / 2, (v[a][1] + v[b][1]) / 2, (v[a][2] + v[b][2]) / 2]));
        cache.set(key, v.length - 1);
      }
      return cache.get(key);
    };
    const nf = [];
    for (const [a, b, c] of f) {
      const ab = mid(a, b);
      const bc = mid(b, c);
      const ca = mid(c, a);
      nf.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    f = nf;
  }
  const rand = rng(seed);
  const scale = v.map(() => 1 + (rand() * 2 - 1) * jitter);
  const g = { pos: [], nor: [], idx: [] };
  g.pos = v.flatMap((p, i) => [p[0] * r * scale[i], p[1] * r * scale[i], p[2] * r * scale[i]]);
  g.nor = v.flatMap((p) => p);
  g.idx = f.flat();
  return flat(fixWinding(g));
}

/** A rounded cylinder along Y (a cushion, a drum, a stool top): radius r, height h, edge rounding e. */
export function rcyl(r, h, e = 0.02, seg = 20) {
  e = Math.min(e, r * 0.9, h / 2 - 1e-4);
  const prof = [[0, -h / 2], [r - e, -h / 2]];
  for (let i = 1; i <= 3; i++) {
    const a = (i / 3) * (Math.PI / 2);
    prof.push([r - e + Math.sin(a) * e, -h / 2 + e - Math.cos(a) * e]);
  }
  for (let i = 0; i <= 3; i++) {
    const a = (i / 3) * (Math.PI / 2);
    prof.push([r - e + Math.cos(a) * e, h / 2 - e + Math.sin(a) * e]);
  }
  prof.push([r - e, h / 2], [0, h / 2]);
  return lathe(prof, seg);
}

/** A rectangular ring (frame, window, picture frame): outer w x h, border b, thickness t, facing +Z. */
export function frame(w, h, b, t) {
  const o = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
  const parts = [];
  const bar = (cx, cy, bw, bh) => parts.push(transform(box(bw, bh, t), { t: [cx, cy, 0] }));
  bar(0, h / 2 - b / 2, w, b);
  bar(0, -h / 2 + b / 2, w, b);
  bar(-w / 2 + b / 2, 0, b, h - 2 * b);
  bar(w / 2 - b / 2, 0, b, h - 2 * b);
  void o;
  return merge(parts);
}

/** A circular arc as points, for building arches, handles and curved rails. Angles in radians. */
export function arc(cx, cy, r, a0, a1, n = 10) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}
