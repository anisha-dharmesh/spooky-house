// Granny's big house: bedrooms, bathroom, craft room, puja room, exercise room, dance room, study, play zone, store room.
// Matched to panel 2 (props) of docs/art/reference/01-asset-pack-overview.webp: warm carved wood, purple, brass.
// In the game these are shown in grey (Granny's house stays black, grey and white).
import { kit } from '../kit.mjs';
import { P } from '../pal.mjs';

const K = (m) => kit(m);

// ---------- store room ----------

/** Big terracotta pot with a leafy plant to hide behind (2 x 2). */
function big_plant_pot(m, { W }) {
  const k = K(m);
  const r = Math.min(W, 1.8) / 2;
  k.lt('#c8703c', [[0, 0], [r * 0.6, 0], [r * 0.7, 0.1], [r * 0.9, 0.55], [r, 0.7], [r, 0.8], [r * 0.9, 0.8], [0, 0.74]], [0, 0, 0], { seg: 20 });
  k.cy('#5a3a24', r * 0.9, 0.04, [0, 0.74, 0], { seg: 20 });
  k.cy('#a95a2e', r * 1.02, 0.06, [0, 0.62, 0], { seg: 20 });
  const greens = [P.green, P.greenLight, P.greenDark];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const rad = 0.25 + (i % 3) * 0.12;
    k.sp(greens[i % 3], 0.34, [Math.cos(a) * rad, 1.15 + (i % 4) * 0.22, Math.sin(a) * rad], { sy: 1.35, sx: 0.7, sz: 0.7, ry: -a, rz: 0.35 * Math.cos(a), ws: 8, hs: 5 });
  }
  k.bl(P.green, 0.5, [0, 1.35, 0], { seed: 4, sy: 1.1 });
  k.sp(P.red, 0.05, [0.3, 1.9, 0.2]);
  k.sp(P.red, 0.05, [-0.35, 1.7, -0.1]);
}

// ---------- bedrooms ----------

/** Three bunks stacked on two posts, with a ladder (2 x 4). */
function bunk_bed(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 1.9);
  const d = Math.min(D, 3.9);
  const quilts = [P.purple, P.pink, P.blue];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.bx(P.woodDark, [0.1, 1.95, 0.1], [sx * (w / 2 - 0.06), 0, sz * (d / 2 - 0.06)], { r: 0.02 });
  for (let i = 0; i < 3; i++) {
    const y = 0.22 + i * 0.62;
    k.bx(P.wood, [w, 0.08, d], [0, y, 0], { r: 0.015 });
    k.bx(P.white, [w - 0.14, 0.12, d - 0.2], [0, y + 0.08, 0], { r: 0.04 });
    k.bx(quilts[i], [w - 0.1, 0.07, d * 0.58], [0, y + 0.18, 0.5], { r: 0.03 });
    k.bx(P.white, [0.55, 0.1, 0.34], [0, y + 0.2, -d / 2 + 0.3], { r: 0.04 });
    k.bx(P.woodDark, [w, 0.22, 0.05], [0, y + 0.08, -d / 2 + 0.03]);
    k.bx(P.woodDark, [0.05, 0.2, d], [-w / 2 + 0.03, y + 0.08, 0]);
    k.bx(P.woodDark, [0.05, 0.2, d], [w / 2 - 0.03, y + 0.08, 0]);
  }
  for (let i = 0; i < 6; i++) k.bx(P.woodLight, [0.07, 0.05, 0.05], [w / 2 + 0.01, 0.18 + i * 0.3, d / 2 - 0.35], { rz: 0 }); // ladder rungs
  k.bx(P.woodLight, [0.04, 1.8, 0.05], [w / 2 + 0.0, 0.1, d / 2 - 0.35]);
}

/** Big double bed with a carved wooden headboard and pink covers (4 x 5). */
function bed_double(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 3.9);
  const d = Math.min(D, 4.9);
  const z0 = -d / 2;
  k.bx(P.woodDark, [w, 0.34, d - 0.1], [0, 0.1, 0.05], { r: 0.05 });
  k.bx(P.woodDark, [w, 1.5, 0.16], [0, 0.0, z0 + 0.08], { r: 0.06 });
  k.bx(P.wood, [w - 0.3, 0.9, 0.06], [0, 0.45, z0 + 0.19], { r: 0.05 });
  for (const sx of [-1, 1]) k.sp(P.brass, 0.1, [sx * (w / 2 - 0.1), 1.55, z0 + 0.08]);
  k.bx(P.woodDark, [w, 0.6, 0.14], [0, 0.0, d / 2 - 0.07], { r: 0.05 });
  k.bx(P.white, [w - 0.2, 0.28, d - 0.4], [0, 0.44, 0.05], { r: 0.1 });
  k.bx(P.pink, [w - 0.16, 0.14, d * 0.62], [0, 0.66, 0.65], { r: 0.07 });
  k.bx(P.pinkDark, [w - 0.14, 0.15, 0.5], [0, 0.67, -0.36], { r: 0.05 });
  for (const sx of [-1, 1]) {
    k.bx(P.white, [1.2, 0.24, 0.7], [sx * 0.85, 0.72, z0 + 0.65], { r: 0.1, rx: -0.2 });
    k.bx(P.pinkLight, [0.8, 0.2, 0.5], [sx * 0.85, 0.86, z0 + 0.7], { r: 0.08, rx: -0.25 });
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.bx(P.woodDeep, [0.16, 0.16, 0.16], [sx * (w / 2 - 0.1), 0, sz * (d / 2 - 0.1)]);
}

/** Chest of drawers with brass knobs (2 x 1). */
function drawer_unit(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 1.9);
  const d = Math.min(D, 0.9);
  k.bx(P.wood, [w, 0.8, d], [0, 0.06, 0], { r: 0.03 });
  k.bx(P.woodLight, [w + 0.06, 0.06, d + 0.04], [0, 0.86, 0], { r: 0.015 });
  for (let i = 0; i < 3; i++) {
    k.bx(P.woodLight, [w - 0.14, 0.2, 0.025], [0, 0.12 + i * 0.25, d / 2 + 0.005], { r: 0.01 });
    k.sp(P.brass, 0.03, [-0.2, 0.22 + i * 0.25, d / 2 + 0.04]);
    k.sp(P.brass, 0.03, [0.2, 0.22 + i * 0.25, d / 2 + 0.04]);
  }
  for (const s of [-1, 1]) k.bx(P.woodDeep, [0.08, 0.08, 0.08], [s * (w / 2 - 0.1), 0, d / 2 - 0.1]);
}

