// Vehicles (the vehicles strip of docs/art/reference/01-asset-pack-overview.webp, plus the school bus and ambulance from the banner).
// Front is +Z. Wheels are made of a tyre, a rim and thin spokes.
import { kit } from '../kit.mjs';
import { P } from '../pal.mjs';

const K = (m) => kit(m);
const TYRE = '#1d1e22';

/** A wheel standing on the floor with its centre at (x, r, z). axis is along X. */
function wheel(k, x, z, r, w, rim = P.steel, spokes = 0) {
  k.cy(TYRE, r, w, [x, r - w / 2, z], { rz: Math.PI / 2, seg: 20 });
  k.cy(rim, r * 0.72, w + 0.012, [x, r - (w + 0.012) / 2, z], { rz: Math.PI / 2, seg: 16 });
  k.cy(TYRE, r * 0.62, w + 0.014, [x, r - (w + 0.014) / 2, z], { rz: Math.PI / 2, seg: 16 });
  k.cy(rim, r * 0.16, w + 0.03, [x, r - (w + 0.03) / 2, z], { rz: Math.PI / 2, seg: 8 });
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI;
    k.tb(rim, [[x, r + Math.cos(a) * r * 0.66, z + Math.sin(a) * r * 0.66], [x, r - Math.cos(a) * r * 0.66, z - Math.sin(a) * r * 0.66]], 0.004, [0, 0, 0], { seg: 3 });
  }
}

/** A pink scooty (the colours can be changed later: the body is one material). */
function scooty(m) {
  const k = K(m);
  m.mat('scootyBody', '#ee4aa0', { r: 0.4 });
  const B = 'scootyBody';
  wheel(k, 0, 0.7, 0.2, 0.1, P.steel, 0);
  wheel(k, 0, -0.65, 0.19, 0.12, P.steel, 0);
  k.bx(B, [0.42, 0.08, 1.2], [0, 0.2, 0.0], { r: 0.03 });                  // floorboard
  k.bx(B, [0.4, 0.45, 0.8], [0, 0.28, -0.55], { r: 0.1 });                  // rear body
  k.bx(B, [0.46, 0.6, 0.12], [0, 0.2, 0.55], { r: 0.05, rx: 0.15 });         // front shield
  k.bx(B, [0.26, 0.05, 0.35], [0, 0.6, 0.8], { r: 0.02 });                 // front fender
  k.bx(P.charcoal, [0.34, 0.1, 0.7], [0, 0.72, -0.5], { r: 0.04 });         // seat
  k.bx(B, [0.3, 0.18, 0.2], [0, 0.45, -0.95], { r: 0.05 });                // tail
  k.bx('#ff4545', [0.2, 0.05, 0.03], [0, 0.55, -1.04]);
  k.tb(P.steelDark, [[0, 0.2, 0.7], [0, 0.55, 0.78], [0, 0.95, 0.7]], 0.03);
  k.bx(B, [0.34, 0.2, 0.2], [0, 0.95, 0.68], { r: 0.06 });                 // headlight cowl
  m.mat('headLamp', '#fff4c8', { e: '#ffeaa0' });
  k.sp('headLamp', 0.06, [0, 1.03, 0.8], { sz: 0.6 });
  k.bx(P.charcoal, [0.7, 0.04, 0.05], [0, 1.1, 0.62], { r: 0.015 });
  for (const s of [-1, 1]) {
    k.sp(P.black, 0.04, [s * 0.35, 1.1, 0.62]);
    k.tb(P.steelDark, [[s * 0.3, 1.12, 0.62], [s * 0.34, 1.3, 0.6]], 0.01, [0, 0, 0], { seg: 4 });
    k.bx(P.steel, [0.1, 0.07, 0.015], [s * 0.34, 1.34, 0.6]);
  }
  k.bx(P.steel, [0.1, 0.12, 0.35], [-0.18, 0.18, -0.5]);                   // exhaust
}

