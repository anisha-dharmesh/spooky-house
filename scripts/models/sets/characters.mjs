// Characters, rigged and animated, matched to the "Characters" strip of docs/art/reference/01-asset-pack-overview.webp:
// Anisha, Granny, the scary teacher, Labubu, Kabla, Rani, Kamala, and the parrot, dog and cat.
// Big round heads and big eyes (chibi), simple rigid skeleton, the animations the game uses:
//   Anisha: idle, walk, sneak, pickup, hide.   Baddies: idle, walk, look_around, caught_you.   Others: idle, walk.
// Front is +Z; the character's left is +X.
import { kit } from '../kit.mjs';
import { Rig, sin, cos, TAU } from '../rig.mjs';

const SKIN = { anisha: '#e0a67b', granny: '#dcab86', teacher: '#e3b08a', rani: '#dca078', kamala: '#d99c74' };

// ---------- the humanoid body ----------

/** Builds a chibi body with the given look and returns the rig and some numbers the animations need. */
function humanoid(m, S) {
  const u = S.H;
  const rig = new Rig(m);
  const yHip = 0.34 * u;
  rig.bone('hips', null, [0, yHip, 0]);
  rig.bone('spine', 'hips', [0, yHip + 0.02 * u, 0]);
  rig.bone('head', 'spine', [0, 0.61 * u, 0]);
  for (const [sd, L] of [[1, 'L'], [-1, 'R']]) {
    rig.bone(`armU_${L}`, 'spine', [sd * 0.155 * u, 0.58 * u, 0]);
    rig.bone(`armL_${L}`, `armU_${L}`, [sd * 0.158 * u, 0.44 * u, 0]);
    rig.bone(`thigh_${L}`, 'hips', [sd * 0.07 * u, yHip, 0]);
    rig.bone(`shin_${L}`, `thigh_${L}`, [sd * 0.07 * u, yHip - 0.17 * u, 0]);
  }
  const skin = S.skin;
  const kh = kit(m, rig.bones.hips.node);
  const ks = kit(m, rig.bones.spine.node);
  const kd = kit(m, rig.bones.head.node);

  // pelvis, skirt
  kh.bx(S.bottom, [0.27 * u, 0.09 * u, 0.17 * u], [0, -0.06 * u, 0], { r: 0.03 * u });
  if (S.skirt) kh.cn(S.skirt.color, S.skirt.r1 * u, S.skirt.r0 * u, S.skirt.h * u, [0, -S.skirt.h * u + 0.04 * u, 0], { seg: 14 });

  // torso: a rounded box with the top colour, plus a neck and details
  ks.bx(S.top, [0.27 * u, 0.28 * u, 0.18 * u], [0, -0.005 * u, 0], { r: 0.05 * u, n: 3 });
  ks.cy(skin, 0.045 * u, 0.04 * u, [0, 0.27 * u, 0]);
  if (S.torso) S.torso(ks, u);

  // arms and hands
  for (const [sd, L] of [[1, 'L'], [-1, 'R']]) {
    const ka = kit(m, rig.bones[`armU_${L}`].node);
    const kf = kit(m, rig.bones[`armL_${L}`].node);
    ka.sp(S.sleeve ?? S.top, 0.047 * u, [0, 0, 0], { ws: 8, hs: 6 });
    ka.tb(S.sleeve ?? S.top, [[0, 0, 0], [0, -0.14 * u, 0]], 0.044 * u, [0, 0, 0], { seg: 7 });
    kf.tb(S.sleeveLow ?? S.sleeve ?? skin, [[0, 0, 0], [0, -0.11 * u, 0]], 0.04 * u, [0, 0, 0], { seg: 7 });
    kf.sp(S.glove ?? skin, 0.045 * u, [0, -0.135 * u, 0.0], { ws: 8, hs: 6 });
    if (S.hand) S.hand(kf, u, sd, L);
    // legs and shoes
    const kt = kit(m, rig.bones[`thigh_${L}`].node);
    const kn = kit(m, rig.bones[`shin_${L}`].node);
    kt.tb(S.legs ?? S.bottom, [[0, 0.0, 0], [0, -0.16 * u, 0]], 0.056 * u, [0, 0, 0], { seg: 8 });
    kn.tb(S.legsLow ?? S.legs ?? S.bottom, [[0, 0.0, 0], [0, -0.13 * u, 0]], 0.05 * u, [0, 0, 0], { seg: 8 });
    kn.bx(S.shoe, [0.085 * u, 0.055 * u, 0.15 * u], [0, -0.17 * u, 0.025 * u], { r: 0.022 * u });
    kn.bx(S.sole ?? '#f4f3ef', [0.088 * u, 0.018 * u, 0.152 * u], [0, -0.17 * u, 0.025 * u]);
  }

  // head, face
  const R = 0.17 * u;
  const cy = 0.15 * u;
  kd.sp(skin, R, [0, cy, 0], { sy: 0.96, ws: 18, hs: 12 });
  face(kd, u, R, cy, S);
  if (S.head) S.head(kd, u, R, cy);
  return { rig, u };
}

