// Palace: throne room, queen's and king's rooms, treasury
// (panel 9 of docs/art/reference/01-asset-pack-overview.webp: gold, deep red velvet, white marble, pink and blue jewels).
import { kit, extrude } from '../kit.mjs';
import { P } from '../pal.mjs';

const K = (m) => kit(m);
const VELVET = '#b5212f';
const VELVET_DARK = '#7d1522';
const GOLD = '#e5b23d';
const GOLD_DARK = '#b88524';
const MARBLE = '#f2eee6';

/** Gold throne with a high carved back and red velvet (2 x 2). */
function throne(m, { W }) {
  const k = K(m);
  const w = 1.3;
  k.bx(GOLD, [w + 0.2, 0.1, 1.0], [0, 0, 0.1], { r: 0.03 });
  k.bx(GOLD_DARK, [w + 0.3, 0.06, 1.1], [0, 0, 0.1], { r: 0.02 });
  k.bx(GOLD, [w, 0.4, 0.8], [0, 0.1, 0.1], { r: 0.04 });
  k.bx(VELVET, [w - 0.2, 0.14, 0.7], [0, 0.5, 0.12], { r: 0.06 });
  k.bx(GOLD, [w, 1.9, 0.14], [0, 0.1, -0.35], { r: 0.04 });
  k.bx(VELVET, [w - 0.3, 1.6, 0.06], [0, 0.25, -0.27], { r: 0.04 });
  for (const s of [-1, 1]) {
    k.bx(GOLD, [0.14, 0.55, 0.85], [s * (w / 2 - 0.02), 0.1, 0.05], { r: 0.04 });
    k.sp(GOLD, 0.09, [s * (w / 2 - 0.02), 0.72, 0.4]);
    k.sp(GOLD, 0.07, [s * (w / 2 - 0.1), 2.0, -0.35]);
    k.cn(GOLD, 0.09, 0.03, 0.28, [s * (w / 2 - 0.1), 2.0, -0.35], { seg: 8 });
  }
  k.dm(GOLD, 0.45, [0, 2.0, -0.35], { sy: 0.9 });
  k.sp(P.red, 0.07, [0, 2.2, -0.28]);
  k.cn(GOLD, 0.05, 0.015, 0.26, [0, 2.38, -0.35], { seg: 8 });
  k.sp('#ff4f86', 0.05, [0, 1.6, -0.27]);
  for (const x of [-0.25, 0.25]) k.sp('#4aa3ff', 0.04, [x, 1.45, -0.27]);
  k.bx(VELVET, [0.9, 0.12, 0.5], [0, 0, 0.78], { r: 0.05 });
}

/** Red royal carpet with a gold border and a stripe down the middle (3 x 8). */
function royal_carpet(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 2.9);
  const d = Math.min(D, 7.9);
  k.bx(GOLD, [w, 0.03, d], [0, 0, 0]);
  k.bx(VELVET, [w - 0.3, 0.035, d - 0.3], [0, 0, 0]);
  k.bx(GOLD_DARK, [w - 0.5, 0.037, d - 0.5], [0, 0, 0]);
  k.bx(VELVET, [w - 0.56, 0.04, d - 0.56], [0, 0, 0]);
  k.bx(GOLD, [0.3, 0.043, d - 0.7], [0, 0, 0]);
  for (let i = 0; i < 8; i++) k.bx(P.yellow, [0.5, 0.045, 0.14], [0, 0, -d / 2 + 0.8 + i * ((d - 1.6) / 7)]);
  for (const s of [-1, 1]) for (let i = 0; i < 8; i++) k.bx(GOLD, [0.14, 0.043, 0.5], [s * (w / 2 - 0.4), 0, -d / 2 + 0.8 + i * ((d - 1.6) / 7)]);
}

