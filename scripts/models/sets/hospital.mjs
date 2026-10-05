// Hospital: reception, waiting room, ward, X-ray and medicine room
// (panel 8 of docs/art/reference/01-asset-pack-overview.webp: white and aqua, steel frames, blue stretchers).
import { kit } from '../kit.mjs';
import { P } from '../pal.mjs';

const K = (m) => kit(m);
const AQUA = '#47b3c4';
const AQUA_LIGHT = '#a8dce6';

/** Tall white and aqua reception desk with a computer (5 x 2). */
function reception_desk(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 4.9);
  const d = Math.min(D, 1.9);
  k.bx(P.white, [w, 1.05, 0.7], [0, 0, 0.55], { r: 0.04 });
  k.bx(AQUA, [w - 0.2, 0.7, 0.03], [0, 0.15, 0.91], { r: 0.01 });
  k.bx(AQUA_LIGHT, [w + 0.08, 0.07, 0.8], [0, 1.05, 0.55], { r: 0.02 });
  k.bx(P.white, [w - 1.0, 0.75, 0.7], [-0.4, 0, -0.55], { r: 0.03 });
  k.bx(AQUA_LIGHT, [w - 0.9, 0.06, 0.8], [-0.4, 0.75, -0.55], { r: 0.02 });
  k.bx(P.white, [0.8, 0.75, 0.7], [w / 2 - 0.5, 0, -0.1]);
  // a screen and keyboard on the desk
  k.bx(P.charcoal, [0.5, 0.34, 0.04], [-0.8, 0.95, -0.5], { r: 0.01 });
  k.bx('#2a5e9a', [0.45, 0.28, 0.01], [-0.8, 0.98, -0.475]);
  k.bx(P.charcoal, [0.06, 0.18, 0.06], [-0.8, 0.8, -0.52]);
  k.bx(P.greyLight, [0.4, 0.02, 0.14], [-0.8, 0.8, -0.3]);
  k.bx(P.red, [0.2, 0.2, 0.012], [w / 2 - 0.5, 0.78, -0.1], { rx: -1.3 });
  k.bx(P.white, [0.1, 0.34, 0.012], [w / 2 - 0.5, 0.78, -0.1], { rx: -1.3 });
  k.sp(AQUA, 0.1, [1.5, 1.2, 0.55], { sy: 0.4 });
  k.cy(P.white, 0.14, 0.09, [1.5, 1.12, 0.55], { seg: 12 });
}

/** A row of four blue plastic seats on a steel beam (4 x 1). */
function waiting_chairs(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 3.9);
  k.bx(P.steelDark, [w, 0.06, 0.08], [0, 0.28, 0.0]);
  const n = 4;
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (i + 0.5) * (w / n);
    k.bx(P.blue, [w / n - 0.06, 0.07, 0.46], [x, 0.44, 0.04], { r: 0.03 });
    k.bx(P.blue, [w / n - 0.06, 0.4, 0.06], [x, 0.5, -0.2], { r: 0.03, rx: -0.12 });
    k.bx(P.steelDark, [0.05, 0.28, 0.05], [x - 0.15, 0.0, 0.0]);
    k.bx(P.steelDark, [0.05, 0.28, 0.05], [x + 0.15, 0.0, 0.0]);
  }
  for (const s of [-1, 1]) k.bx(P.steelDark, [0.07, 0.06, 0.6], [s * (w / 2 - 0.05), 0, 0]);
}

