// School: classroom, library, science lab, cafeteria props
// (panel 6 of docs/art/reference/01-asset-pack-overview.webp: honey wood desks, orange chairs, green chalkboard, blue lockers).
import { kit } from '../kit.mjs';
import { P } from '../pal.mjs';

const K = (m) => kit(m);

function globe(m) {
  const k = K(m);
  k.cy(P.woodDark, 0.16, 0.04, [0, 0, 0], { seg: 14 });
  k.cy(P.brass, 0.025, 0.28, [0, 0.04, 0], { seg: 8 });
  k.sp('#3b82c4', 0.24, [0, 0.58, 0], { ws: 18, hs: 12, rz: 0.4 });
  for (const [x, y, z, r, s] of [[0.1, 0.62, 0.2, 0.12, 1], [-0.15, 0.55, 0.15, 0.1, 1], [0.2, 0.5, -0.12, 0.09, 1], [-0.1, 0.72, -0.12, 0.08, 1], [0.0, 0.4, 0.18, 0.07, 1]])
    k.sp('#66b348', r, [x, y, z], { sx: 1, sy: 0.7, sz: 0.4, ws: 8, hs: 5, ry: Math.atan2(x, z) });
  k.tb(P.brass, Array.from({ length: 12 }, (_, i) => [Math.cos(i / 11 * Math.PI * 1.1 - 0.4) * 0.3, 0.58 + Math.sin(i / 11 * Math.PI * 1.1 - 0.4) * 0.3, 0]), 0.012, [0, 0, 0], { seg: 4 });
}

/** Honey wood student desk with a grey drawer (2 x 1). */
function student_desk(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 1.9);
  const d = Math.min(D, 0.9);
  k.bx(P.woodLight, [w, 0.05, d], [0, 0.72, 0], { r: 0.015 });
  k.bx('#f0c986', [w - 0.1, 0.01, d - 0.1], [0, 0.769, 0]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.bx(P.steelDark, [0.05, 0.72, 0.05], [sx * (w / 2 - 0.08), 0, sz * (d / 2 - 0.08)]);
  k.bx(P.steel, [0.6, 0.22, d - 0.2], [w / 2 - 0.45, 0.45, 0]);
  k.bx(P.greyDark, [0.5, 0.012, 0.012], [w / 2 - 0.45, 0.6, d / 2 - 0.08]);
  k.bx(P.steelDark, [w - 0.2, 0.04, 0.04], [0, 0.2, d / 2 - 0.08]);
  k.bx(P.red, [0.2, 0.05, 0.26], [-0.4, 0.775, 0.0], { r: 0.01, ry: 0.15 });
  k.bx(P.blue, [0.18, 0.04, 0.24], [-0.4, 0.82, 0.0], { r: 0.01, ry: 0.15 });
}

function student_chair(m) {
  const k = K(m);
  k.bx('#f0a43c', [0.42, 0.05, 0.4], [0, 0.44, 0.02], { r: 0.015 });
  k.bx('#f0a43c', [0.4, 0.34, 0.04], [0, 0.55, -0.2], { r: 0.015, rx: -0.08 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.bx(P.steelDark, [0.035, 0.44, 0.035], [sx * 0.18, 0, sz * 0.17 + 0.02]);
  k.bx(P.steelDark, [0.37, 0.025, 0.025], [0, 0.18, 0.19]);
}

/** Green chalkboard in a wooden frame with a chalk tray (6 x 1). */
function blackboard(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 5.9);
  k.fm(P.woodDark, w, 1.5, 0.12, 0.08, [0, 0.5, 0]);
  k.bx('#2c6b57', [w - 0.24, 1.26, 0.03], [0, 0.62, 0.01]);
  k.bx(P.woodLight, [w, 0.06, 0.16], [0, 0.46, 0.06]);
  for (const [x, c] of [[-1.2, P.white], [-1.05, P.yellow], [-0.9, P.pinkLight]]) k.cy(c, 0.012, 0.09, [x, 0.52, 0.08], { rz: Math.PI / 2, seg: 5 });
  k.bx('#e8f0ea', [1.2, 0.02, 0.012], [0.7, 1.4, 0.04], { r: 0.003 });
  k.bx('#e8f0ea', [0.7, 0.02, 0.012], [0.45, 1.32, 0.04]);
  k.bx('#e8f0ea', [0.5, 0.5, 0.012], [-1.6, 0.85, 0.04], { r: 0.003 });
}

function teacher_desk(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 2.9);
  const d = Math.min(D, 1.5);
  k.bx(P.wood, [w, 0.72, d], [0, 0, 0], { r: 0.02 });
  k.bx(P.woodLight, [w + 0.08, 0.06, d + 0.06], [0, 0.72, 0], { r: 0.015 });
  k.bx(P.woodDeep, [w - 0.3, 0.55, 0.05], [0, 0.05, d / 2 - 0.02]);
  for (const x of [-w / 2 + 0.5, w / 2 - 0.5]) {
    for (let i = 0; i < 2; i++) {
      k.bx(P.woodLight, [0.7, 0.22, 0.03], [x, 0.12 + i * 0.28, -d / 2 - 0.005], { r: 0.01 });
      k.sp(P.brass, 0.025, [x, 0.23 + i * 0.28, -d / 2 - 0.03]);
    }
  }
  k.bx(P.red, [0.3, 0.05, 0.4], [-0.6, 0.78, 0.1], { r: 0.012, ry: 0.2 });
  k.sp(P.green, 0.1, [0.8, 0.88, 0.2], { sy: 0.9 });
  k.cy(P.white, 0.03, 0.12, [0.8, 0.78, 0.2], { seg: 8 });
  k.cn(P.blue, 0.05, 0.06, 0.1, [0.4, 0.78, -0.2], { seg: 8 });
}

