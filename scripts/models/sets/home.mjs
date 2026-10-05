// My little house: living room, bedroom, kitchen and pet room props.
// Matched to panel 1 of docs/art/reference/01-asset-pack-overview.webp (cosy, chunky, honey wood, pastel pinks and blues).
import { kit } from '../kit.mjs';
import { P } from '../pal.mjs';

const K = (m) => kit(m);

// ---------- living room ----------

/** TV on a low wooden unit (3 x 1). */
function tv_small(m, { W, D }) {
  const k = K(m);
  const w = W - 0.12;
  const d = 0.62;
  k.bx(P.wood, [w, 0.46, d], [0, 0.04, 0], { r: 0.02 });
  k.bx(P.woodLight, [w + 0.06, 0.05, d + 0.04], [0, 0.5, 0], { r: 0.015 });
  for (const x of [-w / 2 + 0.08, w / 2 - 0.08]) k.bx(P.woodDark, [0.08, 0.04, d - 0.1], [x, 0, 0]);
  // drawers left and right, an open shelf in the middle
  const dw = (w - 0.2) / 3;
  for (const s of [-1, 1]) {
    k.bx(P.woodLight, [dw - 0.04, 0.34, 0.02], [s * (dw + 0.04), 0.1, d / 2 + 0.005], { r: 0.008 });
    k.sp(P.brass, 0.022, [s * (dw + 0.04), 0.27, d / 2 + 0.03]);
  }
  k.bx(P.woodDeep, [dw - 0.04, 0.34, 0.03], [0, 0.1, d / 2 - 0.02]);
  k.bx(P.cream, [0.16, 0.14, 0.14], [0.02, 0.1, 0.02], { r: 0.02 }); // a little box on the shelf
  // the TV
  const x = -0.35;
  k.bx(P.charcoal, [0.5, 0.02, 0.24], [x, 0.55, 0.02], { r: 0.008 });
  k.bx(P.charcoal, [0.1, 0.14, 0.06], [x, 0.56, 0.0]);
  k.bx('#17191e', [1.5, 0.88, 0.06], [x, 0.7, 0], { r: 0.015 });
  k.bx('#2a3340', [1.4, 0.78, 0.01], [x, 0.75, 0.032]);
  k.bx('#3b4a60', [1.4, 0.05, 0.012], [x, 1.08, 0.036]);
}

/** Cream armchair with two yellow cushions (1.4 x 1.2). */
function armchair(m) {
  const k = K(m);
  k.bx(P.cream, [1.3, 0.28, 1.1], [0, 0.1, 0], { r: 0.08 });          // seat base
  k.bx(P.white, [0.98, 0.16, 0.86], [0, 0.38, 0.06], { r: 0.07 });     // seat cushion
  k.bx(P.cream, [1.3, 0.72, 0.3], [0, 0.34, -0.45], { r: 0.1 });       // back
  for (const s of [-1, 1]) k.bx(P.cream, [0.26, 0.5, 1.0], [s * 0.57, 0.28, 0.02], { r: 0.09 }); // arms
  for (const s of [-1, 1]) k.bx('#a9763f', [0.07, 0.1, 0.07], [s * 0.55, 0, 0.44]);
  for (const s of [-1, 1]) k.bx('#a9763f', [0.07, 0.1, 0.07], [s * 0.55, 0, -0.46]);
  k.bx(P.yellow, [0.4, 0.38, 0.12], [-0.22, 0.52, -0.2], { r: 0.05, rx: -0.25 });
  k.bx('#f0a43c', [0.32, 0.3, 0.1], [0.28, 0.5, -0.22], { r: 0.05, rx: -0.25, ry: 0.2 });
}

function side_table(m) {
  const k = K(m);
  k.bx(P.woodLight, [0.62, 0.05, 0.62], [0, 0.5, 0], { r: 0.012 });
  k.legs(P.wood, 0.62, 0.62, 0.5, 0.06, [0, 0, 0], 0.01);
  k.bx(P.wood, [0.5, 0.04, 0.5], [0, 0.18, 0]);
}