function trophy(m) {
  const k = K(m);
  k.bx(P.woodDark, [0.26, 0.05, 0.26], [0, 0, 0], { r: 0.01 });
  k.bx(P.gold, [0.2, 0.05, 0.2], [0, 0.05, 0]);
  k.lt(P.gold, [[0, 0], [0.07, 0], [0.04, 0.05], [0.03, 0.2], [0.12, 0.28], [0.15, 0.45], [0.11, 0.46], [0.0, 0.4]], [0, 0.1, 0]);
  for (const s of [-1, 1]) k.ring(P.gold, 0.06, 0.012, [s * 0.14, 0.4, 0], { rx: Math.PI / 2, ry: 0 });
  k.sp(P.goldDark, 0.025, [0, 0.24, 0.09]);
}

function medal(m) {
  const k = K(m);
  k.cy(P.gold, 0.1, 0.02, [0, 0, 0], { seg: 20 });
  k.cy(P.goldDark, 0.07, 0.025, [0, 0, 0], { seg: 20 });
  k.bx(P.red, [0.07, 0.01, 0.2], [-0.03, 0, -0.22], { ry: 0.3 });
  k.bx(P.white, [0.07, 0.01, 0.2], [0.03, 0, -0.22], { ry: -0.3 });
  k.bx(P.blue, [0.04, 0.011, 0.2], [0, 0, -0.22]);
}

function watch(m) {
  const k = K(m);
  k.ring(P.steelDark, 0.1, 0.025, [0, 0.025, 0]);
  k.cy(P.steel, 0.09, 0.05, [0, 0.0, 0], { seg: 20 });
  k.cy(P.white, 0.07, 0.01, [0, 0.05, 0], { seg: 20 });
  k.bx(P.black, [0.005, 0.012, 0.05], [0, 0.056, -0.02]);
  k.bx(P.red, [0.04, 0.012, 0.004], [0.0, 0.056, 0.0], { ry: 0.5 });
}

function thali(m) {
  const k = K(m);
  k.lt(P.steel, [[0, 0.01], [0.3, 0.02], [0.34, 0.05], [0.3, 0.05], [0, 0.03]], [0, 0, 0], { seg: 24 });
  for (const [x, z, c] of [[-0.12, -0.06, P.orange], [0.12, -0.06, P.yellow], [-0.12, 0.13, P.red], [0.12, 0.13, P.greenLight]]) {
    k.lt(P.steelDark, [[0, 0.04], [0.07, 0.04], [0.09, 0.1], [0.075, 0.1], [0.0, 0.06]], [x, 0, z], { seg: 12 });
    k.cy(c, 0.065, 0.02, [x, 0.06, z], { seg: 12 });
  }
  k.bx('#e8d9a8', [0.14, 0.03, 0.1], [0, 0.04, -0.2], { r: 0.015 });
}

function glass(m) {
  const k = K(m);
  m.mat('glassTumbler', '#cfe7f2', { r: 0.15, a: 0.45 });
  k.cn('glassTumbler', 0.06, 0.075, 0.2, [0, 0, 0], { seg: 14 });
  k.cn(P.pink, 0.055, 0.067, 0.14, [0, 0.01, 0], { seg: 14 });
  k.cy(P.white, 0.01, 0.2, [0.02, 0.06, 0], { rz: -0.12, seg: 5 });
}

function bowl(m) {
  const k = K(m);
  k.lt(P.white, [[0, 0], [0.07, 0], [0.1, 0.04], [0.2, 0.12], [0.22, 0.2], [0.2, 0.2], [0.18, 0.13], [0.0, 0.05]], [0, 0, 0], { seg: 20 });
  k.lt(P.purple, [[0.1, 0.045], [0.2, 0.12], [0.22, 0.2], [0.215, 0.2], [0.195, 0.125], [0.1, 0.05]], [0, 0, 0], { seg: 20 });
  k.cy(P.orange, 0.185, 0.02, [0, 0.12, 0], { seg: 20 });
}

function mirror_wall(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 3.6);
  k.fm(P.gold, w, 1.7, 0.12, 0.07, [0, 0, 0]);
  k.bx('#9fc6dc', [w - 0.24, 1.46, 0.02], [0, 0.12, 0.02]);
  k.bx('#d9ecf5', [0.12, 0.9, 0.012], [-w / 4, 0.4, 0.034], { rz: -0.5 });
  for (const x of [-w / 2, 0, w / 2]) k.sp(P.goldDark, 0.1, [x, 1.72, 0.0], { sy: 0.6 });
}

function toothpaste(m) {
  const k = K(m);
  k.bx(P.white, [0.07, 0.04, 0.28], [0, 0, 0], { r: 0.015 });
  k.bx(P.blue, [0.071, 0.041, 0.1], [0, 0, 0.06], { r: 0.015 });
  k.cy(P.red, 0.03, 0.05, [0, 0.0, -0.17], { rx: Math.PI / 2, seg: 8 });
  k.bx(P.white, [0.07, 0.015, 0.03], [0, 0.0, 0.15]);
}

function slime_bucket(m) {
  const k = K(m);
  k.cn(P.blue, 0.2, 0.26, 0.34, [0, 0, 0], { seg: 16 });
  k.cy('#6bd33a', 0.24, 0.05, [0, 0.31, 0], { seg: 16 });
  k.bl('#7be04a', 0.18, [0, 0.38, 0], { sy: 0.5, detail: 1, jitter: 0.08 });
  for (const [a, h] of [[0.5, 0.2], [2.4, 0.14], [4.2, 0.18]]) k.bx('#7be04a', [0.05, h, 0.03], [Math.cos(a) * 0.25, 0.28 - h / 2, Math.sin(a) * 0.25]);
  k.tb(P.steelDark, [[-0.25, 0.3, 0], [0, 0.55, 0], [0.25, 0.3, 0]], 0.012);
}

function inverter(m) {
  const k = K(m);
  k.bx(P.grey, [0.7, 0.95, 0.35], [0, 0.0, 0], { r: 0.03 });
  k.bx(P.greyDark, [0.5, 0.3, 0.02], [0, 0.55, 0.18]);
  k.bx('#6fd57f', [0.3, 0.1, 0.012], [0, 0.65, 0.19], { r: 0.005 });
  for (let i = 0; i < 4; i++) k.sp([P.red, P.yellow, P.green, P.blueLight][i], 0.02, [-0.18 + i * 0.12, 0.5, 0.19]);
  for (let i = 0; i < 5; i++) k.bx(P.greyDark, [0.5, 0.02, 0.02], [0, 0.1 + i * 0.07, 0.18]);
}