/** A black classic motorbike with chrome, a round headlight and a tank. */
function bullet_bike(m) {
  const k = K(m);
  const chrome = '#cfd3da';
  wheel(k, 0, 0.78, 0.33, 0.1, chrome, 14);
  wheel(k, 0, -0.78, 0.33, 0.12, chrome, 14);
  k.bx(P.black, [0.18, 0.08, 1.0], [0, 0.55, 0.0], { r: 0.03 });             // frame
  k.sp('#1b1c22', 0.2, [0, 0.9, 0.2], { sy: 0.8, sz: 1.5, ws: 14, hs: 8 });    // tank
  k.sp('#2a2c34', 0.1, [0, 0.98, 0.25], { sy: 0.5, sz: 1.4, ws: 10, hs: 6 });
  k.sp(P.red, 0.03, [0, 1.07, 0.38], { sy: 0.4 });
  k.bx(P.charcoal, [0.34, 0.1, 0.55], [0, 0.84, -0.32], { r: 0.04 });        // seat
  k.bx('#7a4a2d', [0.3, 0.02, 0.45], [0, 0.94, -0.32], { r: 0.01 });
  k.bx(chrome, [0.28, 0.3, 0.32], [0, 0.45, 0.0], { r: 0.03 });             // engine
  k.cy(chrome, 0.07, 0.3, [0, 0.76, 0.05], { seg: 10 });
  for (let i = 0; i < 4; i++) k.bx('#9aa0aa', [0.3, 0.02, 0.3], [0, 0.55 + i * 0.05, 0.0]);
  k.tb(P.steelDark, [[0, 0.33, 0.78], [0, 0.7, 0.72], [0, 1.2, 0.62]], 0.03, [0, 0, 0], { seg: 6 });
  m.mat('headLamp', '#fff4c8', { e: '#ffeaa0' });
  k.cy(chrome, 0.1, 0.08, [0, 0.98, 0.72], { rx: Math.PI / 2, seg: 14 });
  k.sp('headLamp', 0.075, [0, 1.06, 0.78], { sz: 0.7 });
  k.bx(P.black, [0.9, 0.03, 0.04], [0, 1.2, 0.62], { r: 0.01 });
  for (const s of [-1, 1]) {
    k.sp(P.black, 0.04, [s * 0.45, 1.2, 0.62]);
    k.sp(chrome, 0.05, [s * 0.35, 1.38, 0.58], { sy: 0.8 });
  }
  k.cn(chrome, 0.07, 0.05, 1.1, [0.2, 0.28, -0.35], { rx: Math.PI / 2, seg: 10 });   // exhaust
  k.cy(chrome, 0.075, 0.12, [0.2, 0.28, -0.98], { rx: Math.PI / 2, seg: 10 });
  k.bx(P.black, [0.14, 0.04, 0.55], [0, 0.68, 1.02], { r: 0.015 });        // front fender
  k.bx(P.black, [0.16, 0.04, 0.55], [0, 0.76, -1.0], { r: 0.015 });         // rear fender
  k.bx(P.red, [0.12, 0.04, 0.02], [0, 0.78, -1.28]);
  k.bx(P.steelDark, [0.04, 0.3, 0.04], [0.15, 0.0, -0.2], { rx: 0.5 });      // stand
}

