// Small game items: food, tools, bottles and things for the pranks
// (the "game objects / items" strip of docs/art/reference/01-asset-pack-overview.webp, and what the tasks need).
// Pickups are chunky and a little bigger than life so they read at small size. Origin is the centre of the base.
import { kit } from '../kit.mjs';
import { P } from '../pal.mjs';

const K = (m) => kit(m);

function cake_slice(m) {
  const k = K(m);
  k.cy(P.white, 0.2, 0.02, [0, 0, 0], { seg: 16 });
  k.bx('#f7d2e1', [0.26, 0.2, 0.2], [0, 0.02, 0], { r: 0.015 });
  k.bx('#f2b6cf', [0.27, 0.05, 0.21], [0, 0.22, 0], { r: 0.02 });
  k.bx('#fff4f7', [0.27, 0.025, 0.21], [0, 0.12, 0], { r: 0.01 });
  k.sp(P.red, 0.04, [-0.06, 0.29, 0], { ws: 8, hs: 6 });
  k.sp('#ffd24a', 0.025, [0.06, 0.27, 0.04]);
}

function chocolate_bar(m) {
  const k = K(m);
  k.bx('#5a3320', [0.34, 0.1, 0.26], [0, 0, 0], { r: 0.02 });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) k.bx('#6d4129', [0.09, 0.02, 0.1], [-0.1 + i * 0.1, 0.1, -0.06 + j * 0.12], { r: 0.008 });
  k.bx(P.gold, [0.12, 0.05, 0.002], [0.1, 0.03, 0.131]);
}

function plum_bowl(m) {
  const k = K(m);
  k.lt(P.white, [[0, 0], [0.1, 0], [0.14, 0.04], [0.24, 0.14], [0.22, 0.14], [0.12, 0.06], [0, 0.04]], [0, 0, 0], { seg: 16 });
  for (const [x, y, z] of [[-0.08, 0.14, 0.02], [0.08, 0.14, -0.04], [0.0, 0.16, 0.1], [0.02, 0.2, -0.02]]) k.sp('#b02a4a', 0.075, [x, y, z], { ws: 10, hs: 6 });
  k.sp('#d94a6a', 0.025, [0.0, 0.25, 0.0]);
}

function toffee_box(m) {
  const k = K(m);
  k.bx('#f2a53a', [0.3, 0.2, 0.26], [0, 0, 0], { r: 0.02 });
  k.bx('#c97a16', [0.31, 0.04, 0.27], [0, 0.18, 0], { r: 0.01 });
  k.bx(P.yellow, [0.2, 0.08, 0.004], [0, 0.06, 0.133]);
  k.sp(P.red, 0.03, [0, 0.1, 0.136], { sz: 0.1 });
}

function stapler(m) {
  const k = K(m);
  k.bx(P.charcoal, [0.34, 0.05, 0.12], [0, 0, 0], { r: 0.02 });
  k.bx(P.greyDark, [0.32, 0.07, 0.1], [0, 0.05, -0.0], { r: 0.025, rx: 0.1 });
  k.bx(P.red, [0.08, 0.02, 0.1], [-0.1, 0.12, 0.0], { r: 0.008 });
}

function kitchen_knife(m) {
  const k = K(m);
  k.bx('#e4e8ee', [0.05, 0.015, 0.4], [0, 0.0, 0.1], { r: 0.003 });
  k.fr('#e4e8ee', 0.05, 0.015, 0.0, 0.015, 0.0, [0, 0, 0.3]);
  k.bx(P.orange, [0.07, 0.04, 0.22], [0, 0.0, -0.2], { r: 0.015 });
  k.bx(P.steel, [0.075, 0.042, 0.02], [0, 0.0, -0.09]);
}

function sauce_bottle(m) {
  const k = K(m);
  k.lt('#d9561a', [[0, 0], [0.08, 0], [0.09, 0.04], [0.09, 0.2], [0.05, 0.28], [0.04, 0.34], [0.0, 0.34]], [0, 0, 0], { seg: 12 });
  k.cy(P.blueDark, 0.045, 0.06, [0, 0.34, 0], { seg: 10 });
  k.bx(P.white, [0.1, 0.1, 0.004], [0, 0.07, 0.09]);
}

