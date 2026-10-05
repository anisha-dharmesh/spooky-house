// Swimming pool: the pool, slides, loungers, umbrellas, lifeguard chair and floaties
// (panel 5 of docs/art/reference/01-asset-pack-overview.webp: bright blue water, red / yellow / teal plastic, striped umbrellas).
import { kit, extrude } from '../kit.mjs';
import { P } from '../pal.mjs';

const K = (m) => kit(m);

/** The pool: a cream rim, a wavy blue water surface and two steps (8 x 5). */
function pool(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 7.9);
  const d = Math.min(D, 4.9);
  // a rounded kidney-ish outline
  const out = [];
  const inn = [];
  const n = 36;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const wob = 1 + 0.06 * Math.sin(a * 3) - 0.05 * Math.cos(a * 2);
    const sx = Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 0.55);
    const sz = Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 0.55);
    out.push([sx * (w / 2) * wob, sz * (d / 2) * wob]);
    inn.push([sx * (w / 2 - 0.35) * wob, sz * (d / 2 - 0.35) * wob]);
  }
  m.mat('water', '#2f9fe6', { r: 0.15 });
  k.add(extrude(out, 0.06, 'xz'), '#efe6d3', { t: [0, 0.03, 0] });
  k.add(extrude(inn, 0.04, 'xz'), 'water', { t: [0, 0.07, 0] });
  k.add(extrude(inn.map(([x, z]) => [x * 0.55, z * 0.5 - 0.3]), 0.012, 'xz'), '#6dc4f5', { t: [0, 0.095, 0] });
  for (let i = 0; i < 3; i++) k.bx('#efe6d3', [1.2 - i * 0.2, 0.025, 0.3], [-w / 2 + 1.2 + i * 0.28, 0.05, d / 2 - 0.6 - i * 0.0]);
}

function pool_ladder(m) {
  const k = K(m);
  for (const s of [-1, 1]) {
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * (Math.PI * 0.9);
      pts.push([s * 0.22, 0.5 + Math.sin(a) * 0.55, -0.2 + (1 - Math.cos(a)) * 0.28]);
    }
    k.tb(P.steel, pts, 0.03);
    k.tb(P.steel, [[s * 0.22, 0.5, -0.2], [s * 0.22, 0.0, -0.2]], 0.03);
    k.bx(P.steelDark, [0.1, 0.03, 0.1], [s * 0.22, 0, -0.2]);
  }
  for (let i = 0; i < 3; i++) k.bx(P.steelDark, [0.42, 0.04, 0.16], [0, 0.45 + i * 0.22, -0.18 + i * 0.0]);
}

/** Folding sun lounger: bright frame and cushion, reclined back (1 x 3). */
function lounger(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 0.9);
  const d = Math.min(D, 2.9);
  k.bx(P.blueDark, [w, 0.08, 1.4], [0, 0.34, 0.65], { r: 0.02 });
  k.bx(P.yellow, [w - 0.06, 0.1, 1.38], [0, 0.4, 0.65], { r: 0.04 });
  k.bx(P.blueDark, [w, 0.08, 1.2], [0, 0.82, -0.7], { rx: 0.7, r: 0.02 });
  k.bx(P.orange, [w - 0.06, 0.1, 1.18], [0, 0.88, -0.72], { rx: 0.7, r: 0.04 });
  for (const s of [-1, 1]) {
    k.bx(P.steelDark, [0.05, 0.36, 0.05], [s * (w / 2 - 0.05), 0, d / 2 - 0.2]);
    k.bx(P.steelDark, [0.05, 0.36, 0.05], [s * (w / 2 - 0.05), 0, 0.0]);
    k.bx(P.steelDark, [0.05, 0.05, 0.9], [s * (w / 2 - 0.05), 0.0, -0.4], { rx: 0.0 });
    k.cy(P.charcoal, 0.07, 0.04, [s * (w / 2 - 0.04), 0.07, d / 2 - 0.2], { rz: Math.PI / 2, seg: 10 });
  }
}