/** Big blue bicycle with a brown saddle and grips. */
function bicycle_big(m) {
  const k = K(m);
  const blue = '#3fa6c9';
  const r = 0.38;
  wheel(k, 0, 0.78, r, 0.05, '#d8dde5', 18);
  wheel(k, 0, -0.78, r, 0.05, '#d8dde5', 18);
  const bb = [0, 0.32, -0.12];
  const tube = (a, b, rad = 0.025) => k.tb(blue, [a, b], rad, [0, 0, 0], { seg: 6 });
  tube([0, r, -0.78], [0, 0.78, -0.35]);               // seat stay
  tube([0, r, -0.78], bb);                              // chain stay
  tube(bb, [0, 0.8, -0.32]);                            // seat tube
  tube(bb, [0, 0.82, 0.5]);                             // down tube
  tube([0, 0.82, -0.32], [0, 0.88, 0.5]);               // top tube
  tube([0, 0.88, 0.5], [0, r, 0.78]);                   // fork
  tube([0, 0.82, 0.5], [0, 0.95, 0.5], 0.03);
  k.tb(P.steelDark, [[0, 0.78, -0.33], [0, 0.98, -0.34]], 0.016, [0, 0, 0], { seg: 5 });
  k.bx('#8a5a35', [0.12, 0.06, 0.26], [0, 0.98, -0.38], { r: 0.025 });                 // saddle
  k.tb(P.steelDark, [[0, 0.95, 0.5], [0, 1.02, 0.5]], 0.018, [0, 0, 0], { seg: 5 });
  k.bx(P.steelDark, [0.55, 0.025, 0.025], [0, 1.03, 0.5]);                             // bars
  for (const s of [-1, 1]) {
    k.cy('#8a5a35', 0.02, 0.12, [s * 0.3, 1.03, 0.5], { rz: Math.PI / 2, seg: 8 });
    k.tb(P.steelDark, [[s * 0.3, 1.03, 0.5], [s * 0.3, 0.96, 0.58]], 0.012, [0, 0, 0], { seg: 4 });
  }
  k.cy(P.steel, 0.09, 0.02, [0.05, 0.31, -0.12], { rz: Math.PI / 2, seg: 12 });         // chainring
  for (const s of [-1, 1]) {
    k.bx(P.black, [0.08, 0.025, 0.1], [s * 0.12, 0.25 + (s > 0 ? 0.18 : 0), -0.12 + (s > 0 ? 0.0 : 0)]);
    k.tb(P.steelDark, [[s * 0.07, 0.32, -0.12], [s * 0.12, 0.25 + (s > 0 ? 0.0 : 0.15), -0.12]], 0.012, [0, 0, 0], { seg: 4 });
  }
  k.bx(P.red, [0.07, 0.04, 0.02], [0, 0.72, -1.2]);
}

/** A friendly yellow school bus (long: 2.6 x 7). */
function school_bus(m) {
  const k = K(m);
  const Y = '#f6c31c';
  m.mat('busGlass', '#8fb9cf', { r: 0.1 });
  k.bx(Y, [2.4, 1.9, 6.4], [0, 0.55, -0.4], { r: 0.1, n: 2 });
  k.bx(Y, [2.3, 1.1, 1.4], [0, 0.55, 3.4], { r: 0.1 });
  k.bx(P.black, [2.45, 0.1, 6.4], [0, 1.2, -0.4]);
  k.bx(P.black, [2.45, 0.1, 6.4], [0, 0.85, -0.4]);
  k.bx(P.charcoal, [2.5, 0.28, 7.6], [0, 0.35, 0.0], { r: 0.05 });                    // bumpers and skirt
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) k.bx('busGlass', [0.03, 0.62, 0.8], [s * 1.2, 1.33, -2.7 + i * 1.05]);
  k.bx('busGlass', [1.9, 0.75, 0.04], [0, 1.45, 2.78]);
  k.bx('busGlass', [2.0, 0.8, 0.04], [0, 1.25, 4.08], { rx: -0.35 });
  k.bx(P.black, [2.3, 0.1, 0.1], [0, 1.2, -3.65]);
  for (const s of [-1, 1]) {
    for (const z of [2.7, -2.0]) wheel(k, s * 1.1, z, 0.5, 0.35, P.greyLight, 0);
    k.sp('#fff4c8', 0.12, [s * 0.8, 0.9, 4.15], { sz: 0.5 });
    k.sp('#ff4545', 0.1, [s * 1.0, 1.2, -3.62], { sz: 0.4 });
  }
  k.bx(P.red, [0.04, 0.5, 0.5], [1.22, 1.55, 3.0], { r: 0.01 });
  k.bx(P.white, [0.06, 0.2, 0.2], [1.25, 1.62, 3.0]);
  k.bx(P.black, [0.9, 0.18, 0.05], [0, 2.42, 3.0]);
  k.bx(P.white, [0.8, 0.12, 0.04], [0, 2.45, 3.03]);
  for (let i = 0; i < 4; i++) k.sp(i % 2 ? P.red : '#ff9a30', 0.05, [-0.6 + i * 0.4, 2.45, 3.35], { sz: 0.3 });
  k.bx(P.black, [2.3, 0.06, 6.0], [0, 2.44, -0.5], { r: 0.02 });
}

