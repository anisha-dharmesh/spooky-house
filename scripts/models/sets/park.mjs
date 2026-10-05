// Playground, garden and sand park (panels 3, 4 and 7 of docs/art/reference/01-asset-pack-overview.webp).
// Bright primary colours for play things, leafy greens and honey wood for the garden.
import { kit } from '../kit.mjs';
import { P } from '../pal.mjs';

const K = (m) => kit(m);

// ---------- trees and plants ----------

/** A round leafy tree: brown trunk, clustered canopy in several greens (2 x 2). */
function tree(m, { W }) {
  const k = K(m);
  const r = Math.min(W, 1.9) / 2;
  k.cn(P.brown, 0.16, 0.1, 1.5, [0, 0, 0], { seg: 8 });
  k.cn(P.brown, 0.3, 0.16, 0.25, [0, 0, 0], { seg: 8 });
  k.tb(P.brown, [[0, 1.0, 0], [0.3, 1.5, 0.1]], 0.05);
  k.tb(P.brown, [[0, 1.1, 0], [-0.3, 1.6, -0.1]], 0.05);
  const g = [P.green, P.greenLight, P.greenDark, '#6fb24f'];
  const blobs = [[0, 2.2, 0, 0.82], [0.5, 1.85, 0.2, 0.55], [-0.5, 1.9, -0.1, 0.55], [0.15, 2.7, -0.2, 0.5], [-0.25, 2.5, 0.4, 0.5], [0.4, 2.4, -0.45, 0.45]];
  blobs.forEach(([x, y, z, rr], i) => k.bl(g[i % 4], rr * (r / 0.95), [x * (r / 0.95), y, z * (r / 0.95)], { seed: i + 2, jitter: 0.14 }));
}

/** A bare spooky tree (2 x 2). */
function tree_dead(m) {
  const k = K(m);
  const dark = '#4a3b34';
  k.cn(dark, 0.22, 0.1, 1.6, [0, 0, 0], { seg: 7 });
  k.cn(dark, 0.4, 0.22, 0.3, [0, 0, 0], { seg: 7 });
  const branches = [
    [[0, 1.2, 0], [0.5, 1.7, 0.1], [0.9, 2.1, 0.2]],
    [[0, 1.4, 0], [-0.5, 1.9, -0.1], [-0.8, 2.4, -0.2]],
    [[0, 1.6, 0], [0.1, 2.2, 0.4], [0.25, 2.8, 0.6]],
    [[0.5, 1.7, 0.1], [0.9, 1.7, 0.5]],
    [[-0.5, 1.9, -0.1], [-0.9, 1.8, -0.5]],
    [[0, 1.6, 0], [-0.1, 2.3, -0.5], [-0.3, 2.9, -0.7]],
  ];
  for (const b of branches) k.tb(dark, b, 0.045, [0, 0, 0], { seg: 5 });
}

/** A palm tree for the sand park and pool. */
function palm_tree(m) {
  const k = K(m);
  const trunk = [];
  for (let i = 0; i <= 8; i++) trunk.push([Math.sin(i * 0.3) * 0.08 + i * 0.03, i * 0.5, 0]);
  k.tb('#8a5a35', trunk, 0.11, [0, 0, 0], { seg: 7 });
  for (let i = 0; i < 6; i++) k.cy('#6b4528', 0.135, 0.05, [Math.sin(i * 0.3) * 0.08 * 1 + 0.03 * i * 1.0, 0.1 + i * 0.7, 0], { seg: 8 });
  const top = [0.24, 4.0, 0];
  const greens = [P.green, P.greenDark, P.greenLight];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const dx = Math.cos(a);
    const dz = Math.sin(a);
    const pts = [];
    for (let t = 0; t <= 5; t++) pts.push([top[0] + dx * t * 0.34, top[1] + 0.25 - Math.pow(t / 5, 2) * 1.0 + Math.sin(t) * 0.02, top[2] + dz * t * 0.34]);
    k.tb(greens[i % 3], pts, 0.05, [0, 0, 0], { seg: 4 });
    for (let t = 1; t <= 4; t++) {
      const p = pts[t];
      k.bx(greens[i % 3], [0.34, 0.015, 0.1], [p[0], p[1] - 0.03, p[2]], { ry: -a + 0.3 });
      k.bx(greens[(i + 1) % 3], [0.34, 0.015, 0.1], [p[0], p[1] - 0.03, p[2]], { ry: -a - 0.3 });
    }
  }
  for (const [dx, dz] of [[0.1, 0.1], [-0.1, 0.12], [0.05, -0.13]]) k.sp('#7a5a2a', 0.1, [top[0] + dx, top[1] - 0.12, top[2] + dz]);
}