/** Big striped umbrella on a pole over a little table (2 x 2). */
function beach_umbrella(m, { W }) {
  const k = K(m);
  const r = Math.min(W, 1.9) / 2;
  k.cy(P.steelDark, 0.45, 0.07, [0, 0, 0], { seg: 14 });
  k.cy(P.woodLight, 0.035, 2.1, [0, 0.07, 0], { seg: 8 });
  const seg = 8;
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * Math.PI * 2;
    const a1 = ((i + 1) / seg) * Math.PI * 2;
    const col = i % 2 ? P.white : P.red;
    const g = {
      pos: [0, 2.45, 0, Math.cos(a0) * r, 1.95, Math.sin(a0) * r, Math.cos(a1) * r, 1.95, Math.sin(a1) * r],
      nor: [0, 1, 0, 0, 0.5, 0, 0, 0.5, 0].map((v, j) => (j % 3 === 1 ? 0.8 : 0)),
      idx: [0, 2, 1],
    };
    // flat-shaded wedge of the canopy, visible from both sides
    const nx = Math.cos((a0 + a1) / 2) * 0.5;
    const nz = Math.sin((a0 + a1) / 2) * 0.5;
    g.nor = [nx * 0.2, 0.95, nz * 0.2, nx, 0.8, nz, nx, 0.8, nz];
    k.add(g, col);
    k.add({ pos: g.pos, nor: g.nor.map((v) => -v), idx: [0, 1, 2] }, col);
  }
  k.sp(P.gold, 0.05, [0, 2.48, 0]);
  k.cy(P.woodDark, 0.4, 0.04, [0, 0.55, 0], { seg: 14 });
  k.cy(P.woodDark, 0.04, 0.5, [0, 0.07, 0], { seg: 6 });
}

/** Tall lifeguard chair with a ladder and a small umbrella (2 x 2). */
function lifeguard_chair(m) {
  const k = K(m);
  const col = P.red;
  for (const sx of [-1, 1]) {
    k.tb(col, [[sx * 0.7, 0, 0.5], [sx * 0.55, 1.7, -0.1]], 0.06);
    k.tb(col, [[sx * 0.7, 0, -0.5], [sx * 0.55, 1.7, -0.3]], 0.06);
  }
  for (const z of [-0.4, 0.4]) k.tb(P.yellow, [[-0.65, 0.5, z], [0.65, 0.5, z]], 0.035);
  k.bx(P.yellow, [1.2, 0.08, 0.9], [0, 1.65, -0.1], { r: 0.02 });
  k.bx(P.red, [1.2, 0.5, 0.06], [0, 1.73, -0.55], { r: 0.02 });
  for (const sx of [-1, 1]) k.bx(P.red, [0.06, 0.4, 0.8], [sx * 0.58, 1.73, -0.1]);
  for (let i = 0; i < 6; i++) k.bx(P.yellow, [0.56, 0.05, 0.06], [0, 0.2 + i * 0.28, 0.72 - i * 0.04]);
  for (const sx of [-1, 1]) k.tb(col, [[sx * 0.3, 0, 0.75], [sx * 0.3, 1.65, 0.45]], 0.04);
  k.cy(P.steelDark, 0.025, 1.2, [0.5, 1.7, -0.4], { seg: 6 });
  k.fr(P.orange, 1.4, 1.4, 0.0, 0.0, 0.35, [0.5, 2.85, -0.4]);
  k.fr(P.red, 1.42, 1.42, 0.0, 0.0, 0.0, [0.5, 2.8, -0.4]);
  k.sp(P.gold, 0.04, [0.5, 3.22, -0.4]);
}

function changing_bench(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 3.9);
  k.bx(P.woodLight, [w, 0.06, 0.5], [0, 0.42, 0], { r: 0.015 });
  k.bx(P.woodLight, [w, 0.8, 0.05], [0, 0.45, -0.22]);
  for (let i = 0; i < 5; i++) k.bx(P.yellow, [0.06, 0.1, 0.07], [-w / 2 + 0.4 + i * (w - 0.8) / 4, 1.0, -0.2]);
  for (const x of [-w / 2 + 0.15, 0, w / 2 - 0.15]) k.bx(P.blueDark, [0.07, 0.42, 0.45], [x, 0, 0]);
  for (let i = 0; i < 3; i++) k.bx([P.pink, P.sky, P.yellow][i], [0.3, 0.06, 0.26], [-w / 4 + i * (w / 4), 0.48, 0], { r: 0.02 });
}