/** White ambulance with red stripes, a red cross and a light bar. */
function ambulance(m) {
  const k = K(m);
  m.mat('busGlass', '#8fb9cf', { r: 0.1 });
  k.bx(P.white, [2.0, 1.9, 3.5], [0, 0.6, -0.9], { r: 0.1 });
  k.bx(P.white, [1.95, 1.1, 1.8], [0, 0.6, 1.8], { r: 0.1 });
  k.bx(P.white, [1.9, 0.9, 1.0], [0, 1.2, 1.6], { r: 0.1, rx: -0.15 });
  k.bx(P.charcoal, [2.05, 0.3, 5.5], [0, 0.35, 0.0], { r: 0.05 });
  k.bx(P.red, [2.02, 0.2, 4.6], [0, 1.0, -0.2], { r: 0.01 });
  k.bx(P.red, [2.02, 0.2, 4.6], [0, 1.4, -0.2], { r: 0.01 });
  for (const s of [-1, 1]) {
    k.bx('busGlass', [0.03, 0.55, 0.7], [s * 0.99, 1.7, 1.35]);
    k.bx(P.red, [0.04, 0.5, 0.5], [s * 1.02, 1.55, -0.9]);
    k.bx(P.white, [0.05, 0.14, 0.4], [s * 1.04, 1.55, -0.9]);
    k.bx(P.white, [0.05, 0.4, 0.14], [s * 1.04, 1.55, -0.9]);
    for (const z of [1.7, -1.4]) wheel(k, s * 0.9, z, 0.42, 0.28, P.greyLight, 0);
    k.sp('#fff4c8', 0.11, [s * 0.7, 0.8, 2.7], { sz: 0.5 });
    k.sp('#ff4545', 0.09, [s * 0.9, 1.4, -2.65], { sz: 0.4 });
  }
  k.bx('busGlass', [1.7, 0.7, 0.04], [0, 1.6, 2.1], { rx: -0.35 });
  k.bx(P.white, [1.9, 1.2, 0.04], [0, 0.7, -2.62]);
  k.bx(P.red, [0.5, 0.5, 0.03], [0, 1.4, -2.64]);
  k.bx(P.white, [0.14, 0.4, 0.04], [0, 1.4, -2.65]);
  k.bx(P.white, [0.4, 0.14, 0.04], [0, 1.4, -2.65]);
  k.bx(P.black, [1.4, 0.12, 0.3], [0, 2.5, 0.2], { r: 0.03 });
  k.bx('#ff3b3b', [0.55, 0.12, 0.3], [-0.45, 2.52, 0.2], { r: 0.03 });
  k.bx('#3b8bff', [0.55, 0.12, 0.3], [0.45, 2.52, 0.2], { r: 0.03 });
}

/** A small red car (2 x 3). */
function car_parked(m) {
  const k = K(m);
  m.mat('busGlass', '#9cc3d6', { r: 0.1 });
  const C = '#e2434f';
  k.bx(C, [1.5, 0.55, 2.7], [0, 0.35, 0.0], { r: 0.15, n: 3 });
  k.bx(C, [1.35, 0.5, 1.5], [0, 0.85, -0.2], { r: 0.18, n: 3 });
  k.bx('busGlass', [1.3, 0.38, 1.3], [0, 0.9, -0.2], { r: 0.1 });
  k.bx(C, [1.4, 0.08, 1.2], [0, 1.3, -0.2], { r: 0.04 });
  k.bx(P.charcoal, [1.55, 0.18, 2.75], [0, 0.22, 0.0], { r: 0.04 });
  for (const s of [-1, 1]) {
    for (const z of [0.9, -0.9]) wheel(k, s * 0.72, z, 0.3, 0.2, P.greyLight, 0);
    k.sp('#fff4c8', 0.1, [s * 0.5, 0.58, 1.35], { sz: 0.5 });
    k.sp('#ff5252', 0.08, [s * 0.52, 0.6, -1.35], { sz: 0.5 });
    k.sp(P.black, 0.05, [s * 0.76, 0.9, 0.5]);
  }
  k.bx(P.white, [0.5, 0.12, 0.02], [0, 0.35, 1.36]);
}