function coffee_table(m) {
  const k = K(m);
  k.bx(P.woodLight, [1.5, 0.06, 0.8], [0, 0.38, 0], { r: 0.015 });
  k.legs(P.wood, 1.5, 0.8, 0.38, 0.07, [0, 0, 0], 0.06);
  k.bx(P.wood, [1.3, 0.04, 0.6], [0, 0.12, 0]);
  k.lt(P.white, [[0, 0], [0.07, 0], [0.09, 0.05], [0.07, 0.12], [0.09, 0.14], [0, 0.14]], [0.3, 0.44, 0.05]); // a little cup
  k.bx(P.pinkLight, [0.3, 0.02, 0.2], [-0.35, 0.44, 0.0], { r: 0.005, ry: 0.2 });
}

/** Little house kitchen: white island with a wooden top, three doors (2.4 x 1). */
function kitchen_island(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 2.4);
  k.bx(P.white, [w, 0.82, 0.86], [0, 0.04, 0], { r: 0.02 });
  k.bx('#8f5a34', [w + 0.06, 0.07, 0.94], [0, 0.86, 0], { r: 0.015 });
  k.bx(P.woodLight, [w + 0.06, 0.02, 0.94], [0, 0.93, 0]);
  for (const x of [-w / 3, 0, w / 3]) {
    k.bx(P.offWhite, [w / 3 - 0.08, 0.64, 0.02], [x, 0.14, 0.44], { r: 0.01 });
    k.sp(P.steel, 0.024, [x + 0.14, 0.62, 0.47]);
  }
  k.bx(P.greyDark, [w, 0.05, 0.8], [0, 0, 0]);
}

function fridge_blue(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 1.05);
  const d = Math.min(D, 0.95);
  k.bx(P.blue, [w, 1.95, d], [0, 0.05, 0], { r: 0.07, n: 3 });
  k.bx(P.blueDark, [w - 0.04, 0.025, d - 0.05], [0, 1.15, 0.0]);    // seam between the doors
  k.bx(P.white, [0.04, 0.45, 0.05], [-w / 2 + 0.12, 1.27, d / 2 + 0.005], { r: 0.012 });  // handles
  k.bx(P.white, [0.04, 0.55, 0.05], [-w / 2 + 0.12, 0.5, d / 2 + 0.005], { r: 0.012 });
  k.bx(P.blueLight, [w - 0.2, 0.1, 0.02], [0, 1.82, d / 2 - 0.005], { r: 0.01 });
  for (const [x, y, c] of [[0.2, 1.6, P.yellow], [0.05, 1.4, P.pink], [0.28, 0.85, P.red], [0.1, 0.65, P.green]]) k.bx(c, [0.12, 0.12, 0.02], [x, y, d / 2 + 0.002], { r: 0.02, rz: 0.2 }); // magnets
  k.bx(P.greyDark, [w - 0.1, 0.05, d - 0.1], [0, 0, 0]);
}

function fridge_small(m) {
  const k = K(m);
  k.bx(P.white, [0.62, 1.35, 0.62], [0, 0.04, 0], { r: 0.04 });
  k.bx(P.greyLight, [0.6, 0.02, 0.02], [0, 0.95, 0.31]);
  k.bx(P.steel, [0.03, 0.3, 0.04], [0.2, 1.0, 0.33], { r: 0.01 });
  k.bx(P.steel, [0.03, 0.4, 0.04], [0.2, 0.42, 0.33], { r: 0.01 });
  k.bx(P.greyDark, [0.56, 0.05, 0.56], [0, 0, 0]);
}