/** Yellow rubber ring with a blue stripe. */
function float_ring(m) {
  const k = K(m);
  k.ring(P.yellow, 0.2, 0.08, [0, 0.08, 0], { seg: 20, segr: 8 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    k.sp(P.blue, 0.06, [Math.cos(a) * 0.2, 0.1, Math.sin(a) * 0.2], { sy: 0.9, ws: 8, hs: 5 });
  }
  k.cn(P.red, 0.03, 0.02, 0.03, [0.2, 0.16, 0]);
}

function towel_stack(m) {
  const k = K(m);
  const cols = [P.sky, P.pink, P.white, P.yellow];
  cols.forEach((c, i) => k.bx(c, [0.5 - i * 0.02, 0.08, 0.34], [0, i * 0.085, 0], { r: 0.03, ry: (i - 1.5) * 0.08 }));
  k.bx(P.white, [0.4, 0.012, 0.04], [0, 0.34, 0.1], { ry: 0.2 });
}

function towel_rack(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 1.9);
  for (const s of [-1, 1]) k.bx(P.woodDark, [0.07, 1.4, 0.07], [s * (w / 2 - 0.06), 0, 0], { r: 0.015 });
  for (const y of [0.5, 0.95, 1.4]) k.bx(P.wood, [w, 0.05, 0.05], [0, y, 0]);
  const cols = [P.sky, P.pink, P.yellow, P.white, P.teal, P.red];
  for (let i = 0; i < 4; i++) k.bx(cols[i], [0.38, 0.4 + (i % 2) * 0.05, 0.05], [-w / 2 + 0.28 + i * 0.4, 0.93 - 0.4 - (i % 2) * 0.05 + 0.4, 0.03], { r: 0.01 });
  for (let i = 0; i < 2; i++) k.bx(cols[i + 4], [0.42, 0.38, 0.05], [-w / 4 + i * 0.5, 0.52, 0.03], { r: 0.01 });
}

// ---------- big fun things from the picture ----------

