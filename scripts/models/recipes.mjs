// How each object is built. Everything is made of simple low-poly shapes in grey tones.
// A recipe gets the model, its footprint (w, d: the object's tile size in metres) and the usable
// size (W, D) which is the footprint minus a 4 cm margin. Front is +Z, origin is the centre of the base.
import { box, cyl, sphere, rbox } from './shapes.mjs';
import { quatFromEuler } from './gltf.mjs';

const TAU = Math.PI * 2;
const deg = (d) => (d * Math.PI) / 180;

const add = (m, g, mat, xf) => m.add(m.root, g, mat, xf);

// ---------- furniture and kitchen ----------

function fridge(m, { W, D }) {
  const H = 2.0;
  const zf = D / 2 - 0.05; // the front face
  add(m, box(W - 0.12, 0.05, D - 0.16), 'black', { t: [0, 0.025, -0.03] });
  add(m, rbox(W, H - 0.07, D - 0.1, 0.06), 'light', { t: [0, 0.05 + (H - 0.07) / 2, -0.05] });
  add(m, box(W + 0.01, 0.035, 0.03), 'dark', { t: [0, 1.3, zf] }); // seam between the two doors
  add(m, box(0.07, 0.34, 0.06), 'dark', { t: [W / 2 - 0.22, 1.65, zf + 0.04] }); // freezer handle
  add(m, box(0.07, 0.7, 0.06), 'dark', { t: [W / 2 - 0.22, 0.85, zf + 0.04] }); // fridge handle
  add(m, box(W - 0.3, 0.03, 0.02), 'edge', { t: [0, 1.93, zf + 0.005] });
}

function counter(m, { W, D }) {
  add(m, box(W - 0.04, 0.06, D - 0.1), 'black', { t: [0, 0.03, -0.01] });
  add(m, box(W, 0.76, D - 0.05), 'dark', { t: [0, 0.44, -0.01] });
  add(m, rbox(W + 0.04, 0.07, D + 0.04, 0.015), 'edge', { t: [0, 0.865, 0] });
  add(m, box(0.02, 0.62, 0.02), 'black', { t: [0, 0.45, D / 2 - 0.03] });
  for (const x of [-0.12, 0.12]) add(m, box(0.025, 0.14, 0.03), 'light', { t: [x, 0.7, D / 2 - 0.01] });
}

function gasStove(m, { W, D }) {
  const zf = D / 2 - 0.06;
  add(m, box(W, 0.82, D - 0.1), 'black', { t: [0, 0.41, -0.02] });
  add(m, rbox(W + 0.02, 0.05, D - 0.06, 0.012), 'dark', { t: [0, 0.865, -0.02] });
  for (const x of [-0.7, 0.7]) {
    add(m, cyl(0.22, 0.22, 0.03, 18), 'edge', { t: [x, 0.9, -0.02] });
    add(m, cyl(0.12, 0.12, 0.045, 14), 'black', { t: [x, 0.91, -0.02] });
    add(m, box(0.5, 0.025, 0.04), 'mid', { t: [x, 0.925, -0.02] });
    add(m, box(0.04, 0.025, 0.5), 'mid', { t: [x, 0.925, -0.02] });
  }
  for (const x of [-0.5, 0, 0.5]) add(m, cyl(0.05, 0.05, 0.04, 12), 'light', { t: [x, 0.74, zf + 0.02], rx: Math.PI / 2 });
  add(m, box(W - 0.4, 0.42, 0.03), 'dark', { t: [0, 0.36, zf + 0.01] });
  add(m, box(W - 0.7, 0.04, 0.04), 'edge', { t: [0, 0.54, zf + 0.04] });
}

function sink(m, { W, D }) {
  add(m, box(W, 0.8, D), 'dark', { t: [0, 0.4, 0] });
  const hx = 0.55;
  const hz = 0.25;
  const y = 0.83;
  add(m, rbox(W + 0.04, 0.06, D / 2 - hz + 0.02, 0.012), 'edge', { t: [0, y, hz + (D / 2 - hz) / 2 + 0.01] });
  add(m, rbox(W + 0.04, 0.06, D / 2 - hz + 0.02, 0.012), 'edge', { t: [0, y, -hz - (D / 2 - hz) / 2 - 0.01] });
  const sideW = W / 2 - hx + 0.02;
  for (const s of [-1, 1]) add(m, rbox(sideW, 0.06, 2 * hz, 0.012), 'edge', { t: [s * (hx + sideW / 2 - 0.02 + 0.01), y, 0] });
  add(m, box(2 * hx, 0.02, 2 * hz), 'mid', { t: [0, 0.62, 0] }); // basin floor
  add(m, box(2 * hx, 0.2, 0.02), 'light', { t: [0, 0.72, -hz] });
  add(m, box(2 * hx, 0.2, 0.02), 'light', { t: [0, 0.72, hz] });
  for (const s of [-1, 1]) add(m, box(0.02, 0.2, 2 * hz), 'light', { t: [s * hx, 0.72, 0] });
  add(m, cyl(0.03, 0.03, 0.3, 10), 'light', { t: [0, 1.0, -hz - 0.1] });
  add(m, cyl(0.025, 0.025, 0.24, 10), 'light', { t: [0, 1.15, -hz - 0.01], rx: Math.PI / 2 });
  add(m, box(0.12, 0.03, 0.03), 'edge', { t: [0, 1.0, -hz - 0.2] });
}

