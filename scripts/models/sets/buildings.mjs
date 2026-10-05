// Building outsides for the town: my little house, Granny's big house, the school, the hospital, the palace,
// plus the greenhouse, a watch tower and a beach shack (banner and panels of docs/art/reference/01-asset-pack-overview.webp).
// Front is +Z. The ground floor sits at y = 0. Windows are glass with a frame; lit windows glow a little.
import { kit, extrude } from '../kit.mjs';
import { P } from '../pal.mjs';

const K = (m) => kit(m);

/** A window on the front (+Z) side of a wall at z: frame, glass, optional shutters and sill. ry turns it for other walls. */
function win(k, x, y, z, w, h, { ry = 0, lit = false, frame = '#f7f4ee', shutters = null, sill = true, cross = true } = {}) {
  const c = Math.cos(ry);
  const s = Math.sin(ry);
  const at = (dx, dz) => [x + dx * c + dz * s, 0, z - dx * s + dz * c];
  const place = (mat, size, dx, dy, dz) => {
    const p = at(dx, dz);
    k.bx(mat, size, [p[0], y + dy, p[2]], { ry });
  };
  place(frame, [w + 0.16, 0.08, 0.12], 0, h, 0.03);
  place(frame, [w + 0.16, 0.08, 0.12], 0, -0.04, 0.03);
  place(frame, [0.08, h, 0.12], -w / 2 - 0.04, 0, 0.03);
  place(frame, [0.08, h, 0.12], w / 2 + 0.04, 0, 0.03);
  place(lit ? 'litGlass' : 'glass', [w, h, 0.05], 0, 0, 0.0);
  if (cross) {
    place(frame, [w, 0.04, 0.07], 0, h / 2 - 0.02, 0.05);
    place(frame, [0.04, h, 0.07], 0, 0, 0.05);
  }
  if (sill) place(frame, [w + 0.3, 0.07, 0.24], 0, -0.1, 0.1);
  if (shutters) for (const sd of [-1, 1]) place(shutters, [0.3, h + 0.08, 0.05], sd * (w / 2 + 0.28), -0.02, 0.04);
}

function door(k, x, z, w, h, color, { ry = 0, frame = '#f7f4ee', arch = false } = {}) {
  const c = Math.cos(ry);
  const s = Math.sin(ry);
  const p = (dx, dz) => [x + dx * c + dz * s, z - dx * s + dz * c];
  const f = p(0, 0.03);
  k.bx(frame, [w + 0.3, h + 0.15, 0.12], [f[0], 0, f[1]], { ry });
  const d = p(0, 0.06);
  k.bx(color, [w, h, 0.1], [d[0], 0, d[1]], { ry });
  for (const sd of [-1, 1]) {
    const q = p(sd * w * 0.22, 0.12);
    k.bx('#ffffff', [w * 0.36, h * 0.38, 0.02], [q[0], h * 0.5, q[1]], { ry, r: 0.01 });
  }
  const kn = p(w * 0.36, 0.13);
  k.sp(P.brass, 0.06, [kn[0], h * 0.48, kn[1]]);
}

function glassMats(m, glow = '#ffd98a') {
  m.mat('glass', '#9fc8dc', { r: 0.1 });
  m.mat('litGlass', '#ffe29a', { e: glow });
}

/** Picket fence along x at z. */
function fence(k, x0, x1, z, color = '#ffffff', h = 0.9) {
  const n = Math.max(2, Math.round((x1 - x0) / 0.35));
  k.bx(color, [x1 - x0, 0.07, 0.05], [(x0 + x1) / 2, 0.25, z]);
  k.bx(color, [x1 - x0, 0.07, 0.05], [(x0 + x1) / 2, 0.62, z]);
  for (let i = 0; i <= n; i++) k.fr(color, 0.14, 0.05, 0.0, 0.0, 0.1, [x0 + (i / n) * (x1 - x0), h, z]), k.bx(color, [0.14, h, 0.05], [x0 + (i / n) * (x1 - x0), 0, z]);
}

// ---------- my little house ----------