/** Raised wooden bed full of colourful flowers (3 x 1). */
function flower_bed(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 2.9);
  const d = Math.min(D, 0.9);
  k.bx(P.wood, [w, 0.35, d], [0, 0, 0], { r: 0.02 });
  k.bx(P.woodLight, [w + 0.04, 0.05, d + 0.04], [0, 0.35, 0], { r: 0.012 });
  k.bx('#5a3a24', [w - 0.12, 0.05, d - 0.12], [0, 0.34, 0]);
  const cols = [P.red, P.yellow, P.pink, P.purple, P.orange, P.white];
  for (let i = 0; i < 14; i++) {
    const x = -w / 2 + 0.2 + (i / 13) * (w - 0.4);
    const z = ((i * 37) % 7) / 7 * (d - 0.4) - (d - 0.4) / 2;
    const h = 0.14 + ((i * 11) % 5) * 0.04;
    k.cy(P.greenDark, 0.012, h, [x, 0.38, z], { seg: 4 });
    k.sp(cols[i % 6], 0.07, [x, 0.38 + h + 0.03, z], { sy: 0.8, ws: 7, hs: 4 });
    k.sp(P.yellow, 0.025, [x, 0.38 + h + 0.07, z], { ws: 5, hs: 3 });
  }
  for (let i = 0; i < 6; i++) k.bl(P.green, 0.12, [-w / 2 + 0.3 + i * (w - 0.6) / 5, 0.47, (i % 2 ? 0.2 : -0.2)], { seed: i + 5, sy: 0.6, detail: 0 });
}

/** Clipped hedge with a rounded top (4 x 1). */
function hedge(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 3.9);
  const d = Math.min(D, 0.95);
  k.bx(P.greenDark, [w, 0.9, d], [0, 0, 0], { r: 0.18, n: 3 });
  const n = Math.round(w / 0.7);
  for (let i = 0; i < n; i++) k.bl(i % 2 ? P.green : P.greenLight, 0.42, [-w / 2 + 0.38 + i * ((w - 0.76) / (n - 1)), 0.95, 0], { seed: i + 1, sy: 0.7, sz: 1.05, jitter: 0.1 });
  for (let i = 0; i < 8; i++) k.sp(P.pink, 0.04, [-w / 2 + 0.3 + i * (w - 0.6) / 7, 0.5 + (i % 3) * 0.2, d / 2 + 0.01]);
}

function garden_hat(m) {
  const k = K(m);
  k.lt('#e3c07a', [[0, 0.12], [0.1, 0.13], [0.16, 0.1], [0.4, 0.04], [0.42, 0.0], [0.4, 0.0], [0.15, 0.06], [0.0, 0.08]], [0, 0, 0], { seg: 24 });
  k.cy(P.red, 0.165, 0.05, [0, 0.07, 0], { seg: 20 });
  k.sp(P.pink, 0.04, [0.15, 0.12, 0.08]);
  k.sp(P.yellow, 0.03, [0.12, 0.14, 0.12]);
}

function watering_can(m) {
  const k = K(m);
  k.cn('#9aa3ad', 0.16, 0.14, 0.34, [0, 0, 0], { seg: 16 });
  k.cy('#7f8893', 0.14, 0.02, [0, 0.34, 0], { seg: 16 });
  k.tb('#9aa3ad', [[0.14, 0.05, 0], [0.26, 0.1, 0], [0.34, 0.2, 0], [0.4, 0.36, 0]], 0.025);
  k.cn('#7f8893', 0.05, 0.03, 0.05, [0.4, 0.36, 0], { seg: 10 });
  k.tb('#9aa3ad', [[-0.1, 0.34, 0], [-0.2, 0.52, 0], [0.0, 0.58, 0], [0.12, 0.4, 0]], 0.022);
  k.bx(P.teal, [0.04, 0.22, 0.04], [-0.12, 0.08, 0.14], { r: 0.01 });
}

function gravestone(m) {
  const k = K(m);
  const stone = '#9ea3ab';
  k.bx('#80858d', [0.7, 0.1, 0.34], [0, 0, 0], { r: 0.02 });
  k.bx(stone, [0.55, 0.65, 0.16], [0, 0.1, 0], { r: 0.03 });
  k.cy(stone, 0.275, 0.16, [0, 0.75, 0], { rx: Math.PI / 2, seg: 14 });
  k.bx('#6f747c', [0.06, 0.28, 0.02], [0, 0.4, 0.085]);
  k.bx('#6f747c', [0.2, 0.06, 0.02], [0, 0.55, 0.085]);
  k.sp(P.greenDark, 0.08, [0.3, 0.1, 0.18], { sy: 0.6 });
  k.sp(P.green, 0.06, [-0.28, 0.08, 0.2], { sy: 0.6 });
}