function milk_bottle(m) {
  const k = K(m);
  k.lt('#f5f3ee', [[0, 0], [0.09, 0], [0.1, 0.04], [0.1, 0.22], [0.05, 0.32], [0.045, 0.36], [0.0, 0.36]], [0, 0, 0], { seg: 12 });
  k.cy(P.yellow, 0.052, 0.07, [0, 0.36, 0], { seg: 10 });
  k.bx('#cfe4f7', [0.12, 0.12, 0.004], [0, 0.07, 0.1]);
}

function hammer(m) {
  const k = K(m);
  k.bx('#a9763f', [0.05, 0.03, 0.4], [0, 0, 0], { r: 0.012 });
  k.bx('#6d737d', [0.09, 0.08, 0.2], [0, 0.0, 0.2], { r: 0.015, ry: 0 });
  k.bx('#9aa1ac', [0.09, 0.05, 0.08], [0, 0.0, 0.32], { r: 0.01 });
  k.bx(P.red, [0.052, 0.032, 0.1], [0, 0.0, -0.15], { r: 0.012 });
}

function milk_carton(m) {
  const k = K(m);
  k.bx('#f2f7fb', [0.2, 0.34, 0.2], [0, 0, 0], { r: 0.01 });
  k.fr('#e7eef5', 0.2, 0.2, 0.2, 0.0, 0.1, [0, 0.34, 0]);
  k.bx('#4a9be0', [0.202, 0.14, 0.202], [0, 0.1, 0]);
  k.sp(P.white, 0.05, [0, 0.28, 0.101], { sz: 0.1 });
}

function torch(m) {
  const k = K(m);
  k.cy('#7a4a2d', 0.045, 0.28, [0, 0.045, 0], { rx: Math.PI / 2, seg: 10 });
  k.cn('#aeb4be', 0.05, 0.075, 0.12, [0, 0.045, 0.2], { rx: Math.PI / 2, seg: 12 });
  m.mat('lampGlow', '#fff4c8', { e: '#ffeaa0' });
  k.cy('lampGlow', 0.06, 0.012, [0, 0.045, 0.27], { rx: Math.PI / 2, seg: 12 });
  k.bx(P.red, [0.03, 0.02, 0.05], [0, 0.095, 0.0], { r: 0.006 });
}

function wrench(m) {
  const k = K(m);
  k.bx('#c8cdd6', [0.05, 0.02, 0.4], [0, 0, 0], { r: 0.008 });
  k.cy('#c8cdd6', 0.08, 0.02, [0, 0, 0.22], { seg: 8 });
  k.bx('#4a4f5a', [0.06, 0.03, 0.08], [0, 0, 0.27]);
  k.cy('#c8cdd6', 0.06, 0.02, [0, 0, -0.2], { seg: 8 });
}

function key(m) {
  const k = K(m);
  k.ring(P.gold, 0.07, 0.022, [0, 0.025, -0.2], { seg: 14, segr: 5 });
  k.bx(P.gold, [0.04, 0.035, 0.32], [0, 0, 0.0], { r: 0.01 });
  k.bx(P.gold, [0.09, 0.035, 0.04], [0.04, 0, 0.14]);
  k.bx(P.gold, [0.07, 0.035, 0.04], [0.035, 0, 0.07]);
}

function pliers(m) {
  const k = K(m);
  for (const s of [-1, 1]) {
    k.bx(P.red, [0.04, 0.03, 0.2], [s * 0.04, 0, -0.14], { r: 0.012, ry: s * 0.12 });
    k.bx('#aab1bd', [0.04, 0.03, 0.18], [s * 0.015, 0, 0.1], { ry: -s * 0.05 });
  }
  k.sp('#5a606c', 0.035, [0, 0.02, -0.02], { sy: 0.7 });
}

function star_wand(m) {
  const k = K(m);
  k.cy(P.pink, 0.022, 0.55, [0, 0.0, 0], { seg: 8 });
  k.cy(P.purple, 0.024, 0.08, [0, 0.0, 0], { seg: 8 });
  const star = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const r = i % 2 ? 0.07 : 0.17;
    star.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  k.ex(P.yellow, star, 0.05, [0, 0.72, 0]);
  k.sp(P.yellow, 0.04, [0, 0.72, 0.0]);
}