/** White hospital bed with side rails, a raised head and wheels (2 x 4). */
function hospital_bed(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 1.7);
  const d = Math.min(D, 3.7);
  k.bx(P.steel, [w - 0.2, 0.08, d - 0.3], [0, 0.34, 0.0], { r: 0.015 });
  k.bx(P.white, [w - 0.14, 0.16, d - 0.7], [0, 0.42, 0.25], { r: 0.05 });
  k.bx(P.white, [w - 0.16, 0.16, 1.0], [0, 0.55, -d / 2 + 0.6], { r: 0.05, rx: 0.22 });
  k.bx(P.blueLight, [w - 0.1, 0.07, d * 0.4], [0, 0.6, 0.62], { r: 0.03 });
  k.bx(P.white, [0.52, 0.12, 0.34], [0, 0.72, -d / 2 + 0.45], { r: 0.05, rx: 0.2 });
  for (const s of [-1, 1]) {
    k.tb(P.steel, [[s * (w / 2 - 0.05), 0.55, -d / 2 + 1.3], [s * (w / 2 - 0.05), 0.85, -d / 2 + 1.3], [s * (w / 2 - 0.05), 0.85, d / 2 - 0.6], [s * (w / 2 - 0.05), 0.55, d / 2 - 0.6]], 0.022);
    for (let i = 0; i < 4; i++) k.tb(P.steel, [[s * (w / 2 - 0.05), 0.58, -d / 2 + 1.5 + i * 0.5], [s * (w / 2 - 0.05), 0.85, -d / 2 + 1.5 + i * 0.5]], 0.012, [0, 0, 0], { seg: 4 });
  }
  k.bx(P.steel, [w - 0.2, 0.5, 0.05], [0, 0.35, -d / 2 + 0.12]);
  k.bx(P.steel, [w - 0.2, 0.35, 0.05], [0, 0.35, d / 2 - 0.12]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    k.cy(P.charcoal, 0.09, 0.05, [sx * (w / 2 - 0.15), 0.09, sz * (d / 2 - 0.25)], { rz: Math.PI / 2, seg: 10 });
    k.bx(P.steelDark, [0.04, 0.26, 0.04], [sx * (w / 2 - 0.15), 0.1, sz * (d / 2 - 0.25)]);
  }
}

/** Three-panel folding screen with aqua curtains (3 x 1). */
function curtain_screen(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 2.9);
  const pw = w / 3;
  for (let i = 0; i < 3; i++) {
    const x = -w / 2 + (i + 0.5) * pw;
    const z = i === 1 ? 0.1 : -0.02;
    k.bx(P.steel, [pw - 0.02, 0.05, 0.06], [x, 1.85, z]);
    k.bx(P.steel, [pw - 0.02, 0.05, 0.06], [x, 0.18, z]);
    k.bx(i % 2 ? AQUA_LIGHT : AQUA, [pw - 0.06, 1.62, 0.025], [x, 0.22, z], { r: 0.01 });
    for (let f = 0; f < 4; f++) k.bx(i % 2 ? AQUA : '#2e92a5', [0.03, 1.6, 0.03], [x - pw / 2 + 0.1 + f * (pw - 0.2) / 3, 0.22, z + 0.02]);
    k.bx(P.steel, [0.05, 1.75, 0.05], [x - pw / 2 + 0.02, 0.15, z]);
    k.cy(P.charcoal, 0.05, 0.04, [x, 0.05, z], { rz: Math.PI / 2, seg: 8 });
  }
  k.bx(P.steel, [0.05, 1.75, 0.05], [w / 2 - 0.02, 0.15, -0.02]);
}

/** IV pole on a wheeled base with a drip bag (1 x 1). */
function drip_stand(m) {
  const k = K(m);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    k.bx(P.steel, [0.04, 0.04, 0.26], [Math.cos(a) * 0.14, 0.06, Math.sin(a) * 0.14], { ry: -a + Math.PI / 2 });
    k.cy(P.charcoal, 0.045, 0.03, [Math.cos(a) * 0.27, 0.045, Math.sin(a) * 0.27], { rz: Math.PI / 2, seg: 8 });
  }
  k.cy(P.steel, 0.018, 1.75, [0, 0.07, 0], { seg: 8 });
  k.bx(P.steel, [0.5, 0.03, 0.03], [0, 1.8, 0]);
  m.mat('dripBag', '#d6ecf5', { r: 0.2, a: 0.6 });
  for (const s of [-1, 1]) {
    k.bx('dripBag', [0.15, 0.24, 0.05], [s * 0.22, 1.5, 0], { r: 0.02 });
    k.bx(s > 0 ? P.yellow : P.sky, [0.12, 0.12, 0.052], [s * 0.22, 1.5, 0]);
    k.tb(P.steel, [[s * 0.22, 1.5, 0], [s * 0.1, 1.1, 0.1], [0.02, 0.95, 0.1]], 0.008);
  }
}