/** Black iron street lamp with a glowing lantern. */
function street_lamp(m) {
  const k = K(m);
  m.mat('lampGlow', '#ffe9a8', { e: '#ffcf66' });
  k.cy('#25262b', 0.17, 0.08, [0, 0, 0], { seg: 10 });
  k.cn('#25262b', 0.1, 0.05, 0.4, [0, 0.08, 0], { seg: 10 });
  k.cy('#25262b', 0.035, 1.9, [0, 0.45, 0], { seg: 8 });
  k.cy('#25262b', 0.07, 0.07, [0, 1.3, 0], { seg: 8 });
  k.cy('#25262b', 0.14, 0.04, [0, 2.3, 0], { seg: 8 });
  k.cy('lampGlow', 0.12, 0.34, [0, 2.34, 0], { seg: 8 });
  for (let i = 0; i < 4; i++) k.bx('#25262b', [0.03, 0.36, 0.03], [Math.cos(i * 1.57 + 0.78) * 0.115, 2.33, Math.sin(i * 1.57 + 0.78) * 0.115]);
  k.fr('#25262b', 0.3, 0.3, 0.04, 0.04, 0.16, [0, 2.7, 0]);
  k.sp('#25262b', 0.04, [0, 2.88, 0]);
  k.tb('#25262b', [[0, 1.5, 0], [0.18, 1.6, 0], [0.22, 1.8, 0]], 0.012);
}

// ---------- garden ----------

/** Wooden slatted bench with iron legs (3 x 1). */
function bench(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 2.9);
  for (let i = 0; i < 4; i++) k.bx(P.wood, [w, 0.04, 0.1], [0, 0.46, 0.22 - i * 0.13], { r: 0.008 });
  for (let i = 0; i < 3; i++) k.bx(P.wood, [w, 0.1, 0.035], [0, 0.6 + i * 0.14, -0.26 - i * 0.02], { r: 0.008, rx: -0.15 });
  for (const s of [-1, 1]) {
    k.bx('#26282d', [0.05, 0.5, 0.05], [s * (w / 2 - 0.15), 0, 0.2]);
    k.bx('#26282d', [0.05, 0.5, 0.05], [s * (w / 2 - 0.15), 0, -0.2]);
    k.bx('#26282d', [0.05, 0.05, 0.5], [s * (w / 2 - 0.15), 0.46, 0], { r: 0.01 });
    k.bx('#26282d', [0.05, 0.78, 0.05], [s * (w / 2 - 0.15), 0.48, -0.28], { rx: -0.15 });
    k.bx('#26282d', [0.06, 0.05, 0.35], [s * (w / 2 - 0.15), 0.62, -0.05]);
  }
}

