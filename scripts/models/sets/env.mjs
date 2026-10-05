// Town streets and greenery (the environment strip of docs/art/reference/01-asset-pack-overview.webp):
// roads, pavements, lamps, bins, cones, bushes and pine trees.
import { kit } from '../kit.mjs';
import { P } from '../pal.mjs';

const K = (m) => kit(m);
const ASPHALT = '#4b4e57';
const KERB = '#c9c6bd';

function tree_pine(m) {
  const k = K(m);
  k.cn(P.brown, 0.14, 0.09, 0.9, [0, 0, 0], { seg: 7 });
  const g = ['#2f7a45', '#3b8c4f', '#2a6c3e', '#46a05a'];
  [[0.95, 0.7, 0.5], [0.75, 1.15, 0.5], [0.55, 1.55, 0.5], [0.35, 1.95, 0.45]].forEach(([r, y, h], i) => k.cn(g[i], r, 0.0, h * 1.2, [0, y, 0], { seg: 9 }));
  k.sp('#f2d65a', 0.07, [0, 2.55, 0]);
}

function bush_round(m, { W }) {
  const k = K(m);
  k.bx('#5aa84c', [1.2, 0.04, 1.2], [0, 0, 0], { r: 0.02 });
  k.bl(P.green, 0.55, [0, 0.5, 0], { seed: 6, sy: 0.85, jitter: 0.1, detail: 2 });
  k.bl(P.greenLight, 0.3, [0.35, 0.65, 0.2], { seed: 7, jitter: 0.1 });
  for (let i = 0; i < 6; i++) k.sp(i % 2 ? P.yellow : P.orange, 0.04, [Math.cos(i * 1.1) * 0.45, 0.4 + (i % 3) * 0.12, Math.sin(i * 1.1) * 0.45 + 0.1], { ws: 6, hs: 4 });
}

function bin_blue(m) {
  const k = K(m);
  k.cn('#3b6fc4', 0.28, 0.32, 0.8, [0, 0, 0], { seg: 12 });
  k.cn('#315ca6', 0.33, 0.3, 0.07, [0, 0.8, 0], { seg: 12 });
  k.rc('#315ca6', 0.2, 0.05, [0, 0.86, 0], { e: 0.02, seg: 10 });
  k.bx(P.white, [0.2, 0.2, 0.004], [0, 0.4, 0.3], { rx: 0.0 });
  for (const s of [-1, 1]) k.cy(P.charcoal, 0.07, 0.04, [s * 0.26, 0.0, -0.1], { rz: Math.PI / 2, seg: 8 });
}

function traffic_cone(m) {
  const k = K(m);
  k.bx('#2a2c32', [0.34, 0.04, 0.34], [0, 0, 0], { r: 0.01 });
  k.cn(P.orange, 0.15, 0.04, 0.55, [0, 0.04, 0], { seg: 12 });
  k.cn(P.white, 0.1, 0.07, 0.1, [0, 0.26, 0], { seg: 12 });
  k.cy(P.orange, 0.04, 0.03, [0, 0.58, 0], { seg: 8 });
}

function bollard(m) {
  const k = K(m);
  k.cy('#2a2c32', 0.1, 0.6, [0, 0, 0], { seg: 10 });
  k.sp('#2a2c32', 0.1, [0, 0.6, 0]);
  k.cy('#4a4d56', 0.12, 0.05, [0, 0.0, 0], { seg: 10 });
  k.cy(P.yellow, 0.102, 0.06, [0, 0.4, 0], { seg: 10 });
}

function street_lamp_simple(m) {
  const k = K(m);
  m.mat('lampGlow', '#ffe9a8', { e: '#ffcf66' });
  k.cy('#25262b', 0.12, 0.08, [0, 0, 0], { seg: 8 });
  k.cn('#25262b', 0.04, 0.03, 3.0, [0, 0.08, 0], { seg: 8 });
  k.tb('#25262b', [[0, 3.0, 0], [0.2, 3.18, 0], [0.55, 3.15, 0]], 0.03, [0, 0, 0], { seg: 6 });
  k.bx('#25262b', [0.4, 0.06, 0.2], [0.55, 3.1, 0], { r: 0.02 });
  k.bx('lampGlow', [0.34, 0.03, 0.15], [0.55, 3.07, 0]);
}

/** A tile of road with kerbs and dashed centre line (4 x 4). */
function road_straight(m, { W, D }) {
  const k = K(m);
  const w = 3.96;
  k.bx(ASPHALT, [w, 0.06, w], [0, 0, 0]);
  for (let i = 0; i < 3; i++) k.bx('#f2eee2', [0.12, 0.062, 0.7], [0, 0, -1.4 + i * 1.4]);
  for (const s of [-1, 1]) {
    k.bx(KERB, [0.35, 0.14, w], [s * (w / 2 - 0.18), 0, 0], { r: 0.02 });
    k.bx('#e8e5dc', [0.02, 0.145, w - 0.1], [s * (w / 2 - 0.34), 0, 0]);
  }
}