function tomato(m) {
  const k = K(m);
  k.sp(P.orange, 0.15, [0, 0.12, 0], { sy: 0.8, ws: 12, hs: 8 });
  k.sp(P.greenDark, 0.06, [0, 0.23, 0], { sy: 0.4, ws: 8, hs: 4 });
  k.sp('#f5a65a', 0.07, [-0.06, 0.18, 0.1], { sy: 0.6 });
}

function melon_bowl(m) {
  const k = K(m);
  k.lt(P.white, [[0, 0], [0.1, 0], [0.14, 0.04], [0.24, 0.14], [0.22, 0.14], [0.12, 0.06], [0, 0.04]], [0, 0, 0], { seg: 16 });
  k.sp(P.greenLight, 0.17, [0, 0.2, 0], { sy: 0.85, ws: 12, hs: 8 });
  k.sp('#3f9a45', 0.07, [0.12, 0.26, 0.08], { sy: 0.5, ws: 8, hs: 4 });
}

function oil_bottle(m) {
  const k = K(m);
  m.mat('oilGlass', '#f2c94a', { r: 0.15, a: 0.85 });
  k.lt('oilGlass', [[0, 0], [0.07, 0], [0.08, 0.04], [0.08, 0.2], [0.04, 0.28], [0.035, 0.38], [0.0, 0.38]], [0, 0, 0], { seg: 12 });
  k.cy(P.white, 0.04, 0.05, [0, 0.38, 0], { seg: 8 });
}

function soda_bottle(m) {
  const k = K(m);
  m.mat('greenGlass', '#2da58f', { r: 0.15, a: 0.9 });
  k.lt('greenGlass', [[0, 0], [0.07, 0], [0.08, 0.04], [0.08, 0.3], [0.04, 0.4], [0.038, 0.5], [0.0, 0.5]], [0, 0, 0], { seg: 12 });
  k.cy(P.white, 0.042, 0.06, [0, 0.5, 0], { seg: 8 });
  k.bx(P.white, [0.1, 0.18, 0.004], [0, 0.1, 0.08]);
}

function juice_carton(m) {
  const k = K(m);
  k.bx('#4aa3e8', [0.17, 0.4, 0.17], [0, 0, 0], { r: 0.01 });
  k.fr('#3d8fd0', 0.17, 0.17, 0.17, 0.0, 0.09, [0, 0.4, 0]);
  k.bx(P.white, [0.12, 0.16, 0.004], [0, 0.12, 0.086]);
  k.sp(P.orange, 0.04, [0, 0.2, 0.09], { sz: 0.1 });
  k.cy(P.white, 0.015, 0.1, [0.04, 0.48, 0.0], { rz: -0.7, seg: 5 });
}

function fruit_crate(m) {
  const k = K(m);
  k.bx('#3b78c2', [0.5, 0.2, 0.36], [0, 0, 0], { r: 0.02 });
  k.bx('#2f64a8', [0.46, 0.02, 0.32], [0, 0.2, 0], { r: 0.0 });
  const fruit = [P.red, P.orange, P.greenLight, P.yellow, P.purple, P.red, P.orange, P.lime];
  fruit.forEach((c, i) => k.sp(c, 0.075, [-0.17 + (i % 4) * 0.115, 0.26, i < 4 ? -0.07 : 0.08], { ws: 8, hs: 5 }));
  k.bl(P.green, 0.09, [0.2, 0.3, 0.0], { detail: 0, seed: 4 });
}

function red_bucket(m) {
  const k = K(m);
  k.cn(P.red, 0.18, 0.24, 0.34, [0, 0, 0], { seg: 16 });
  k.ring(P.redDark, 0.245, 0.02, [0, 0.33, 0], { seg: 16, segr: 4 });
  k.tb('#9aa1ac', [[-0.24, 0.32, 0], [0, 0.55, 0], [0.24, 0.32, 0]], 0.014);
  k.cy('#4aa3e8', 0.2, 0.03, [0, 0.28, 0], { seg: 16 });
}