/** Three-tier stone fountain with blue water (3 x 3). */
function fountain(m, { W }) {
  const k = K(m);
  const r = Math.min(W, 2.9) / 2;
  const stone = '#d9d4c8';
  k.lt(stone, [[0, 0], [r, 0], [r, 0.4], [r - 0.12, 0.45], [r - 0.12, 0.3], [0, 0.3]], [0, 0, 0], { seg: 28 });
  k.cy('#4aa5e6', r - 0.14, 0.04, [0, 0.31, 0], { seg: 28 });
  k.cy(stone, 0.22, 0.6, [0, 0.3, 0], { seg: 12 });
  k.lt(stone, [[0, 0.9], [0.6, 0.9], [0.62, 1.05], [0.5, 1.07], [0.0, 0.98]], [0, 0, 0], { seg: 22 });
  k.cy('#4aa5e6', 0.5, 0.03, [0, 1.0, 0], { seg: 22 });
  k.cy(stone, 0.12, 0.45, [0, 1.0, 0], { seg: 10 });
  k.lt(stone, [[0, 1.4], [0.32, 1.4], [0.34, 1.5], [0.28, 1.52], [0.0, 1.46]], [0, 0, 0], { seg: 16 });
  k.cy(stone, 0.06, 0.3, [0, 1.46, 0], { seg: 8 });
  m.mat('spray', '#bfe6ff', { r: 0.2, a: 0.6 });
  k.cn('spray', 0.02, 0.14, 0.3, [0, 1.74, 0], { seg: 8 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    k.cn('spray', 0.02, 0.06, 0.2, [Math.cos(a) * 0.3, 1.4, Math.sin(a) * 0.3], { seg: 6 });
  }
}

/** Six-sided white gazebo with a dark roof, benches inside and a lamp (4 x 4). */
function gazebo(m, { W }) {
  const k = K(m);
  const r = Math.min(W, 3.9) / 2 - 0.1;
  k.cy('#e9dfc8', r + 0.15, 0.2, [0, 0, 0], { seg: 6 });
  k.cy('#f4efe2', r + 0.05, 0.05, [0, 0.2, 0], { seg: 6 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    k.cy('#f4efe2', 0.09, 2.2, [Math.cos(a) * r, 0.25, Math.sin(a) * r], { seg: 8 });
    k.cy('#e9dfc8', 0.12, 0.1, [Math.cos(a) * r, 0.25, Math.sin(a) * r], { seg: 8 });
    k.cy('#e9dfc8', 0.12, 0.1, [Math.cos(a) * r, 2.4, Math.sin(a) * r], { seg: 8 });
    const b = ((i + 1) / 6) * Math.PI * 2;
    // railings between pillars (all but the doorway at the front)
    if (i !== 2 && i !== 3) {
      k.tb('#f4efe2', [[Math.cos(a) * r, 0.9, Math.sin(a) * r], [Math.cos(b) * r, 0.9, Math.sin(b) * r]], 0.03);
      for (let t = 1; t < 5; t++) {
        const u = t / 5;
        k.cy('#f4efe2', 0.018, 0.65, [Math.cos(a) * r * (1 - u) + Math.cos(b) * r * u, 0.3, Math.sin(a) * r * (1 - u) + Math.sin(b) * r * u], { seg: 5 });
      }
    }
  }
  k.cy('#e9dfc8', r + 0.1, 0.12, [0, 2.5, 0], { seg: 6 });
  k.cn('#4b4658', r + 0.45, 0.2, 0.9, [0, 2.62, 0], { seg: 6 });
  k.cy('#e0b44a', 0.04, 0.4, [0, 3.5, 0], { seg: 6 });
  k.sp('#e0b44a', 0.08, [0, 3.95, 0]);
  m.mat('lampGlow', '#ffe9a8', { e: '#ffcf66' });
  k.sp('lampGlow', 0.14, [0, 2.2, 0]);
  k.cy('#8a5a35', 0.5, 0.3, [0, 0.2, -0.3], { seg: 6 });
  k.bx(P.wood, [1.4, 0.05, 0.4], [0, 0.55, -r + 0.5]);
}

/** Wooden arch covered in climbing flowers (2 x 1). */
function garden_arch(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 1.9);
  const pts = [];
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI - (i / 12) * Math.PI;
    pts.push([Math.cos(a) * (w / 2 - 0.1), 1.6 + Math.sin(a) * 0.7, 0]);
  }
  for (const s of [-1, 1]) k.bx(P.wood, [0.1, 1.6, 0.1], [s * (w / 2 - 0.1), 0, 0], { r: 0.015 });
  k.tb(P.wood, pts, 0.055);
  const cols = [P.red, P.pink, P.yellow, P.orange];
  for (let i = 0; i < 22; i++) {
    const t = i / 21;
    const p = t < 0.3 ? [(-1) * (w / 2 - 0.1), t / 0.3 * 1.5 + 0.1, 0] : t > 0.7 ? [(w / 2 - 0.1), (1 - t) / 0.3 * 1.5 + 0.1, 0] : pts[Math.round(((t - 0.3) / 0.4) * 12)];
    k.bl(i % 3 === 0 ? P.greenLight : P.green, 0.11, [p[0] + (i % 2 ? 0.05 : -0.05), p[1], p[2] + (i % 3 - 1) * 0.04], { seed: i, detail: 0, jitter: 0.1 });
    if (i % 2 === 0) k.sp(cols[i % 4], 0.045, [p[0], p[1] + 0.06, p[2] + 0.1]);
  }
  k.bx('#c9a58a', [w, 0.04, 0.5], [0, 0, 0], { r: 0.01 });
}

/** A raised wooden planter box with vegetables (2 x 1). */
function planter_box(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 1.9);
  const d = Math.min(D, 0.95);
  k.bx(P.wood, [w, 0.4, d], [0, 0, 0], { r: 0.02 });
  k.bx(P.woodDark, [w - 0.1, 0.05, d - 0.1], [0, 0.38, 0]);
  for (let i = 0; i < 9; i++) k.bl(i % 3 ? P.green : P.lime, 0.14, [-w / 2 + 0.2 + (i % 5) * (w - 0.4) / 4, 0.55, (i < 5 ? -0.2 : 0.2)], { seed: i, sy: 0.9, jitter: 0.12 });
  for (let i = 0; i < 4; i++) k.sp([P.red, P.orange, P.red, P.yellow][i], 0.06, [-w / 2 + 0.35 + i * 0.4, 0.5, 0.0]);
}

function pot_flowers(m) {
  const k = K(m);
  k.lt(P.teal, [[0, 0], [0.12, 0], [0.19, 0.28], [0.2, 0.3], [0, 0.3]], [0, 0, 0], { seg: 14 });
  k.cy(P.woodDeep, 0.19, 0.03, [0, 0.3, 0], { seg: 14 });
  for (let i = 0; i < 7; i++) k.bl(i % 2 ? P.green : P.greenLight, 0.13, [Math.cos(i) * 0.11, 0.42, Math.sin(i) * 0.11], { seed: i, detail: 0 });
  const cols = [P.red, P.pink, P.yellow, P.red, P.orange];
  for (let i = 0; i < 9; i++) k.sp(cols[i % 5], 0.045, [Math.cos(i * 1.4) * 0.14, 0.52 + (i % 3) * 0.04, Math.sin(i * 1.4) * 0.14]);
}

// ---------- playground ----------