/** Gold chandelier with three tiers of glowing candles (3 x 3, hangs from the ceiling). */
function chandelier(m, { W }) {
  const k = K(m);
  m.root.t = [0, 0.5, 0]; // the crystals hang below the rings: lift everything so the lowest point is at 0
  m.mat('candle', '#fff2c4', { e: '#ffd98a' });
  m.mat('crystal', '#e8f6ff', { r: 0.1, a: 0.7 });
  k.cy(GOLD, 0.04, 1.0, [0, 1.0, 0], { seg: 8 });
  k.sp(GOLD, 0.16, [0, 1.02, 0]);
  const tiers = [[0.55, 0.55, 8], [0.95, 0.25, 10], [1.35, -0.05, 12]];
  for (const [r, y, n] of tiers) {
    k.ring(GOLD, r, 0.03, [0, y + 0.2, 0], { seg: 14, segr: 5 });
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      k.cy(GOLD, 0.02, 0.2, [x, y + 0.2, z], { seg: 4 });
      k.cy('candle', 0.016, 0.06, [x, y + 0.4, z], { seg: 4 });
      k.sp('candle', 0.03, [x, y + 0.5, z], { sy: 1.6, ws: 5, hs: 3 });
      k.cn('crystal', 0.012, 0.035, 0.18, [x, y + 0.02, z], { seg: 4 });
    }
    k.tb(GOLD_DARK, [[0, 1.05, 0], [r * 0.7, y + 0.45, 0], [r, y + 0.2, 0]], 0.014, [0, 0, 0], { seg: 4 });
  }
  k.cn('crystal', 0.12, 0.01, 0.4, [0, -0.35, 0], { seg: 8 });
  k.sp(GOLD, 0.1, [0, -0.35, 0]);
}

function crown_cushion(m) {
  const k = K(m);
  k.bx(VELVET, [0.6, 0.12, 0.5], [0, 0, 0], { r: 0.05 });
  for (const [x, z] of [[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25]]) k.sp(GOLD, 0.04, [x, 0.04, z]);
  k.cn(GOLD, 0.15, 0.17, 0.12, [0, 0.12, 0], { seg: 12 });
  k.ring(GOLD_DARK, 0.155, 0.015, [0, 0.14, 0]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    k.cn(GOLD, 0.035, 0.0, 0.13, [Math.cos(a) * 0.16, 0.24, Math.sin(a) * 0.16], { seg: 5 });
    k.sp([P.red, P.blue, P.pink][i % 3], 0.02, [Math.cos(a) * 0.17, 0.3, Math.sin(a) * 0.17]);
  }
  k.sp('#ff4f86', 0.035, [0, 0.17, 0.16]);
}

/** Grand gold bed with magenta covers and a canopy rail (5 x 5). */
function royal_bed(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 4.9);
  const d = Math.min(D, 4.9);
  const z0 = -d / 2;
  k.bx(GOLD, [w, 0.4, d], [0, 0.1, 0], { r: 0.05 });
  k.bx(GOLD_DARK, [w + 0.06, 0.08, d + 0.06], [0, 0.08, 0], { r: 0.02 });
  k.bx(GOLD, [w, 2.0, 0.2], [0, 0.1, z0 + 0.1], { r: 0.06 });
  k.bx(VELVET, [w - 0.4, 1.4, 0.06], [0, 0.4, z0 + 0.23], { r: 0.05 });
  k.dm(GOLD, 0.6, [0, 2.1, z0 + 0.1], { sy: 0.6 });
  k.bx(GOLD, [w, 0.8, 0.14], [0, 0.1, d / 2 - 0.07], { r: 0.04 });
  for (const s of [-1, 1]) {
    k.cy(GOLD, 0.1, 2.3, [s * (w / 2 - 0.1), 0, z0 + 0.1], { seg: 8 });
    k.sp(GOLD, 0.14, [s * (w / 2 - 0.1), 2.4, z0 + 0.1]);
    k.cy(GOLD, 0.09, 1.0, [s * (w / 2 - 0.1), 0, d / 2 - 0.1], { seg: 8 });
    k.sp(GOLD, 0.12, [s * (w / 2 - 0.1), 1.1, d / 2 - 0.1]);
  }
  k.bx(P.white, [w - 0.3, 0.3, d - 0.5], [0, 0.5, 0.05], { r: 0.1 });
  k.bx('#d4285c', [w - 0.26, 0.18, d * 0.62], [0, 0.78, 0.7], { r: 0.08 });
  k.bx('#f2a6c4', [w - 0.24, 0.2, 0.7], [0, 0.8, -0.2], { r: 0.06 });
  for (const sx of [-1, 1]) {
    k.bx(P.white, [1.5, 0.32, 0.8], [sx * 1.1, 0.8, z0 + 0.8], { r: 0.12, rx: -0.2 });
    k.bx('#d4285c', [1.0, 0.26, 0.55], [sx * 1.1, 1.0, z0 + 0.82], { r: 0.1, rx: -0.25 });
    k.sp(GOLD, 0.05, [sx * 1.1, 1.2, z0 + 0.9]);
  }
}