/** Wall shelves full of medicine bottles and boxes (4 x 1). */
function medicine_shelf(m, { W, D }) {
  const k = K(m);
  const w = Math.min(W, 3.9);
  const d = Math.min(D, 0.55);
  k.bx(P.white, [w, 2.0, 0.04], [0, 0, -d / 2 + 0.02]);
  for (const s of [-1, 1]) k.bx(AQUA, [0.06, 2.0, d], [s * (w / 2 - 0.03), 0, 0]);
  k.bx(AQUA, [w, 0.06, d], [0, 2.0, 0]);
  k.bx(AQUA, [w, 0.08, d], [0, 0, 0]);
  const cols = [P.white, P.orange, P.blue, P.green, P.yellow, P.red, P.pinkLight];
  for (let r = 0; r < 4; r++) {
    const y = 0.08 + r * 0.48;
    k.bx(P.greyLight, [w - 0.12, 0.03, d - 0.04], [0, y + 0.42, 0.0]);
    let x = -w / 2 + 0.2;
    let i = r * 5;
    while (x < w / 2 - 0.3) {
      const c = cols[i % 7];
      if (i % 3 === 0) {
        k.cy(P.white, 0.06, 0.2, [x + 0.06, y, 0.02], { seg: 6 });
        k.cy(c, 0.062, 0.05, [x + 0.06, y + 0.2, 0.02], { seg: 6 });
        x += 0.15;
      } else if (i % 3 === 1) {
        k.bx(c, [0.16, 0.12 + (i % 4) * 0.03, 0.12], [x + 0.08, y, 0.02]);
        x += 0.2;
      } else {
        k.cn(c, 0.07, 0.04, 0.26, [x + 0.07, y, 0.02], { seg: 6 });
        x += 0.18;
      }
      i++;
    }
  }
}

/** Wheelchair: blue seat and back, big spoked wheels (2 x 2). */
function wheelchair(m) {
  const k = K(m);
  k.bx(P.blue, [0.5, 0.06, 0.5], [0, 0.46, 0.0], { r: 0.02 });
  k.bx(P.blue, [0.5, 0.45, 0.05], [0, 0.5, -0.27], { r: 0.02 });
  for (const s of [-1, 1]) {
    k.cy(P.charcoal, 0.3, 0.05, [s * 0.34, 0.3, -0.1], { rz: Math.PI / 2, seg: 18 });
    k.cy(P.steel, 0.25, 0.03, [s * 0.36, 0.3, -0.1], { rz: Math.PI / 2, seg: 18 });
    k.ring(P.steelDark, 0.26, 0.012, [s * 0.38, 0.3, -0.1], { rz: Math.PI / 2 });
    k.cy(P.charcoal, 0.07, 0.04, [s * 0.26, 0.07, 0.38], { rz: Math.PI / 2, seg: 10 });
    k.bx(P.steelDark, [0.04, 0.4, 0.04], [s * 0.26, 0.1, 0.38]);
    k.bx(P.steelDark, [0.05, 0.05, 0.4], [s * 0.27, 0.68, -0.05]);
    k.tb(P.charcoal, [[s * 0.25, 0.9, -0.3], [s * 0.25, 0.95, -0.5]], 0.022);
  }
  k.bx(P.steelDark, [0.5, 0.04, 0.04], [0, 0.46, 0.2]);
  k.bx(P.black, [0.5, 0.025, 0.12], [0, 0.97, -0.5], { r: 0.01 });
}