/** Small wooden cabinet with shelves that glow (1 x 1). */
function cabinet_small(m) {
  const k = K(m);
  k.bx(P.wood, [0.9, 1.15, 0.5], [0, 0.04, 0], { r: 0.02 });
  k.bx(P.woodLight, [0.96, 0.05, 0.56], [0, 1.19, 0], { r: 0.012 });
  for (const y of [0.14, 0.52, 0.86]) k.bx('#f3d9a0', [0.74, 0.28, 0.02], [0, y, 0.26]);
  for (const y of [0.42, 0.78]) k.bx(P.woodDark, [0.78, 0.04, 0.05], [0, y, 0.26]);
  for (const [x, y, c] of [[-0.2, 0.18, P.red], [0.1, 0.18, P.blue], [-0.1, 0.56, P.green], [0.22, 0.56, P.pink], [-0.2, 0.9, P.yellow]]) k.bx(c, [0.14, 0.18, 0.1], [x, y, 0.2], { r: 0.02 });
}

function storage_drum(m) {
  const k = K(m);
  k.cy(P.white, 0.28, 0.5, [0, 0.0, 0]);
  k.cn(P.red, 0.3, 0.26, 0.1, [0, 0.5, 0]);
  k.dm(P.blue, 0.26, [0, 0.6, 0], { sy: 0.7 });
  k.cy(P.blueDark, 0.29, 0.04, [0, 0.46, 0]);
}

function jar_glass(m) {
  const k = K(m);
  k.m.mat('jarGlass', '#cfe3ee', { r: 0.2, a: 0.55 });
  k.lt('jarGlass', [[0, 0], [0.16, 0], [0.18, 0.04], [0.18, 0.3], [0.14, 0.34], [0.14, 0.4], [0, 0.4]], [0, 0, 0]);
  k.cy(P.steelDark, 0.15, 0.05, [0, 0.4, 0]);
  k.cy('#e9d7a8', 0.15, 0.1, [0, 0.03, 0]);
}

function table_lamp(m) {
  const k = K(m);
  k.cy(P.pinkLight, 0.1, 0.03, [0, 0, 0]);
  k.cy(P.pinkDark, 0.02, 0.28, [0, 0.03, 0]);
  k.cn(P.pink, 0.17, 0.1, 0.2, [0, 0.31, 0], { caps: false });
  k.m.mat('lampGlow', '#ffe9b0', { e: '#ffd98a' });
  k.sp('lampGlow', 0.05, [0, 0.4, 0]);
}

// ---------- bedroom ----------

/** Single bed: orange-wood frame, white pillows, purple and pink quilt (2 x 4). */
function bed_single(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 1.9);
  const d = Math.min(D, 3.9);
  const z0 = -d / 2;
  k.bx('#c9803f', [w, 0.3, d], [0, 0.14, 0], { r: 0.04 });                   // frame
  k.bx('#c9803f', [w, 1.15, 0.12], [0, 0.0, z0 + 0.06], { r: 0.05 });         // headboard
  k.bx('#e0a15a', [w - 0.2, 0.5, 0.05], [0, 0.55, z0 + 0.14], { r: 0.04 });
  k.bx('#c9803f', [w, 0.55, 0.1], [0, 0.0, d / 2 - 0.05], { r: 0.04 });       // footboard
  k.bx(P.white, [w - 0.14, 0.2, d - 0.3], [0, 0.4, 0.02], { r: 0.06 });       // mattress
  k.bx('#8c63b4', [w - 0.1, 0.1, d * 0.62], [0, 0.56, 0.68], { r: 0.05 });    // quilt
  k.bx('#e592c0', [w - 0.1, 0.11, 0.38], [0, 0.565, -0.52], { r: 0.04 });     // folded top band
  for (const sx of [-1, 1]) k.bx(P.white, [0.62, 0.17, 0.4], [sx * 0.42, 0.58, z0 + 0.45], { r: 0.07, rx: -0.18 });
  for (let i = 0; i < 4; i++) k.sp('#f6d3e8', 0.06, [(i - 1.5) * 0.3, 0.63, 0.55 + (i % 2) * 0.55], { sy: 0.25 }); // quilt flowers
  k.bx('#7a4a2d', [0.1, 0.14, 0.1], [w / 2 - 0.1, 0, d / 2 - 0.1]);
  k.bx('#7a4a2d', [0.1, 0.14, 0.1], [-w / 2 + 0.1, 0, d / 2 - 0.1]);
}