/** A-frame swing set with two seats and chains (4 x 2). */
function swing(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 3.9);
  const d = Math.min(D, 1.8);
  const h = 2.3;
  const frame = '#e8742e';
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) k.tb(frame, [[sx * (w / 2 - 0.1), 0, sz * (d / 2 - 0.1)], [sx * (w / 2 - 0.2), h, 0]], 0.06, [0, 0, 0], { seg: 6 });
  }
  k.tb(frame, [[-w / 2 + 0.2, h, 0], [w / 2 - 0.2, h, 0]], 0.07);
  for (const sx of [-1, 1]) k.tb(frame, [[sx * (w / 2 - 0.12), 0.5, d / 2 - 0.1], [sx * (w / 2 - 0.12), 0.5, -d / 2 + 0.1]], 0.04);
  for (const x of [-w / 5, w / 5]) {
    for (const z of [-0.18, 0.18]) k.tb(P.steel, [[x + z * 0, h - 0.04, z], [x + z * 0, 0.55, z]], 0.012, [0, 0, 0], { seg: 4 });
    k.bx(P.yellow, [0.42, 0.05, 0.42], [x, 0.5, 0], { r: 0.015 });
    k.bx('#d99a1c', [0.42, 0.04, 0.05], [x, 0.54, -0.2]);
  }
}

/** Pink slide on an orange frame with a ladder (2 x 4). */
function slide_play(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 1.8);
  const L = Math.min(D, 3.9);
  const hi = 1.6;
  const z0 = -L / 2 + 0.3;
  const frame = '#e8742e';
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.bx(frame, [0.09, hi, 0.09], [sx * (w / 2 - 0.15), 0, z0 + (sz + 1) * 0.25], { r: 0.015 });
  k.bx(P.yellow, [w - 0.2, 0.06, 0.6], [0, hi - 0.06, z0 + 0.25], { r: 0.015 });
  for (const sx of [-1, 1]) {
    k.bx(frame, [0.07, 0.55, 0.6], [sx * (w / 2 - 0.15), hi, z0 + 0.25], { r: 0.01 });
    k.bx(P.red, [0.05, 0.06, 0.62], [sx * (w / 2 - 0.15), hi + 0.5, z0 + 0.25]);
  }
  const run = L - 0.9;
  const ang = Math.atan2(hi - 0.25, run);
  const len = Math.hypot(run, hi - 0.25);
  k.bx(P.pink, [w - 0.3, 0.05, len], [0, (hi + 0.25) / 2 - 0.1, z0 + 0.55 + run / 2], { rx: ang });
  for (const sx of [-1, 1]) k.bx(P.pinkDark, [0.1, 0.18, len], [sx * (w / 2 - 0.2), (hi + 0.25) / 2 - 0.02, z0 + 0.55 + run / 2], { rx: ang, r: 0.03 });
  for (let i = 0; i < 5; i++) k.bx(P.woodLight, [0.55, 0.04, 0.05], [0.0, 0.2 + i * 0.28, z0 - 0.08 - (4 - i) * 0.02], { rx: 0 });
  for (const sx of [-1, 1]) k.tb(frame, [[sx * 0.3, 0, z0 - 0.4], [sx * 0.3, hi, z0 - 0.1]], 0.035);
}

/** See-saw: a long plank on a blue pivot with handles (4 x 1). */
function see_saw(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 3.8);
  k.cn(P.blueDark, 0.2, 0.1, 0.5, [0, 0, 0], { seg: 8 });
  k.bx(P.blue, [0.5, 0.06, 0.4], [0, 0.0, 0], { r: 0.02 });
  const tilt = 0.14;
  k.bx(P.yellow, [w, 0.08, 0.34], [0, 0.55, 0], { rz: tilt, r: 0.025 });
  k.bx(P.green, [0.5, 0.082, 0.345], [-w / 2 + 0.3, 0.55 + Math.sin(tilt) * (-w / 2 + 0.3) * -1, 0], { rz: tilt });
  k.bx(P.orange, [0.5, 0.082, 0.345], [w / 2 - 0.3, 0.55 + Math.sin(tilt) * (w / 2 - 0.3) * -1, 0], { rz: tilt });
  for (const s of [-1, 1]) {
    const x = s * (w / 2 - 0.65);
    const y = 0.55 - Math.sin(tilt) * x;
    k.tb(P.red, [[x, y + 0.05, 0.0], [x, y + 0.45, 0.0], [x + s * 0.0, y + 0.5, 0.0]], 0.025);
    k.bx(P.red, [0.32, 0.03, 0.03], [x, y + 0.45, 0], { r: 0.01 });
    k.sp(P.steelDark, 0.05, [s * (w / 2 - 0.05), 0.55 - Math.sin(tilt) * s * (w / 2 - 0.05) - 0.03, 0.0]);
  }
}