function face(kd, u, R, cy, S) {
  const eye = S.eye ?? '#3a2418';
  for (const sd of [1, -1]) {
    const x = sd * 0.074 * u;
    kd.sp('#ffffff', 0.05 * u, [x, cy - 0.005 * u, R * 0.86], { sz: 0.5, sy: 1.12, ws: 12, hs: 8 });
    kd.sp(eye, 0.036 * u, [x + sd * -0.004 * u, cy - 0.012 * u, R * 0.9], { sz: 0.5, sy: 1.15, ws: 10, hs: 6 });
    kd.sp('#0e0b0c', 0.02 * u, [x + sd * -0.004 * u, cy - 0.012 * u, R * 0.93], { sz: 0.4, sy: 1.1, ws: 8, hs: 5 });
    kd.sp('#ffffff', 0.011 * u, [x + sd * 0.008 * u, cy + 0.012 * u, R * 0.95], { sz: 0.4, ws: 6, hs: 4 });
    // brows
    const tilt = (S.brow ?? 0) * sd;
    kd.bx(S.browColor ?? '#2a1a14', [0.07 * u, 0.012 * u, 0.012 * u], [x, cy + 0.07 * u, R * 0.85], { rz: tilt, r: 0.005 * u });
    if (S.blush !== false) kd.sp('#f0827c', 0.03 * u, [sd * 0.115 * u, cy - 0.05 * u, R * 0.72], { sz: 0.35, sy: 0.8, ws: 8, hs: 5 });
  }
  kd.sp(S.noseColor ?? '#cf8f6b', 0.016 * u, [0, cy - 0.03 * u, R * 0.98], { ws: 6, hs: 4 });
  if (!S.mask) {
    const mood = S.mouth ?? 'smile';
    const y = cy - 0.077 * u;
    if (mood === 'smile') {
      kd.bx('#a84a4a', [0.05 * u, 0.012 * u, 0.012 * u], [0, y, R * 0.95], { r: 0.005 * u });
      kd.bx('#a84a4a', [0.018 * u, 0.012 * u, 0.012 * u], [0.032 * u, y + 0.007 * u, R * 0.93], { rz: 0.5 });
      kd.bx('#a84a4a', [0.018 * u, 0.012 * u, 0.012 * u], [-0.032 * u, y + 0.007 * u, R * 0.93], { rz: -0.5 });
    } else if (mood === 'frown') {
      kd.bx('#7d2f2f', [0.05 * u, 0.013 * u, 0.012 * u], [0, y - 0.004 * u, R * 0.95], { r: 0.005 * u });
      kd.bx('#7d2f2f', [0.02 * u, 0.013 * u, 0.012 * u], [0.032 * u, y - 0.012 * u, R * 0.93], { rz: -0.5 });
      kd.bx('#7d2f2f', [0.02 * u, 0.013 * u, 0.012 * u], [-0.032 * u, y - 0.012 * u, R * 0.93], { rz: 0.5 });
    } else {
      kd.bx('#8a3b3b', [0.045 * u, 0.012 * u, 0.012 * u], [0, y, R * 0.95]);
    }
  }
}

/** A hair cap with a fringe: used by most people. */
function hairCap(kd, u, R, cy, color, { back = 0.02, fringe = true, sides = 0.0 } = {}) {
  kd.sp(color, R * 1.07, [0, cy + 0.015 * u, -back * u], { sy: 0.98, ws: 16, hs: 10 });
  if (fringe) {
    for (const [x, y, z, s] of [[-0.09, 0.115, 0.1, 1], [0.0, 0.135, 0.115, 1.1], [0.09, 0.115, 0.1, 1], [-0.145, 0.06, 0.06, 0.8], [0.145, 0.06, 0.06, 0.8]])
      kd.sp(color, 0.07 * u * s, [x * u, cy + y * u, z * u], { sy: 0.65, sz: 0.8, ws: 8, hs: 5 });
  }
  if (sides) for (const sd of [1, -1]) kd.sp(color, 0.07 * u, [sd * 0.15 * u, cy - 0.04 * u, -0.02 * u], { sy: sides, ws: 8, hs: 6 });
}

function glasses(kd, u, R, cy, color = '#2a2a30') {
  for (const sd of [1, -1]) kd.ring(color, 0.055 * u, 0.007 * u, [sd * 0.074 * u, cy - 0.005 * u, R * 0.93], { rx: Math.PI / 2, seg: 14, segr: 4 });
  kd.bx(color, [0.04 * u, 0.008 * u, 0.008 * u], [0, cy + 0.005 * u, R * 0.95]);
  for (const sd of [1, -1]) kd.bx(color, [0.008 * u, 0.008 * u, 0.1 * u], [sd * 0.128 * u, cy, R * 0.55]);
}

// ---------- the animations every person shares ----------

const dig = (v) => v;