function little_house(m) {
  const k = K(m);
  glassMats(m);
  const wall = '#f2a9c5';
  const trim = '#ffffff';
  k.bx('#6cb85a', [13.6, 0.12, 11.6], [0, 0, 0.0]);                              // lawn
  k.bx('#e6d9bf', [1.6, 0.14, 4.0], [1.0, 0, 7.0 - 1.4]);                        // path
  k.bx('#d8c9a8', [9.4, 0.4, 7.4], [0, 0.1, -0.6]);                              // plinth
  k.bx(wall, [9.0, 5.2, 7.0], [0, 0.4, -0.6], { r: 0.05 });                       // walls
  k.bx(trim, [9.2, 0.18, 7.2], [0, 2.9, -0.6]);                                  // floor band
  k.bx('#c93b4a', [9.8, 0.22, 7.8], [0, 5.6, -0.6]);
  k.fr('#a8423a', 10.2, 8.2, 10.2, 0.3, 2.7, [0, 5.7, -0.6]);                     // roof
  k.fr('#8f3430', 10.3, 0.5, 10.3, 0.3, 0.1, [0, 8.35, -0.6]);                    // ridge
  k.bx('#a0522d', [0.9, 1.9, 0.9], [-3.0, 6.0, -1.8]);                           // chimney
  k.bx('#7a3a20', [1.05, 0.14, 1.05], [-3.0, 7.95, -1.8]);
  for (const x of [-2.8, 2.6]) {
    win(k, x, 1.5, 3.0, 1.4, 1.5, { shutters: '#d96d92', lit: true });
    win(k, x, 3.8, 3.0, 1.4, 1.4, { shutters: '#d96d92' });
  }
  win(k, 0.0, 3.8, 3.0, 1.2, 1.4, { lit: true });
  for (const z of [-2.8, 0.4]) {
    win(k, 4.5, 1.7, z, 1.2, 1.4, { ry: Math.PI / 2 });
    win(k, 4.5, 3.8, z, 1.2, 1.4, { ry: Math.PI / 2, lit: true });
    win(k, -4.5, 1.7, z, 1.2, 1.4, { ry: -Math.PI / 2 });
    win(k, -4.5, 3.8, z, 1.2, 1.4, { ry: -Math.PI / 2 });
  }
  // porch
  k.bx('#d8c9a8', [3.4, 0.3, 2.0], [0, 0.1, 3.9]);
  for (const sx of [-1, 1]) k.bx(trim, [0.22, 2.5, 0.22], [sx * 1.4, 0.4, 4.6], { r: 0.04 });
  k.bx(trim, [3.8, 0.2, 2.4], [0, 2.9, 3.9]);
  k.fr('#c93b4a', 4.2, 2.8, 3.6, 0.6, 0.9, [0, 3.1, 3.7]);
  door(k, 0.0, 3.0, 1.2, 2.2, '#4aa8d8', { frame: trim });
  for (let i = 0; i < 3; i++) k.bx('#e6d9bf', [2.2 - i * 0.1, 0.15, 0.5], [0, i * 0.12 + 0.05, 5.15 + (2 - i) * 0.3]);
  // garden
  fence(k, -6.6, -1.4, 5.5);
  fence(k, 1.6, 6.6, 5.5);
  for (const sx of [-1, 1]) fence(k, -6.6, 6.6, 5.5 + 0.0, trim, 0.0);
  for (const [x, z, r] of [[-3.5, 4.0, 0.5], [3.5, 4.0, 0.45], [-5.8, 1.0, 0.55]]) {
    k.bl(P.green, r, [x, r * 0.8, z], { seed: x + 9, jitter: 0.1, sy: 0.85 });
    for (let i = 0; i < 4; i++) k.sp([P.pink, P.yellow, P.red, P.white][i], 0.07, [x + Math.cos(i * 1.7) * r * 0.8, r * 0.8 + Math.sin(i * 2.1) * 0.15, z + r * 0.7], { ws: 6, hs: 4 });
  }
  k.cn(P.brown, 0.2, 0.14, 2.2, [5.6, 0.12, 4.2], { seg: 7 });
  k.bl(P.greenLight, 1.1, [5.6, 3.0, 4.2], { seed: 3, jitter: 0.14 });
  k.bl(P.green, 0.8, [6.2, 3.5, 4.0], { seed: 5, jitter: 0.14 });
  // a pink scooty parked outside would be separate; here a mailbox
  k.bx('#4a74d8', [0.4, 0.3, 0.3], [-2.0, 1.1, 5.7], { r: 0.05 });
  k.cy('#7a4a2d', 0.04, 1.1, [-2.0, 0.12, 5.7], { seg: 5 });
}

// ---------- granny's big house ----------

function tower(k, x, z, r, h, roofH, wallCol, roofCol, litWin = true) {
  k.cy(wallCol, r, h, [x, 0.3, z], { seg: 12 });
  k.cy('#e3dce8', r + 0.12, 0.2, [x, 0.3 + h * 0.5, z], { seg: 12 });
  k.cy('#e3dce8', r + 0.12, 0.2, [x, 0.3 + h - 0.2, z], { seg: 12 });
  k.cn(roofCol, r + 0.5, 0.0, roofH, [x, 0.3 + h, z], { seg: 12 });
  k.sp(P.gold, 0.14, [x, 0.3 + h + roofH + 0.05, z]);
  for (const y of [h * 0.28, h * 0.68]) for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
    const px = x + Math.cos(a) * (r + 0.02);
    const pz = z + Math.sin(a) * (r + 0.02);
    k.bx(litWin ? 'litGlass' : 'glass', [0.6, 1.0, 0.06], [px, y + 0.3, pz], { ry: -a + Math.PI / 2 });
    k.bx('#f7f4ee', [0.78, 0.1, 0.12], [px, y + 1.32, pz], { ry: -a + Math.PI / 2 });
    k.bx('#f7f4ee', [0.78, 0.1, 0.12], [px, y + 0.22, pz], { ry: -a + Math.PI / 2 });
  }
}