/** Tall wooden wardrobe with two doors (2 x 1). */
function wardrobe_small(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 1.9);
  const d = Math.min(D, 0.85);
  k.bx(P.wood, [w, 2.0, d], [0, 0.08, 0], { r: 0.03 });
  k.bx(P.woodLight, [w + 0.06, 0.07, d + 0.04], [0, 2.08, 0], { r: 0.02 });
  k.bx(P.woodDeep, [w - 0.1, 0.08, d - 0.1], [0, 0, 0]);
  for (const s of [-1, 1]) {
    k.bx(P.woodLight, [w / 2 - 0.1, 1.68, 0.03], [s * (w / 4), 0.24, d / 2 + 0.005], { r: 0.012 });
    k.bx(P.wood, [w / 2 - 0.3, 1.46, 0.02], [s * (w / 4), 0.35, d / 2 + 0.027], { r: 0.01 });
    k.bx(P.brass, [0.04, 0.22, 0.05], [s * 0.09, 1.0, d / 2 + 0.05], { r: 0.012 });
  }
  for (const s of [-1, 1]) k.bx(P.woodDeep, [0.1, 0.08, 0.1], [s * (w / 2 - 0.12), 0, d / 2 - 0.12]);
}

// ---------- the pet room ----------

/** Pet playpen with a pink floor and a canopy (2 x 2). */
function dog_bed(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 1.9);
  const d = Math.min(D, 1.9);
  const h = 0.8;
  k.bx(P.pink, [w - 0.1, 0.14, d - 0.1], [0, 0.06, 0], { r: 0.05 });
  k.bx(P.pinkLight, [w - 0.3, 0.06, d - 0.3], [0, 0.2, 0], { r: 0.03 });
  k.m.mat('wire', '#d9ecf8', { r: 0.4 });
  for (const s of [-1, 1]) {
    k.bx('wire', [0.05, 0.05, d - 0.06], [s * (w / 2 - 0.03), h, 0]);        // top rails
    k.bx('wire', [w - 0.06, 0.05, 0.05], [0, h, s * (d / 2 - 0.03)]);
    k.bx('wire', [0.05, 0.05, d - 0.06], [s * (w / 2 - 0.03), 0.1, 0]);      // bottom rails
    k.bx('wire', [w - 0.06, 0.05, 0.05], [0, 0.1, s * (d / 2 - 0.03)]);
  }
  const n = 9;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n - 0.5;
    for (const s of [-1, 1]) {
      k.bx('wire', [0.022, h - 0.1, 0.022], [t * (w - 0.14), 0.1, s * (d / 2 - 0.03)]);
      k.bx('wire', [0.022, h - 0.1, 0.022], [s * (w / 2 - 0.03), 0.1, t * (d - 0.14)]);
    }
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.bx(P.blueLight, [0.07, h + 0.05, 0.07], [sx * (w / 2 - 0.04), 0.07, sz * (d / 2 - 0.04)], { r: 0.02 });
  // a peaked canopy over the back half
  k.m.mat('canopy', '#eaf3fb', { r: 0.5, a: 0.8 });
  k.fr('canopy', w, 0.7, w - 0.1, 0.1, 0.35, [0, h + 0.03, -d / 2 + 0.38]);
  k.sp(P.red, 0.08, [-0.4, 0.3, 0.2]);
  k.sp(P.yellow, 0.07, [0.45, 0.28, -0.1]);
}