/** Teal monkey bars with rungs between two ladders (5 x 2). */
function monkey_bars(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 4.8);
  const d = Math.min(D, 1.6);
  const h = 2.1;
  const col = '#2fb3c8';
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.tb(col, [[sx * (w / 2 - 0.1), 0, sz * (d / 2 - 0.15)], [sx * (w / 2 - 0.1), h, sz * (d / 2 - 0.15)]], 0.05, [0, 0, 0], { seg: 6 });
  for (const sz of [-1, 1]) k.tb(col, [[-w / 2 + 0.1, h, sz * (d / 2 - 0.15)], [w / 2 - 0.1, h, sz * (d / 2 - 0.15)]], 0.05);
  const n = 9;
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + 0.5 + (i / (n - 1)) * (w - 1.0);
    k.tb('#1f8fa3', [[x, h, -d / 2 + 0.15], [x, h, d / 2 - 0.15]], 0.025, [0, 0, 0], { seg: 5 });
  }
  for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) k.tb('#1f8fa3', [[sx * (w / 2 - 0.1), 0.3 + i * 0.32, -d / 2 + 0.15], [sx * (w / 2 - 0.1), 0.3 + i * 0.32, d / 2 - 0.15]], 0.02, [0, 0, 0], { seg: 4 });
  k.bx('#d9b26e', [w, 0.02, d], [0, 0, 0]);
}

/** Round spinner with a red rim, yellow floor and blue rails (3 x 3). */
function merry_go_round(m, { W }) {
  const k = K(m);
  const r = Math.min(W, 2.9) / 2;
  k.cy(P.pinkDark, r, 0.1, [0, 0.05, 0], { seg: 28 });
  k.cy(P.yellow, r - 0.1, 0.05, [0, 0.15, 0], { seg: 28 });
  k.cy(P.blueDark, 0.12, 1.1, [0, 0.15, 0], { seg: 10 });
  k.sp(P.red, 0.18, [0, 1.3, 0]);
  const n = 6;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    k.cy(P.blue, 0.04, 0.7, [Math.cos(a) * (r - 0.15), 0.2, Math.sin(a) * (r - 0.15)], { seg: 6 });
    k.tb(P.red, [[0, 1.2, 0], [Math.cos(a) * (r - 0.15), 0.9, Math.sin(a) * (r - 0.15)]], 0.025, [0, 0, 0], { seg: 4 });
  }
  k.ring(P.blue, r - 0.15, 0.04, [0, 0.9, 0]);
}

/** Wooden sandbox with sand and a few toys (5 x 4). */
function sand_pit(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 4.9);
  const d = Math.min(D, 3.9);
  k.bx(P.yellow, [w, 0.3, 0.2], [0, 0, d / 2 - 0.1], { r: 0.03 });
  k.bx(P.yellow, [w, 0.3, 0.2], [0, 0, -d / 2 + 0.1], { r: 0.03 });
  k.bx(P.orange, [0.2, 0.3, d - 0.4], [w / 2 - 0.1, 0, 0], { r: 0.03 });
  k.bx(P.orange, [0.2, 0.3, d - 0.4], [-w / 2 + 0.1, 0, 0], { r: 0.03 });
  k.bx(P.sand, [w - 0.4, 0.22, d - 0.4], [0, 0, 0]);
  for (let i = 0; i < 5; i++) k.bl('#d9b878', 0.3, [-1.2 + i * 0.6, 0.22, -0.4 + (i % 2) * 0.5], { seed: i, sy: 0.35, detail: 1, jitter: 0.12 });
  k.bl('#d9b878', 0.5, [0.6, 0.22, 0.4], { seed: 9, sy: 0.7, jitter: 0.1 });
  k.cn(P.red, 0.1, 0.14, 0.16, [-0.2, 0.22, 0.2], { seg: 10 });
  k.cn(P.blue, 0.05, 0.08, 0.2, [0.5, 0.22, -0.2], { rz: 0.8, seg: 8 });
  k.sp(P.yellow, 0.07, [-1.4, 0.3, 0.3]);
}

function bucket_spade(m) {
  const k = K(m);
  k.cn(P.red, 0.11, 0.15, 0.22, [-0.1, 0, 0], { seg: 14 });
  k.ring(P.yellow, 0.1, 0.012, [-0.1, 0.2, 0], { rx: 0, seg: 14 });
  k.tb(P.yellow, [[-0.2, 0.2, 0], [-0.1, 0.34, 0], [0.0, 0.2, 0]], 0.012);
  k.bx(P.blueDark, [0.04, 0.03, 0.3], [0.22, 0.02, 0], { r: 0.01, ry: 0.2 });
  k.bx(P.blue, [0.12, 0.025, 0.1], [0.24, 0.02, -0.18], { r: 0.01, ry: 0.2 });
}