/** Standard animations for a humanoid. `kinds` picks which to make. */
function humanoidAnimations(rig, u, kinds) {
  const arms = (a) => ({ armU_L: [a.uL ?? 0, 0, a.zL ?? 0.06], armL_L: [a.lL ?? -0.15, 0, 0], armU_R: [a.uR ?? 0, 0, a.zR ?? -0.06], armL_R: [a.lR ?? -0.15, 0, 0] });
  const legs = (a) => ({ thigh_L: [a.tL ?? 0, 0, 0], shin_L: [a.sL ?? 0, 0, 0], thigh_R: [a.tR ?? 0, 0, 0], shin_R: [a.sR ?? 0, 0, 0] });
  const all = (o) => ({ ...arms(o), ...legs(o) });

  const make = {
    idle() {
      rig.animate('idle', 2.6, (p) => {
        const b = sin(p * TAU);
        return { ...all({ uL: b * 0.04, uR: -b * 0.04, lL: -0.12 + b * 0.03, lR: -0.12 - b * 0.03 }), spine: [0.015 * b, 0, 0], head: [-0.02 * b, 0.05 * sin(p * TAU * 0.5), 0.02 * b], hips: [0, 0, 0], move: { hips: [0, 0.006 * u * b, 0] } };
      });
    },
    walk() {
      rig.animate('walk', 0.8, (p) => {
        const w = p * TAU;
        const s = sin(w);
        const flexL = Math.max(0, sin(w + 1.6));
        const flexR = Math.max(0, sin(w + 1.6 + Math.PI));
        return {
          ...all({ tL: -s * 0.65, tR: s * 0.65, sL: 0.1 + 0.7 * flexL, sR: 0.1 + 0.7 * flexR, uL: s * 0.55, uR: -s * 0.55, lL: -0.3 - 0.2 * Math.max(0, -s), lR: -0.3 - 0.2 * Math.max(0, s) }),
          spine: [0.04, 0.1 * s, 0], head: [-0.04, -0.1 * s, 0], hips: [0, -0.08 * s, 0],
          move: { hips: [0, 0.025 * u * Math.abs(cos(w)) - 0.012 * u, 0] },
        };
      });
    },
    sneak() {
      rig.animate('sneak', 1.3, (p) => {
        const w = p * TAU;
        const s = sin(w);
        const flexL = Math.max(0, sin(w + 1.6));
        const flexR = Math.max(0, sin(w + 1.6 + Math.PI));
        return {
          ...all({ tL: -0.6 - s * 0.35, tR: -0.6 + s * 0.35, sL: 0.95 + 0.3 * flexL, sR: 0.95 + 0.3 * flexR, uL: s * 0.3 + 0.2, uR: -s * 0.3 + 0.2, lL: -0.9, lR: -0.9 }),
          spine: [0.4, 0.08 * s, 0], head: [-0.3, -0.08 * s, 0], hips: [0, 0, 0],
          move: { hips: [0, -0.115 * u + 0.008 * u * Math.abs(cos(w)), 0.02 * u] },
        };
      });
    },
    pickup() {
      rig.animate('pickup', 1.3, (p) => {
        const k = p < 0.4 ? p / 0.4 : p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4;
        const e = k * k * (3 - 2 * k);
        return {
          ...all({ tL: -0.7 * e, tR: -0.7 * e, sL: 1.1 * e, sR: 1.1 * e, uL: -0.3 * e, uR: -0.9 * e, lL: -0.3 * e, lR: -0.5 * e }),
          spine: [0.7 * e, 0, 0], head: [0.3 * e, 0, 0], hips: [0, 0, 0],
          move: { hips: [0, -0.13 * u * e, 0.03 * u * e] },
        };
      }, { loop: false });
    },
    hide() {
      rig.animate('hide', 0.8, (p) => {
        const e = Math.min(1, p / 0.7);
        const k = e * e * (3 - 2 * e);
        return {
          ...all({ tL: -1.3 * k, tR: -1.3 * k, sL: 1.9 * k, sR: 1.9 * k, uL: -1.4 * k, uR: -1.4 * k, lL: -2.0 * k, lR: -2.0 * k, zL: 0.06 - 0.2 * k, zR: -0.06 + 0.2 * k }),
          spine: [0.85 * k, 0, 0], head: [0.5 * k, 0, 0], hips: [0, 0, 0],
          move: { hips: [0, -0.2 * u * k, 0.04 * u * k] },
        };
      }, { loop: false });
    },
    look_around() {
      rig.animate('look_around', 3.2, (p) => {
        const w = p * TAU;
        const turn = sin(w) * 0.9;
        return { ...all({ lL: -0.2, lR: -0.2, uL: 0.05, uR: -0.05 }), spine: [0.02, turn * 0.3, 0], head: [-0.05, turn * 0.8, 0], hips: [0, turn * 0.05, 0], move: { hips: [0, 0.004 * u * sin(w * 2), 0] } };
      });
    },
    caught_you() {
      rig.animate('caught_you', 1.2, (p) => {
        const k = Math.min(1, p / 0.35);
        const e = k * k * (3 - 2 * k);
        const wag = p > 0.35 ? sin((p - 0.35) * TAU * 3) * 0.12 : 0;
        return {
          ...all({ uL: -1.55 * e, lL: -0.1 * e + wag, zL: 0.06, uR: 0.3 * e, lR: -1.2 * e, zR: -0.5 * e }),
          spine: [0.12 * e, 0, 0], head: [0.1 * e + wag * 0.3, 0.0, 0], hips: [0, 0, 0],
        };
      }, { loop: false });
    },
  };
  for (const k of kinds) make[k]();
}

// ---------- the people ----------

const WALKERS = ['idle', 'walk'];
const BADDIE_ANIMS = ['idle', 'walk', 'look_around', 'caught_you'];

function anisha(m) {
  const S = {
    H: 1.2, skin: SKIN.anisha, top: '#ef6fae', sleeve: '#ef6fae', bottom: '#3f78c9', legs: '#3f78c9', shoe: '#7cc4ec', sole: '#ffffff', eye: '#3a2418', mouth: 'smile',
    torso(ks, u) {
      ks.bx('#d9549a', [0.28 * u, 0.04 * u, 0.19 * u], [0, -0.125 * u, 0], { r: 0.015 * u });                 // hem
      ks.bx('#ff8cc2', [0.1 * u, 0.04 * u, 0.012 * u], [0, 0.1 * u, 0.092 * u], { r: 0.01 * u });              // pocket stripe
      ks.sp('#f9b4d6', 0.012 * u, [0.03 * u, 0.15 * u, 0.094 * u]);
    },
    head(kd, u, R, cy) {
      hairCap(kd, u, R, cy, '#1b1b22', { back: 0.03 });
      kd.tb('#1b1b22', [[0, cy + 0.1 * u, -R * 0.9], [0, cy + 0.14 * u, -R - 0.09 * u], [0, cy + 0.02 * u, -R - 0.18 * u], [0, cy - 0.14 * u, -R - 0.14 * u], [0, cy - 0.27 * u, -R - 0.08 * u]], 0.055 * u, [0, 0, 0], { seg: 8 });
      kd.sp('#1b1b22', 0.045 * u, [0, cy - 0.29 * u, -R - 0.075 * u], { sy: 1.2 });
      kd.sp('#ee5aa2', 0.04 * u, [0, cy + 0.1 * u, -R - 0.03 * u], { ws: 8, hs: 6 });
      for (const sd of [1, -1]) kd.sp('#1b1b22', 0.05 * u, [sd * 0.1 * u, cy + 0.03 * u, 0.13 * u], { sy: 1.3, sz: 0.6, ws: 8, hs: 6 }); // side locks
    },
  };
  const { rig, u } = humanoid(m, S);
  humanoidAnimations(rig, u, ['idle', 'walk', 'sneak', 'pickup', 'hide']);
}