function school_bag(m) {
  const k = K(m);
  k.bx(P.red, [0.36, 0.46, 0.2], [0, 0, 0], { r: 0.07 });
  k.bx(P.redDark, [0.34, 0.2, 0.06], [0, 0.04, 0.12], { r: 0.03 });
  k.bx(P.redDark, [0.3, 0.12, 0.05], [0, 0.3, 0.1], { r: 0.03 });
  k.bx(P.yellow, [0.12, 0.05, 0.02], [0, 0.3, 0.13]);
  k.tb(P.redDark, [[-0.1, 0.46, 0], [0, 0.55, 0], [0.1, 0.46, 0]], 0.02);
  for (const s of [-1, 1]) k.bx(P.blue, [0.07, 0.2, 0.05], [s * 0.2, 0.05, 0.0], { r: 0.02 });
}

/** A long reading table with two benches (4 x 2). */
function reading_table(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 3.9);
  const d = Math.min(D, 1.9);
  k.bx(P.woodLight, [w, 0.07, 1.0], [0, 0.72, 0], { r: 0.02 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.bx(P.wood, [0.1, 0.72, 0.1], [sx * (w / 2 - 0.2), 0, sz * 0.38]);
  for (const sz of [-1, 1]) {
    k.bx(P.orange, [w - 0.3, 0.06, 0.34], [0, 0.42, sz * 0.72], { r: 0.015 });
    for (const sx of [-1, 1]) k.bx(P.woodDark, [0.07, 0.42, 0.07], [sx * (w / 2 - 0.3), 0, sz * 0.72]);
  }
  for (let i = 0; i < 3; i++) k.bx([P.red, P.blue, P.green][i], [0.3, 0.04, 0.4], [-1.0 + i * 0.9, 0.8, 0.0], { r: 0.008, ry: 0.1 * i });
  k.bx(P.white, [0.25, 0.01, 0.35], [-0.95, 0.845, 0.0], { ry: 0.1 });
  k.sp(P.pink, 0.1, [1.3, 0.85, 0.1], { sy: 0.9 });
}

/** Science lab bench with a sink, taps and glassware (6 x 2). */
function lab_bench(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 5.9);
  const d = Math.min(D, 1.5);
  k.bx(P.woodLight, [w, 0.8, d], [0, 0, 0], { r: 0.02 });
  k.bx('#4b5563', [w + 0.06, 0.07, d + 0.06], [0, 0.8, 0], { r: 0.015 });
  for (let i = 0; i < 5; i++) k.bx(P.wood, [w / 5 - 0.1, 0.62, 0.02], [-w / 2 + (i + 0.5) * (w / 5), 0.08, d / 2 + 0.005]);
  k.bx(P.steel, [0.6, 0.05, 0.4], [-1.6, 0.86, 0], { r: 0.02 });
  k.tb(P.steel, [[-1.6, 0.87, -0.15], [-1.6, 1.15, -0.15], [-1.6, 1.2, 0.0]], 0.025);
  m.mat('flaskGlass', '#cfe8f3', { r: 0.1, a: 0.5 });
  for (const [x, c, h] of [[0.2, P.red, 0.18], [0.7, P.blue, 0.22], [1.2, P.green, 0.16]]) {
    k.cn('flaskGlass', 0.12, 0.03, 0.28, [x, 0.87, 0.0], { seg: 12 });
    k.cn(c, 0.09, 0.05, h, [x, 0.88, 0.0], { seg: 12 });
  }
  for (let i = 0; i < 5; i++) k.cy('flaskGlass', 0.025, 0.2, [2.0 + i * 0.1, 0.87, 0.1], { seg: 8 });
  k.bx(P.black, [0.5, 0.03, 0.08], [2.15, 0.87, 0.1]);
}