function necklace(m) {
  const k = K(m);
  const pts = [];
  for (let i = 0; i <= 18; i++) {
    const a = Math.PI * (i / 18);
    pts.push([Math.cos(a) * 0.18, 0.012, Math.sin(a) * 0.22 - 0.02]);
  }
  k.tb(GOLD, pts, 0.01, [0, 0, 0], { seg: 4 });
  for (let i = 2; i <= 16; i += 2) k.sp(i % 4 === 0 ? P.pink : P.white, 0.022, [pts[i][0], 0.025, pts[i][2]], { ws: 6, hs: 4 });
  k.sp('#e8305e', 0.055, [0, 0.04, 0.2], { sy: 0.8, ws: 8, hs: 6 });
  k.ring(GOLD, 0.06, 0.01, [0, 0.03, 0.2]);
}

function earrings(m) {
  const k = K(m);
  for (const s of [-1, 1]) {
    k.ring(GOLD, 0.05, 0.008, [s * 0.1, 0.05, 0.0], { rx: Math.PI / 2 });
    k.sp('#e8305e', 0.04, [s * 0.1, 0.0, 0.0], { sy: 1.2, ws: 8, hs: 6 });
    k.sp(P.white, 0.015, [s * 0.1, 0.11, 0.0]);
  }
  k.bx('#7d1522', [0.34, 0.03, 0.18], [0, -0.0, 0.0], { r: 0.015 });
}

/** A knight's armour on a stand with a gold plume and a sword (1 x 1). */
function armour_stand(m) {
  const k = K(m);
  const steel = '#b6bdc9';
  k.bx(P.woodDark, [0.7, 0.08, 0.7], [0, 0, 0], { r: 0.015 });
  for (const s of [-1, 1]) {
    k.bx(steel, [0.14, 0.7, 0.16], [s * 0.1, 0.08, 0.0], { r: 0.04 });
    k.bx('#8f98a6', [0.16, 0.12, 0.2], [s * 0.1, 0.05, 0.04], { r: 0.04 });
  }
  k.bx(steel, [0.46, 0.5, 0.28], [0, 0.76, 0.0], { r: 0.08 });
  k.bx(GOLD, [0.48, 0.05, 0.3], [0, 0.78, 0.0], { r: 0.01 });
  for (const s of [-1, 1]) {
    k.sp(steel, 0.12, [s * 0.3, 1.18, 0.0]);
    k.bx(steel, [0.12, 0.45, 0.14], [s * 0.34, 0.75, 0.0], { r: 0.04 });
  }
  k.sp(steel, 0.15, [0, 1.42, 0.0]);
  k.bx('#59606d', [0.18, 0.04, 0.02], [0, 1.43, 0.14]);
  k.cn(P.red, 0.03, 0.06, 0.2, [0, 1.52, 0.0], { seg: 8 });
  k.bx(GOLD, [0.04, 0.5, 0.01], [0.38, 0.35, 0.1], { rz: 0 });
  k.bx('#d5dae3', [0.04, 0.7, 0.012], [0.4, 0.55, 0.1]);
  k.bx(GOLD, [0.18, 0.04, 0.04], [0.4, 0.55, 0.1]);
}

/** Carved wooden chest with gold bands, full of coins (2 x 1). */
function treasure_chest(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 1.9);
  const d = Math.min(D, 0.9);
  k.bx('#8a4f2b', [w, 0.55, d], [0, 0, 0], { r: 0.03 });
  k.cy('#a05c32', d / 2, w, [0, 0.55, 0], { rz: Math.PI / 2, seg: 16 });
  for (const x of [-w / 2 + 0.15, 0, w / 2 - 0.15]) {
    k.bx(GOLD, [0.1, 0.57, d + 0.02], [x, -0.01, 0], { r: 0.01 });
    k.add(extrude(Array.from({ length: 9 }, (_, i) => [Math.cos(Math.PI * i / 8) * (d / 2 + 0.01), Math.sin(Math.PI * i / 8) * (d / 2 + 0.01)]).concat(Array.from({ length: 9 }, (_, i) => [Math.cos(Math.PI * (8 - i) / 8) * (d / 2 - 0.05), Math.sin(Math.PI * (8 - i) / 8) * (d / 2 - 0.05)])), 0.1, 'xy'), GOLD, { t: [x, 0.55, 0] });
  }
  k.bx(GOLD, [0.2, 0.22, 0.04], [0, 0.32, d / 2 + 0.01], { r: 0.02 });
  k.sp(GOLD_DARK, 0.03, [0, 0.4, d / 2 + 0.05]);
  k.bx(GOLD_DARK, [w - 0.1, 0.03, d - 0.1], [0, 0.55, 0]);
}