function tableDining(m, { W, D }) {
  add(m, rbox(W, 0.08, D, 0.03), 'mid', { t: [0, 0.71, 0] });
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) add(m, box(0.14, 0.67, 0.14), 'dark', { t: [sx * (W / 2 - 0.3), 0.335, sz * (D / 2 - 0.3)] });
  add(m, box(W - 0.6, 0.06, 0.08), 'dark', { t: [0, 0.62, D / 2 - 0.3] });
  add(m, box(W - 0.6, 0.06, 0.08), 'dark', { t: [0, 0.62, -D / 2 + 0.3] });
  for (const x of [-1.4, 0, 1.4])
    for (const z of [-0.6, 0.6]) {
      add(m, cyl(0.3, 0.27, 0.03, 16), 'light', { t: [x, 0.765, z] });
      add(m, cyl(0.17, 0.17, 0.005, 14), 'edge', { t: [x, 0.782, z] });
    }
}

function chair(m, { W }) {
  const s = Math.min(W, 0.6);
  add(m, rbox(s, 0.07, s, 0.02), 'mid', { t: [0, 0.45, 0.02] });
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) add(m, box(0.05, 0.42, 0.05), 'dark', { t: [sx * (s / 2 - 0.05), 0.21, sz * (s / 2 - 0.03) + 0.02] });
  add(m, box(s, 0.4, 0.05), 'mid', { t: [0, 0.73, -s / 2 + 0.02] });
  add(m, box(s - 0.1, 0.06, 0.06), 'dark', { t: [0, 0.93, -s / 2 + 0.02] });
  for (const sx of [-1, 1]) add(m, box(0.05, 0.5, 0.05), 'dark', { t: [sx * (s / 2 - 0.03), 0.68, -s / 2 + 0.02] });
}

function spiceRack(m, { W, D }) {
  const zb = -D / 2 + 0.05;
  add(m, box(W, 1.3, 0.04), 'dark', { t: [0, 0.65, zb] });
  for (const s of [-1, 1]) add(m, box(0.04, 1.3, 0.3), 'dark', { t: [s * (W / 2 - 0.02), 0.65, zb + 0.13] });
  for (const y of [0.55, 0.95]) add(m, box(W - 0.04, 0.04, 0.3), 'mid', { t: [0, y, zb + 0.13] });
  for (const [row, y] of [[0, 0.57], [1, 0.97]])
    for (let i = 0; i < 5; i++) {
      const x = -W / 2 + 0.2 + i * ((W - 0.4) / 4);
      add(m, cyl(0.075, 0.075, 0.2, 12), row ? 'light' : 'edge', { t: [x, y + 0.11, zb + 0.14] });
      add(m, cyl(0.06, 0.06, 0.035, 12), 'dark', { t: [x, y + 0.23, zb + 0.14] });
    }
  add(m, box(W - 0.04, 0.08, 0.05), 'mid', { t: [0, 1.26, zb + 0.03] });
}

function cementBag(m) {
  add(m, rbox(0.62, 0.2, 0.42, 0.07), 'light', { t: [0, 0.1, 0] });
  add(m, box(0.34, 0.006, 0.22), 'dark', { t: [0, 0.2, 0.02] });
  add(m, box(0.2, 0.007, 0.03), 'white', { t: [0, 0.2, 0.02] });
  for (const s of [-1, 1]) add(m, box(0.04, 0.17, 0.4), 'mid', { t: [s * 0.31, 0.1, 0] });
}

function hangingBulb(m) {
  add(m, cyl(0.008, 0.008, 0.55, 6), 'dark', { t: [0, 2.12, 0] });
  add(m, cyl(0.04, 0.04, 0.09, 10), 'dark', { t: [0, 1.82, 0] });
  add(m, sphere(0.1, 12, 8), 'glow', { t: [0, 1.72, 0] });
}