function granny_house(m) {
  const k = K(m);
  glassMats(m, '#ffc861');
  const wall = '#cdc3d6';
  const trim = '#efe9f4';
  const roof = '#3b3b57';
  k.bx('#4a5a42', [21.6, 0.12, 15.6], [0, 0, 0]);
  k.bx('#8d8798', [14.4, 0.7, 10.4], [0, 0.1, -1.0]);                              // stone base
  k.bx(wall, [14.0, 9.6, 9.8], [0, 0.8, -1.0], { r: 0.05 });                       // main block
  for (const y of [3.9, 7.0]) k.bx(trim, [14.3, 0.22, 10.1], [0, y, -1.0]);
  k.bx(trim, [14.4, 0.3, 10.2], [0, 10.4, -1.0]);
  k.fr(roof, 14.8, 10.6, 12.0, 4.4, 3.4, [0, 10.6, -1.0]);                         // hip roof
  k.fr('#2f2f47', 4.2, 3.0, 3.4, 2.6, 0.5, [0, 13.95, -1.0]);
  for (const x of [-4.4, 0.0, 4.4]) {                                              // dormers
    k.bx(wall, [1.9, 1.7, 1.6], [x, 10.7, 2.0], { r: 0.04 });
    k.fr(roof, 2.3, 2.0, 2.3, 0.3, 1.0, [x, 12.4, 2.0]);
    k.bx('litGlass', [1.0, 1.1, 0.06], [x, 10.95, 2.82]);
    k.bx(trim, [1.2, 0.1, 0.12], [x, 12.05, 2.86]);
  }
  tower(k, -7.4, 3.0, 2.0, 14.4, 5.8, wall, roof);                                 // left turret
  tower(k, 7.3, 3.2, 1.5, 11.6, 4.4, wall, roof);                                  // right turret
  tower(k, 6.4, -5.2, 1.3, 13.0, 4.2, wall, roof, false);                          // back turret
  // windows on three floors
  for (const [y, n] of [[1.6, 5], [4.7, 5], [7.8, 5]]) {
    for (let i = 0; i < n; i++) {
      const x = -5.6 + i * 2.8;
      if (y < 2 && i === 2) continue;
      win(k, x, y, 3.9, 1.3, 1.9, { lit: (i + Math.round(y)) % 2 === 0, frame: trim, cross: true });
      if (y > 4) for (const sd of [-1, 1]) k.bx('#3b3b57', [0.3, 2.0, 0.05], [x + sd * 0.95, y - 0.02, 3.93]);
    }
  }
  for (const [y] of [[4.7], [7.8]]) {                                              // balcony rails
    k.bx(trim, [14.0, 0.14, 1.0], [0, y - 0.55, 4.2]);
    for (let i = 0; i < 28; i++) k.bx(trim, [0.06, 0.8, 0.06], [-6.8 + i * 0.5, y - 0.55 + 0.14, 4.65]);
    k.bx(trim, [14.0, 0.1, 0.1], [0, y + 0.4, 4.65]);
  }
  for (const z of [-4.5, 0.2, 3.4]) for (const [y, n] of [[1.6, 1], [4.7, 1], [7.8, 1]]) { win(k, 7.0, y, z, 1.3, 1.9, { ry: Math.PI / 2, lit: z > 0, frame: trim }); win(k, -7.0, y, z, 1.3, 1.9, { ry: -Math.PI / 2, lit: z < 0, frame: trim }); void n; }
  // entrance
  door(k, 0.0, 3.9, 1.8, 2.8, '#2d5a5c', { frame: trim });
  for (const sx of [-1, 1]) k.cy(trim, 0.22, 3.2, [sx * 1.5, 0.8, 5.2], { seg: 10 });
  k.bx(trim, [4.0, 0.3, 2.6], [0, 4.0, 4.9]);
  k.fr(roof, 4.4, 3.0, 3.6, 1.0, 1.2, [0, 4.3, 4.9]);
  for (let i = 0; i < 5; i++) k.bx('#a39bb0', [5.2 - i * 0.3, 0.2, 0.7], [0, 0.2 + i * 0.16, 6.6 - i * 0.5]);
  // outside stairs with a rail on the left
  for (let i = 0; i < 8; i++) k.bx('#a39bb0', [1.2, 0.2, 0.7], [-10.2 + i * 0.0, 0.2 + i * 0.35, 1.2 - i * 0.55 + 4.0], { ry: 0 });
  k.tb('#2f2f47', [[-10.8, 0.5, 5.2], [-10.8, 3.2, 1.0]], 0.05, [0, 0, 0], { seg: 5 });
  // trees and gravestones around
  for (const [x, z, h] of [[-9.8, -6.5, 6], [9.8, -6.0, 7], [-10.2, 6.5, 5]]) {
    k.cn('#3a2f2a', 0.3, 0.18, h * 0.5, [x, 0.12, z], { seg: 6 });
    for (let i = 0; i < 4; i++) k.cn('#2d4a3a', 1.7 - i * 0.35, 0.0, h * 0.34, [x, h * 0.28 + i * h * 0.17, z], { seg: 7 });
  }
  for (const [x, z] of [[-4.2, 7.2], [5.2, 7.6], [-6.6, 6.4]]) {
    k.bx('#9ea3ab', [0.6, 0.9, 0.2], [x, 0.12, z], { r: 0.05 });
    k.cy('#9ea3ab', 0.3, 0.2, [x, 1.02, z], { rx: Math.PI / 2, seg: 8 });
  }
  k.bx('#26262c', [9.0, 0.1, 0.1], [0, 0.9, 7.6]);
  for (let i = 0; i < 19; i++) k.bx('#26262c', [0.07, 1.1, 0.07], [-4.5 + i * 0.5, 0.12, 7.6]);
  k.sp('#f2e8c8', 1.1, [-9.0, 12.5, -8.0], { ws: 14, hs: 10 });                    // the moon
  k.sp('#232339', 0.9, [-8.6, 12.7, -7.9], { ws: 12, hs: 8 });
}