function granny(m) {
  const S = {
    H: 1.5, skin: SKIN.granny, top: '#7a4fb2', sleeve: '#7a4fb2', bottom: '#e8a4be', legs: '#d7c9d8', shoe: '#6b4a38', sole: '#3a2a22', eye: '#4a3a2a', mouth: 'smile', brow: 0,
    skirt: { color: '#e8a4be', r0: 0.13, r1: 0.2, h: 0.26 },
    torso(ks, u) {
      ks.bx('#e8a4be', [0.1 * u, 0.26 * u, 0.012 * u], [0, 0.0, 0.092 * u], { r: 0.01 * u });                  // blouse showing
      for (const sd of [1, -1]) ks.bx('#684099', [0.045 * u, 0.28 * u, 0.012 * u], [sd * 0.085 * u, 0.0, 0.094 * u]);
      for (let i = 0; i < 3; i++) ks.sp('#f3d27a', 0.01 * u, [0, 0.1 * u - i * 0.07 * u, 0.1 * u]);
    },
    head(kd, u, R, cy) {
      kd.sp('#bdb7c9', R * 1.04, [0, cy + 0.025 * u, -0.025 * u], { sy: 0.98, ws: 16, hs: 10 });
      for (const [x, y, z] of [[-0.09, 0.115, 0.1], [0.0, 0.135, 0.11], [0.09, 0.115, 0.1]]) kd.sp('#c9c3d4', 0.07 * u, [x * u, cy + y * u, z * u], { sy: 0.6, sz: 0.8, ws: 8, hs: 5 });
      kd.sp('#c9c3d4', 0.08 * u, [0, cy + 0.2 * u, -0.02 * u], { ws: 10, hs: 8 });                             // bun
      kd.ring('#9a7fc0', 0.07 * u, 0.014 * u, [0, cy + 0.17 * u, -0.02 * u], { seg: 12, segr: 4 });
      glasses(kd, u, R, cy, '#6b4a38');
    },
  };
  const { rig, u } = humanoid(m, S);
  humanoidAnimations(rig, u, [...WALKERS, 'look_around', 'caught_you']);
}

function scary_teacher(m) {
  const S = {
    H: 1.6, skin: SKIN.teacher, top: '#2b4aa0', sleeve: '#2b4aa0', bottom: '#212329', legs: SKIN.teacher, shoe: '#17181c', sole: '#0d0e10', eye: '#2a1c14', mouth: 'frown', brow: -0.45, blush: false,
    torso(ks, u) {
      ks.bx('#ffffff', [0.09 * u, 0.2 * u, 0.012 * u], [0, 0.03 * u, 0.094 * u]);                              // shirt
      ks.bx('#d73a42', [0.035 * u, 0.17 * u, 0.012 * u], [0, 0.02 * u, 0.1 * u], { r: 0.004 * u });             // tie
      for (const sd of [1, -1]) ks.fr('#3a5cb8', 0.07 * u, 0.012 * u, 0.02 * u, 0.012 * u, 0.1 * u, [sd * 0.07 * u, 0.15 * u, 0.094 * u], { rz: sd * 0.5 }); // lapels
    },
    hand(kf, u, sd, L) {
      if (L === 'R') {
        kf.bx('#f2c85a', [0.04 * u, 0.5 * u, 0.012 * u], [0, -0.55 * u, 0.06 * u], { rx: 0.5, r: 0.004 * u });   // a ruler
        for (let i = 0; i < 9; i++) {
          const t = (-0.2 + i * 0.05) * u;
          kf.bx('#8a6a2a', [0.02 * u, 0.004 * u, 0.014 * u], [-0.0 * u, -0.3 * u + t * Math.cos(0.5), 0.066 * u + t * Math.sin(0.5)], { rx: 0.5 });
        }
      }
    },
    head(kd, u, R, cy) {
      hairCap(kd, u, R, cy, '#241c20', { back: 0.04, sides: 1.6 });
      kd.sp('#241c20', 0.1 * u, [-0.1 * u, cy + 0.11 * u, 0.02 * u], { sy: 0.8 });
      kd.sp('#241c20', 0.1 * u, [0.1 * u, cy + 0.11 * u, 0.02 * u], { sy: 0.8 });
      glasses(kd, u, R, cy, '#1f1f24');
    },
  };
  const { rig, u } = humanoid(m, S);
  humanoidAnimations(rig, u, BADDIE_ANIMS);
}