/** Pink pet cradle with a golden arch (1 x 1). */
function cat_basket(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 0.9);
  const d = Math.min(D, 0.9);
  k.bx(P.pink, [w, 0.26, d], [0, 0.1, 0], { r: 0.06 });
  k.bx(P.pinkLight, [w - 0.14, 0.1, d - 0.14], [0, 0.3, 0], { r: 0.04 });
  k.bx(P.pinkDark, [w - 0.06, 0.05, d - 0.06], [0, 0.04, 0]);
  const arch = [];
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * (i / 10);
    arch.push([Math.cos(a) * (w / 2 - 0.05), 0.3 + Math.sin(a) * 0.5, 0]);
  }
  k.tb(P.gold, arch, 0.025, [0, 0, -d / 2 + 0.06]);
  k.sp(P.gold, 0.05, [0, 0.82, -d / 2 + 0.06]);
  k.sp(P.yellow, 0.1, [0.1, 0.4, 0.05], { sy: 0.7 });
  for (const s of [-1, 1]) k.bx('#7a4a2d', [0.07, 0.08, 0.07], [s * (w / 2 - 0.1), 0, d / 2 - 0.1]);
}

/** Golden dome bird cage on a stand (1 x 1). */
function parrot_cage(m) {
  const k = K(m);
  k.cy(P.woodDark, 0.32, 0.03, [0, 0, 0]);
  k.cy(P.gold, 0.04, 0.55, [0, 0.03, 0]);
  k.cn(P.gold, 0.3, 0.2, 0.06, [0, 0.58, 0]);
  const bars = 14;
  for (let i = 0; i < bars; i++) {
    const a = (i / bars) * Math.PI * 2;
    k.cy(P.gold, 0.01, 0.52, [Math.cos(a) * 0.24, 0.64, Math.sin(a) * 0.24], { seg: 5 });
  }
  k.ring(P.gold, 0.24, 0.012, [0, 0.94, 0]);
  k.dm(P.gold, 0.26, [0, 1.16, 0], { sy: 0.9 });
  k.ring(P.gold, 0.06, 0.012, [0, 1.42, 0], { rx: Math.PI / 2 });
  k.tb(P.woodDark, [[-0.22, 0.8, 0], [0.22, 0.8, 0]], 0.014);
  k.sp(P.blue, 0.06, [0.0, 0.88, 0], { sy: 1.3 });
}

function pet_bowl(m) {
  const k = K(m);
  k.bx(P.blueLight, [0.78, 0.03, 0.42], [0, 0, 0], { r: 0.012 });
  for (const [x, c, c2] of [[-0.2, P.pink, P.red], [0.2, P.blue, P.yellow]]) {
    k.lt(c, [[0, 0.03], [0.1, 0.03], [0.16, 0.14], [0.13, 0.14], [0.08, 0.06], [0, 0.06]], [x, 0, 0], { seg: 14 });
    k.cy(c2, 0.115, 0.03, [x, 0.06, 0], { seg: 12 });
  }
}

function pet_toys(m) {
  const k = K(m);
  k.sp(P.red, 0.13, [-0.25, 0.13, 0.1]);
  k.sp(P.white, 0.04, [-0.25, 0.2, 0.2], { sy: 0.6 });
  k.cy(P.cream, 0.04, 0.34, [0.1, 0.04, -0.1], { rx: 0, rz: Math.PI / 2, seg: 8 });
  k.sp(P.cream, 0.06, [-0.07, 0.07, -0.1]);
  k.sp(P.cream, 0.06, [0.27, 0.07, -0.1]);
  k.ring(P.green, 0.12, 0.04, [0.15, 0.04, 0.3]);
  k.sp(P.yellow, 0.1, [-0.2, 0.1, -0.3], { sy: 0.8 });
}

function soft_toy(m) {
  const k = K(m);
  const fur = '#d9a66b';
  k.sp(fur, 0.16, [0, 0.2, 0], { sy: 1.1 });
  k.sp('#f1d3a8', 0.1, [0, 0.19, 0.11], { sy: 1.1, sz: 0.5 });
  k.sp(fur, 0.14, [0, 0.46, 0]);
  k.sp('#f1d3a8', 0.06, [0, 0.43, 0.12], { sz: 0.8 });
  k.sp('#3a2a22', 0.02, [0, 0.45, 0.17]);
  for (const s of [-1, 1]) {
    k.sp(fur, 0.05, [s * 0.1, 0.58, 0]);
    k.sp('#3a2a22', 0.018, [s * 0.055, 0.5, 0.125]);
    k.sp(fur, 0.055, [s * 0.18, 0.24, 0.02], { sy: 1.4 });
    k.sp(fur, 0.065, [s * 0.09, 0.05, 0.08], { sz: 1.3 });
  }
  k.bx(P.pink, [0.2, 0.05, 0.03], [0, 0.33, 0.1], { rz: 0.1 });
}