// ---------- school ----------

function school(m) {
  const k = K(m);
  glassMats(m);
  const wall = '#f0a07a';
  const trim = '#fff3e2';
  const roof = '#b4503a';
  k.bx('#6cb85a', [24.0, 0.12, 14.0], [0, 0, 0]);
  k.bx('#d9d2c2', [20.4, 0.5, 8.4], [0, 0.1, -1.2]);
  k.bx(wall, [20.0, 7.4, 8.0], [0, 0.6, -1.2], { r: 0.05 });
  k.bx(trim, [20.3, 0.25, 8.3], [0, 4.0, -1.2]);
  k.bx(trim, [20.4, 0.3, 8.4], [0, 8.0, -1.2]);
  k.fr(roof, 20.8, 8.8, 20.8, 0.4, 2.4, [0, 8.2, -1.2]);
  for (const sx of [-1, 1]) k.fr(roof, 5.6, 5.0, 5.6, 0.4, 2.0, [sx * 8.8, 8.2, -1.2]);          // wing roofs
  // clock tower over the entrance
  k.bx(wall, [4.4, 5.2, 4.4], [0, 8.2, 0.6], { r: 0.04 });
  k.bx(trim, [4.7, 0.28, 4.7], [0, 13.2, 0.6]);
  k.fr(roof, 5.0, 5.0, 0.0, 0.0, 3.0, [0, 13.4, 0.6]);
  k.sp(P.gold, 0.2, [0, 16.55, 0.6]);
  k.cy('#ffffff', 1.1, 0.14, [0, 10.4, 2.9], { rx: Math.PI / 2, seg: 20 });
  k.ring('#8a5a35', 1.1, 0.08, [0, 10.5, 2.97], { rx: Math.PI / 2, seg: 20, segr: 5 });
  k.bx(P.black, [0.1, 0.8, 0.06], [0, 10.5, 3.05]);
  k.bx(P.black, [0.6, 0.1, 0.06], [0.28, 10.5, 3.06], { rz: 0.4 });
  // entrance and columns
  k.bx(trim, [6.0, 0.4, 3.0], [0, 0.1, 3.4]);
  for (const sx of [-2.2, -0.75, 0.75, 2.2]) k.cy(trim, 0.22, 4.2, [sx, 0.5, 4.4], { seg: 10 });
  k.bx(trim, [6.2, 0.35, 3.4], [0, 4.7, 3.4]);
  k.ex(trim, [[-3.1, 0], [3.1, 0], [0, 1.4]], 0.4, [0, 5.1, 4.9]);
  k.ex('#e8d6bf', [[-2.6, 0], [2.6, 0], [0, 1.1]], 0.1, [0, 5.18, 5.12]);
  door(k, 0.0, 2.8, 2.2, 3.0, '#6b3f27', { frame: trim });
  for (let i = 0; i < 5; i++) k.bx('#d9d2c2', [4.6 + i * 0.3, 0.16, 0.6], [0, 0.1 + i * 0.1, 5.5 + (4 - i) * 0.0 + i * 0.0 + 0.9 - i * 0.0]);
  // windows
  for (let i = 0; i < 6; i++) {
    const x = -8.6 + i * 3.4;
    if (Math.abs(x) < 3.2) continue;
    win(k, x, 1.7, 2.8, 1.5, 2.0, { frame: trim, lit: i % 2 === 0, cross: true });
    win(k, x, 5.0, 2.8, 1.5, 2.0, { frame: trim, lit: i % 3 === 1, cross: true });
  }
  win(k, -1.2, 5.6, 2.84, 1.0, 1.8, { frame: trim });
  win(k, 1.2, 5.6, 2.84, 1.0, 1.8, { frame: trim });
  // garden
  for (const sx of [-1, 1]) {
    k.bl(P.green, 0.9, [sx * 5.6, 0.7, 5.6], { seed: 12 + sx, jitter: 0.1, sy: 0.8 });
    for (let i = 0; i < 6; i++) k.sp([P.red, P.yellow, P.orange, P.pink, P.white, P.purple][i], 0.1, [sx * (4.4 + i * 0.4), 0.3, 6.2 + (i % 2) * 0.3], { ws: 6, hs: 4 });
    k.cn(P.brown, 0.18, 0.12, 2.0, [sx * 10.8, 0.12, 5.4], { seg: 6 });
    k.bl(P.greenLight, 1.0, [sx * 10.8, 2.8, 5.4], { seed: 20 + sx, jitter: 0.14 });
  }
  k.bx('#d9d2c2', [2.0, 0.08, 3.5], [0, 0.04, 8.9]);
}