/** Pram with a hood and big wheels (2 x 2). */
function baby_stroller(m, { W, D }) {
  const k = K(m);
  k.bx(P.pink, [0.7, 0.3, 1.0], [0, 0.35, 0.05], { r: 0.1 });
  k.bx(P.pinkLight, [0.6, 0.12, 0.88], [0, 0.6, 0.05], { r: 0.05 });
  k.dm(P.pinkDark, 0.38, [0, 0.62, -0.3], { sy: 1.3, ry: 0 });
  for (const s of [-1, 1]) {
    k.cy(P.charcoal, 0.22, 0.06, [s * 0.42, 0.19, 0.42], { rz: Math.PI / 2, seg: 16 });
    k.cy(P.steel, 0.07, 0.07, [s * 0.42, 0.34, 0.42], { rz: Math.PI / 2, seg: 10 });
    k.cy(P.charcoal, 0.22, 0.06, [s * 0.42, 0.19, -0.42], { rz: Math.PI / 2, seg: 16 });
  }
  k.tb(P.steel, [[-0.28, 0.5, -0.5], [-0.28, 1.0, -0.78], [0.28, 1.0, -0.78], [0.28, 0.5, -0.5]], 0.025);
  k.bx(P.steel, [0.7, 0.05, 0.05], [0, 0.3, 0.42]);
  k.bx(P.steel, [0.7, 0.05, 0.05], [0, 0.3, -0.42]);
}

function box_cardboard(m) {
  const k = K(m);
  k.bx('#cf9f62', [0.9, 0.7, 0.9], [0, 0, 0], { r: 0.012 });
  k.bx('#b88646', [0.9, 0.02, 0.12], [0, 0.69, 0], { ry: 0 });
  k.bx('#e6c48a', [0.4, 0.2, 0.01], [0, 0.15, 0.455]);
  k.bx(P.red, [0.12, 0.12, 0.012], [0.25, 0.4, 0.456]);
}

function box_stack(m, { W, D }) {
  const k = K(m);
  k.bx('#cf9f62', [0.95, 0.6, 0.9], [-0.45, 0, -0.4], { r: 0.012 });
  k.bx('#c18e51', [0.9, 0.55, 0.85], [0.5, 0, -0.45], { r: 0.012, ry: 0.08 });
  k.bx('#d8ab6e', [0.8, 0.5, 0.8], [-0.35, 0.6, -0.4], { r: 0.012, ry: -0.1 });
  k.bx('#b98547', [0.85, 0.55, 0.8], [0.45, 0.0, 0.5], { r: 0.012 });
  k.bx('#e6c48a', [0.45, 0.01, 0.2], [-0.4, 0.6, 0.0], { ry: 0.2 });
  k.bx(P.white, [0.3, 0.2, 0.01], [0.45, 0.2, 0.93]);
  k.bx(P.red, [0.14, 0.05, 0.012], [0.45, 0.4, 0.93]);
}

// ---------- fun rooms ----------

/** Big black speaker with orange rim and two woofers (2 x 1). */
function jbl_speaker(m, { W, D }) {
  const k = K(m);
  k.bx(P.charcoal, [1.3, 1.2, 0.7], [0, 0, 0], { r: 0.05 });
  k.bx(P.orange, [1.34, 0.05, 0.74], [0, 1.16, 0], { r: 0.015 });
  k.bx(P.orange, [1.34, 0.05, 0.74], [0, 0.0, 0], { r: 0.015 });
  for (const s of [-1, 1]) {
    k.cy(P.black, 0.3, 0.06, [s * 0.34, 0.27, 0.32], { rx: Math.PI / 2, seg: 20 });
    k.cy('#4a4f5a', 0.2, 0.07, [s * 0.34, 0.27, 0.34], { rx: Math.PI / 2, seg: 20 });
    k.cy(P.black, 0.08, 0.08, [s * 0.34, 0.27, 0.36], { rx: Math.PI / 2, seg: 14 });
  }
  k.bx(P.black, [0.5, 0.2, 0.02], [0, 0.78, 0.35]);
  k.bx(P.white, [0.3, 0.05, 0.012], [0, 0.84, 0.36]);
  k.bx(P.charcoal, [0.9, 0.04, 0.04], [0, 1.2, 0], { ry: 0 });
}

function disco_light(m) {
  const k = K(m);
  k.cy(P.steelDark, 0.2, 0.04, [0, 0, 0]);
  k.cy(P.steel, 0.03, 0.9, [0, 0.04, 0]);
  const ball = '#c9d4e4';
  m.mat('mirrorBall', ball, { r: 0.15 });
  k.bl('mirrorBall', 0.3, [0, 1.15, 0], { jitter: 0, detail: 1 });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    k.sp([P.pink, P.blueLight, P.yellow, P.greenLight][i], 0.07, [Math.cos(a) * 0.3, 1.15, Math.sin(a) * 0.3]);
  }
}

function game_controller(m) {
  const k = K(m);
  k.bx(P.charcoal, [0.22, 0.045, 0.14], [0, 0, 0], { r: 0.02 });
  for (const s of [-1, 1]) k.sp(P.charcoal, 0.055, [s * 0.1, 0.02, 0.04], { sy: 0.7 });
  k.bx(P.white, [0.05, 0.01, 0.016], [-0.07, 0.045, -0.01]);
  k.bx(P.white, [0.016, 0.01, 0.05], [-0.07, 0.045, -0.01]);
  for (const [x, z, c] of [[0.07, -0.03, P.red], [0.09, -0.01, P.blue], [0.07, 0.01, P.green], [0.05, -0.01, P.yellow]]) k.sp(c, 0.012, [x, 0.052, z], { sy: 0.5 });
}

function colored_paper(m) {
  const k = K(m);
  const cols = [P.red, P.yellow, P.green, P.blueLight, P.pink, P.orange];
  cols.forEach((c, i) => k.bx(c, [0.3, 0.01, 0.4], [i * 0.01, i * 0.011, 0], { ry: (i - 2.5) * 0.18 }));
}