function cushion(m) {
  const k = K(m);
  k.bx(P.yellow, [0.5, 0.14, 0.5], [0, 0, 0], { r: 0.06 });
  k.bx(P.pink, [0.5, 0.145, 0.1], [0, 0, 0], { r: 0.04 });
  k.sp(P.red, 0.025, [0, 0.14, 0]);
}

function bean_bag(m, { W }) {
  const k = K(m);
  const r = Math.min(W, 1.8) / 2;
  k.sp(P.purple, r, [0, r * 0.68, 0], { sy: 0.68 });
  k.sp(P.purpleLight, r * 0.62, [0, r * 0.86, -r * 0.3], { sy: 0.5 });
  k.sp(P.pink, r * 0.2, [r * 0.3, r * 1.04, r * 0.2], { sy: 0.4 });
}

function fairy_lights(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 3.8);
  m.mat('bulbGlow', '#fff1c4', { e: '#ffd98a' });
  const pts = [];
  const bulbs = [];
  const n = 8;
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    pts.push([-w / 2 + t * w, 0.25 - Math.sin(Math.PI * t) * 0.16 * (1 + Math.sin(t * 6) * 0.1), 0]);
  }
  k.tb(P.charcoal, pts, 0.008, [0, 0, 0], { seg: 4 });
  const colors = [P.yellow, P.pink, P.blueLight, P.greenLight, P.orange];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const x = -w / 2 + t * w;
    const y = 0.25 - Math.sin(Math.PI * t) * 0.16;
    k.sp(colors[i % colors.length], 0.035, [x, y - 0.04, 0.0], { sy: 1.25 });
  }
}

function toothbrush(m) {
  const k = K(m);
  k.bx(P.pink, [0.3, 0.025, 0.05], [0, 0.0, 0], { r: 0.01, ry: 0.3 });
  k.bx(P.white, [0.1, 0.03, 0.05], [0.18, 0.0, 0.05], { ry: 0.3 });
  k.bx(P.blueLight, [0.09, 0.04, 0.045], [0.18, 0.0, 0.052], { ry: 0.3 });
}

// ---------- bathroom (little house and Granny's) ----------

/** Big white oval bathtub on little feet (2 x 4). */
function bathtub(m, { W, D }) {
  const k = K(m);
  const rx = Math.min(W, 1.8) / 2;
  const rz = Math.min(D, 3.6) / 2;
  const tub = [[0, 0.2], [0.94, 0.2], [1, 0.3], [1, 0.62], [0.95, 0.67], [0.84, 0.64], [0.84, 0.4], [0, 0.38]];
  k.lt(P.white, tub, [0, 0, 0], { s: [rx, 1, rz], seg: 28 });
  for (const [x, z] of [[-0.6, -0.8], [0.6, -0.8], [-0.6, 0.8], [0.6, 0.8]]) k.sp(P.brass, 0.1, [x * rx, 0.1, z * rz], { sy: 0.9 });
  k.cy(P.steel, 0.04, 0.3, [0, 0.62, -rz + 0.12]);
  k.tb(P.steel, [[0, 0.9, -rz + 0.12], [0, 0.98, -rz + 0.3], [0, 0.9, -rz + 0.5]], 0.03);
  k.sp(P.steelDark, 0.045, [-0.18, 0.95, -rz + 0.12]);
  k.sp(P.red, 0.045, [0.18, 0.95, -rz + 0.12]);
}