function labubu(m) {
  const fur = '#f4f2ee';
  const S = {
    H: 1.4, skin: '#f7f5f1', top: '#272529', sleeve: fur, sleeveLow: fur, bottom: fur, legs: fur, shoe: fur, sole: '#d9d5cf', eye: '#141214', mouth: 'smile', blush: false, browColor: '#ee5a5a', brow: 0.2,
    glove: fur,
    torso(ks, u) {
      ks.bx(fur, [0.28 * u, 0.1 * u, 0.2 * u], [0, -0.1 * u, 0], { r: 0.04 * u });
      ks.bx('#1d1b1f', [0.28 * u, 0.2 * u, 0.19 * u], [0, 0.04 * u, 0], { r: 0.05 * u });
      for (let i = 0; i < 3; i++) ks.sp('#e8b74a', 0.014 * u, [0, 0.14 * u - i * 0.06 * u, 0.098 * u]);
      ks.bx(fur, [0.1 * u, 0.04 * u, 0.012 * u], [0, 0.17 * u, 0.098 * u]);
    },
    head(kd, u, R, cy) {
      // a fluffy hood with two tall ears
      kd.sp(fur, R * 1.16, [0, cy + 0.02 * u, -0.03 * u], { sy: 1.02, ws: 14, hs: 10 });
      kd.sp(fur, 0.1 * u, [0, cy + 0.15 * u, 0.1 * u], { sy: 0.7, ws: 8, hs: 6 });
      for (const sd of [1, -1]) {
        kd.sp(fur, 0.075 * u, [sd * 0.13 * u, cy + 0.24 * u, 0], { sy: 3.0, sz: 0.55, rz: -sd * 0.2, ws: 8, hs: 8 });
        kd.sp('#ee4a54', 0.052 * u, [sd * 0.135 * u, cy + 0.245 * u, 0.025 * u], { sy: 2.8, sz: 0.4, rz: -sd * 0.2, ws: 8, hs: 8 });
        kd.sp('#141214', 0.05 * u, [sd * 0.074 * u, cy - 0.005 * u, R * 0.9], { sz: 0.4, sy: 1.1, ws: 10, hs: 6 });
        kd.ring('#ffffff', 0.05 * u, 0.008 * u, [sd * 0.074 * u, cy - 0.005 * u, R * 0.94], { rx: Math.PI / 2, seg: 12, segr: 4 });
        kd.sp('#ee6a6a', 0.032 * u, [sd * 0.115 * u, cy - 0.055 * u, R * 0.74], { sz: 0.35, sy: 0.8, ws: 8, hs: 5 });
      }
      kd.cn('#f4d96a', 0.016 * u, 0.0, 0.07 * u, [0, cy + 0.15 * u, R * 1.0], { seg: 6 });                   // little horn
      for (const sd of [1, -1]) kd.bx('#ffffff', [0.016 * u, 0.025 * u, 0.008 * u], [sd * 0.012 * u, cy - 0.098 * u, R * 0.95]);
    },
  };
  const { rig, u } = humanoid(m, S);
  humanoidAnimations(rig, u, BADDIE_ANIMS);
}

function kabla(m) {
  const black = '#1c1c21';
  const S = {
    H: 1.5, skin: '#c8956f', top: black, sleeve: black, sleeveLow: black, bottom: '#17171b', legs: '#17171b', shoe: '#101013', sole: '#2a2a30', glove: '#121215', eye: '#e08a2a', mouth: 'flat', mask: true, brow: -0.55, blush: false, browColor: '#0e0e10', noseColor: '#c8956f',
    torso(ks, u) {
      ks.bx('#26262c', [0.15 * u, 0.09 * u, 0.012 * u], [0, -0.07 * u, 0.098 * u], { r: 0.008 * u });          // pocket
      ks.bx('#2c2c33', [0.012 * u, 0.2 * u, 0.012 * u], [0, 0.04 * u, 0.098 * u]);                              // zip
      ks.sp('#2c2c33', 0.012 * u, [-0.04 * u, 0.2 * u, 0.098 * u]);
      ks.sp('#2c2c33', 0.012 * u, [0.04 * u, 0.2 * u, 0.098 * u]);
    },
    head(kd, u, R, cy) {
      kd.sp(black, R * 1.14, [0, cy + 0.03 * u, -0.03 * u], { sy: 1.04, ws: 16, hs: 10 });                    // the hood
      kd.sp(black, 0.12 * u, [0, cy + 0.14 * u, 0.0], { sy: 0.8, ws: 10, hs: 8 });
      kd.sp('#c8956f', R * 0.99, [0, cy, 0.01 * u], { sy: 0.9, sz: 0.9, ws: 16, hs: 10 });                    // a patch of face
      kd.bx('#16161a', [0.23 * u, 0.1 * u, 0.12 * u], [0, cy - 0.07 * u, R * 0.62], { r: 0.04 * u });         // the mask
      kd.sp('#16161a', 0.12 * u, [0, cy - 0.085 * u, R * 0.7], { sy: 0.7, sz: 0.55, ws: 10, hs: 6 });
      for (const sd of [1, -1]) kd.bx('#16161a', [0.09 * u, 0.09 * u, 0.012 * u], [sd * 0.074 * u, cy + 0.07 * u, R * 0.9], { rz: -sd * -0.45 }); // angry lids over the eyes
    },
  };
  const { rig, u } = humanoid(m, S);
  humanoidAnimations(rig, u, BADDIE_ANIMS);
}