function scissors(m) {
  const k = K(m);
  for (const s of [-1, 1]) {
    k.bx(P.steel, [0.025, 0.012, 0.2], [s * 0.015, 0.012, -0.06], { ry: s * 0.12 });
    k.ring(P.red, 0.045, 0.014, [s * 0.05, 0.012, 0.1]);
  }
  k.sp(P.steelDark, 0.016, [0, 0.016, 0.02]);
}

function glue(m) {
  const k = K(m);
  k.cy(P.white, 0.045, 0.14, [0, 0, 0], { seg: 12 });
  k.cn(P.orange, 0.045, 0.012, 0.08, [0, 0.14, 0], { seg: 12 });
  k.bx(P.blue, [0.092, 0.06, 0.092], [0, 0.04, 0], { r: 0.01 });
}

function pen_holder(m) {
  const k = K(m);
  k.lt(P.purple, [[0, 0], [0.07, 0], [0.08, 0.02], [0.08, 0.15], [0.07, 0.15], [0, 0.03]], [0, 0, 0]);
  [[0.0, P.red], [0.03, P.blue], [-0.03, P.green], [0.015, P.yellow]].forEach(([x, c], i) => k.cy(c, 0.009, 0.28, [x, 0.04, (i - 1.5) * 0.02], { rz: (x * 3), seg: 6 }));
}

function idol(m) {
  const k = K(m);
  k.bx(P.woodDark, [0.4, 0.08, 0.3], [0, 0, 0], { r: 0.012 });
  k.cn(P.gold, 0.12, 0.06, 0.3, [0, 0.08, 0], { seg: 12 });
  k.sp(P.gold, 0.1, [0, 0.42, 0]);
  k.cn(P.goldDark, 0.07, 0.01, 0.1, [0, 0.5, 0], { seg: 8 });
  k.sp(P.red, 0.02, [0, 0.6, 0]);
  for (const s of [-1, 1]) k.sp(P.gold, 0.05, [s * 0.15, 0.22, 0.04], { sy: 1.2 });
}

function puja_thali(m) {
  const k = K(m);
  k.lt(P.brass, [[0, 0.01], [0.28, 0.02], [0.32, 0.06], [0.28, 0.06], [0, 0.03]], [0, 0, 0], { seg: 24 });
  k.lt(P.orange, [[0, 0.03], [0.06, 0.03], [0.08, 0.08], [0.0, 0.07]], [0, 0, 0.0], { seg: 10 });
  k.sp(P.yellow, 0.025, [0, 0.14, 0], { sy: 1.6 });
  for (let i = 0; i < 6; i++) k.sp([P.pink, P.orange, P.yellow][i % 3], 0.035, [Math.cos(i) * 0.15, 0.06, Math.sin(i) * 0.15], { sy: 0.5 });
  k.cy(P.brown, 0.006, 0.22, [0.15, 0.05, -0.1], { rz: 0.3, seg: 5 });
}

function diya(m) {
  const k = K(m);
  k.lt('#b5602f', [[0, 0], [0.05, 0], [0.09, 0.03], [0.1, 0.07], [0.08, 0.075], [0.0, 0.055]], [0, 0, 0], { seg: 14 });
  k.cn('#b5602f', 0.04, 0.025, 0.05, [0.11, 0.03, 0], { rz: -1.2, seg: 8 });
  m.mat('flame', '#ffd25a', { e: '#ffb133' });
  k.sp('flame', 0.03, [0.0, 0.1, 0], { sy: 1.7 });
  k.sp(P.orange, 0.018, [0.0, 0.085, 0], { sy: 1.2 });
}

function matchbox(m) {
  const k = K(m);
  k.bx(P.red, [0.12, 0.04, 0.08], [0, 0, 0], { r: 0.006 });
  k.bx(P.yellow, [0.1, 0.042, 0.02], [0, 0, 0.03]);
  for (let i = 0; i < 3; i++) k.bx(P.woodLight, [0.004, 0.004, 0.06], [-0.04 + i * 0.02, 0.043, -0.2 + i * 0], { ry: 0.3 });
}

/** Treadmill with side rails, a belt and a screen (2 x 4). */
function treadmill(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 1.0);
  const d = Math.min(D, 2.0);
  k.bx(P.charcoal, [w, 0.12, d], [0, 0.2, 0.2], { r: 0.04 });
  k.bx('#3a3f4a', [w - 0.3, 0.06, d - 0.2], [0, 0.32, 0.2]);
  for (let i = 0; i < 10; i++) k.bx(P.greyDark, [w - 0.3, 0.005, 0.02], [0, 0.382, -0.7 + i * 0.2]);
  for (const s of [-1, 1]) {
    k.bx(P.red, [0.12, 0.06, d - 0.1], [s * (w / 2 - 0.05), 0.32, 0.2], { r: 0.02 });
    k.bx(P.steelDark, [0.06, 1.2, 0.06], [s * (w / 2 - 0.05), 0.3, -d / 2 + 0.2]);
  }
  k.bx(P.charcoal, [w, 0.3, 0.14], [0, 1.2, -d / 2 + 0.2], { r: 0.03 });
  k.bx('#1c2a3a', [w - 0.2, 0.18, 0.02], [0, 1.26, -d / 2 + 0.28]);
  k.bx('#59d0ff', [0.3, 0.06, 0.012], [0, 1.31, -d / 2 + 0.285]);
  k.bx(P.steelDark, [w - 0.1, 0.05, 0.05], [0, 1.05, -d / 2 + 0.55]);
  for (const s of [-1, 1]) k.bx(P.steelDark, [0.04, 0.04, 0.45], [s * (w / 2 - 0.05), 1.05, -d / 2 + 0.5]);
}

function dumbbell(m) {
  const k = K(m);
  k.cy(P.steel, 0.018, 0.28, [0, 0.07, 0], { rz: Math.PI / 2, seg: 8 });
  for (const s of [-1, 1]) {
    k.cy(P.charcoal, 0.08, 0.06, [s * 0.14, 0.09, 0], { rz: Math.PI / 2, seg: 10 });
    k.cy(P.red, 0.09, 0.03, [s * 0.1, 0.09, 0], { rz: Math.PI / 2, seg: 10 });
  }
}