function knife(m) {
  add(m, box(0.3, 0.006, 0.05), 'white', { t: [0.1, 0.012, 0], ry: deg(20) });
  add(m, box(0.14, 0.02, 0.035), 'dark', { t: [-0.1, 0.014, 0.036], ry: deg(20) });
}

function chilli(m) {
  const pts = [0, 1, 2, 3];
  pts.forEach((i) => {
    const t = i / 3;
    add(m, cyl(0.032 * (1 - t) + 0.008, 0.036 * (1 - t) + 0.012, 0.09, 8), 'mid', {
      t: [-0.1 + i * 0.075, 0.05, Math.sin(t * 2.2) * 0.05],
      rz: Math.PI / 2,
      ry: deg(-20 * t),
    });
  });
  add(m, cyl(0.012, 0.012, 0.05, 6), 'dark', { t: [-0.16, 0.055, -0.01], rz: Math.PI / 2 });
}

function lemon(m) {
  add(m, sphere(0.09, 12, 8), 'light', { t: [0, 0.085, 0], s: [1.3, 0.95, 0.95] });
  for (const s of [-1, 1]) add(m, cyl(0, 0.02, 0.03, 6), 'mid', { t: [s * 0.12, 0.085, 0], rz: -s * Math.PI / 2 });
}

function saltJar(m) {
  add(m, cyl(0.07, 0.07, 0.15, 14), 'white', { t: [0, 0.075, 0] });
  add(m, cyl(0.072, 0.072, 0.06, 14), 'dark', { t: [0, 0.07, 0] });
  add(m, cyl(0.065, 0.065, 0.03, 14), 'edge', { t: [0, 0.165, 0] });
}

function sugarJar(m) {
  add(m, rbox(0.14, 0.14, 0.14, 0.03), 'light', { t: [0, 0.07, 0] });
  add(m, box(0.145, 0.05, 0.145), 'mid', { t: [0, 0.07, 0] });
  add(m, rbox(0.12, 0.035, 0.12, 0.015), 'edge', { t: [0, 0.16, 0] });
}

function teaCup(m) {
  add(m, cyl(0.105, 0.09, 0.015, 16), 'white', { t: [0, 0.008, 0] });
  add(m, cyl(0.062, 0.045, 0.075, 14), 'white', { t: [0, 0.052, 0] });
  add(m, cyl(0.052, 0.052, 0.004, 14), 'dark', { t: [0, 0.09, 0] });
  add(m, box(0.03, 0.012, 0.02), 'white', { t: [0.075, 0.07, 0] });
  add(m, box(0.012, 0.05, 0.02), 'white', { t: [0.09, 0.055, 0] });
  add(m, box(0.03, 0.012, 0.02), 'white', { t: [0.075, 0.04, 0] });
}

function maggiPacket(m) {
  add(m, rbox(0.2, 0.035, 0.3, 0.012), 'mid', { t: [0, 0.02, 0] });
  for (const s of [-1, 1]) add(m, box(0.2, 0.03, 0.02), 'edge', { t: [0, 0.02, s * 0.14] });
  for (let i = 0; i < 4; i++) add(m, box(0.06, 0.004, 0.012), 'black', { t: [(i % 2 ? 0.03 : -0.03), 0.04, -0.06 + i * 0.045], ry: deg(i % 2 ? 25 : -25) });
}

function cashewBowl(m) {
  add(m, cyl(0.15, 0.08, 0.09, 16), 'light', { t: [0, 0.045, 0] });
  add(m, cyl(0.125, 0.125, 0.004, 16), 'dark', { t: [0, 0.09, 0] });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU;
    add(m, sphere(0.032, 8, 5), 'white', { t: [Math.cos(a) * 0.06, 0.11, Math.sin(a) * 0.06], s: [1.3, 0.8, 0.9], ry: a });
  }
  add(m, sphere(0.032, 8, 5), 'white', { t: [0, 0.13, 0], s: [1.3, 0.8, 0.9] });
}

// ---------- hall ----------

function rug(m, { W, D }) {
  add(m, rbox(W, 0.02, D, 0.006), 'dark', { t: [0, 0.01, 0] });
  add(m, box(W - 0.3, 0.004, D - 0.3), 'mid', { t: [0, 0.021, 0] });
  add(m, box(W - 0.8, 0.005, D - 0.8), 'dark', { t: [0, 0.022, 0] });
  add(m, box(W - 1.4, 0.006, D - 1.4), 'mid', { t: [0, 0.023, 0] });
}