function rani(m) {
  const S = {
    H: 1.15, skin: SKIN.rani, top: '#f088b8', sleeve: '#f7f4f2', sleeveLow: '#f7f4f2', bottom: '#3d7ac8', legs: '#3d7ac8', shoe: '#f26a4d', sole: '#ffffff', eye: '#3a2418', mouth: 'smile',
    torso(ks, u) {
      ks.sp('#ffd6e8', 0.016 * u, [-0.05 * u, 0.1 * u, 0.094 * u]);
      ks.bx('#f7f4f2', [0.09 * u, 0.025 * u, 0.012 * u], [0, 0.17 * u, 0.094 * u]);
    },
    head(kd, u, R, cy) {
      hairCap(kd, u, R, cy, '#1b1517', { back: 0.04 });
      for (const sd of [1, -1]) kd.tb('#1b1517', [[sd * 0.15 * u, cy + 0.03 * u, -0.02 * u], [sd * 0.17 * u, cy - 0.1 * u, -0.03 * u], [sd * 0.16 * u, cy - 0.28 * u, -0.05 * u]], 0.05 * u, [0, 0, 0], { seg: 7 });
      kd.tb('#1b1517', [[0, cy + 0.05 * u, -R], [0, cy - 0.1 * u, -R - 0.04 * u], [0, cy - 0.3 * u, -R]], 0.08 * u, [0, 0, 0], { seg: 7 });
      kd.ring('#d6323a', R * 0.93, 0.02 * u, [0, cy + 0.125 * u, -0.025 * u], { seg: 18, segr: 4, rx: 0.35 });     // red hairband
    },
  };
  const { rig, u } = humanoid(m, S);
  humanoidAnimations(rig, u, [...WALKERS, 'look_around']);
}

function kamala(m) {
  const S = {
    H: 1.15, skin: SKIN.kamala, top: '#f7d24a', sleeve: '#f7d24a', sleeveLow: '#f7d24a', bottom: '#8a54c4', legs: SKIN.kamala, shoe: '#e2434f', sole: '#ffffff', eye: '#3a2418', mouth: 'smile',
    skirt: { color: '#8a54c4', r0: 0.13, r1: 0.17, h: 0.16 },
    torso(ks, u) {
      ks.bx('#f2a1c8', [0.07 * u, 0.2 * u, 0.2 * u], [0.14 * u, 0.0, 0.0], { r: 0.02 * u });                    // a pink sleeve
      ks.bx('#ffffff', [0.1 * u, 0.025 * u, 0.012 * u], [0, 0.17 * u, 0.094 * u]);
    },
    head(kd, u, R, cy) {
      hairCap(kd, u, R, cy, '#1a1416', { back: 0.04, sides: 1.9 });
      kd.ring('#d6323a', R * 0.93, 0.02 * u, [0, cy + 0.125 * u, -0.025 * u], { seg: 18, segr: 4, rx: 0.35 });
      kd.sp('#ff9bc4', 0.03 * u, [-0.15 * u, cy + 0.1 * u, 0.0], { ws: 6, hs: 4 });
    },
  };
  const { rig, u } = humanoid(m, S);
  humanoidAnimations(rig, u, [...WALKERS, 'look_around']);
}

// ---------- the pets ----------

/** A sitting-or-trotting four-legged pet. */
function quadruped(m, P) {
  const rig = new Rig(m);
  const s = P.s;
  rig.bone('hips', null, [0, 0.26 * s, -0.16 * s]);
  rig.bone('spine', 'hips', [0, 0.28 * s, 0.0]);
  rig.bone('head', 'spine', [0, 0.36 * s, 0.2 * s]);
  rig.bone('tail', 'hips', [0, 0.3 * s, -0.3 * s]);
  rig.bone('tail2', 'tail', [0, 0.33 * s, -0.42 * s]);
  for (const [sd, L] of [[1, 'L'], [-1, 'R']]) {
    rig.bone(`legF_${L}`, 'spine', [sd * 0.085 * s, 0.22 * s, 0.12 * s]);
    rig.bone(`legB_${L}`, 'hips', [sd * 0.095 * s, 0.2 * s, -0.17 * s]);
  }
  const kh = kit(m, rig.bones.hips.node);
  const ks = kit(m, rig.bones.spine.node);
  const kd = kit(m, rig.bones.head.node);
  kh.sp(P.body, 0.14 * s, [0, 0.0, -0.01 * s], { sx: 0.95, sy: 0.95, sz: 1.15, ws: 12, hs: 8 });
  ks.sp(P.body, 0.14 * s, [0, 0.02 * s, 0.06 * s], { sx: 0.95, sy: 1.0, sz: 1.1, ws: 12, hs: 8 });
  ks.sp(P.chest, 0.1 * s, [0, -0.02 * s, 0.13 * s], { sy: 1.1, sz: 0.7, ws: 10, hs: 6 });
  // head
  kd.sp(P.head, 0.115 * s, [0, 0.0, 0], { ws: 14, hs: 10 });
  kd.sp(P.snout, 0.065 * s, [0, -0.03 * s, 0.1 * s], { sx: 0.9, sy: 0.75, sz: 1.2, ws: 10, hs: 6 });
  kd.sp(P.nose, 0.025 * s, [0, -0.012 * s, 0.17 * s], { ws: 8, hs: 5 });
  for (const sd of [1, -1]) {
    kd.sp('#ffffff', 0.032 * s, [sd * 0.05 * s, 0.025 * s, 0.093 * s], { sz: 0.5, ws: 10, hs: 6 });
    kd.sp(P.eye, 0.022 * s, [sd * 0.05 * s, 0.022 * s, 0.103 * s], { sz: 0.5, ws: 8, hs: 5 });
    kd.sp('#0e0b0c', 0.012 * s, [sd * 0.05 * s, 0.022 * s, 0.11 * s], { sz: 0.4, ws: 6, hs: 4 });
    P.ear(kd, s, sd);
  }
  P.headExtras?.(kd, s);
  // legs
  for (const [sd, L] of [[1, 'L'], [-1, 'R']]) {
    const f = kit(m, rig.bones[`legF_${L}`].node);
    const b = kit(m, rig.bones[`legB_${L}`].node);
    f.tb(P.leg, [[0, 0, 0], [0, -0.21 * s, 0]], 0.04 * s, [0, 0, 0], { seg: 7 });
    f.sp(P.paw, 0.045 * s, [0, -0.21 * s, 0.015 * s], { sz: 1.3, sy: 0.7, ws: 8, hs: 5 });
    b.sp(P.body, 0.075 * s, [0, 0.0, 0.0], { sy: 1.1, ws: 8, hs: 6 });
    b.tb(P.leg, [[0, 0, 0], [0, -0.19 * s, 0]], 0.036 * s, [0, 0, 0], { seg: 7 });
    b.sp(P.paw, 0.045 * s, [0, -0.19 * s, 0.015 * s], { sz: 1.3, sy: 0.7, ws: 8, hs: 5 });
  }
  const kt = kit(m, rig.bones.tail.node);
  const kt2 = kit(m, rig.bones.tail2.node);
  P.tail(kt, kt2, s);

  const sit = { hips: [0, 0, 0], spine: [-0.75, 0, 0], head: [0.6, 0, 0], move: { hips: [0, -0.1 * s, -0.05 * s] }, legB_L: [-1.3, 0, 0], legB_R: [-1.3, 0, 0], legF_L: [0.0, 0, 0], legF_R: [0.0, 0, 0] };
  rig.animate('idle', 2.4, (p) => {
    const w = sin(p * TAU);
    return { ...sit, head: [0.6 + 0.05 * w, 0.25 * sin(p * TAU * 0.5), 0.1 * w], tail: [0.2, 0.0, 0.0], tail2: [0, 0.5 * w, 0], legF_L: [0.75 + 0.02 * w, 0, 0], legF_R: [0.75 - 0.02 * w, 0, 0] };
  });
  rig.animate('walk', 0.7, (p) => {
    const w = p * TAU;
    const a = sin(w);
    return {
      hips: [0, 0, 0], spine: [0.04 * a, 0, 0], head: [-0.05, 0.1 * a, 0],
      legF_L: [-a * 0.7, 0, 0], legF_R: [a * 0.7, 0, 0], legB_L: [a * 0.7, 0, 0], legB_R: [-a * 0.7, 0, 0],
      tail: [0.3 + 0.1 * a, 0, 0], tail2: [0, 0.6 * a, 0], move: { hips: [0, 0.015 * s * Math.abs(cos(w)), 0] },
    };
  });
}