function black_bucket(m) {
  const k = K(m);
  k.cn('#26282e', 0.15, 0.2, 0.3, [0, 0, 0], { seg: 14 });
  k.ring('#3a3d46', 0.205, 0.018, [0, 0.29, 0], { seg: 14, segr: 4 });
  k.tb('#6c717b', [[-0.2, 0.28, 0], [0, 0.48, 0], [0.2, 0.28, 0]], 0.012);
}

function paint_tube(m) {
  const k = K(m);
  k.cy('#4a74d8', 0.045, 0.2, [0, 0, 0], { rz: Math.PI / 2, seg: 10 });
  k.cn('#4a74d8', 0.045, 0.02, 0.05, [0.125, 0.0, 0], { rz: -Math.PI / 2, seg: 8 });
  k.cy(P.white, 0.022, 0.04, [0.17, 0.0, 0], { rz: Math.PI / 2, seg: 6 });
  k.bx(P.white, [0.02, 0.02, 0.04], [-0.12, 0, 0]);
  k.cy(P.yellow, 0.047, 0.05, [-0.04, 0.0, 0], { rz: Math.PI / 2, seg: 10 });
}

function paint_can(m) {
  const k = K(m);
  k.cy('#e9ecf2', 0.15, 0.28, [0, 0, 0], { seg: 16 });
  k.cy('#c9ced8', 0.155, 0.03, [0, 0.28, 0], { seg: 16 });
  k.cy(P.red, 0.156, 0.08, [0, 0.12, 0], { seg: 16 });
  k.tb('#9aa1ac', [[-0.15, 0.28, 0], [0, 0.4, 0], [0.15, 0.28, 0]], 0.01);
  k.bx(P.red, [0.1, 0.01, 0.012], [0, 0.285, 0]);
}

function spray_bottle(m) {
  const k = K(m);
  m.mat('spGlass', '#e8eef5', { r: 0.2, a: 0.8 });
  k.bx('spGlass', [0.12, 0.2, 0.08], [0, 0, 0], { r: 0.03 });
  k.bx(P.pink, [0.115, 0.1, 0.078], [0, 0.01, 0], { r: 0.03 });
  k.cy(P.white, 0.03, 0.08, [0, 0.2, 0], { seg: 8 });
  k.bx(P.white, [0.1, 0.04, 0.05], [0, 0.26, 0.02], { r: 0.015 });
  k.bx(P.white, [0.02, 0.06, 0.01], [0, 0.18, 0.06], { rx: 0.4 });
}

function tissue_box(m) {
  const k = K(m);
  k.bx('#f3ead2', [0.28, 0.12, 0.16], [0, 0, 0], { r: 0.015 });
  k.bx(P.white, [0.18, 0.02, 0.08], [0, 0.12, 0], { r: 0.008 });
  k.bx(P.blueLight, [0.28, 0.03, 0.161], [0, 0.04, 0]);
}

function battery(m) {
  const k = K(m);
  k.bx(P.red, [0.2, 0.12, 0.12], [0, 0, 0], { r: 0.015 });
  k.bx(P.white, [0.14, 0.06, 0.004], [0, 0.03, 0.06]);
  k.cy(P.steel, 0.025, 0.03, [-0.06, 0.12, 0], { seg: 8 });
  k.cy(P.steel, 0.025, 0.03, [0.06, 0.12, 0], { seg: 8 });
  k.bx(P.black, [0.03, 0.01, 0.004], [-0.06, 0.15, 0.03]);
}

function shovel(m) {
  const k = K(m);
  k.bx('#a9763f', [0.04, 0.03, 0.55], [0, 0.015, -0.06], { r: 0.012 });
  k.bx(P.gold, [0.2, 0.025, 0.26], [0, 0.015, 0.34], { r: 0.012 });
  k.fr(P.gold, 0.2, 0.025, 0.04, 0.025, 0.1, [0, 0.015, 0.54], { rx: Math.PI / 2 });
  k.bx('#a9763f', [0.12, 0.03, 0.04], [0, 0.015, -0.32]);
}