function doorMat(m, { W }) {
  const w = Math.min(W, 1.6);
  add(m, rbox(w, 0.03, 0.7, 0.008), 'dark', { t: [0, 0.015, 0] });
  for (let i = 0; i < 7; i++) add(m, box(w - 0.12, 0.012, 0.05), 'edge', { t: [0, 0.032, -0.26 + i * 0.087] });
}

function sofa(m, { W, D }) {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(m, cyl(0.05, 0.04, 0.08, 8), 'black', { t: [sx * (W / 2 - 0.2), 0.04, sz * (D / 2 - 0.2)] });
  add(m, rbox(W, 0.36, D, 0.06), 'dark', { t: [0, 0.26, 0] });
  add(m, rbox(W, 0.55, 0.42, 0.08), 'dark', { t: [0, 0.68, -D / 2 + 0.21] });
  for (const s of [-1, 1]) add(m, rbox(0.4, 0.5, D, 0.08), 'dark', { t: [s * (W / 2 - 0.2), 0.58, 0] });
  const cw = (W - 0.8) / 2 - 0.02;
  for (const s of [-1, 1]) {
    add(m, rbox(cw, 0.2, D - 0.5, 0.07), 'mid', { t: [s * ((W - 0.8) / 4), 0.54, 0.16] });
    add(m, rbox(cw, 0.4, 0.2, 0.07), 'mid', { t: [s * ((W - 0.8) / 4), 0.76, -D / 2 + 0.52], rx: deg(-10) });
  }
}

function tvBig(m, { W }) {
  add(m, box(W, 0.4, 0.55), 'dark', { t: [0, 0.2, -0.12] });
  add(m, box(W - 0.2, 0.03, 0.57), 'edge', { t: [0, 0.415, -0.12] });
  add(m, box(0.5, 0.06, 0.25), 'black', { t: [0, 0.46, -0.12] });
  add(m, box(W - 0.3, 1.05, 0.07), 'black', { t: [0, 0.99, -0.12] });
  add(m, box(W - 0.5, 0.9, 0.012), 'dark', { t: [0, 0.99, -0.078] });
  add(m, box(W - 0.9, 0.04, 0.012), 'mid', { t: [-0.1, 1.28, -0.07], rz: deg(-2) });
}

function alexa(m) {
  add(m, cyl(0.25, 0.25, 0.03, 16), 'dark', { t: [0, 0.015, 0] });
  add(m, cyl(0.035, 0.035, 0.55, 8), 'dark', { t: [0, 0.3, 0] });
  add(m, cyl(0.3, 0.3, 0.04, 16), 'mid', { t: [0, 0.6, 0] });
  add(m, cyl(0.1, 0.1, 0.26, 14), 'black', { t: [0, 0.75, 0] });
  add(m, cyl(0.103, 0.103, 0.015, 14), 'glow', { t: [0, 0.88, 0] });
  add(m, cyl(0.09, 0.09, 0.012, 14), 'dark', { t: [0, 0.885, 0] });
}

function cupboardBig(m, { W, D }) {
  const H = 2.0;
  const zf = D / 2 - 0.08; // the front face
  add(m, box(W - 0.1, 0.08, D - 0.2), 'black', { t: [0, 0.04, -0.06] });
  add(m, rbox(W, H - 0.16, D - 0.16, 0.05), 'dark', { t: [0, 0.08 + (H - 0.16) / 2, -0.04] });
  add(m, box(W, 0.08, D - 0.12), 'mid', { t: [0, H - 0.04, -0.02] });
  const dw = W / 2 - 0.04;
  for (const s of [-1, 1]) {
    add(m, box(dw, 1.62, 0.04), 'mid', { t: [s * (dw / 2 + 0.015), 1.0, zf + 0.005] });
    add(m, box(dw - 0.2, 1.4, 0.03), 'dark', { t: [s * (dw / 2 + 0.015), 1.0, zf + 0.03] });
    add(m, sphere(0.045, 8, 6), 'light', { t: [s * 0.1, 1.0, zf + 0.07] });
  }
  add(m, box(0.02, 1.66, 0.045), 'black', { t: [0, 1.0, zf + 0.01] });
}