/** Exercise bike with a big flywheel and a screen (2 x 2). */
function exercise_bike(m) {
  const k = K(m);
  k.bx(P.charcoal, [0.7, 0.05, 0.12], [0, 0, 0.35], { r: 0.015 });
  k.bx(P.charcoal, [0.7, 0.05, 0.12], [0, 0, -0.35], { r: 0.015 });
  k.cy(P.red, 0.28, 0.12, [0, 0.28, -0.28], { rz: Math.PI / 2, seg: 22 });
  k.cy(P.charcoal, 0.1, 0.14, [0, 0.46, -0.28], { rz: Math.PI / 2, seg: 14 });
  k.bx(P.charcoal, [0.07, 0.8, 0.07], [0, 0.0, 0.0], { rx: 0.2 });
  k.bx(P.red, [0.1, 0.06, 0.34], [0, 0.78, 0.18], { r: 0.02 });
  k.tb(P.steelDark, [[0, 0.78, -0.26], [0, 1.1, -0.38], [0, 1.2, -0.18]], 0.025);
  k.bx(P.black, [0.5, 0.05, 0.05], [0, 1.18, -0.15]);
  k.bx('#1c2a3a', [0.28, 0.16, 0.04], [0, 1.2, -0.42], { rx: -0.3 });
  k.bx('#6bf0ff', [0.18, 0.05, 0.01], [0, 1.28, -0.4], { rx: -0.3 });
  for (const s of [-1, 1]) k.bx(P.steelDark, [0.04, 0.05, 0.22], [s * 0.2, 0.28, -0.1]);
}

function yoga_mat(m) {
  const k = K(m);
  k.bx(P.purple, [0.72, 0.025, 1.9], [0, 0, 0], { r: 0.008 });
  k.bx(P.purpleLight, [0.62, 0.027, 1.8], [0, 0, 0], { r: 0.004 });
  k.cy(P.purple, 0.06, 0.72, [0, 0.0, 0.98], { rz: Math.PI / 2, seg: 14 });
  k.cy(P.purpleLight, 0.04, 0.73, [0, 0.01, 0.98], { rz: Math.PI / 2, seg: 12 });
}

function music_player(m) {
  const k = K(m);
  k.bx(P.red, [0.7, 0.3, 0.22], [0, 0, 0], { r: 0.05 });
  for (const s of [-1, 1]) {
    k.cy(P.charcoal, 0.1, 0.03, [s * 0.22, 0.15, 0.11], { rx: Math.PI / 2, seg: 18 });
    k.cy('#555b66', 0.05, 0.035, [s * 0.22, 0.15, 0.115], { rx: Math.PI / 2, seg: 12 });
  }
  k.bx(P.black, [0.22, 0.1, 0.02], [0, 0.12, 0.115]);
  k.bx('#6bf0ff', [0.16, 0.04, 0.01], [0, 0.15, 0.125]);
  k.tb(P.steelDark, [[-0.25, 0.3, 0], [-0.25, 0.4, 0], [0.25, 0.4, 0], [0.25, 0.3, 0]], 0.02);
  k.sp(P.yellow, 0.025, [0, 0.07, 0.115]);
}

/** Climbing wall with coloured holds (6 x 1). */
function climbing_wall(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 5.9);
  k.bx('#a9763f', [w, 3.1, 0.16], [0, 0, -0.38]);
  k.bx(P.woodLight, [w - 0.2, 2.9, 0.04], [0, 0.1, -0.28]);
  const rand = (i) => ((Math.sin(i * 91.7) * 43758.5453) % 1 + 1) % 1;
  const cols = [P.red, P.yellow, P.blue, P.green, P.pink, P.orange, P.purple];
  for (let i = 0; i < 34; i++) {
    const x = (rand(i) - 0.5) * (w - 0.5);
    const y = 0.25 + rand(i + 50) * 2.6;
    k.bl(cols[i % cols.length], 0.09, [x, y, -0.24], { seed: i + 3, sy: 0.7, sz: 0.7, jitter: 0.12, detail: 0 });
  }
  k.bx(P.greyDark, [w, 0.1, 0.5], [0, 0, -0.2]);
}

function safety_harness(m) {
  const k = K(m);
  k.ring(P.orange, 0.12, 0.02, [0, 0.03, 0]);
  k.ring(P.orange, 0.1, 0.02, [0, 0.03, 0.15]);
  k.tb(P.orange, [[-0.1, 0.03, 0], [-0.05, 0.2, 0.05], [0.05, 0.2, 0.05], [0.1, 0.03, 0]], 0.015);
  k.tb(P.orange, [[0.0, 0.2, 0.05], [0.0, 0.03, 0.15]], 0.015);
  k.bx(P.steel, [0.05, 0.04, 0.02], [0, 0.2, 0.05]);
  k.bx(P.red, [0.04, 0.02, 0.04], [0.12, 0.0, 0.05]);
}

function sponge_mat(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 3.9);
  const d = Math.min(D, 2.9);
  const cols = [P.blue, P.red, P.yellow, P.green];
  const n = 4;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < 3; j++) k.bx(cols[(i + j) % 4], [w / n - 0.04, 0.28, d / 3 - 0.04], [-w / 2 + (i + 0.5) * (w / n), 0, -d / 2 + (j + 0.5) * (d / 3)], { r: 0.06 });
}

/** Sloping solar panels with a blue cell grid (3 x 2). */
function solar_panel(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 2.9);
  k.bx(P.steelDark, [w, 0.12, 0.12], [0, 0, 0.7], { r: 0.02 });
  k.bx(P.steelDark, [w, 0.12, 0.12], [0, 0, -0.7], { r: 0.02 });
  for (const s of [-1, 1]) k.bx(P.steel, [0.08, 0.6, 0.08], [s * (w / 2 - 0.2), 0.05, -0.65]);
  for (const s of [-1, 1]) k.bx(P.steel, [0.08, 0.5, 0.08], [s * (w / 2 - 0.2), 0.05, -0.0], { rx: -0.6 });
  const tilt = -0.42;
  const cy = 0.55;
  const cz = 0.05;
  k.bx(P.steel, [w, 0.07, 1.6], [0, cy, cz], { rx: tilt });
  for (let i = 0; i < 6; i++)
    for (let j = 0; j < 4; j++) {
      const zl = -0.6 + j * 0.4;
      const yy = 0.06 * Math.cos(tilt) - zl * Math.sin(tilt);
      const zz = 0.06 * Math.sin(tilt) + zl * Math.cos(tilt);
      k.bx('#2a55b0', [w / 6 - 0.05, 0.03, 0.36], [-w / 2 + (i + 0.5) * (w / 6), cy + yy - 0.015, cz + zz], { rx: tilt });
    }
}