function microscope(m) {
  const k = K(m);
  k.bx(P.charcoal, [0.24, 0.04, 0.3], [0, 0, 0], { r: 0.015 });
  k.bx(P.charcoal, [0.07, 0.34, 0.07], [0, 0.04, -0.1], { rx: 0.0 });
  k.tb(P.charcoal, [[0, 0.38, -0.1], [0, 0.46, -0.04], [0, 0.4, 0.06]], 0.035);
  k.cy(P.steel, 0.04, 0.22, [0, 0.3, 0.06], { rx: -0.3, seg: 10 });
  k.cy(P.steelDark, 0.03, 0.06, [0, 0.19, 0.1], { seg: 8 });
  k.bx(P.greyLight, [0.2, 0.015, 0.14], [0, 0.14, 0.06]);
  k.sp(P.blue, 0.03, [0.09, 0.2, -0.08], { sy: 0.6 });
}

function flask(m) {
  const k = K(m);
  m.mat('flaskGlass', '#cfe8f3', { r: 0.1, a: 0.5 });
  k.cn('flaskGlass', 0.14, 0.03, 0.3, [0, 0, 0], { seg: 14 });
  k.cn(P.pink, 0.115, 0.05, 0.14, [0, 0.01, 0], { seg: 14 });
  k.cy('flaskGlass', 0.035, 0.07, [0, 0.3, 0], { seg: 8 });
  k.cn(P.brown, 0.04, 0.036, 0.05, [0, 0.36, 0], { seg: 8 });
}

/** The long lunch counter with a glass top and trays shelf (6 x 1). */
function canteen_counter(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 5.9);
  k.bx(P.teal, [w, 0.95, 0.8], [0, 0, -0.05], { r: 0.03 });
  k.bx(P.white, [w + 0.06, 0.06, 0.9], [0, 0.95, -0.05], { r: 0.015 });
  k.bx(P.steel, [w - 0.3, 0.05, 0.28], [0, 0.56, 0.4], { r: 0.012 });
  m.mat('sneezeGlass', '#cfe8f3', { r: 0.1, a: 0.35 });
  k.bx('sneezeGlass', [w - 0.4, 0.4, 0.02], [0, 1.02, 0.28]);
  const foods = [P.red, P.yellow, P.orange, P.greenLight, P.pink, P.brown];
  for (let i = 0; i < 6; i++) {
    const x = -w / 2 + 0.6 + i * (w - 1.2) / 5;
    k.cy(P.steel, 0.2, 0.05, [x, 1.0, -0.05], { seg: 14 });
    k.bl(foods[i], 0.14, [x, 1.1, -0.05], { seed: i, sy: 0.7, jitter: 0.1, detail: 0 });
  }
  for (let i = 0; i < 6; i++) k.bx(P.orange, [0.4, 0.03, 0.3], [-w / 2 + 0.6 + i * (w - 1.2) / 5, 0.585, 0.4], { ry: i * 0.05 });
}

function lunch_tray(m) {
  const k = K(m);
  k.bx(P.orange, [0.46, 0.03, 0.34], [0, 0, 0], { r: 0.015 });
  k.bx('#f58a2e', [0.4, 0.015, 0.28], [0, 0.03, 0], { r: 0.01 });
  k.cy(P.white, 0.09, 0.015, [-0.1, 0.045, 0.0], { seg: 14 });
  k.bl(P.yellow, 0.06, [-0.1, 0.075, 0.0], { sy: 0.6, detail: 0 });
  k.bx(P.red, [0.12, 0.05, 0.1], [0.12, 0.045, -0.06], { r: 0.02 });
  k.cn(P.blueLight, 0.03, 0.04, 0.1, [0.14, 0.045, 0.08], { seg: 8 });
}