function piano(m, { W }) {
  add(m, box(W, 1.2, 0.95), 'black', { t: [0, 0.6, -0.4] });
  add(m, box(W - 0.15, 0.3, 0.08), 'dark', { t: [0, 0.95, 0.1] });
  add(m, box(W - 0.1, 0.07, 0.62), 'dark', { t: [0, 0.69, 0.3] });
  add(m, box(W - 0.2, 0.025, 0.4), 'white', { t: [0, 0.74, 0.34] });
  const keys = 14;
  for (let i = 0; i < keys; i++) {
    const x = -((W - 0.2) / 2) + 0.12 + i * ((W - 0.2 - 0.24) / (keys - 1));
    if (i < keys - 1 && ![2, 6, 9].includes(i)) add(m, box(0.06, 0.03, 0.2), 'black', { t: [x + (W - 0.2 - 0.24) / (2 * (keys - 1)), 0.765, 0.26] });
  }
  for (const s of [-1, 1]) add(m, box(0.12, 0.04, 0.08), 'edge', { t: [s * 0.2, 0.06, 0.55] });
  for (const s of [-1, 1]) add(m, box(0.1, 0.5, 0.5), 'black', { t: [s * (W / 2 - 0.1), 0.45, 0.35] });
}

function wallClock(m, { D }) {
  const z = -D / 2 + 0.05;
  add(m, cyl(0.27, 0.27, 0.06, 20), 'dark', { t: [0, 1.8, z], rx: Math.PI / 2 });
  add(m, cyl(0.235, 0.235, 0.064, 20), 'white', { t: [0, 1.8, z + 0.002], rx: Math.PI / 2 });
  add(m, box(0.025, 0.14, 0.01), 'black', { t: [0.03, 1.84, z + 0.04], rz: deg(-35) });
  add(m, box(0.018, 0.2, 0.01), 'black', { t: [-0.02, 1.88, z + 0.045], rz: deg(15) });
  add(m, cyl(0.02, 0.02, 0.012, 8), 'black', { t: [0, 1.8, z + 0.05], rx: Math.PI / 2 });
}

function photoFrame(m, { D }) {
  const z = -D / 2 + 0.03;
  add(m, box(0.5, 0.6, 0.04), 'edge', { t: [0, 1.5, z] });
  add(m, box(0.4, 0.5, 0.02), 'white', { t: [0, 1.5, z + 0.02] });
  add(m, sphere(0.07, 10, 6), 'dark', { t: [0, 1.55, z + 0.035] });
  add(m, rbox(0.24, 0.13, 0.014, 0.02), 'dark', { t: [0, 1.4, z + 0.032] });
}

function stairs(m, { W, D }) {
  const n = 6;
  const depth = D / n;
  for (let i = 0; i < n; i++) {
    const h = (i + 1) * 0.075;
    add(m, box(W, h, depth), i % 2 ? 'mid' : 'light', { t: [0, h / 2, D / 2 - (i + 0.5) * depth] });
  }
  for (const s of [-1, 1]) add(m, box(0.06, 0.8, D), 'dark', { t: [s * (W / 2 - 0.03), 0.4 + 0.05, 0], });
}

function lift(m, { W, D }) {
  add(m, box(W, 0.04, D), 'black', { t: [0, 0.02, 0] });
  add(m, box(W - 0.3, 0.012, D - 0.3), 'dark', { t: [0, 0.046, 0] });
  const zb = -D / 2 + 0.05;
  add(m, box(W - 0.2, 2.0, 0.05), 'dark', { t: [0, 1.0, zb] });
  add(m, box(0.02, 2.0, 0.06), 'light', { t: [0, 1.0, zb + 0.005] });
  for (const s of [-1, 1]) add(m, box(0.1, 2.2, 0.1), 'edge', { t: [s * (W / 2 - 0.05), 1.1, zb] });
  add(m, box(W, 0.1, 0.1), 'edge', { t: [0, 2.15, zb] });
  add(m, cyl(0.12, 0.12, 0.01, 3), 'white', { t: [-0.4, 0.057, 0.2] });
  add(m, cyl(0.12, 0.12, 0.01, 3), 'white', { t: [0.4, 0.057, 0.2], ry: Math.PI });
}

function lampFloor(m) {
  add(m, cyl(0.2, 0.22, 0.04, 16), 'dark', { t: [0, 0.02, 0] });
  add(m, cyl(0.022, 0.022, 1.3, 8), 'edge', { t: [0, 0.7, 0] });
  add(m, cyl(0.14, 0.24, 0.32, 16, false), 'white', { t: [0, 1.44, 0] });
  add(m, sphere(0.07, 10, 6), 'glow', { t: [0, 1.38, 0] });
}

function tvRemote(m) {
  add(m, rbox(0.055, 0.02, 0.2, 0.008), 'black', { t: [0, 0.01, 0], ry: deg(15) });
  for (let i = 0; i < 5; i++) add(m, box(0.03, 0.006, 0.02), 'edge', { t: [Math.sin(deg(15)) * 0.0, 0.022, -0.06 + i * 0.03], ry: deg(15) });
}