/** A heap of gold coins and nuggets (1 x 1). */
function gold_pile(m) {
  const k = K(m);
  k.bl(GOLD, 0.42, [0, 0.18, 0], { seed: 5, sy: 0.6, detail: 2, jitter: 0.12 });
  for (let i = 0; i < 14; i++) {
    const a = i * 2.4;
    const r = 0.1 + (i % 4) * 0.08;
    k.cy(i % 3 ? GOLD : '#f5cb52', 0.07, 0.015, [Math.cos(a) * r, 0.22 + (i % 4) * 0.06, Math.sin(a) * r], { rx: 0.5 * Math.cos(a), rz: 0.5 * Math.sin(a), seg: 10 });
  }
  k.sp('#e8305e', 0.035, [0.2, 0.3, 0.1]);
  k.sp('#4aa3ff', 0.03, [-0.15, 0.32, -0.05]);
}

/** A big framed painting of a castle on a hill (2 x 1, hangs on the wall). */
function painting(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 1.9);
  k.fm(GOLD, w, 1.2, 0.12, 0.08, [0, 0, 0]);
  k.fm(GOLD_DARK, w - 0.2, 1.0, 0.03, 0.09, [0, 0.1, 0]);
  k.bx('#8fcff0', [w - 0.24, 0.96, 0.02], [0, 0.12, 0.02]);
  k.bx('#6bb04e', [w - 0.24, 0.36, 0.022], [0, 0.12, 0.022]);
  k.bx(P.white, [0.3, 0.3, 0.024], [0.2, 0.36, 0.024]);
  k.fr(P.red, 0.36, 0.01, 0.1, 0.01, 0.14, [0.2, 0.66, 0.026]);
  k.sp(P.white, 0.11, [-0.5, 0.88, 0.025], { sz: 0.1 });
  k.sp(P.yellow, 0.07, [0.6, 1.0, 0.025], { sz: 0.1 });
}

/** White marble column with gold base and a gold dome top (1 x 1). */
function pillar(m) {
  const k = K(m);
  k.bx(MARBLE, [0.9, 0.2, 0.9], [0, 0, 0], { r: 0.02 });
  k.cy(GOLD, 0.4, 0.1, [0, 0.2, 0], { seg: 16 });
  k.cy(MARBLE, 0.3, 2.1, [0, 0.3, 0], { seg: 14 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    k.bx('#e4dfd3', [0.05, 2.0, 0.04], [Math.cos(a) * 0.3, 0.35, Math.sin(a) * 0.3], { ry: -a });
  }
  k.cy(GOLD, 0.38, 0.14, [0, 2.4, 0], { seg: 16 });
  k.bx(MARBLE, [0.9, 0.16, 0.9], [0, 2.54, 0], { r: 0.02 });
  k.dm(GOLD, 0.32, [0, 2.7, 0], { sy: 1.1 });
  k.cn(GOLD, 0.03, 0.0, 0.3, [0, 3.0, 0], { seg: 6 });
}

/** Long banquet table in gold with a red runner, goblets and candles (6 x 2). */
function royal_table(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 5.9);
  const d = Math.min(D, 1.9);
  m.mat('candle', '#fff2c4', { e: '#ffd98a' });
  k.bx(GOLD, [w, 0.1, d], [0, 0.82, 0], { r: 0.03 });
  k.bx(VELVET, [w - 0.4, 0.02, 0.8], [0, 0.92, 0], { r: 0.005 });
  k.bx(GOLD, [w - 0.4, 0.02, 0.1], [0, 0.93, 0.5]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    k.cn(GOLD_DARK, 0.17, 0.09, 0.82, [sx * (w / 2 - 0.35), 0, sz * (d / 2 - 0.3)], { seg: 8 });
    k.sp(GOLD, 0.12, [sx * (w / 2 - 0.35), 0.5, sz * (d / 2 - 0.3)], { ws: 8, hs: 5 });
  }
  k.bx(GOLD_DARK, [w - 1.0, 0.1, 0.2], [0, 0.55, 0], { r: 0.02 });
  for (let i = 0; i < 5; i++) {
    const x = -w / 2 + 0.7 + i * ((w - 1.4) / 4);
    for (const z of [-0.55, 0.55]) {
      k.cy(GOLD, 0.05, 0.04, [x, 0.93, z], { seg: 8 });
      k.cy(GOLD, 0.015, 0.1, [x, 0.97, z], { seg: 4 });
      k.cn(GOLD, 0.06, 0.07, 0.1, [x, 1.07, z], { seg: 8 });
      k.sp('#e8305e', 0.02, [x, 1.14, z]);
    }
  }
  for (const x of [-1.2, 1.2]) {
    k.cy(GOLD, 0.05, 0.28, [x, 0.93, 0.0], { seg: 8 });
    k.cy('candle', 0.025, 0.12, [x, 1.21, 0], { seg: 8 });
    k.sp('candle', 0.035, [x, 1.38, 0], { sy: 1.6, ws: 6, hs: 4 });
  }
  k.bl(P.red, 0.12, [0, 1.0, 0], { detail: 0, sy: 0.7 });
  k.bl(P.orange, 0.1, [0.25, 1.0, 0.1], { detail: 0, sy: 0.7 });
}