function toy_car(m) {
  const k = K(m);
  const C = P.red;
  k.bx(C, [0.38, 0.12, 0.7], [0, 0.07, 0.0], { r: 0.04 });
  k.bx(C, [0.32, 0.13, 0.34], [0, 0.18, -0.06], { r: 0.05 });
  k.bx('#bfe3f5', [0.28, 0.09, 0.3], [0, 0.2, -0.06], { r: 0.03 });
  for (const s of [-1, 1]) for (const z of [0.22, -0.22]) {
    k.cy(P.charcoal, 0.1, 0.07, [s * 0.2, 0.1 - 0.035, z], { rz: Math.PI / 2, seg: 12 });
    k.cy(P.yellow, 0.05, 0.075, [s * 0.2, 0.1 - 0.0375, z], { rz: Math.PI / 2, seg: 8 });
  }
  k.sp(P.yellow, 0.035, [0.1, 0.12, 0.34], { sz: 0.5 });
  k.sp(P.yellow, 0.035, [-0.1, 0.12, 0.34], { sz: 0.5 });
}

/** Bus stop shelter with a bench and a round sign (3 x 1). */
function bus_stop(m, { W }) {
  const k = K(m);
  const w = Math.min(W, 2.9);
  m.mat('shelterGlass', '#bfe0ee', { r: 0.1, a: 0.4 });
  for (const s of [-1, 1]) k.bx(P.blueDark, [0.1, 2.3, 0.1], [s * (w / 2 - 0.1), 0, -0.3], { r: 0.015 });
  k.bx(P.blue, [w, 0.12, 0.9], [0, 2.3, 0.0], { r: 0.04 });
  k.bx('shelterGlass', [w - 0.2, 1.7, 0.03], [0, 0.5, -0.32]);
  for (const s of [-1, 1]) k.bx('shelterGlass', [0.03, 1.7, 0.6], [s * (w / 2 - 0.1), 0.5, 0.0]);
  k.bx(P.woodLight, [w - 0.6, 0.07, 0.4], [0, 0.45, -0.1], { r: 0.015 });
  for (const s of [-1, 1]) k.bx(P.steelDark, [0.06, 0.45, 0.35], [s * (w / 2 - 0.5), 0, -0.1]);
  k.cy(P.steelDark, 0.03, 2.6, [w / 2 + 0.2, 0, 0.1], { seg: 8 });
  k.cy(P.yellow, 0.22, 0.04, [w / 2 + 0.2, 2.3, 0.1], { rx: Math.PI / 2, seg: 18 });
  k.cy(P.blueDark, 0.16, 0.045, [w / 2 + 0.2, 2.34, 0.1], { rx: Math.PI / 2, seg: 14 });
  k.bx(P.white, [0.2, 0.05, 0.05], [w / 2 + 0.2, 2.44, 0.14]);
  k.bx(P.white, [0.05, 0.2, 0.05], [w / 2 + 0.2, 2.36, 0.14]);
}

export const RECIPES = {
  scooty: { build: scooty, maxTris: 6000 },
  bullet_bike: { build: bullet_bike, maxTris: 6000 },
  bicycle_big: { build: bicycle_big, maxTris: 6000 },
  school_bus: { build: school_bus, kind: 'vehicle', foot: [2.7, 8.0], name: 'School bus' },
  ambulance: { build: ambulance, kind: 'vehicle', foot: [2.2, 5.6], name: 'Ambulance' },
  car_parked: { build: car_parked, maxTris: 6000 },
  toy_car: { build: toy_car },
  bus_stop: { build: bus_stop },
};