function skates(m) {
  for (const s of [-1, 1]) {
    const x = s * 0.12;
    add(m, box(0.11, 0.025, 0.28), 'dark', { t: [x, 0.062, 0] });
    add(m, rbox(0.1, 0.16, 0.22, 0.035), 'white', { t: [x, 0.155, -0.025] });
    add(m, sphere(0.055, 8, 6), 'white', { t: [x, 0.11, 0.09], s: [1, 0.75, 1.1] });
    for (const z of [-0.1, 0.1]) for (const w of [-1, 1]) add(m, cyl(0.028, 0.028, 0.02, 10), 'black', { t: [x + w * 0.05, 0.03, z], rz: Math.PI / 2 });
  }
}

// ---------- extras that the 2D pack has no picture for ----------

function shoes(m) {
  for (const s of [-1, 1]) {
    const x = s * 0.1;
    add(m, rbox(0.12, 0.035, 0.33, 0.012), 'black', { t: [x, 0.018, 0] });
    add(m, rbox(0.11, 0.11, 0.2, 0.04), 'dark', { t: [x, 0.09, -0.04] });
    add(m, sphere(0.058, 8, 6), 'dark', { t: [x, 0.06, 0.1], s: [1, 0.85, 1.25] });
    for (let i = 0; i < 3; i++) add(m, box(0.07, 0.008, 0.012), 'white', { t: [x, 0.142 - i * 0.004, 0.02 + i * 0.03 - 0.06] });
  }
}

// ---------- people ----------

/**
 * A blocky humanoid made of rigid parts, animated by turning the joints (no skin needed).
 * Joints (all nodes): root > hips > torso > head, armL, armR; hips > legL, legR.
 */
function humanoid(m, p) {
  const { legLen, torsoH, torsoW, torsoD, headR, armLen, skin, top, bottom, shoe, hair } = p;
  const hips = m.node('hips', m.root, { t: [0, legLen, 0] });
  const torso = m.node('torso', hips);
  m.add(torso, rbox(torsoW, torsoH, torsoD, 0.04), top, { t: [0, torsoH / 2, 0] });
  m.add(torso, rbox(torsoW * 1.02, 0.12, torsoD * 1.02, 0.03), bottom, { t: [0, 0.04, 0] });
  const head = m.node('head', torso, { t: [0, torsoH + 0.035, 0] });
  m.add(head, sphere(headR, 14, 10), skin, { t: [0, headR, 0], s: [1, 1.02, 1] });
  const armL = m.node('armL', torso, { t: [-(torsoW / 2 + 0.045), torsoH - 0.05, 0] });
  const armR = m.node('armR', torso, { t: [torsoW / 2 + 0.045, torsoH - 0.05, 0] });
  for (const a of [armL, armR]) {
    m.add(a, rbox(0.075, armLen, 0.075, 0.025), top, { t: [0, -armLen / 2 + 0.02, 0] });
    m.add(a, sphere(0.05, 8, 6), skin, { t: [0, -armLen + 0.03, 0] });
  }
  const hipW = torsoW * 0.28;
  const legL = m.node('legL', hips, { t: [-hipW, 0, 0] });
  const legR = m.node('legR', hips, { t: [hipW, 0, 0] });
  for (const l of [legL, legR]) {
    m.add(l, rbox(0.1, legLen - 0.06, 0.1, 0.03), bottom, { t: [0, -(legLen - 0.06) / 2, 0] });
    m.add(l, rbox(0.12, 0.07, 0.2, 0.025), shoe, { t: [0, -legLen + 0.035, 0.04] });
  }
  return { hips, torso, head, armL, armR, legL, legR, headR, torsoD };
}

function faceFeatures(m, j, o) {
  const { head, headR } = j;
  const z = headR * 0.93;
  for (const s of [-1, 1]) {
    m.add(head, sphere(0.022, 6, 4), 'black', { t: [s * headR * 0.36, headR * 1.08, z] }); // eyes
    m.add(head, box(0.07, 0.014, 0.014), 'black', { t: [s * headR * 0.38, headR * 1.08 + o.browLift, z + 0.01], rz: s * o.browTilt }); // brows
  }
  m.add(head, box(0.07, 0.012, 0.012), 'dark', { t: [0, headR * 0.62, z + 0.015], rz: o.frown }); // mouth
  m.add(head, box(0.025, 0.04, 0.03), 'edge', { t: [0, headR * 0.88, z + 0.025] }); // nose
}