// ---------- hospital ----------

function hospital(m) {
  const k = K(m);
  glassMats(m, '#bfe6ff');
  m.mat('blueGlass', '#6fb4d8', { r: 0.1 });
  const wall = '#e8e9ee';
  k.bx('#8cc66a', [27.0, 0.12, 14.0], [0, 0, 0]);
  k.bx('#6f7480', [27.0, 0.05, 4.0], [0, 0.11, 5.4]);                               // car park
  k.bx(wall, [22.0, 10.4, 8.4], [0, 0.2, -1.4], { r: 0.04 });
  k.bx(wall, [8.0, 8.0, 6.0], [-13.0, 0.2, -0.4], { r: 0.04 });
  for (const y of [3.7, 7.1]) k.bx('#cfd2da', [22.2, 0.18, 8.6], [0, y, -1.4]);
  k.bx('#cfd2da', [22.4, 0.5, 8.6], [0, 10.6, -1.4]);
  // window bands
  for (let f = 0; f < 3; f++) for (let i = 0; i < 8; i++) {
    const x = -9.0 + i * 2.6;
    if (f === 0 && Math.abs(x) < 3.0) continue;
    k.bx('#ffffff', [1.9, 1.5, 0.1], [x, 1.2 + f * 3.4, 2.86]);
    k.bx(f === 1 && i % 3 === 0 ? 'litGlass' : 'blueGlass', [1.7, 1.3, 0.12], [x, 1.3 + f * 3.4, 2.88]);
    k.bx('#ffffff', [0.06, 1.3, 0.14], [x, 1.3 + f * 3.4, 2.9]);
  }
  for (let f = 0; f < 2; f++) for (let i = 0; i < 3; i++) { k.bx('#ffffff', [1.7, 1.4, 0.1], [-13.0 + (i - 1) * 2.4, 1.2 + f * 3.4, 2.66]); k.bx('blueGlass', [1.5, 1.2, 0.12], [-13.0 + (i - 1) * 2.4, 1.3 + f * 3.4, 2.68]); }
  // entrance canopy and glass doors
  k.bx('#d8353f', [8.0, 0.4, 3.6], [0, 3.5, 4.8], { r: 0.08 });
  for (const sx of [-1, 1]) k.bx('#cfd2da', [0.4, 3.4, 0.4], [sx * 3.4, 0.2, 6.2]);
  k.bx('#ffffff', [6.0, 0.18, 0.1], [0, 3.76, 6.6]);
  k.bx('blueGlass', [3.6, 3.0, 0.1], [0, 0.2, 2.88]);
  k.bx('#ffffff', [0.08, 3.0, 0.12], [0, 0.2, 2.9]);
  for (let i = 0; i < 3; i++) k.bx('#cfd2da', [6.5 + i * 0.5, 0.15, 0.6], [0, 0.16 + i * 0.0, 7.4 + i * 0.0 - i * 0.0]);
  // red cross sign on the roof
  k.bx('#d8353f', [3.2, 3.2, 0.5], [-1.0, 11.0, -1.2], { r: 0.1 });
  k.bx('#ffffff', [0.9, 2.4, 0.52], [-1.0, 11.4, -1.2]);
  k.bx('#ffffff', [2.4, 0.9, 0.52], [-1.0, 12.15, -1.2]);
  k.bx('#cfd2da', [4.0, 0.4, 3.0], [8.0, 10.6, -1.4]);
  k.cy('#cfd2da', 0.3, 1.0, [8.0, 11.0, -1.4], { seg: 6 });
  // trees and bushes
  for (const sx of [-1, 1]) {
    k.cn(P.brown, 0.2, 0.14, 2.4, [sx * 12.2, 0.12, 5.2], { seg: 6 });
    k.bl(P.green, 1.5, [sx * 12.2, 3.6, 5.2], { seed: 30 + sx, jitter: 0.14 });
    for (let i = 0; i < 5; i++) k.sp([P.pink, P.yellow, P.white, P.orange, P.red][i], 0.12, [sx * (7.2 + i * 0.5), 0.35, 6.6], { ws: 6, hs: 4 });
  }
}