function school_bell(m) {
  const k = K(m);
  k.bx(P.woodDark, [0.3, 0.06, 0.3], [0, 0, 0], { r: 0.015 });
  k.lt(P.brass, [[0, 0.36], [0.05, 0.36], [0.1, 0.3], [0.16, 0.14], [0.19, 0.07], [0.19, 0.04], [0.0, 0.04]], [0, 0.06, 0], { seg: 18 });
  k.sp(P.goldDark, 0.04, [0, 0.12, 0]);
  k.bx(P.red, [0.1, 0.05, 0.1], [0.1, 0.06, 0.1], { r: 0.015 });
  k.ring(P.steelDark, 0.05, 0.012, [0, 0.46, 0], { rx: Math.PI / 2, seg: 10, segr: 4 });
}

/** Tall blue lockers with little vents and name plates (4 x 1). */
function lockers(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 3.9);
  const d = Math.min(D, 0.7);
  const n = Math.round(w / 0.65);
  const lw = w / n;
  k.bx(P.blueDark, [w, 2.0, d], [0, 0.08, 0], { r: 0.015 });
  k.bx(P.blueDark, [w, 0.08, d], [0, 0, 0]);
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (i + 0.5) * lw;
    k.bx(i % 3 === 1 ? '#7a9ae6' : P.blue, [lw - 0.04, 1.9, 0.03], [x, 0.12, d / 2 + 0.005], { r: 0.008 });
    for (let v = 0; v < 3; v++) k.bx(P.blueDark, [lw - 0.2, 0.025, 0.012], [x, 1.7 + v * 0.06, d / 2 + 0.025]);
    k.bx(P.white, [0.14, 0.06, 0.012], [x, 1.45, d / 2 + 0.025]);
    k.bx(P.steel, [0.025, 0.14, 0.03], [x + lw / 2 - 0.1, 1.0, d / 2 + 0.03], { r: 0.008 });
  }
}

function notice_board(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 2.9);
  k.fm(P.woodDark, w, 1.1, 0.07, 0.06, [0, 0.9, 0]);
  k.bx('#c9955a', [w - 0.14, 0.96, 0.02], [0, 0.97, 0.01]);
  for (const [x, y, c, a] of [[-0.8, 1.4, P.yellow, 0.1], [0.0, 1.5, P.pinkLight, -0.08], [0.7, 1.35, P.blueLight, 0.06], [-0.4, 1.05, P.white, -0.1], [0.5, 1.05, P.greenLight, 0.12]]) {
    k.bx(c, [0.34, 0.4, 0.01], [x, y, 0.03], { rz: a });
    k.sp(P.red, 0.025, [x, y + 0.2, 0.04]);
  }
}

/** A friendly skeleton on a stand (1 x 2). */
function skeleton_model(m) {
  const k = K(m);
  const bone = '#f1ead7';
  k.bx(P.charcoal, [0.5, 0.05, 0.5], [0, 0, 0], { r: 0.015 });
  k.cy(P.steelDark, 0.025, 0.2, [0, 0.05, 0], { seg: 6 });
  for (const s of [-1, 1]) k.tb(bone, [[s * 0.09, 0.28, 0], [s * 0.1, 0.8, 0]], 0.03, [0, 0, 0], { seg: 5 });
  k.bx(bone, [0.34, 0.12, 0.16], [0, 0.82, 0], { r: 0.05 });
  k.tb(bone, [[0, 0.94, 0], [0, 1.28, 0]], 0.025, [0, 0, 0], { seg: 5 });
  for (let i = 0; i < 4; i++) k.sp(bone, 0.14 - i * 0.015, [0, 1.0 + i * 0.1, 0.0], { sy: 0.35, sz: 0.7, ws: 10, hs: 5 });
  k.sp(bone, 0.13, [0, 1.52, 0], { ws: 12, hs: 8 });
  k.bx(bone, [0.12, 0.07, 0.1], [0, 1.4, 0.05], { r: 0.02 });
  for (const s of [-1, 1]) {
    k.sp('#2a2a2e', 0.035, [s * 0.05, 1.53, 0.11]);
    k.tb(bone, [[s * 0.18, 1.2, 0], [s * 0.26, 0.95, 0.04], [s * 0.2, 0.7, 0.1]], 0.022, [0, 0, 0], { seg: 5 });
  }
}