// quick keyframe helpers
function track(node, path, duration, fn, samples = 16) {
  const times = [];
  const values = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    times.push(+(t * duration).toFixed(5));
    values.push(fn(t));
  }
  return { node, path, times, values };
}
const rotX = (a) => quatFromEuler(a, 0, 0);
const swing = (a) => rotX(-a); // positive = forward (+Z)

function animate(m, j, legLen, cfg) {
  const { hips, torso, head, armL, armR, legL, legR } = j;
  const S = (t, k = 1, ph = 0) => Math.sin((t * k + ph) * TAU);
  const C = (t, k = 1, ph = 0) => Math.cos((t * k + ph) * TAU);

  m.animate('idle', [
    track(hips, 'translation', 2.4, (t) => [0, legLen + 0.008 * S(t), 0]),
    track(torso, 'rotation', 2.4, (t) => rotX(deg(1.5) * S(t))),
    track(head, 'rotation', 2.4, (t) => quatFromEuler(0, deg(4) * S(t, 1, 0.25), 0)),
    track(armL, 'rotation', 2.4, (t) => quatFromEuler(0, 0, deg(2) * S(t, 1, 0.1))),
    track(armR, 'rotation', 2.4, (t) => quatFromEuler(0, 0, -deg(2) * S(t, 1, 0.1))),
  ]);

  const gait = (name, period, legA, armA, crouch, lean) =>
    m.animate(name, [
      track(hips, 'translation', period, (t) => [0, legLen * (1 - crouch) + 0.025 * C(t, 2), 0]),
      track(torso, 'rotation', period, (t) => rotX(deg(lean) + deg(2) * S(t, 2))),
      track(head, 'rotation', period, (t) => rotX(-deg(lean) * 0.7)),
      track(legL, 'rotation', period, (t) => swing(deg(legA) * S(t))),
      track(legR, 'rotation', period, (t) => swing(-deg(legA) * S(t))),
      track(armL, 'rotation', period, (t) => swing(-deg(armA) * S(t))),
      track(armR, 'rotation', period, (t) => swing(deg(armA) * S(t))),
    ]);
  gait('walk', cfg.walkPeriod, 34, 30, 0.02, 3);
  gait('sneak', cfg.walkPeriod * 1.35, 24, 14, 0.09, 26);

  m.animate('pickup', [
    track(hips, 'translation', 1.0, (t) => [0, legLen * (1 - 0.12 * Math.sin(t * Math.PI)), 0]),
    track(torso, 'rotation', 1.0, (t) => rotX(deg(60) * Math.sin(t * Math.PI))),
    track(armL, 'rotation', 1.0, (t) => swing(deg(75) * Math.sin(t * Math.PI))),
    track(armR, 'rotation', 1.0, (t) => swing(deg(75) * Math.sin(t * Math.PI))),
    track(head, 'rotation', 1.0, (t) => rotX(-deg(35) * Math.sin(t * Math.PI))),
  ]);

  const hold = (t) => Math.min(1, t / 0.45);
  m.animate('hide', [
    track(hips, 'translation', 0.6, (t) => [0, legLen * (1 - 0.5 * hold(t)), 0]),
    track(torso, 'rotation', 0.6, (t) => rotX(deg(35) * hold(t))),
    track(legL, 'rotation', 0.6, (t) => swing(deg(85) * hold(t))),
    track(legR, 'rotation', 0.6, (t) => swing(deg(85) * hold(t))),
    track(armL, 'rotation', 0.6, (t) => swing(deg(60) * hold(t))),
    track(armR, 'rotation', 0.6, (t) => swing(deg(60) * hold(t))),
    track(head, 'rotation', 0.6, (t) => rotX(-deg(25) * hold(t))),
  ]);

  if (cfg.baddie) {
    m.animate('look_around', [
      track(head, 'rotation', 3.2, (t) => quatFromEuler(0, deg(55) * Math.sin(t * TAU) * (Math.abs(Math.sin(t * TAU)) > 0.5 ? 1 : 0.6), 0), 24),
      track(torso, 'rotation', 3.2, (t) => quatFromEuler(0, deg(14) * Math.sin(t * TAU), 0), 24),
      track(hips, 'translation', 3.2, () => [0, legLen, 0], 2),
    ]);
    m.animate('caught_you', [
      track(armR, 'rotation', 1.4, (t) => quatFromEuler(-deg(165) + deg(10) * S(t, 3), 0, deg(8) * S(t, 3))),
      track(armL, 'rotation', 1.4, (t) => quatFromEuler(0, 0, deg(40) + deg(6) * S(t, 3))),
      track(head, 'rotation', 1.4, (t) => quatFromEuler(deg(-8), deg(16) * S(t, 3), 0)),
      track(torso, 'rotation', 1.4, (t) => rotX(deg(-8) + deg(4) * S(t, 3))),
      track(hips, 'translation', 1.4, (t) => [0, legLen + 0.05 * Math.abs(S(t, 2)), 0]),
    ]);
  }
}