/** White toilet with a lid and a tank at the back (1 x 2). */
function toilet(m, { W, D }) {
  const k = K(m);
  const z0 = -Math.min(D, 1.8) / 2;
  k.bx(P.white, [0.62, 0.78, 0.26], [0, 0.0, z0 + 0.2], { r: 0.05 });     // tank
  k.bx(P.offWhite, [0.64, 0.06, 0.28], [0, 0.78, z0 + 0.2], { r: 0.02 }); // tank lid
  k.sp(P.steel, 0.03, [0.2, 0.86, z0 + 0.2]);
  k.lt(P.white, [[0, 0], [0.22, 0], [0.3, 0.3], [0.32, 0.4], [0.28, 0.42], [0, 0.42]], [0, 0, z0 + 0.7], { s: [1, 1, 1.25] });
  k.lt(P.offWhite, [[0, 0.42], [0.3, 0.42], [0.31, 0.46], [0, 0.46]], [0, 0, z0 + 0.7], { s: [1, 1, 1.25] });
  k.lt(P.sky, [[0, 0.4], [0.2, 0.4], [0.2, 0.41], [0, 0.41]], [0, 0, z0 + 0.7], { s: [1, 1, 1.25] });
  k.bx(P.pinkLight, [0.5, 0.05, 0.05], [0, 0.46, z0 + 0.4], { r: 0.015 });
}

/** Pedestal basin with a tap (2 x 1). */
function wash_basin(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 0.9);
  k.cy(P.white, 0.13, 0.62, [0, 0, -0.1]);
  k.bx(P.white, [w, 0.14, 0.55], [0, 0.62, -0.04], { r: 0.05 });
  k.bx(P.sky, [w - 0.2, 0.02, 0.36], [0, 0.755, 0.0], { r: 0.02 });
  k.cy(P.steel, 0.025, 0.14, [0, 0.76, -0.27]);
  k.tb(P.steel, [[0, 0.9, -0.27], [0, 0.95, -0.2], [0, 0.9, -0.1]], 0.02);
  k.sp(P.red, 0.03, [-0.12, 0.9, -0.28]);
  k.sp(P.blue, 0.03, [0.12, 0.9, -0.28]);
}

function soap(m) {
  const k = K(m);
  k.bx(P.pink, [0.2, 0.06, 0.13], [0, 0, 0], { r: 0.025 });
  k.bx(P.pinkLight, [0.14, 0.01, 0.07], [0, 0.058, 0], { r: 0.004 });
}

/** Shower cubicle with glass doors and a rain head (2 x 2). */
function shower(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 1.9);
  const d = Math.min(D, 1.9);
  m.mat('showerGlass', '#cde9f3', { r: 0.1, a: 0.35 });
  k.bx(P.white, [w, 0.12, d], [0, 0, 0], { r: 0.03 });
  k.bx(P.greyLight, [w - 0.3, 0.02, d - 0.3], [0, 0.12, 0]);
  k.bx(P.steel, [0.06, 2.1, 0.06], [-w / 2 + 0.04, 0.12, d / 2 - 0.04]);
  k.bx(P.steel, [0.06, 2.1, 0.06], [w / 2 - 0.04, 0.12, d / 2 - 0.04]);
  k.bx(P.steel, [0.06, 2.1, 0.06], [-w / 2 + 0.04, 0.12, -d / 2 + 0.04]);
  k.bx(P.steel, [w, 0.05, 0.05], [0, 2.2, d / 2 - 0.04]);
  k.bx(P.steel, [w, 0.05, 0.05], [0, 2.2, -d / 2 + 0.04]);
  k.bx('showerGlass', [0.03, 2.05, d - 0.1], [-w / 2 + 0.04, 0.14, 0]);
  k.bx('showerGlass', [w - 0.1, 2.05, 0.03], [0, 0.14, d / 2 - 0.04]);
  k.cy(P.steel, 0.025, 1.9, [-w / 2 + 0.35, 0.12, -d / 2 + 0.06]);
  k.tb(P.steel, [[-w / 2 + 0.35, 2.0, -d / 2 + 0.06], [-w / 2 + 0.35, 2.12, -d / 2 + 0.3], [-w / 2 + 0.35, 2.1, -d / 2 + 0.5]], 0.025);
  k.cn(P.steel, 0.04, 0.17, 0.05, [-w / 2 + 0.35, 2.04, -d / 2 + 0.52]);
  k.sp(P.red, 0.04, [-w / 2 + 0.55, 1.3, -d / 2 + 0.06]);
}