function water_tank(m, { W }) {
  const k = K(m);
  k.cn(P.blueDark, 0.78, 0.7, 1.4, [0, 0, 0], { seg: 22 });
  k.cn(P.blue, 0.74, 0.7, 0.4, [0, 1.0, 0], { seg: 22 });
  k.dm(P.blueDark, 0.7, [0, 1.4, 0], { sy: 0.3 });
  k.cy(P.steelDark, 0.14, 0.12, [0.2, 1.62, 0.1]);
  k.cy(P.steel, 0.045, 0.7, [0.7, 0.2, 0.55]);
  k.bx(P.steel, [0.12, 0.05, 0.3], [0.7, 0.2, 0.7]);
  k.bx(P.red, [0.2, 0.03, 0.2], [0.35, 0.62, 0.66], { ry: 0.2 });
}

/** A big gaming screen on a low stand with a console (4 x 1). */
function game_tv_play(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 3.8);
  k.bx(P.purple, [w, 0.5, 0.7], [0, 0, 0], { r: 0.03 });
  k.bx(P.purpleLight, [w + 0.04, 0.05, 0.74], [0, 0.5, 0], { r: 0.015 });
  k.bx('#14161c', [2.2, 1.2, 0.07], [0, 0.78, -0.1], { r: 0.015 });
  k.bx('#2f5ea8', [2.1, 1.1, 0.01], [0, 0.83, -0.062]);
  k.bx('#ffcf4a', [0.5, 0.3, 0.012], [-0.5, 1.1, -0.058]);
  k.bx('#e5484d', [0.6, 0.25, 0.012], [0.5, 0.95, -0.058]);
  k.bx(P.black, [0.3, 0.06, 0.2], [-w / 2 + 0.4, 0.55, 0.1], { r: 0.015 });
  k.bx(P.white, [0.3, 0.06, 0.2], [w / 2 - 0.4, 0.55, 0.1], { r: 0.015 });
  for (const [x, c] of [[-0.4, P.red], [0, P.blue], [0.4, P.green]]) k.bx(c, [0.14, 0.03, 0.09], [x, 0.55, 0.22], { r: 0.012 });
}

// ---------- study / office ----------

function desk(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 2.9);
  const d = Math.min(D, 1.5);
  k.bx(P.woodLight, [w, 0.07, d], [0, 0.72, 0], { r: 0.02 });
  for (const s of [-1, 1]) {
    k.bx(P.wood, [0.07, 0.72, d - 0.1], [s * (w / 2 - 0.1), 0, 0]);
  }
  k.bx(P.wood, [0.9, 0.62, d - 0.2], [-w / 2 + 0.58, 0.05, 0], { r: 0.015 });
  for (let i = 0; i < 3; i++) {
    k.bx(P.woodLight, [0.8, 0.17, 0.02], [-w / 2 + 0.58, 0.1 + i * 0.2, d / 2 - 0.1], { r: 0.008 });
    k.sp(P.brass, 0.025, [-w / 2 + 0.58, 0.18 + i * 0.2, d / 2 - 0.07]);
  }
  k.bx(P.wood, [w - 0.2, 0.08, 0.04], [0, 0.62, -d / 2 + 0.1]);
}

function office_chair(m) {
  const k = K(m);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    k.bx(P.charcoal, [0.05, 0.04, 0.3], [Math.cos(a) * 0.16, 0.08, Math.sin(a) * 0.16], { ry: -a + Math.PI / 2 });
    k.sp(P.black, 0.035, [Math.cos(a) * 0.3, 0.035, Math.sin(a) * 0.3]);
  }
  k.cy(P.steelDark, 0.03, 0.4, [0, 0.1, 0]);
  k.bx(P.red, [0.48, 0.1, 0.46], [0, 0.48, 0.02], { r: 0.04 });
  k.bx(P.red, [0.44, 0.5, 0.08], [0, 0.55, -0.24], { r: 0.04, rx: 0.08 });
  for (const s of [-1, 1]) k.bx(P.charcoal, [0.05, 0.05, 0.3], [s * 0.26, 0.7, 0.0]);
}

function dressing_table(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 2.9);
  k.bx(P.pinkLight, [w, 0.06, 0.8], [0, 0.72, 0.02], { r: 0.015 });
  k.legs(P.pink, w, 0.8, 0.72, 0.06, [0, 0, 0.02], 0.04);
  k.bx(P.pink, [0.8, 0.34, 0.7], [w / 2 - 0.5, 0.35, 0.02], { r: 0.01 });
  for (let i = 0; i < 2; i++) k.sp(P.brass, 0.025, [w / 2 - 0.5, 0.45 + i * 0.12, 0.4]);
  k.fm(P.gold, 1.5, 1.2, 0.08, 0.04, [-0.3, 0.78, -0.3]);
  k.bx('#9fc6dc', [1.34, 1.04, 0.02], [-0.3, 0.86, -0.28]);
  k.lt(P.pinkDark, [[0, 0], [0.05, 0], [0.06, 0.12], [0.03, 0.18], [0, 0.18]], [-0.9, 0.78, 0.1]);
  k.bx(P.white, [0.14, 0.05, 0.14], [0.2, 0.78, 0.15], { r: 0.02 });
}

function plate(m) {
  const k = K(m);
  k.lt(P.white, [[0, 0.005], [0.2, 0.01], [0.26, 0.035], [0.28, 0.04], [0.2, 0.02], [0, 0.015]], [0, 0, 0], { seg: 24 });
  k.lt(P.blueLight, [[0.2, 0.012], [0.26, 0.037], [0.265, 0.04], [0.19, 0.016]], [0, 0, 0], { seg: 24 });
}

function jewellery_box(m) {
  const k = K(m);
  k.bx(P.woodDark, [0.4, 0.18, 0.28], [0, 0, 0], { r: 0.02 });
  k.bx(P.wood, [0.4, 0.07, 0.28], [0, 0.18, -0.02], { r: 0.03, rx: 0.5 });
  k.bx(P.gold, [0.42, 0.02, 0.3], [0, 0.17, 0], { r: 0.005 });
  k.sp(P.gold, 0.025, [0, 0.12, 0.15]);
  for (const [x, c] of [[-0.1, P.pink], [0.0, P.blueLight], [0.1, P.red]]) k.sp(c, 0.025, [x, 0.215, 0.07], { sy: 0.8 });
}