function water_cooler(m) {
  const k = K(m);
  k.bx(P.white, [0.36, 0.95, 0.34], [0, 0, 0], { r: 0.04 });
  k.bx(P.blue, [0.3, 0.08, 0.02], [0, 0.45, 0.175]);
  k.bx(P.red, [0.04, 0.05, 0.03], [-0.08, 0.6, 0.18]);
  k.bx(P.blueLight, [0.04, 0.05, 0.03], [0.08, 0.6, 0.18]);
  m.mat('waterBottle', '#8fd0f2', { r: 0.1, a: 0.6 });
  k.cn('waterBottle', 0.15, 0.12, 0.36, [0, 0.95, 0], { seg: 14 });
  k.cn('waterBottle', 0.12, 0.05, 0.1, [0, 1.31, 0], { seg: 12 });
  k.cy(P.blue, 0.05, 0.04, [0, 1.41, 0], { seg: 8 });
}

function first_aid_box(m) {
  const k = K(m);
  k.bx(P.white, [0.36, 0.26, 0.14], [0, 0, 0], { r: 0.03 });
  k.bx(P.red, [0.1, 0.18, 0.012], [0, 0.04, 0.075]);
  k.bx(P.red, [0.18, 0.1, 0.012], [0, 0.08, 0.075]);
  k.bx(P.steelDark, [0.16, 0.025, 0.03], [0, 0.26, 0], { r: 0.008 });
  k.bx(P.steelDark, [0.025, 0.03, 0.03], [-0.07, 0.26, 0]);
  k.bx(P.steelDark, [0.025, 0.03, 0.03], [0.07, 0.26, 0]);
}

function school_cabinet(m) {
  const k = K(m);
  k.bx('#a9763f', [0.9, 1.4, 0.5], [0, 0, 0], { r: 0.02 });
  k.bx(P.woodLight, [0.96, 0.05, 0.56], [0, 1.4, 0], { r: 0.012 });
  for (const s of [-1, 1]) {
    k.bx(P.woodLight, [0.4, 1.25, 0.02], [s * 0.21, 0.08, 0.26], { r: 0.008 });
    k.sp(P.brass, 0.022, [s * 0.05, 0.75, 0.29]);
  }
}

function glass_cabinet(m) {
  const k = K(m);
  m.mat('cabGlass', '#d5e6f0', { r: 0.1, a: 0.22 });
  k.bx('#9aa4c4', [0.9, 1.7, 0.45], [0, 0, 0], { r: 0.02 });
  k.bx('cabGlass', [0.76, 1.5, 0.02], [0, 0.1, 0.23]);
  for (const y of [0.5, 0.9, 1.3]) k.bx('#7b87ad', [0.8, 0.03, 0.4], [0, y, 0.0]);
  for (let i = 0; i < 6; i++) k.bx([P.red, P.blue, P.yellow, P.green, P.pink, P.orange][i], [0.1, 0.2, 0.2], [-0.25 + (i % 3) * 0.25, 0.5 + Math.floor(i / 3) * 0.4 + 0.03, 0.0]);
}

export const RECIPES = {
  globe: { build: globe },
  student_desk: { build: student_desk },
  student_chair: { build: student_chair, kind: 'extra', foot: [0.6, 0.6], name: 'Student chair' },
  blackboard: { build: blackboard },
  teacher_desk: { build: teacher_desk },
  school_bag: { build: school_bag },
  reading_table: { build: reading_table },
  lab_bench: { build: lab_bench },
  microscope: { build: microscope },
  flask: { build: flask },
  canteen_counter: { build: canteen_counter },
  lunch_tray: { build: lunch_tray },
  school_bell: { build: school_bell },
  lockers: { build: lockers },
  notice_board: { build: notice_board },
  skeleton_model: { build: skeleton_model },
  water_cooler: { build: water_cooler },
  first_aid_box: { build: first_aid_box },
  school_cabinet: { build: school_cabinet, kind: 'extra', foot: [1.0, 0.6], name: 'School cabinet' },
  glass_cabinet: { build: glass_cabinet, kind: 'extra', foot: [1.0, 0.5], name: 'Glass cabinet' },
};