function anisha(m) {
  const p = { legLen: 0.42, torsoH: 0.38, torsoW: 0.3, torsoD: 0.2, headR: 0.17, armLen: 0.34, skin: 'light', top: 'white', bottom: 'mid', shoe: 'dark', hair: 'black' };
  const j = humanoid(m, p);
  m.add(j.head, sphere(p.headR * 1.06, 14, 8), 'black', { t: [0, p.headR + 0.025, -0.02], s: [1, 0.92, 1.0] }); // hair cap
  m.add(j.head, rbox(p.headR * 1.7, 0.12, 0.06, 0.02), 'black', { t: [0, p.headR * 1.55, p.headR * 0.78] }); // fringe
  for (const s of [-1, 1]) {
    m.add(j.head, cyl(0.045, 0.03, 0.2, 8), 'black', { t: [s * (p.headR + 0.06), p.headR * 0.75, -0.02], rz: s * deg(-20) }); // pigtails
    m.add(j.head, sphere(0.028, 6, 4), 'white', { t: [s * (p.headR + 0.03), p.headR * 1.25, -0.02] });
  }
  faceFeatures(m, j, { browLift: 0.04, browTilt: deg(8), frown: 0 });
  animate(m, j, p.legLen, { walkPeriod: 0.7, baddie: false });
}

function scaryTeacher(m) {
  const p = { legLen: 0.78, torsoH: 0.55, torsoW: 0.42, torsoD: 0.26, headR: 0.17, armLen: 0.56, skin: 'light', top: 'dark', bottom: 'black', shoe: 'black', hair: 'black' };
  const j = humanoid(m, p);
  m.add(j.head, sphere(p.headR * 1.05, 14, 8), 'black', { t: [0, p.headR + 0.03, -0.02] }); // hair
  m.add(j.head, sphere(0.08, 8, 6), 'black', { t: [0, p.headR * 2.05, -0.06] }); // bun
  faceFeatures(m, j, { browLift: 0.045, browTilt: deg(-22), frown: deg(8) });
  for (const s of [-1, 1]) m.add(j.head, cyl(0.04, 0.04, 0.012, 10), 'edge', { t: [s * p.headR * 0.36, p.headR * 1.08, p.headR * 0.97], rx: Math.PI / 2 }); // glasses
  m.add(j.torso, box(0.1, 0.03, 0.02), 'white', { t: [0, p.torsoH - 0.05, p.torsoD / 2 + 0.005] }); // collar
  m.add(j.armR, box(0.025, 0.55, 0.025), 'mid', { t: [0, -0.62, 0.1], rx: deg(0) }); // a pointing stick
  animate(m, j, p.legLen, { walkPeriod: 1.0, baddie: true });
}

// ---------- the registry ----------

/** id -> { build, kind } where kind is 'object' (sized from the pack) or 'character'/'extra' (own size). */
export const RECIPES = {
  fridge: { build: fridge },
  counter: { build: counter },
  gas_stove: { build: gasStove },
  sink: { build: sink },
  table_dining: { build: tableDining },
  chair: { build: chair },
  spice_rack: { build: spiceRack },
  cement_bag: { build: cementBag },
  hanging_bulb: { build: hangingBulb },
  knife: { build: knife },
  chilli: { build: chilli },
  lemon: { build: lemon },
  salt_jar: { build: saltJar },
  sugar_jar: { build: sugarJar },
  tea_cup: { build: teaCup },
  maggi_packet: { build: maggiPacket },
  cashew_bowl: { build: cashewBowl },
  rug: { build: rug },
  front_door_mat: { build: doorMat },
  sofa: { build: sofa },
  tv_big: { build: tvBig },
  alexa: { build: alexa },
  cupboard_big: { build: cupboardBig },
  piano: { build: piano },
  wall_clock: { build: wallClock },
  photo_frame: { build: photoFrame },
  stairs: { build: stairs },
  lift: { build: lift },
  lamp_floor: { build: lampFloor },
  tv_remote: { build: tvRemote },
  skates: { build: skates },
  shoes: { build: shoes, kind: 'extra', foot: [1.4, 1.0] },
  anisha: { build: anisha, kind: 'character', foot: [0.8, 0.8], maxTris: 8000 },
  scary_teacher: { build: scaryTeacher, kind: 'character', foot: [1.0, 1.0], maxTris: 8000 },
};