function sand_castle(m, { W }) {
  const k = K(m);
  const sand = '#e2c07f';
  k.bx(sand, [1.5, 0.28, 1.3], [0, 0, 0], { r: 0.08 });
  for (const [x, z] of [[-0.55, -0.45], [0.55, -0.45], [-0.55, 0.45], [0.55, 0.45]]) {
    k.cn(sand, 0.24, 0.2, 0.7, [x, 0.2, z], { seg: 10 });
    for (let i = 0; i < 4; i++) k.bx(sand, [0.1, 0.1, 0.1], [x + Math.cos(i * 1.57) * 0.16, 0.9, z + Math.sin(i * 1.57) * 0.16]);
  }
  k.cn(sand, 0.3, 0.24, 0.95, [0, 0.25, 0], { seg: 12 });
  k.cn('#d8b46c', 0.28, 0.0, 0.3, [0, 1.15, 0], { seg: 12 });
  k.cy(P.steelDark, 0.01, 0.4, [0, 1.35, 0], { seg: 4 });
  k.bx(P.red, [0.24, 0.14, 0.01], [0.12, 1.55, 0]);
  k.bx(P.white, [0.22, 0.2, 0.02], [0, 0.2, 0.66]);
}

/** Wooden fort with a ladder, a roofed deck and a yellow slide (4 x 4). */
function play_fort(m, { W, D }) {
  const k = K(m);
  const brown = '#8a5a35';
  const deck = 1.5;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.bx(brown, [0.14, 3.0, 0.14], [sx * 0.7 - 0.8, 0, sz * 0.7 - 0.2], { r: 0.02 });
  k.bx(P.woodLight, [1.7, 0.08, 1.7], [-0.8, deck, -0.2], { r: 0.015 });
  for (const sx of [-1, 1]) {
    k.bx(brown, [0.06, 0.7, 1.5], [sx * 0.76 - 0.8, deck + 0.08, -0.2], { r: 0.01 });
  }
  k.bx(brown, [1.5, 0.7, 0.06], [-0.8, deck + 0.08, -0.9], { r: 0.01 });
  k.fr('#7a4a2d', 2.2, 2.2, 0.3, 0.3, 0.75, [-0.8, 2.95, -0.2]);
  k.sp('#7a4a2d', 0.08, [-0.8, 3.75, -0.2]);
  for (let i = 0; i < 6; i++) k.bx(P.woodLight, [0.5, 0.05, 0.05], [-0.8, 0.25 + i * 0.22, 0.8 + (5 - i) * 0.04]);
  for (const sx of [-1, 1]) k.tb(brown, [[-0.8 + sx * 0.3, 0, 1.3], [-0.8 + sx * 0.3, 1.5, 0.75]], 0.04);
  const run = 1.9;
  const ang = Math.atan2(deck - 0.2, run);
  const len = Math.hypot(run, deck - 0.2);
  k.bx(P.yellow, [0.7, 0.05, len], [0.9, (deck + 0.2) / 2 - 0.05, -0.2 + 0.0 - 0.0], { rx: 0, ry: 0 });
  k.bx(P.red, [0.7, 0.05, len], [0.75, (deck + 0.25) / 2 - 0.1, 0.55], { rx: ang, ry: 0 });
  for (const sx of [-1, 1]) k.bx(P.redDark, [0.07, 0.15, len], [0.75 + sx * 0.35, (deck + 0.25) / 2, 0.55], { rx: ang });
}

/** Orange and yellow climbing cube with rope nets (3 x 3). */
function jungle_gym(m, { W }) {
  const k = K(m);
  const s = Math.min(W, 2.8);
  const h = 2.2;
  const col = P.orange;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.tb(col, [[sx * s / 2, 0, sz * s / 2], [sx * s / 2, h, sz * s / 2]], 0.05, [0, 0, 0], { seg: 6 });
  for (const sx of [-1, 1]) k.tb(P.yellow, [[sx * s / 2, h, -s / 2], [sx * s / 2, h, s / 2]], 0.05);
  for (const sz of [-1, 1]) k.tb(P.yellow, [[-s / 2, h, sz * s / 2], [s / 2, h, sz * s / 2]], 0.05);
  for (let i = 1; i < 5; i++) {
    const t = -s / 2 + (i / 5) * s;
    k.tb(P.blueDark, [[t, h, -s / 2], [t, 0.1, -s / 2]], 0.012, [0, 0, 0], { seg: 4 });
    k.tb(P.blueDark, [[-s / 2, h * (i / 5), -s / 2], [s / 2, h * (i / 5), -s / 2]], 0.012, [0, 0, 0], { seg: 4 });
    k.tb(P.red, [[s / 2, h * (i / 5), -s / 2], [s / 2, h * (i / 5), s / 2]], 0.012, [0, 0, 0], { seg: 4 });
    k.tb(P.red, [[s / 2, h, t], [s / 2, 0.1, t]], 0.012, [0, 0, 0], { seg: 4 });
  }
  k.bx(P.pink, [s - 0.2, 0.05, s - 0.2], [0, 1.2, 0], { r: 0.02 });
  k.bx('#d9b26e', [s + 0.1, 0.02, s + 0.1], [0, 0, 0]);
}