/** Tall bookcase full of colourful books (4 x 1). */
function bookshelf(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 3.9);
  const d = Math.min(D, 0.7);
  k.bx(P.woodDark, [w, 2.1, 0.05], [0, 0, -d / 2 + 0.03]);                      // back panel
  for (const s of [-1, 1]) k.bx(P.wood, [0.07, 2.1, d], [s * (w / 2 - 0.035), 0, 0]); // sides
  k.bx(P.woodLight, [w + 0.06, 0.06, d + 0.04], [0, 2.1, 0], { r: 0.015 });     // top
  k.bx(P.wood, [w, 0.08, d], [0, 0, 0]);                                         // bottom
  const cols = [P.red, P.blue, P.green, P.yellow, P.purple, P.orange, P.teal, P.pink];
  for (let r = 0; r < 4; r++) {
    const y = 0.08 + r * 0.5;
    k.bx(P.wood, [w - 0.1, 0.05, d - 0.05], [0, y + 0.45, 0.0]);                 // shelf board
    let x = -w / 2 + 0.14;
    let i = r * 7;
    while (x < w / 2 - 0.2) {
      const bw = 0.08 + ((i * 37) % 5) * 0.015;
      const bh = 0.28 + ((i * 53) % 4) * 0.04;
      k.bx(cols[i % cols.length], [bw, bh, d - 0.22], [x + bw / 2, y + 0.0, 0.0], { rz: (i % 9 === 0) ? 0.15 : 0 });
      x += bw + 0.012;
      i++;
    }
  }
}

function shampoo(m) {
  const k = K(m);
  k.bx(P.pink, [0.12, 0.28, 0.08], [0, 0, 0], { r: 0.03 });
  k.cn(P.white, 0.03, 0.025, 0.06, [0, 0.28, 0], { seg: 8 });
  k.bx(P.white, [0.1, 0.1, 0.002], [0, 0.07, 0.042]);
  k.sp(P.yellow, 0.02, [0.0, 0.12, 0.045], { sz: 0.1 });
}

/** A computer: monitor, keyboard, mouse and a tower (2 x 1). */
function computer(m, { W, D }) {
  const k = K(m);
  k.bx(P.charcoal, [0.6, 0.04, 0.3], [-0.2, 0.0, -0.1], { r: 0.015 });
  k.bx(P.charcoal, [0.08, 0.28, 0.06], [-0.2, 0.04, -0.12]);
  k.bx('#1a1c22', [0.95, 0.58, 0.05], [-0.2, 0.3, -0.12], { r: 0.012 });
  k.bx('#30609e', [0.88, 0.5, 0.01], [-0.2, 0.34, -0.092]);
  k.bx('#6bd1ff', [0.4, 0.2, 0.01], [-0.3, 0.55, -0.088]);
  k.bx(P.greyLight, [0.55, 0.025, 0.2], [-0.2, 0, 0.28], { r: 0.01 });
  for (let i = 0; i < 3; i++) k.bx(P.white, [0.5, 0.012, 0.03], [-0.2, 0.025, 0.22 + i * 0.045]);
  k.bx(P.greyLight, [0.07, 0.025, 0.11], [0.2, 0, 0.3], { r: 0.015 });
  k.bx(P.greyDark, [0.3, 0.7, 0.55], [0.72, 0, -0.05], { r: 0.015 });
  k.cy(P.steel, 0.05, 0.02, [0.72, 0.5, 0.23], { rx: Math.PI / 2 });
  k.sp(P.greenLight, 0.015, [0.8, 0.62, 0.225]);
}

function book_big(m) {
  const k = K(m);
  k.bx(P.redDark, [0.34, 0.1, 0.46], [0, 0, 0], { r: 0.01 });
  k.bx(P.cream, [0.32, 0.08, 0.44], [0.015, 0.01, 0.0]);
  k.bx(P.gold, [0.24, 0.011, 0.14], [0, 0.101, 0.06], { r: 0.003 });
  k.bx(P.gold, [0.02, 0.1, 0.46], [-0.16, 0.0, 0]);
}

function pencil(m) {
  const k = K(m);
  k.cy(P.yellow, 0.014, 0.28, [0, 0.014, 0], { rz: Math.PI / 2, seg: 6 });
  k.cn(P.sand, 0.014, 0.003, 0.04, [0.16, 0.014, 0], { rz: -Math.PI / 2, seg: 6 });
  k.cy(P.pink, 0.014, 0.03, [-0.155, 0.014, 0], { rz: Math.PI / 2, seg: 6 });
}

function eraser(m) {
  const k = K(m);
  k.bx(P.pinkLight, [0.1, 0.035, 0.05], [0, 0, 0], { r: 0.008 });
  k.bx(P.blue, [0.06, 0.036, 0.052], [-0.02, 0, 0]);
}

function dustbin(m) {
  const k = K(m);
  k.cn(P.green, 0.28, 0.33, 0.7, [0, 0, 0], { seg: 18 });
  k.cn(P.greenDark, 0.35, 0.34, 0.05, [0, 0.7, 0], { seg: 18 });
  k.rc(P.greenDark, 0.2, 0.06, [0, 0.74, 0], { e: 0.02 });
  for (let i = 0; i < 4; i++) k.bx(P.greenDark, [0.04, 0.5, 0.02], [Math.cos(i * 1.57) * 0.3, 0.1, Math.sin(i * 1.57) * 0.3], { ry: -i * 1.57 });
}

/** A sloping slide chute with side walls (2 x 6). */
function slide_chute(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 1.6);
  const L = Math.min(D, 5.8);
  const hi = 2.0;
  const lo = 0.25;
  const ang = Math.atan2(hi - lo, L);
  const len = Math.hypot(L, hi - lo);
  k.bx(P.sky, [w - 0.2, 0.06, len], [0, (hi + lo) / 2 - 0.03, 0], { rx: ang });
  for (const s of [-1, 1]) k.bx(P.blueDark, [0.14, 0.22, len], [s * (w / 2 - 0.07), (hi + lo) / 2 + 0.03, 0], { rx: ang, r: 0.04 });
  for (const z of [-L / 2 + 0.2, 0, L / 2 - 0.2]) {
    const y = hi - ((z + L / 2) / L) * (hi - lo);
    for (const s of [-1, 1]) k.bx(P.steelDark, [0.08, y - 0.05, 0.08], [s * (w / 2 - 0.06), 0, z]);
  }
  k.bx(P.yellow, [w, 0.08, 0.5], [0, hi - 0.04, -L / 2 + 0.1], { r: 0.03 });
  for (let i = 0; i < 6; i++) k.bx(P.steel, [0.06, 0.06, 0.4], [w / 2 + 0.02, 0.2 + i * 0.3, -L / 2 + 0.5], { ry: 0 });
}

