// Things that the 2D art pack has no picture for: the shoes, and the little-house props for the home tasks
// (docs/HOME_TASKS.md): Teddy, a toy box, a pet food sack and a school uniform.
import { box, sphere, rbox } from '../shapes.mjs';
import { kit } from '../kit.mjs';
import { P } from '../pal.mjs';

const add = (m, g, mat, xf) => m.add(m.root, g, mat, xf);

function shoes(m) {
  for (const s of [-1, 1]) {
    const x = s * 0.1;
    add(m, rbox(0.12, 0.035, 0.33, 0.012), 'black', { t: [x, 0.018, 0] });
    add(m, rbox(0.11, 0.11, 0.2, 0.04), 'dark', { t: [x, 0.09, -0.04] });
    add(m, sphere(0.058, 8, 6), 'dark', { t: [x, 0.06, 0.1], s: [1, 0.85, 1.25] });
    for (let i = 0; i < 3; i++) add(m, box(0.07, 0.008, 0.012), 'white', { t: [x, 0.142 - i * 0.004, 0.02 + i * 0.03 - 0.06] });
  }
}

/** Teddy, sitting (1 x 1). */
function teddy(m) {
  const k = kit(m);
  const sp = (c, r, pos, o = {}) => k.sp(c, r, pos, { ws: 9, hs: 6, ...o });
  const fur = '#b9854f';
  const light = '#e3c597';
  const dark = '#3a2a22';
  sp(fur, 0.17, [0, 0.2, 0], { sy: 1.1 });
  sp(light, 0.1, [0, 0.19, 0.11], { sy: 1.1, sz: 0.5 });
  sp(fur, 0.15, [0, 0.5, 0]);
  sp(light, 0.065, [0, 0.46, 0.13], { sz: 0.8 });
  sp(dark, 0.022, [0, 0.48, 0.19]);
  for (const s of [-1, 1]) {
    sp(fur, 0.055, [s * 0.11, 0.63, 0]);
    sp(light, 0.03, [s * 0.11, 0.63, 0.03]);
    sp(dark, 0.02, [s * 0.06, 0.54, 0.14]);
    sp(fur, 0.06, [s * 0.2, 0.26, 0.03], { sy: 1.4 });
    sp(fur, 0.07, [s * 0.1, 0.05, 0.1], { sz: 1.3 });
    sp(light, 0.04, [s * 0.1, 0.05, 0.17], { sz: 0.6 });
  }
  k.bx(P.red, [0.26, 0.05, 0.05], [0, 0.35, 0.11], { r: 0.02 });
}

/** Toy box with the lid open and toys peeking out (1.6 x 1). */
function toy_box(m) {
  const k = kit(m);
  k.bx(P.blueLight, [1.3, 0.5, 0.7], [0, 0, 0], { r: 0.05 });
  k.bx(P.white, [1.34, 0.05, 0.74], [0, 0.5, 0], { r: 0.02 });
  k.bx(P.yellow, [1.0, 0.08, 0.04], [0, 0.2, 0.36]);
  k.bx(P.pink, [0.5, 0.06, 0.04], [0, 0.32, 0.36]);
  k.bx(P.blueDark, [1.34, 0.04, 0.34], [0, 0.55, -0.34], { rx: -1.1, r: 0.01 });
  k.sp(P.red, 0.12, [-0.3, 0.62, 0.02]);
  k.bx(P.green, [0.2, 0.2, 0.2], [0.2, 0.55, 0.0], { r: 0.03, ry: 0.4 });
  k.sp(P.yellow, 0.1, [0.42, 0.62, 0.1]);
}

/** Pet food sack with a paw print (1 x 1). */
function pet_food_sack(m) {
  const k = kit(m);
  k.bx(P.woodLight, [0.5, 0.62, 0.3], [0, 0, 0], { r: 0.07 });
  k.bx(P.wood, [0.5, 0.1, 0.3], [0, 0.6, 0], { r: 0.04 });
  k.bx(P.white, [0.3, 0.26, 0.02], [0, 0.18, 0.16], { r: 0.02 });
  k.sp(P.redDark, 0.055, [0, 0.26, 0.175], { sz: 0.15 });
  for (const x of [-0.07, 0, 0.07]) k.sp(P.redDark, 0.02, [x, 0.34, 0.175], { sz: 0.15 });
  k.tb(P.brown ?? P.woodDark, [[-0.2, 0.7, 0], [0, 0.78, 0], [0.2, 0.7, 0]], 0.012);
}

/** School uniform, folded in a neat pile (1 x 1). */
function school_uniform(m) {
  const k = kit(m);
  k.bx(P.blueDark, [0.5, 0.1, 0.38], [0, 0, 0], { r: 0.03 });
  k.bx(P.white, [0.46, 0.09, 0.34], [0, 0.1, 0], { r: 0.03, ry: 0.05 });
  k.bx(P.white, [0.12, 0.012, 0.1], [0, 0.19, 0.08], { r: 0.004 });
  k.bx(P.red, [0.06, 0.012, 0.2], [0.1, 0.2, 0], { r: 0.004, ry: 0.1 });
  k.bx(P.blueDark, [0.34, 0.03, 0.04], [0, 0.04, 0.2]);
}

export const RECIPES = {
  teddy: { build: teddy, kind: 'extra', foot: [1.0, 1.0] },
  toy_box: { build: toy_box, kind: 'extra', foot: [1.6, 1.0] },
  pet_food_sack: { build: pet_food_sack, kind: 'extra', foot: [1.0, 1.0] },
  school_uniform: { build: school_uniform, kind: 'extra', foot: [1.0, 1.0] },
  shoes: { build: shoes, kind: 'extra', foot: [1.4, 1.0] },
};