// ---------- palace ----------

function dome(k, x, y, z, r, color, {segs = 18, drum = 0, drumColor = '#f4efe2', spire = true} = {}) {
  if (drum) {
    k.cy(drumColor, r * 0.95, drum, [x, y, z], { seg: 14 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      k.bx('litGlass', [0.3, drum * 0.55, 0.08], [x + Math.cos(a) * r * 0.96, y + drum * 0.2, z + Math.sin(a) * r * 0.96], { ry: -a + Math.PI / 2 });
    }
    k.cy(P.gold, r * 1.02, 0.18, [x, y + drum, z], { seg: 14 });
  }
  const prof = [[0, 0]];
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    prof.push([Math.cos(a) * r * (1 + 0.12 * Math.sin(a * 2)), Math.sin(a) * r * 1.05]);
  }
  prof[prof.length - 1][0] = 0;
  const mid = (0 + prof[prof.length - 1][1]) / 2;
  k.lt(color, prof, [x, y + drum + 0.18, z], { seg: segs });
  if (spire) {
    k.cy(P.gold, 0.06, r * 0.7, [x, y + drum + 0.18 + r * 1.05, z], { seg: 6 });
    k.sp(P.gold, 0.14, [x, y + drum + 0.18 + r * 1.05 + r * 0.7, z]);
  }
  void mid;
}

function palace(m) {
  const k = K(m);
  glassMats(m, '#ffd98a');
  const ivory = '#f4efe2';
  const gold = '#e5b23d';
  k.bx('#8fcf70', [30.0, 0.12, 16.0], [0, 0, 0]);
  k.bx('#e6dfd0', [26.0, 0.8, 11.0], [0, 0.1, -1.0]);
  k.bx(ivory, [24.0, 7.0, 8.6], [0, 0.9, -1.4], { r: 0.05 });
  k.bx(gold, [24.3, 0.3, 8.9], [0, 7.7, -1.4]);
  k.bx(ivory, [24.3, 0.3, 8.9], [0, 4.2, -1.4]);
  // central hall with a big gold dome
  k.bx(ivory, [8.0, 9.0, 7.0], [0, 0.9, -1.0], { r: 0.05 });
  k.bx(gold, [8.3, 0.3, 7.3], [0, 9.9, -1.0]);
  dome(k, 0, 10.2, -1.0, 3.6, gold, { drum: 2.2 });
  // side towers with domes (one blue)
  for (const [x, z, col, h] of [[-11.2, 0.6, gold, 9.5], [11.2, 0.6, '#3b6fd0', 9.5], [-7.0, -3.4, gold, 7.5], [7.0, -3.4, gold, 7.5]]) {
    k.cy(ivory, 1.7, h, [x, 0.9, z], { seg: 12 });
    k.cy(gold, 1.9, 0.25, [x, 0.9 + h, z], { seg: 12 });
    dome(k, x, 0.9 + h + 0.25, z, 1.9, col, {});
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
      k.bx('litGlass', [0.7, 1.4, 0.08], [x + Math.cos(a) * 1.72, 0.9 + h * 0.55, z + Math.sin(a) * 1.72], { ry: -a + Math.PI / 2 });
    }
  }
  // windows with arches
  for (let i = 0; i < 6; i++) {
    const x = -8.6 + i * 3.4;
    if (Math.abs(x) < 4.5) continue;
    for (const y of [1.9, 5.3]) {
      k.bx('#ffffff', [1.3, 1.9, 0.1], [x, y, 3.2]);
      k.bx('litGlass', [1.1, 1.7, 0.12], [x, y + 0.1, 3.22]);
      k.cy('#ffffff', 0.65, 0.1, [x, y + 2.0, 3.2], { rx: Math.PI / 2, seg: 10 });
      k.cy('litGlass', 0.55, 0.12, [x, y + 2.0, 3.22], { rx: Math.PI / 2, seg: 10 });
    }
  }
  // grand entrance, steps and red carpet
  k.bx(ivory, [9.0, 0.4, 3.0], [0, 0.1, 3.4]);
  for (const sx of [-3.4, -1.7, 1.7, 3.4]) { k.cy(ivory, 0.3, 4.6, [sx, 0.5, 4.4], { seg: 10 }); k.cy(gold, 0.36, 0.2, [sx, 0.5, 4.4], { seg: 10 }); k.cy(gold, 0.36, 0.2, [sx, 5.1, 4.4], { seg: 10 }); }
  k.bx(ivory, [9.6, 0.5, 3.4], [0, 5.3, 3.8]);
  k.ex(gold, [[-4.8, 0], [4.8, 0], [0, 2.0]], 0.5, [0, 5.8, 5.4]);
  k.ex('#fff8ea', [[-4.2, 0], [4.2, 0], [0, 1.6]], 0.1, [0, 5.9, 5.7]);
  k.bx('#ffffff', [2.4, 4.0, 0.12], [0, 0.5, 2.96]);
  k.bx('#8a1c2c', [2.0, 3.6, 0.1], [0, 0.55, 3.0]);
  k.cy('#8a1c2c', 1.0, 0.1, [0, 4.15, 3.0], { rx: Math.PI / 2, seg: 12 });
  for (let i = 0; i < 7; i++) k.bx('#e6dfd0', [8.0 + i * 0.4, 0.2, 0.7], [0, 0.1 + i * 0.1, 5.3 + (6 - i) * 0.0 + i * 0.35]);
  k.bx('#c42e3c', [2.4, 0.04, 6.0], [0, 0.78, 6.6]);
  k.bx(gold, [0.2, 0.05, 6.0], [-1.3, 0.8, 6.6]);
  k.bx(gold, [0.2, 0.05, 6.0], [1.3, 0.8, 6.6]);
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) {
    k.cn(P.greenDark, 0.5, 0.0, 1.8, [sx * (6.0 + i * 1.7), 0.12, 6.6], { seg: 8 });
    k.sp(P.red, 0.1, [sx * (6.0 + i * 1.7), 1.2, 6.9], { ws: 6, hs: 4 });
  }
}