function rope_coil(m) {
  const k = K(m);
  for (let i = 0; i < 4; i++) k.ring('#c9a15e', 0.2 - i * 0.02, 0.04, [0, 0.04 + i * 0.065, 0], { seg: 18, segr: 6 });
  k.tb('#c9a15e', [[0.2, 0.3, 0], [0.32, 0.25, 0.1], [0.4, 0.04, 0.2]], 0.04, [0, 0, 0], { seg: 6 });
}

function laptop(m) {
  const k = K(m);
  k.bx(P.greyLight, [0.4, 0.025, 0.28], [0, 0, 0.0], { r: 0.01 });
  k.bx(P.greyDark, [0.3, 0.004, 0.14], [0, 0.025, 0.02]);
  k.bx(P.greyLight, [0.4, 0.26, 0.02], [0, 0.0, -0.14], { r: 0.01, rx: -0.2 });
  k.bx('#2a5e9a', [0.35, 0.21, 0.004], [0, 0.03, -0.126], { rx: -0.2 });
  k.bx('#6bd1ff', [0.14, 0.08, 0.004], [-0.05, 0.1, -0.12], { rx: -0.2 });
}

function onion(m) {
  const k = K(m);
  k.sp('#a6307c', 0.15, [0, 0.14, 0], { sy: 0.85, ws: 12, hs: 8 });
  k.cn('#a6307c', 0.04, 0.0, 0.1, [0, 0.26, 0], { seg: 8 });
  k.sp('#c9578f', 0.08, [0.07, 0.15, 0.1], { sy: 0.9 });
  k.bx('#d9b88a', [0.05, 0.02, 0.05], [0, 0.0, 0.0]);
}

function eye_drops(m) {
  const k = K(m);
  m.mat('dropGlass', '#dcecf4', { r: 0.2, a: 0.7 });
  k.lt('dropGlass', [[0, 0], [0.04, 0], [0.045, 0.02], [0.045, 0.11], [0.025, 0.15], [0.0, 0.15]], [0, 0, 0], { seg: 10 });
  k.cn(P.white, 0.022, 0.006, 0.06, [0, 0.15, 0], { seg: 8 });
  k.cy(P.blueLight, 0.047, 0.06, [0, 0.03, 0], { seg: 10 });
}

function bouncy_ball(m) {
  const k = K(m);
  k.sp(P.pink, 0.16, [0, 0.16, 0], { ws: 14, hs: 10 });
  k.ring(P.yellow, 0.16, 0.012, [0, 0.16, 0], { seg: 18, segr: 4 });
  k.ring(P.blue, 0.16, 0.012, [0, 0.16, 0], { seg: 18, segr: 4, rx: Math.PI / 2 });
  k.sp(P.white, 0.04, [0.08, 0.28, 0.08], { sy: 0.4 });
}

function plum(m) {
  const k = K(m);
  k.sp('#8f2a63', 0.14, [0, 0.13, 0], { sy: 0.92, ws: 12, hs: 8 });
  k.sp('#b25a8a', 0.06, [-0.05, 0.19, 0.1], { sy: 0.7 });
  k.cy(P.greenDark, 0.008, 0.07, [0, 0.25, 0], { seg: 4 });
  k.sp(P.greenLight, 0.04, [0.04, 0.3, 0.0], { sy: 0.3 });
}

function cake_whole(m) {
  const k = K(m);
  k.cy(P.white, 0.34, 0.02, [0, 0, 0], { seg: 22 });
  k.cy('#f5c6da', 0.28, 0.2, [0, 0.02, 0], { seg: 22 });
  k.cy('#fff4f7', 0.285, 0.05, [0, 0.12, 0], { seg: 22 });
  k.cy('#f5c6da', 0.18, 0.15, [0, 0.22, 0], { seg: 18 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    k.sp(P.red, 0.03, [Math.cos(a) * 0.22, 0.25, Math.sin(a) * 0.22], { ws: 6, hs: 4 });
  }
  k.sp(P.red, 0.05, [0, 0.4, 0], { ws: 8, hs: 6 });
  k.cy(P.yellow, 0.01, 0.07, [0.1, 0.37, 0.05], { seg: 4 });
}

function flower_single(m) {
  const k = K(m);
  k.cy(P.greenDark, 0.012, 0.4, [0, 0, 0], { rz: 0.0, seg: 5 });
  k.sp(P.greenLight, 0.07, [0.07, 0.15, 0], { sx: 1.4, sy: 0.3, sz: 0.5, rz: -0.4, ws: 7, hs: 4 });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    k.sp(i % 2 ? '#ff7bb5' : '#ff5c9d', 0.055, [Math.cos(a) * 0.075, 0.45, Math.sin(a) * 0.075], { sy: 0.8, ws: 7, hs: 5 });
  }
  k.sp(P.yellow, 0.045, [0, 0.46, 0]);
}