function dog(m) {
  quadruped(m, {
    s: 1.6, body: '#d89a58', chest: '#f6efe4', head: '#f6efe4', snout: '#f6efe4', nose: '#2a1c18', eye: '#3a2418', leg: '#d89a58', paw: '#f6efe4',
    ear(kd, s, sd) {
      kd.sp('#a96630', 0.065 * s, [sd * 0.105 * s, 0.01 * s, -0.01 * s], { sx: 0.5, sy: 1.6, sz: 1.0, rz: sd * 0.25, ws: 8, hs: 6 });
    },
    headExtras(kd, s) {
      kd.sp('#c9824a', 0.07 * s, [0, 0.07 * s, 0.03 * s], { sy: 0.6, ws: 8, hs: 5 });
      kd.sp('#c9824a', 0.04 * s, [0.06 * s, 0.03 * s, 0.07 * s], { sy: 0.8, ws: 6, hs: 4 });
      kd.bx('#c0405a', [0.03 * s, 0.025 * s, 0.01 * s], [0, -0.095 * s, 0.14 * s], { r: 0.008 * s });
    },
    tail(kt, kt2, s) {
      kt.tb('#d89a58', [[0, 0, 0], [0, 0.08 * s, -0.1 * s]], 0.03 * s, [0, 0, 0], { seg: 6 });
      kt2.sp('#f6efe4', 0.04 * s, [0, 0.02 * s, -0.04 * s], { ws: 6, hs: 4 });
    },
  });
}

function cat(m) {
  quadruped(m, {
    s: 1.2, body: '#9d96ab', chest: '#f3f0f5', head: '#9d96ab', snout: '#f3f0f5', nose: '#e88aa4', eye: '#5dbb6a', leg: '#9d96ab', paw: '#f3f0f5',
    ear(kd, s, sd) {
      kd.cn('#9d96ab', 0.05 * s, 0.0, 0.11 * s, [sd * 0.07 * s, 0.07 * s, -0.005 * s], { seg: 6, rz: -sd * 0.25 });
      kd.cn('#f0a8bf', 0.032 * s, 0.0, 0.07 * s, [sd * 0.07 * s, 0.075 * s, 0.015 * s], { seg: 6, rz: -sd * 0.25 });
    },
    headExtras(kd, s) {
      for (const sd of [1, -1]) {
        kd.sp('#7e7790', 0.04 * s, [sd * 0.04 * s, 0.075 * s, 0.07 * s], { sy: 0.5, ws: 6, hs: 4 });
        for (let i = 0; i < 2; i++) kd.bx('#f3f0f5', [0.07 * s, 0.003 * s, 0.003 * s], [sd * 0.1 * s, -0.04 * s + i * 0.015 * s, 0.1 * s], { rz: sd * (0.1 - i * 0.2) });
      }
    },
    tail(kt, kt2, s) {
      kt.tb('#9d96ab', [[0, 0, 0], [0, 0.1 * s, -0.12 * s]], 0.032 * s, [0, 0, 0], { seg: 6 });
      kt2.tb('#7e7790', [[0, 0, 0], [0, 0.12 * s, -0.06 * s], [0, 0.22 * s, 0.02 * s]], 0.03 * s, [0, 0, 0], { seg: 6 });
    },
  });
}