function road_corner(m) {
  const k = K(m);
  const w = 3.96;
  k.bx(ASPHALT, [w, 0.06, w], [0, 0, 0]);
  k.bx(KERB, [0.35, 0.14, w], [-(w / 2 - 0.18), 0, 0], { r: 0.02 });
  k.bx(KERB, [w, 0.14, 0.35], [0, 0, -(w / 2 - 0.18)], { r: 0.02 });
  k.bx(KERB, [0.7, 0.14, 0.7], [(w / 2 - 0.4), 0, (w / 2 - 0.4)], { r: 0.1 });
  for (let i = 0; i < 2; i++) k.bx('#f2eee2', [0.12, 0.062, 0.7], [0.4, 0, 0.0 + i * 1.2 - 0.3]);
  for (let i = 0; i < 2; i++) k.bx('#f2eee2', [0.7, 0.062, 0.12], [0.3 + i * 1.2 - 0.2, 0, 0.4]);
}

function road_junction(m) {
  const k = K(m);
  const w = 3.96;
  k.bx(ASPHALT, [w, 0.06, w], [0, 0, 0]);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.bx(KERB, [0.7, 0.14, 0.7], [x * (w / 2 - 0.4), 0, z * (w / 2 - 0.4)], { r: 0.1 });
  for (let i = 0; i < 5; i++) {
    k.bx('#f2eee2', [0.4, 0.062, 0.14], [-1.0 + i * 0.5, 0, -1.45]);
    k.bx('#f2eee2', [0.4, 0.062, 0.14], [-1.0 + i * 0.5, 0, 1.45]);
  }
}

function pavement(m) {
  const k = K(m);
  k.bx('#d9d4c6', [3.96, 0.1, 3.96], [0, 0, 0]);
  for (let i = -1; i <= 1; i++) {
    k.bx('#c7c1b2', [3.9, 0.012, 0.04], [0, 0.1, i * 1.3]);
    k.bx('#c7c1b2', [0.04, 0.012, 3.9], [i * 1.3, 0.1, 0]);
  }
  k.bx('#e6e1d3', [3.96, 0.11, 0.2], [0, 0, 1.88]);
}

function grass_tile(m) {
  const k = K(m);
  k.bx('#6bb457', [3.96, 0.08, 3.96], [0, 0, 0]);
  for (let i = 0; i < 14; i++) {
    const x = Math.sin(i * 12.9) * 1.7;
    const z = Math.cos(i * 7.3) * 1.7;
    k.fr('#58a246', 0.1, 0.02, 0.0, 0.0, 0.14, [x, 0.08, z]);
  }
  for (const [x, z, c] of [[-1.2, 0.8, P.pink], [1.3, -0.9, P.yellow], [0.4, 1.4, P.white], [-0.6, -1.4, P.orange]]) {
    k.cy(P.greenDark, 0.01, 0.1, [x, 0.08, z], { seg: 4 });
    k.sp(c, 0.045, [x, 0.2, z], { ws: 6, hs: 4 });
  }
}

export const RECIPES = {
  tree_pine: { build: tree_pine, kind: 'extra', foot: [2.0, 2.0], name: 'Pine tree' },
  bush_round: { build: bush_round, kind: 'extra', foot: [1.4, 1.4], name: 'Round bush' },
  bin_blue: { build: bin_blue, kind: 'extra', foot: [0.8, 0.8], name: 'Blue bin' },
  traffic_cone: { build: traffic_cone, kind: 'extra', foot: [0.4, 0.4], name: 'Traffic cone' },
  bollard: { build: bollard, kind: 'extra', foot: [0.3, 0.3], name: 'Bollard' },
  street_lamp_simple: { build: street_lamp_simple, kind: 'extra', foot: [1.2, 0.5], name: 'Simple street lamp' },
  road_straight: { build: road_straight, kind: 'extra', foot: [4.0, 4.0], name: 'Road (straight)' },
  road_corner: { build: road_corner, kind: 'extra', foot: [4.0, 4.0], name: 'Road (corner)' },
  road_junction: { build: road_junction, kind: 'extra', foot: [4.0, 4.0], name: 'Road (junction)' },
  pavement: { build: pavement, kind: 'extra', foot: [4.0, 4.0], name: 'Pavement' },
  grass_tile: { build: grass_tile, kind: 'extra', foot: [4.0, 4.0], name: 'Grass' },
};