function pasta_packet(m) {
  const k = K(m);
  k.bx('#f2b73a', [0.26, 0.06, 0.18], [0, 0, 0], { r: 0.02 });
  k.bx(P.red, [0.2, 0.01, 0.1], [0, 0.058, 0], { r: 0.004 });
  k.bx(P.white, [0.1, 0.012, 0.04], [0, 0.064, 0], { r: 0.004 });
}

const ITEM = { kind: 'item', foot: [0.5, 0.5] };

export const RECIPES = {
  cake_slice: { build: cake_slice, ...ITEM, name: 'Cake slice' },
  chocolate_bar: { build: chocolate_bar, ...ITEM, name: 'Chocolate' },
  plum_bowl: { build: plum_bowl, ...ITEM, name: 'Bowl of plums' },
  toffee_box: { build: toffee_box, ...ITEM, name: 'Toffee box' },
  stapler: { build: stapler, ...ITEM, name: 'Stapler' },
  kitchen_knife: { build: kitchen_knife, ...ITEM, name: 'Kitchen knife' },
  sauce_bottle: { build: sauce_bottle, ...ITEM, name: 'Sauce bottle' },
  milk_bottle: { build: milk_bottle, ...ITEM, name: 'Milk bottle' },
  hammer: { build: hammer, ...ITEM, name: 'Hammer' },
  milk_carton: { build: milk_carton, ...ITEM, name: 'Milk carton' },
  torch: { build: torch, ...ITEM, name: 'Torch' },
  wrench: { build: wrench, ...ITEM, name: 'Spanner' },
  key: { build: key, ...ITEM, name: 'Key' },
  pliers: { build: pliers, ...ITEM, name: 'Pliers' },
  star_wand: { build: star_wand, ...ITEM, name: 'Star wand' },
  tomato: { build: tomato, ...ITEM, name: 'Tomato' },
  melon_bowl: { build: melon_bowl, ...ITEM, name: 'Melon bowl' },
  oil_bottle: { build: oil_bottle, ...ITEM, name: 'Oil bottle' },
  soda_bottle: { build: soda_bottle, ...ITEM, name: 'Soda bottle' },
  juice_carton: { build: juice_carton, ...ITEM, name: 'Juice carton' },
  fruit_crate: { build: fruit_crate, ...ITEM, name: 'Fruit crate' },
  red_bucket: { build: red_bucket, ...ITEM, name: 'Red bucket' },
  black_bucket: { build: black_bucket, ...ITEM, name: 'Black bucket' },
  paint_tube: { build: paint_tube, ...ITEM, name: 'Paint tube' },
  paint_can: { build: paint_can, ...ITEM, name: 'Paint can' },
  spray_bottle: { build: spray_bottle, ...ITEM, name: 'Spray bottle' },
  tissue_box: { build: tissue_box, ...ITEM, name: 'Tissue box' },
  battery: { build: battery, ...ITEM, name: 'Battery' },
  shovel: { build: shovel, ...ITEM, name: 'Shovel' },
  rope_coil: { build: rope_coil, ...ITEM, name: 'Rope' },
  laptop: { build: laptop, ...ITEM, name: 'Laptop' },
  onion: { build: onion, ...ITEM, name: 'Onion' },
  eye_drops: { build: eye_drops, ...ITEM, name: 'Eye drops' },
  bouncy_ball: { build: bouncy_ball, ...ITEM, name: 'Bouncy ball' },
  plum: { build: plum, ...ITEM, name: 'Plum' },
  cake_whole: { build: cake_whole, ...ITEM, name: 'Cake' },
  flower_single: { build: flower_single, ...ITEM, name: 'Flower' },
  pasta_packet: { build: pasta_packet, ...ITEM, name: 'Noodle packet' },
};