function parrot(m) {
  const s = 1.0;
  const rig = new Rig(m);
  rig.bone('body', null, [0, 0.3 * s, 0]);
  rig.bone('head', 'body', [0, 0.47 * s, 0.06 * s]);
  rig.bone('tail', 'body', [0, 0.2 * s, -0.12 * s]);
  for (const [sd, L] of [[1, 'L'], [-1, 'R']]) rig.bone(`wing_${L}`, 'body', [sd * 0.11 * s, 0.38 * s, -0.02 * s]);
  const kb = kit(m, rig.bones.body.node);
  const kh = kit(m, rig.bones.head.node);
  kb.sp('#4cb85a', 0.15 * s, [0, 0.04 * s, 0], { sy: 1.25, sz: 0.95, ws: 12, hs: 8 });
  kb.sp('#2e86d6', 0.1 * s, [0, -0.05 * s, 0.03 * s], { sy: 1.2, sz: 0.7, ws: 10, hs: 6 });
  kb.sp('#f2d65a', 0.09 * s, [0, 0.0, 0.1 * s], { sy: 1.1, sz: 0.5, ws: 10, hs: 6 });
  for (const sd of [1, -1]) {
    kb.tb('#f2a53a', [[sd * 0.03 * s, -0.1 * s, 0.0], [sd * 0.03 * s, -0.27 * s, 0.0]], 0.014 * s, [0, 0, 0], { seg: 5 });
    kb.bx('#f2a53a', [0.05 * s, 0.015 * s, 0.07 * s], [sd * 0.03 * s, -0.285 * s, 0.025 * s]);
  }
  kh.sp('#e23b3b', 0.115 * s, [0, 0.0, 0.0], { ws: 14, hs: 10 });
  kh.sp('#f6c94a', 0.05 * s, [0, -0.02 * s, 0.11 * s], { sy: 1.1, sz: 1.2, ws: 8, hs: 6 });
  kh.cn('#f6c94a', 0.035 * s, 0.0, 0.07 * s, [0, -0.09 * s, 0.13 * s], { seg: 6, rx: 3.0 });
  for (const sd of [1, -1]) {
    kh.sp('#ffffff', 0.035 * s, [sd * 0.06 * s, 0.03 * s, 0.07 * s], { sz: 0.5, ws: 10, hs: 6 });
    kh.sp('#141214', 0.022 * s, [sd * 0.06 * s, 0.03 * s, 0.085 * s], { sz: 0.5, ws: 8, hs: 5 });
    kh.sp('#ffffff', 0.008 * s, [sd * 0.065 * s, 0.04 * s, 0.093 * s], { ws: 5, hs: 3 });
  }
  kh.sp('#f06a6a', 0.04 * s, [0, 0.12 * s, -0.02 * s], { sy: 0.7, ws: 8, hs: 5 });
  const kt = kit(m, rig.bones.tail.node);
  kt.sp('#2e86d6', 0.07 * s, [0, -0.1 * s, -0.12 * s], { sx: 0.8, sy: 2.2, sz: 0.6, rx: -0.3, ws: 8, hs: 8 });
  kt.sp('#4cb85a', 0.05 * s, [0, -0.08 * s, -0.08 * s], { sx: 0.7, sy: 1.8, sz: 0.6, rx: -0.3, ws: 8, hs: 6 });
  for (const [sd, L] of [[1, 'L'], [-1, 'R']]) {
    const kw = kit(m, rig.bones[`wing_${L}`].node);
    kw.sp('#2e86d6', 0.06 * s, [sd * 0.03 * s, -0.12 * s, -0.03 * s], { sx: 0.45, sy: 2.4, sz: 1.2, rz: sd * 0.12, ws: 8, hs: 8 });
    kw.sp('#58c8a8', 0.045 * s, [sd * 0.04 * s, -0.08 * s, 0.0], { sx: 0.4, sy: 1.8, sz: 1.0, ws: 6, hs: 6 });
  }
  rig.animate('idle', 2.0, (p) => {
    const w = sin(p * TAU);
    return { head: [0.08 * w, 0.4 * sin(p * TAU * 2), 0], tail: [0.1 * w, 0, 0], wing_L: [0, 0, 0.03 * w], wing_R: [0, 0, -0.03 * w], body: [0, 0, 0], move: { body: [0, 0.004 * s * w, 0] } };
  });
  rig.animate('walk', 0.6, (p) => {
    const w = p * TAU;
    const a = sin(w);
    return { head: [0.1 * a, 0, 0], tail: [0.2 * a, 0, 0], wing_L: [0, 0, 0.5 * Math.abs(a)], wing_R: [0, 0, -0.5 * Math.abs(a)], body: [0.05 * a, 0, 0], move: { body: [0, 0.05 * s * Math.abs(a), 0] } };
  });
}

export const RECIPES = {
  anisha: { build: anisha, kind: 'character', foot: [0.8, 0.8], name: 'Anisha' },
  granny: { build: granny, kind: 'character', foot: [0.9, 0.9], name: 'Granny' },
  scary_teacher: { build: scary_teacher, kind: 'character', foot: [0.8, 0.8], name: 'Scary teacher' },
  labubu: { build: labubu, kind: 'character', foot: [0.9, 0.9], name: 'Labubu' },
  kabla: { build: kabla, kind: 'character', foot: [0.8, 0.8], name: 'Kabla' },
  rani: { build: rani, kind: 'character', foot: [0.8, 0.8], name: 'Rani' },
  kamala: { build: kamala, kind: 'character', foot: [0.8, 0.8], name: 'Kamala' },
  parrot: { build: parrot, kind: 'character', foot: [0.6, 0.6], name: 'Parrot' },
  dog: { build: dog, kind: 'character', foot: [0.8, 1.2], name: 'Dog' },
  cat: { build: cat, kind: 'character', foot: [0.6, 0.9], name: 'Cat' },
  pet_parrot: { build: parrot, kind: 'character' },
  pet_dog: { build: dog, kind: 'character' },
  pet_cat: { build: cat, kind: 'character' },
};