function cobweb(m) {
  const k = K(m);
  const rays = 7;
  const R = 0.85;
  for (let i = 0; i < rays; i++) {
    const a = (i / (rays - 1)) * (Math.PI / 2);
    k.tb(P.white, [[0, 0, 0], [Math.cos(a) * R, -Math.sin(a) * R, 0]], 0.004, [-0.4, 0.9, 0], { seg: 3 });
  }
  for (let r = 1; r <= 4; r++) {
    const pts = [];
    for (let i = 0; i < rays; i++) {
      const a = (i / (rays - 1)) * (Math.PI / 2);
      const rr = (r / 4) * R * (i % 2 ? 0.88 : 1);
      pts.push([Math.cos(a) * rr, -Math.sin(a) * rr, 0]);
    }
    k.tb(P.white, pts, 0.003, [-0.4, 0.9, 0], { seg: 3 });
  }
  k.sp(P.charcoal, 0.03, [0.1, 0.15, 0.0]);
}

// ---------- extras from the picture's Granny props ----------

/** Brass lantern on a tall pole. */
function lantern_floor(m) {
  const k = K(m);
  m.mat('lanternGlow', '#ffe3a0', { e: '#ffc861' });
  k.cy(P.brass, 0.18, 0.06, [0, 0, 0]);
  k.cn(P.brass, 0.1, 0.05, 0.9, [0, 0.06, 0], { seg: 10 });
  k.cy(P.brass, 0.14, 0.05, [0, 0.96, 0]);
  k.cy('lanternGlow', 0.11, 0.38, [0, 1.01, 0], { seg: 8 });
  for (let i = 0; i < 4; i++) k.bx(P.brass, [0.03, 0.4, 0.03], [Math.cos(i * 1.57 + 0.78) * 0.12, 1.0, Math.sin(i * 1.57 + 0.78) * 0.12]);
  k.fr(P.brass, 0.34, 0.34, 0.0, 0.0, 0.2, [0, 1.4, 0]);
  k.sp(P.brass, 0.04, [0, 1.62, 0]);
}

/** A big dark hexagonal lantern on a wooden stand. */
function lantern_hex(m) {
  const k = K(m);
  m.mat('lanternGlow', '#ffe3a0', { e: '#ffc861' });
  k.legs(P.woodDark, 0.7, 0.7, 0.8, 0.07, [0, 0, 0], 0.02);
  k.bx(P.wood, [0.76, 0.06, 0.76], [0, 0.8, 0], { r: 0.015 });
  k.cy('lanternGlow', 0.22, 0.75, [0, 0.86, 0], { seg: 6 });
  for (let i = 0; i < 6; i++) k.bx('#3c3045', [0.05, 0.85, 0.05], [Math.cos(i * 1.047) * 0.25, 0.84, Math.sin(i * 1.047) * 0.25]);
  k.fr('#3c3045', 0.7, 0.7, 0.06, 0.06, 0.42, [0, 1.6, 0]);
  k.sp(P.gold, 0.05, [0, 2.06, 0]);
  k.cy('#3c3045', 0.28, 0.06, [0, 0.83, 0], { seg: 6 });
}

/** Purple floral urn. */
function urn_purple(m) {
  const k = K(m);
  k.lt(P.purple, [[0, 0], [0.12, 0], [0.2, 0.18], [0.22, 0.3], [0.16, 0.45], [0.1, 0.5], [0.12, 0.56], [0.0, 0.56]], [0, 0, 0], { seg: 18 });
  k.cy(P.gold, 0.13, 0.04, [0, 0.55, 0]);
  k.dm(P.gold, 0.1, [0, 0.59, 0], { sy: 0.8 });
  for (let i = 0; i < 6; i++) k.sp([P.pinkLight, P.yellow, P.white][i % 3], 0.035, [Math.cos(i * 1.05) * 0.21, 0.3, Math.sin(i * 1.05) * 0.21]);
  k.sp(P.brass, 0.02, [0, 0.66, 0]);
}

export const RECIPES = {
  big_plant_pot: { build: big_plant_pot },
  bunk_bed: { build: bunk_bed },
  bed_double: { build: bed_double },
  drawer_unit: { build: drawer_unit },
  trophy: { build: trophy },
  medal: { build: medal },
  watch: { build: watch },
  thali: { build: thali },
  glass: { build: glass },
  bowl: { build: bowl },
  mirror_wall: { build: mirror_wall },
  toothpaste: { build: toothpaste },
  slime_bucket: { build: slime_bucket },
  inverter: { build: inverter },
  baby_stroller: { build: baby_stroller },
  box_cardboard: { build: box_cardboard },
  box_stack: { build: box_stack },
  jbl_speaker: { build: jbl_speaker },
  disco_light: { build: disco_light },
  game_controller: { build: game_controller },
  colored_paper: { build: colored_paper },
  scissors: { build: scissors },
  glue: { build: glue },
  pen_holder: { build: pen_holder },
  idol: { build: idol },
  puja_thali: { build: puja_thali },
  diya: { build: diya },
  matchbox: { build: matchbox },
  treadmill: { build: treadmill },
  dumbbell: { build: dumbbell },
  exercise_bike: { build: exercise_bike },
  yoga_mat: { build: yoga_mat },
  music_player: { build: music_player },
  climbing_wall: { build: climbing_wall },
  safety_harness: { build: safety_harness },
  sponge_mat: { build: sponge_mat },
  solar_panel: { build: solar_panel },
  water_tank: { build: water_tank },
  game_tv_play: { build: game_tv_play },
  desk: { build: desk },
  office_chair: { build: office_chair },
  dressing_table: { build: dressing_table },
  plate: { build: plate },
  jewellery_box: { build: jewellery_box },
  bookshelf: { build: bookshelf },
  shampoo: { build: shampoo },
  computer: { build: computer },
  book_big: { build: book_big },
  pencil: { build: pencil },
  eraser: { build: eraser },
  dustbin: { build: dustbin },
  slide_chute: { build: slide_chute },
  cobweb: { build: cobweb, mount: { y: 1.0, wall: true } },
  lantern_floor: { build: lantern_floor, kind: 'extra', foot: [0.5, 0.5], name: 'Brass lantern' },
  lantern_hex: { build: lantern_hex, kind: 'extra', foot: [0.9, 0.9], name: 'Hexagon lantern' },
  urn_purple: { build: urn_purple, kind: 'extra', foot: [0.6, 0.6], name: 'Purple urn' },
};