// ---------- small park buildings ----------

function greenhouse(m) {
  const k = K(m);
  m.mat('gh_glass', '#cfe9f2', { r: 0.1, a: 0.4 });
  const frame = '#e8edf2';
  k.bx('#c9c3b4', [8.4, 0.3, 5.4], [0, 0, 0]);
  const w = 8.0;
  const d = 5.0;
  for (let i = 0; i <= 8; i++) {
    const x = -w / 2 + (i / 8) * w;
    k.bx(frame, [0.07, 2.4, 0.07], [x, 0.3, d / 2]);
    k.bx(frame, [0.07, 2.4, 0.07], [x, 0.3, -d / 2]);
  }
  for (let i = 0; i <= 5; i++) {
    const z = -d / 2 + (i / 5) * d;
    k.bx(frame, [0.07, 2.4, 0.07], [w / 2, 0.3, z]);
    k.bx(frame, [0.07, 2.4, 0.07], [-w / 2, 0.3, z]);
  }
  k.bx('gh_glass', [w, 2.4, 0.03], [0, 0.3, d / 2]);
  k.bx('gh_glass', [w, 2.4, 0.03], [0, 0.3, -d / 2]);
  k.bx('gh_glass', [0.03, 2.4, d], [w / 2, 0.3, 0]);
  k.bx('gh_glass', [0.03, 2.4, d], [-w / 2, 0.3, 0]);
  for (const y of [0.3, 2.7]) {
    k.bx(frame, [w, 0.07, 0.07], [0, y, d / 2]);
    k.bx(frame, [w, 0.07, 0.07], [0, y, -d / 2]);
    k.bx(frame, [0.07, 0.07, d], [w / 2, y, 0]);
    k.bx(frame, [0.07, 0.07, d], [-w / 2, y, 0]);
  }
  k.fr('gh_glass', w + 0.2, d + 0.2, w + 0.2, 0.2, 1.8, [0, 2.7, 0]);
  k.bx(frame, [w + 0.2, 0.09, 0.09], [0, 4.5, 0]);
  for (const sd of [-1, 1]) k.tb(frame, [[-w / 2 - 0.1, 2.7, sd * (d / 2 + 0.1)], [-0.0, 4.5, sd * 0.1]], 0.04, [0, 0, 0], { seg: 4 });
  for (const sd of [-1, 1]) k.tb(frame, [[w / 2 + 0.1, 2.7, sd * (d / 2 + 0.1)], [0.0, 4.5, sd * 0.1]], 0.04, [0, 0, 0], { seg: 4 });
  k.bx(frame, [1.2, 2.2, 0.1], [0, 0.3, d / 2 + 0.02]);
  for (let i = 0; i < 5; i++) {
    const x = -3.0 + i * 1.5;
    k.cy('#c8703c', 0.3, 0.45, [x, 0.3, -1.2], { seg: 8 });
    k.bl(i % 2 ? P.green : P.greenLight, 0.5, [x, 1.1, -1.2], { seed: i + 40, jitter: 0.14, sy: 1.2 });
    k.sp([P.red, P.yellow, P.pink][i % 3], 0.1, [x + 0.15, 1.5, -0.95], { ws: 6, hs: 4 });
  }
}