function towel(m) {
  const k = K(m);
  k.bx(P.sky, [0.4, 0.07, 0.3], [0, 0, 0], { r: 0.03 });
  k.bx(P.blueLight, [0.4, 0.07, 0.1], [0, 0.07, 0.05], { r: 0.03 });
  k.bx(P.white, [0.4, 0.015, 0.03], [0, 0.065, -0.1]);
}

function mirror(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 1.2);
  k.fm(P.woodLight, w, 1.2, 0.08, 0.05, [0, 0, 0], { });
  k.bx('#8fc0d8', [w - 0.14, 1.06, 0.02], [0, 0.07, 0.012]);
  k.bx('#ffffff', [0.08, 0.5, 0.012], [-w / 4, 0.4, 0.024], { rz: -0.4 });
}

function plant_pot(m) {
  const k = K(m);
  k.lt(P.white, [[0, 0], [0.12, 0], [0.14, 0.03], [0.1, 0.22], [0.14, 0.26], [0.16, 0.34], [0, 0.34]], [0, 0, 0]);
  k.cn('#6b4528', 0.15, 0.15, 0.03, [0, 0.33, 0]);
  const leaf = [P.green, P.greenLight, P.greenDark];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    k.sp(leaf[i % 3], 0.14, [Math.cos(a) * 0.12, 0.55 + (i % 3) * 0.07, Math.sin(a) * 0.12], { sy: 1.3, sx: 0.8, ry: a });
  }
  k.sp(P.greenLight, 0.16, [0, 0.7, 0], { sy: 1.2 });
  k.sp(P.red, 0.03, [0.1, 0.8, 0.1]);
}

export const RECIPES = {
  tv_small: { build: tv_small },
  armchair: { build: armchair, kind: 'extra', foot: [1.4, 1.2], name: 'Armchair' },
  side_table: { build: side_table, kind: 'extra', foot: [0.7, 0.7], name: 'Side table' },
  coffee_table: { build: coffee_table, kind: 'extra', foot: [1.6, 0.9], name: 'Coffee table' },
  kitchen_island: { build: kitchen_island, kind: 'extra', foot: [2.5, 1.0], name: 'Kitchen island' },
  fridge_blue: { build: fridge_blue, kind: 'extra', foot: [1.1, 1.0], name: 'Blue fridge' },
  fridge_small: { build: fridge_small, kind: 'extra', foot: [0.7, 0.7], name: 'Small fridge' },
  cabinet_small: { build: cabinet_small, kind: 'extra', foot: [1.0, 0.6], name: 'Small cabinet' },
  storage_drum: { build: storage_drum, kind: 'extra', foot: [0.7, 0.7], name: 'Storage drum' },
  jar_glass: { build: jar_glass, kind: 'extra', foot: [0.4, 0.4], name: 'Glass jar' },
  table_lamp: { build: table_lamp, kind: 'extra', foot: [0.4, 0.4], name: 'Table lamp' },
  bed_single: { build: bed_single },
  wardrobe_small: { build: wardrobe_small },
  dog_bed: { build: dog_bed },
  cat_basket: { build: cat_basket },
  parrot_cage: { build: parrot_cage },
  pet_bowl: { build: pet_bowl },
  pet_toys: { build: pet_toys },
  soft_toy: { build: soft_toy },
  cushion: { build: cushion },
  bean_bag: { build: bean_bag },
  fairy_lights: { build: fairy_lights },
  toothbrush: { build: toothbrush },
  bathtub: { build: bathtub },
  toilet: { build: toilet },
  wash_basin: { build: wash_basin },
  soap: { build: soap },
  shower: { build: shower },
  towel: { build: towel },
  mirror: { build: mirror },
  plant_pot: { build: plant_pot },
};
