// Recipes for objects the Claude Design batch does not cover. Only the shoes for now.
// (The first 31 objects, Anisha and the scary teacher come from godot/assets/models/batch1.manifest.json; the older
// grey recipes for them are in git history, commit 0296e66.)
// Everything here is made of simple low-poly shapes in grey tones.
// A recipe gets the model, its footprint (w, d: the object's tile size in metres) and the usable
// size (W, D) which is the footprint minus a 4 cm margin. Front is +Z, origin is the centre of the base.
import { box, cyl, sphere, rbox } from './shapes.mjs';

const add = (m, g, mat, xf) => m.add(m.root, g, mat, xf);

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


// ---------- the registry ----------

/** id -> { build, kind, foot } where foot overrides the footprint for things that are not in the pack. */
export const RECIPES = {
  shoes: { build: shoes, kind: 'extra', foot: [1.4, 1.0] },
};