function watch_tower(m) {
  const k = K(m);
  const wood = '#9a6a3c';
  const dark = '#6d4524';
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.tb(wood, [[sx * 1.3, 0, sz * 1.3], [sx * 1.0, 4.4, sz * 1.0]], 0.12, [0, 0, 0], { seg: 6 });
  for (const y of [1.0, 2.4, 3.8]) for (const sd of [-1, 1]) {
    const t = y / 4.4;
    const half = 1.3 - 0.3 * t;
    k.bx(wood, [half * 2, 0.1, 0.1], [0, y, sd * half]);
    k.bx(wood, [0.1, 0.1, half * 2], [sd * half, y, 0]);
  }
  for (let i = 0; i < 2; i++) k.tb(dark, [[-1.3, 0.1, 1.3 - i * 0.0], [1.0, 3.9, 1.0]], 0.05, [0, 0, 0], { seg: 4 });
  k.bx('#c9a06b', [2.6, 0.14, 2.6], [0, 4.4, 0], { r: 0.02 });
  for (const sd of [-1, 1]) {
    k.bx(wood, [2.6, 0.9, 0.08], [0, 4.5, sd * 1.25]);
    k.bx(wood, [0.08, 0.9, 2.6], [sd * 1.25, 4.5, 0]);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.bx(dark, [0.12, 1.8, 0.12], [sx * 1.2, 4.5, sz * 1.2]);
  k.fr('#a9503c', 3.4, 3.4, 0.4, 0.4, 1.3, [0, 6.3, 0]);
  k.sp(P.gold, 0.1, [0, 7.65, 0]);
  for (let i = 0; i < 12; i++) k.bx(wood, [0.9, 0.06, 0.08], [-0.0, 0.3 + i * 0.34, 1.3 - i * 0.025], { rx: 0 });
  k.cy(P.steelDark, 0.07, 0.9, [0.4, 4.7, 0.4], { rx: 1.3, seg: 8 });
  k.cy(P.steel, 0.1, 0.25, [0.4, 4.95, 0.95], { rx: 1.3, seg: 8 });
  k.cy(P.steelDark, 0.04, 0.8, [0.4, 4.5, 0.4], { seg: 6 });
  k.cy(P.steelDark, 0.03, 1.3, [-1.2, 6.2, -1.2], { seg: 5 });
  k.bx(P.red, [0.8, 0.5, 0.03], [-0.8, 7.0, -1.2]);
}

function beach_shack(m) {
  const k = K(m);
  const bamboo = '#d9b06a';
  const thatch = '#c9a55a';
  k.bx('#e9d3a0', [4.2, 0.2, 3.2], [0, 0, 0]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.cy(bamboo, 0.1, 2.5, [sx * 1.8, 0.2, sz * 1.3], { seg: 7 });
  k.bx(bamboo, [3.6, 1.0, 0.08], [0, 0.2, -1.3]);
  for (const sd of [-1, 1]) k.bx(bamboo, [0.08, 1.0, 2.6], [sd * 1.8, 0.2, 0]);
  k.bx('#8a5a35', [3.8, 0.12, 0.7], [0, 1.1, 1.3], { r: 0.02 });
  for (let i = 0; i < 6; i++) k.bx(i % 2 ? '#ffffff' : '#e2434f', [0.55, 0.5, 0.05], [-1.5 + i * 0.6, 0.65, 1.62]);
  k.fr(thatch, 4.8, 4.0, 1.2, 0.8, 1.5, [0, 2.7, 0]);
  for (let i = 0; i < 12; i++) k.bx('#b8934a', [0.12, 0.04, 1.8], [-2.0 + i * 0.36, 2.9 + 0.0, 0.7 + 0.0], { rx: -0.6 });
  for (const [x, c] of [[-1.0, P.pink], [-0.5, P.yellow], [0.0, P.sky], [0.6, P.orange]]) k.cn(c, 0.09, 0.07, 0.24, [x, 1.22, 1.3], { seg: 8 });
  k.cy(P.steelDark, 0.03, 1.8, [2.2, 0.0, 1.6], { seg: 6 });
  k.bx(P.yellow, [0.6, 0.4, 0.05], [2.2, 1.6, 1.6]);
  k.bx('#f07a90', [0.4, 0.2, 0.06], [2.2, 1.7, 1.63]);
}

export const RECIPES = {
  little_house: { build: little_house, kind: 'building', foot: [14.0, 12.0], name: 'My little house', maxTris: 12000 },
  granny_house: { build: granny_house, kind: 'building', foot: [22.0, 16.0], name: "Granny's big house", maxTris: 20000 },
  school: { build: school, kind: 'building', foot: [24.0, 14.0], name: 'School', maxTris: 15000 },
  hospital: { build: hospital, kind: 'building', foot: [27.0, 14.0], name: 'Hospital', maxTris: 15000 },
  palace: { build: palace, kind: 'building', foot: [30.0, 16.0], name: 'Palace', maxTris: 20000 },
  greenhouse: { build: greenhouse, kind: 'building', foot: [8.6, 5.6], name: 'Greenhouse' },
  watch_tower: { build: watch_tower, kind: 'building', foot: [3.0, 3.0], name: 'Watch tower' },
  beach_shack: { build: beach_shack, kind: 'building', foot: [4.4, 3.6], name: 'Beach shack' },
};