/** Big X-ray machine: a white gantry with an aqua arm over a table (3 x 3). */
function xray_machine(m, { W, D }) {
  const k = K(m);
  k.bx(P.white, [0.9, 0.5, 2.3], [-0.8, 0, 0.0], { r: 0.04 });
  k.bx(AQUA_LIGHT, [0.8, 0.07, 2.2], [-0.8, 0.5, 0.0], { r: 0.02 });
  k.bx(P.greyLight, [0.7, 0.08, 2.0], [-0.8, 0.57, 0.0], { r: 0.02 });
  k.bx(P.white, [0.9, 2.5, 0.5], [1.0, 0, -0.8], { r: 0.05 });
  k.bx(P.white, [0.35, 0.35, 1.4], [0.6, 2.1, -0.1], { r: 0.04 });
  k.bx(AQUA, [0.8, 0.45, 0.7], [0.1, 2.15, 0.7], { r: 0.06 });
  k.cy(P.charcoal, 0.2, 0.1, [0.1, 1.95, 0.7], { seg: 14 });
  k.bx(P.greyLight, [1.0, 0.1, 0.6], [-0.8, 0.1, 0.0], { r: 0.02 });
  k.bx('#10151c', [0.4, 0.3, 0.04], [1.0, 1.6, -0.54], { r: 0.01 });
  k.bx('#6bd1ff', [0.3, 0.2, 0.01], [1.0, 1.65, -0.515]);
  for (let i = 0; i < 3; i++) k.sp([P.green, P.yellow, P.red][i], 0.025, [0.85 + i * 0.1, 1.45, -0.54]);
  k.tb(P.charcoal, [[0.9, 1.9, -0.5], [0.5, 2.3, -0.2], [0.3, 2.2, 0.4]], 0.04);
}

/** Wall light box showing an X-ray (2 x 1). */
function xray_lightbox(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 1.9);
  m.mat('lightPanel', '#e6f3ff', { e: '#bcdcff' });
  k.fm(P.steel, w, 1.1, 0.06, 0.08, [0, 0, 0]);
  k.bx('lightPanel', [w - 0.12, 0.98, 0.02], [0, 0.06, 0.02]);
  const bone = '#6a7a8c';
  k.bx(bone, [0.1, 0.62, 0.004], [0, 0.22, 0.034], { r: 0.001 });
  k.sp(bone, 0.1, [0, 0.82, 0.034], { sz: 0.05 });
  for (let i = 0; i < 4; i++) k.bx(bone, [0.4 - i * 0.04, 0.04, 0.004], [0, 0.65 - i * 0.1, 0.034]);
  for (const s of [-1, 1]) k.bx(bone, [0.05, 0.4, 0.004], [s * 0.34, 0.5, 0.034], { rz: s * 0.15 });
}

function stethoscope(m) {
  const k = K(m);
  const ring = [];
  for (let i = 0; i <= 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    ring.push([Math.cos(a) * 0.12, 0.012, Math.sin(a) * 0.14 + 0.04]);
  }
  k.tb(P.charcoal, ring, 0.012, [0, 0, 0], { seg: 5 });
  k.tb(P.steel, [[-0.1, 0.02, -0.1], [-0.06, 0.02, -0.18]], 0.012, [0, 0, 0], { seg: 5 });
  k.tb(P.steel, [[0.1, 0.02, -0.1], [0.06, 0.02, -0.18]], 0.012, [0, 0, 0], { seg: 5 });
  k.cy(P.steel, 0.055, 0.025, [0, 0.0, 0.26], { seg: 12 });
  k.cy(P.charcoal, 0.035, 0.012, [0, 0.025, 0.26], { seg: 10 });
  k.tb(P.charcoal, [[0, 0.015, 0.18], [0, 0.015, 0.24]], 0.012, [0, 0, 0], { seg: 5 });
}

function weighing_scale(m) {
  const k = K(m);
  k.bx(P.greyLight, [0.55, 0.08, 0.5], [0, 0, 0], { r: 0.03 });
  k.bx(P.steel, [0.45, 0.012, 0.4], [0, 0.08, 0.0]);
  k.bx(P.greyLight, [0.1, 1.15, 0.08], [0, 0.04, -0.2], { r: 0.015 });
  k.bx(P.charcoal, [0.34, 0.18, 0.1], [0, 1.2, -0.2], { r: 0.03 });
  k.bx('#8fe0a0', [0.24, 0.08, 0.012], [0, 1.26, -0.145]);
  k.bx(P.steel, [0.02, 0.5, 0.02], [0.1, 0.85, -0.2]);
  k.bx(P.red, [0.12, 0.012, 0.012], [0.1, 0.9, -0.17]);
}

