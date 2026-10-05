// Low-poly building blocks. Each returns { pos, nor, idx } centred on the origin.
import { fixWinding } from './gltf.mjs';

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