/** Tiny hut with a blue roof (2 x 2). */
function play_hut(m, { W }) {
  const k = K(m);
  k.bx(P.woodLight, [1.4, 0.1, 1.4], [0, 0, 0]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.bx(P.wood, [0.08, 1.4, 0.08], [sx * 0.62, 0.1, sz * 0.62]);
  k.bx(P.cream, [1.3, 0.9, 0.05], [0, 0.1, -0.64]);
  for (const sx of [-1, 1]) k.bx(P.cream, [0.05, 0.9, 1.2], [sx * 0.64, 0.1, 0]);
  k.bx(P.red, [0.4, 0.6, 0.02], [0, 0.2, -0.61]);
  k.fr(P.blue, 1.7, 1.7, 0.0, 0.0, 0.8, [0, 1.5, 0]);
  k.sp(P.yellow, 0.07, [0, 2.32, 0]);
}

function rock(m) {
  const k = K(m);
  k.bl('#8c9099', 0.55, [0, 0.4, 0], { seed: 11, sy: 0.75, jitter: 0.2 });
  k.bl('#767b84', 0.38, [0.55, 0.26, 0.2], { seed: 5, sy: 0.7, jitter: 0.2 });
  k.bl('#a1a5ad', 0.3, [-0.5, 0.2, 0.3], { seed: 8, sy: 0.7, jitter: 0.2 });
  k.sp(P.greenDark, 0.14, [-0.1, 0.1, 0.5], { sy: 0.5 });
  k.sp(P.green, 0.11, [0.3, 0.08, 0.5], { sy: 0.5 });
}

function sand_pile(m) {
  const k = K(m);
  k.bl('#e6c88a', 0.5, [0, 0.2, 0], { seed: 3, sy: 0.55, detail: 2, jitter: 0.16 });
  k.bl('#d9b878', 0.3, [0.4, 0.12, 0.2], { seed: 7, sy: 0.5, jitter: 0.16 });
  k.bl('#efd7a2', 0.22, [-0.3, 0.1, 0.3], { seed: 2, sy: 0.5, jitter: 0.16 });
}

function fence_wood(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 1.9);
  k.bx(P.woodLight, [w, 0.06, 0.05], [0, 0.25, 0]);
  k.bx(P.woodLight, [w, 0.06, 0.05], [0, 0.6, 0]);
  const n = 8;
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + 0.12 + (i / (n - 1)) * (w - 0.24);
    k.bx(P.wood, [0.12, 0.85, 0.04], [x, 0.0, 0.03], { r: 0.008 });
    k.fr(P.wood, 0.12, 0.04, 0.0, 0.0, 0.1, [x, 0.85, 0.03]);
  }
}

export const RECIPES = {
  tree: { build: tree },
  tree_dead: { build: tree_dead },
  palm_tree: { build: palm_tree, kind: 'extra', foot: [2.0, 2.0], name: 'Palm tree' },
  flower_bed: { build: flower_bed },
  hedge: { build: hedge },
  garden_hat: { build: garden_hat },
  watering_can: { build: watering_can },
  gravestone: { build: gravestone },
  street_lamp: { build: street_lamp },
  bench: { build: bench },
  fountain: { build: fountain },
  gazebo: { build: gazebo, kind: 'extra', foot: [4.0, 4.0], name: 'Garden gazebo' },
  garden_arch: { build: garden_arch, kind: 'extra', foot: [2.0, 1.0], name: 'Flower arch' },
  planter_box: { build: planter_box, kind: 'extra', foot: [2.0, 1.0], name: 'Planter box' },
  pot_flowers: { build: pot_flowers, kind: 'extra', foot: [0.5, 0.5], name: 'Flower pot' },
  swing: { build: swing },
  slide_play: { build: slide_play },
  see_saw: { build: see_saw },
  monkey_bars: { build: monkey_bars },
  merry_go_round: { build: merry_go_round },
  sand_pit: { build: sand_pit },
  bucket_spade: { build: bucket_spade },
  sand_castle: { build: sand_castle },
  play_fort: { build: play_fort, kind: 'extra', foot: [4.0, 4.0], name: 'Play fort' },
  jungle_gym: { build: jungle_gym, kind: 'extra', foot: [3.0, 3.0], name: 'Jungle gym' },
  play_hut: { build: play_hut, kind: 'extra', foot: [2.0, 2.0], name: 'Play hut' },
  rock: { build: rock, kind: 'extra', foot: [1.6, 1.2], name: 'Rocks' },
  sand_pile: { build: sand_pile, kind: 'extra', foot: [1.3, 1.0], name: 'Sand pile' },
  fence_wood: { build: fence_wood, kind: 'extra', foot: [2.0, 0.2], name: 'Wooden fence' },
};