function goblet(m) {
  const k = K(m);
  k.lt(GOLD, [[0, 0], [0.09, 0], [0.1, 0.03], [0.04, 0.06], [0.03, 0.18], [0.11, 0.24], [0.14, 0.4], [0.13, 0.41], [0.0, 0.3]], [0, 0, 0], { seg: 14 });
  k.ring(GOLD_DARK, 0.04, 0.012, [0, 0.14, 0]);
  k.cy('#8a1c2c', 0.115, 0.01, [0, 0.38, 0], { seg: 12 });
  k.sp('#e8305e', 0.02, [0, 0.27, 0.12]);
  k.sp('#4aa3ff', 0.018, [0.11, 0.3, 0.0]);
}

function sword(m) {
  const k = K(m);
  k.bx('#d8dde6', [0.05, 0.012, 0.7], [0, 0.0, 0.0], { r: 0.002 });
  k.bx('#aab3c0', [0.012, 0.014, 0.66], [0, 0.0, 0.0]);
  k.cn('#d8dde6', 0.025, 0.0, 0.1, [0, 0.0, -0.4], { rx: Math.PI / 2 });
  k.bx(GOLD, [0.32, 0.025, 0.04], [0, 0, 0.36], { r: 0.01 });
  k.cy('#7d1522', 0.02, 0.2, [0, 0.015, 0.5], { rx: Math.PI / 2, seg: 8 });
  k.sp(GOLD, 0.04, [0, 0.015, 0.62]);
  k.sp('#e8305e', 0.02, [0, 0.04, 0.36]);
}

function gold_lamp(m) {
  const k = K(m);
  m.mat('lampGlow', '#ffe9a8', { e: '#ffcf66' });
  k.cy(GOLD_DARK, 0.2, 0.05, [0, 0, 0], { seg: 12 });
  k.lt(GOLD, [[0, 0.05], [0.12, 0.05], [0.06, 0.16], [0.04, 0.9], [0.1, 0.96], [0, 0.96]], [0, 0, 0], { seg: 12 });
  k.cy(GOLD, 0.2, 0.05, [0, 0.96, 0], { seg: 8 });
  k.cy('lampGlow', 0.16, 0.38, [0, 1.01, 0], { seg: 8 });
  for (let i = 0; i < 4; i++) k.bx(GOLD, [0.03, 0.4, 0.03], [Math.cos(i * 1.57 + 0.78) * 0.16, 1.0, Math.sin(i * 1.57 + 0.78) * 0.16]);
  k.cn(GOLD, 0.2, 0.0, 0.25, [0, 1.4, 0], { seg: 8 });
  k.sp(GOLD, 0.04, [0, 1.66, 0]);
}

function gem(m) {
  const k = K(m);
  k.cn('#e8305e', 0.0, 0.1, 0.1, [0, 0.0, 0], { seg: 6 });
  k.cn('#ff6b94', 0.1, 0.07, 0.07, [0, 0.1, 0], { seg: 6 });
}

export const RECIPES = {
  throne: { build: throne },
  royal_carpet: { build: royal_carpet },
  chandelier: { build: chandelier, mount: { y: 2.0, wall: false }, maxTris: 4000 },
  crown_cushion: { build: crown_cushion },
  royal_bed: { build: royal_bed },
  necklace: { build: necklace },
  earrings: { build: earrings },
  armour_stand: { build: armour_stand },
  treasure_chest: { build: treasure_chest },
  gold_pile: { build: gold_pile },
  painting: { build: painting, mount: { y: 1.0, wall: true } },
  pillar: { build: pillar },
  royal_table: { build: royal_table, maxTris: 4000 },
  goblet: { build: goblet },
  sword: { build: sword, kind: 'item', foot: [0.5, 0.9], name: 'Sword' },
  gold_lamp: { build: gold_lamp, kind: 'extra', foot: [0.6, 0.6], name: 'Gold lamp' },
  gem: { build: gem, kind: 'item', foot: [0.3, 0.3], name: 'Gem' },
};