/** Eye test chart on a board: rows of letters getting smaller. */
function eye_chart(m) {
  const k = K(m);
  k.fm(P.steel, 0.7, 1.1, 0.04, 0.05, [0, 0, 0]);
  k.bx(P.white, [0.62, 1.02, 0.01], [0, 0.04, 0.02]);
  const rows = [0.2, 0.16, 0.13, 0.1, 0.08, 0.06, 0.05];
  rows.forEach((s, i) => {
    const y = 0.95 - i * 0.14;
    const n = Math.min(5, i + 1);
    for (let j = 0; j < n; j++) k.bx(P.black, [s * 0.7, s * 0.9, 0.004], [(j - (n - 1) / 2) * (s * 1.3), y, 0.03]);
  });
  k.bx(P.red, [0.4, 0.015, 0.004], [0, 0.1, 0.03]);
}

/** A blue stretcher on a wheeled steel frame. */
function stretcher(m) {
  const k = K(m);
  k.bx(P.blue, [0.8, 0.1, 1.9], [0, 0.72, 0], { r: 0.04 });
  k.bx('#2d62b8', [0.84, 0.04, 1.94], [0, 0.68, 0], { r: 0.015 });
  k.bx(P.white, [0.5, 0.1, 0.3], [0, 0.82, -0.7], { r: 0.04, rx: 0.1 });
  for (const s of [-1, 1]) {
    k.bx(P.steel, [0.05, 0.05, 1.8], [s * 0.3, 0.48, 0]);
    for (const z of [-0.8, 0.8]) {
      k.bx(P.steel, [0.05, 0.4, 0.05], [s * 0.3, 0.1, z], { rx: z > 0 ? 0.2 : -0.2 });
      k.cy(P.charcoal, 0.09, 0.04, [s * 0.3, 0.09, z], { rz: Math.PI / 2, seg: 10 });
    }
    k.tb(P.steel, [[s * 0.42, 0.78, -0.4], [s * 0.42, 0.86, -0.4], [s * 0.42, 0.86, 0.4], [s * 0.42, 0.78, 0.4]], 0.018);
  }
}

function medicine_bottle(m) {
  const k = K(m);
  k.cy(P.white, 0.06, 0.2, [0, 0, 0], { seg: 12 });
  k.cy(P.orange, 0.062, 0.05, [0, 0.2, 0], { seg: 12 });
  k.bx(P.green, [0.1, 0.1, 0.02], [0, 0.04, 0.05]);
  k.bx(P.white, [0.06, 0.06, 0.004], [0, 0.06, 0.062]);
  k.bx(P.red, [0.04, 0.012, 0.004], [0, 0.085, 0.064]);
}

function syringe(m) {
  const k = K(m);
  m.mat('syGlass', '#dcecf4', { r: 0.1, a: 0.6 });
  k.cy('syGlass', 0.022, 0.2, [0, 0.022, 0], { rx: Math.PI / 2, seg: 10 });
  k.cy(P.blue, 0.016, 0.1, [0, 0.022, 0.0], { rx: Math.PI / 2, seg: 8 });
  k.cy(P.steel, 0.006, 0.12, [0, 0.022, 0.16], { rx: Math.PI / 2, seg: 5 });
  k.cy(P.white, 0.008, 0.2, [0, 0.022, -0.12], { rx: Math.PI / 2, seg: 5 });
  k.bx(P.white, [0.07, 0.01, 0.02], [0, 0.022, -0.22]);
  k.bx(P.white, [0.07, 0.01, 0.02], [0, 0.022, 0.1]);
}

export const RECIPES = {
  reception_desk: { build: reception_desk },
  waiting_chairs: { build: waiting_chairs },
  hospital_bed: { build: hospital_bed },
  curtain_screen: { build: curtain_screen },
  drip_stand: { build: drip_stand },
  medicine_shelf: { build: medicine_shelf },
  wheelchair: { build: wheelchair },
  xray_machine: { build: xray_machine },
  xray_lightbox: { build: xray_lightbox, mount: { y: 1.2, wall: true } },
  stethoscope: { build: stethoscope },
  weighing_scale: { build: weighing_scale },
  eye_chart: { build: eye_chart, mount: { y: 1.1, wall: true } },
  stretcher: { build: stretcher, kind: 'extra', foot: [0.9, 2.0], name: 'Stretcher' },
  medicine_bottle: { build: medicine_bottle, kind: 'item', foot: [0.2, 0.2], name: 'Medicine bottle' },
  syringe: { build: syringe, kind: 'item', foot: [0.3, 0.4], name: 'Syringe' },
};