/** Three slides (teal, orange, blue) off a coloured tower (5 x 5). */
function water_slide_tower(m) {
  const k = K(m);
  const h = 3.4;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.bx(P.yellow, [0.14, h, 0.14], [sx * 0.7, 0, sz * 0.7], { r: 0.02 });
  for (const y of [1.2, 2.3]) {
    k.bx(P.blueLight, [1.6, 0.08, 1.6], [0, y, 0], { r: 0.02 });
    for (const sx of [-1, 1]) k.bx(P.red, [0.05, 0.1, 1.6], [sx * 0.75, y + 0.08, 0]);
  }
  k.bx(P.white, [1.6, 0.08, 1.6], [0, h, 0], { r: 0.02 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.bx(P.white, [0.05, 0.7, 0.05], [sx * 0.75, h, sz * 0.75]);
  for (const sx of [-1, 1]) k.bx(P.pink, [0.05, 0.5, 1.6], [sx * 0.76, h + 0.3, 0]);
  k.fr(P.purple, 1.9, 1.9, 0.0, 0.0, 0.6, [0, h + 0.75, 0]);
  const cols = [P.teal, P.orange, P.blue];
  cols.forEach((c, i) => {
    const x = (i - 1) * 0.95;
    const a = 0.45;
    const L = 3.6;
    k.bx(c, [0.75, 0.06, L], [x, 1.5 + (2 - i) * 0.2, 2.1], { rx: a * 0.5 + 0.0 });
    k.bx(c, [0.07, 0.2, L], [x - 0.36, 1.6 + (2 - i) * 0.2, 2.1], { rx: a * 0.5 });
    k.bx(c, [0.07, 0.2, L], [x + 0.36, 1.6 + (2 - i) * 0.2, 2.1], { rx: a * 0.5 });
  });
  for (let i = 0; i < 12; i++) k.bx(P.woodLight, [0.5, 0.05, 0.05], [0, 0.2 + i * 0.28, -0.76]);
}

/** Yellow spiral slide round a pole (3 x 3). */
function slide_spiral(m) {
  const k = K(m);
  k.cy(P.steelDark, 0.12, 3.2, [0, 0, 0], { seg: 10 });
  k.bx(P.blueDark, [0.9, 0.08, 0.9], [0, 3.0, 0], { r: 0.02 });
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const a = t * Math.PI * 3.2;
    const r = 0.85 + t * 0.3;
    pts.push([Math.cos(a + 1) * r, 2.9 - t * 2.55, Math.sin(a + 1) * r]);
  }
  k.tb(P.yellow, pts, 0.2, [0, 0, 0], { seg: 8 });
  k.tb('#ffd75f', pts.map((p) => [p[0], p[1] + 0.12, p[2]]), 0.08, [0, 0, 0], { seg: 6 });
  k.cy(P.red, 0.03, 0.8, [0.9, 2.95, 0.4], { seg: 6 });
  for (let i = 0; i < 8; i++) k.bx(P.blue, [0.5, 0.05, 0.06], [0, 0.2 + i * 0.34, 0.15], { ry: i * 0.6 });
}

function swan_float(m) {
  const k = K(m);
  k.sp(P.white, 0.4, [0, 0.35, 0], { sy: 0.7, sz: 1.25 });
  k.sp(P.white, 0.2, [0, 0.45, -0.38], { sy: 0.9, sz: 1.5 });
  const neck = [[0, 0.55, 0.28], [0, 0.95, 0.3], [0, 1.2, 0.2], [0, 1.28, 0.38]];
  k.tb(P.white, neck, 0.075, [0, 0, 0], { seg: 8 });
  k.sp(P.white, 0.1, [0, 1.3, 0.42]);
  k.bx(P.orange, [0.09, 0.05, 0.16], [0, 1.26, 0.55], { r: 0.015 });
  for (const s of [-1, 1]) {
    k.sp(P.black, 0.02, [s * 0.07, 1.34, 0.5]);
    k.sp(P.white, 0.22, [s * 0.35, 0.5, 0.0], { sy: 0.4, sz: 1.3, rz: s * 0.3 });
  }
}

/** A small red-roofed shack with a counter, for drinks and snacks (3 x 2). */
function snack_stall(m) {
  const k = K(m);
  k.bx(P.woodLight, [2.4, 0.1, 1.6], [0, 0, 0], { r: 0.01 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.bx(P.wood, [0.09, 2.1, 0.09], [sx * 1.1, 0.1, sz * 0.7]);
  k.bx(P.cream, [2.2, 1.0, 0.06], [0, 0.1, -0.7]);
  for (const sx of [-1, 1]) k.bx(P.cream, [0.06, 1.0, 1.3], [sx * 1.1, 0.1, 0]);
  k.bx(P.wood, [2.3, 0.07, 0.5], [0, 1.0, 0.65], { r: 0.015 });
  for (let i = 0; i < 6; i++) k.bx(i % 2 ? P.white : P.red, [0.4, 0.45, 0.04], [-1.0 + i * 0.4, 1.0 - 0.2 + 0.0, 0.92]);
  k.fr(P.red, 2.8, 2.0, 0.4, 1.4, 0.5, [0, 2.2, 0]);
  for (const [x, c] of [[-0.6, P.pink], [-0.2, P.yellow], [0.2, P.blue]]) k.cn(c, 0.07, 0.05, 0.2, [x, 1.07, 0.65], { seg: 8 });
  k.sp(P.white, 0.1, [0.6, 1.2, 0.65]);
  k.bx(P.pink, [0.5, 0.35, 0.02], [0, 1.4, -0.66]);
}

export const RECIPES = {
  pool: { build: pool },
  pool_ladder: { build: pool_ladder },
  lounger: { build: lounger },
  beach_umbrella: { build: beach_umbrella },
  lifeguard_chair: { build: lifeguard_chair },
  changing_bench: { build: changing_bench },
  float_ring: { build: float_ring },
  towel_stack: { build: towel_stack },
  towel_rack: { build: towel_rack },
  water_slide_tower: { build: water_slide_tower, kind: 'extra', foot: [5.0, 5.0], name: 'Water slide tower' },
  slide_spiral: { build: slide_spiral, kind: 'extra', foot: [3.0, 3.0], name: 'Spiral slide' },
  swan_float: { build: swan_float, kind: 'extra', foot: [1.2, 1.4], name: 'Swan float' },
  snack_stall: { build: snack_stall, kind: 'extra', foot: [3.0, 2.0], name: 'Snack stall' },
};
