// Skeletons and animations for characters (people and pets).
// A Rig makes the bones; geometry is attached to a bone with kit(m, bone.node) and follows it rigidly.
// Rest pose has no rotations. Animations rotate (and, for the hips, move) bones; every animation sets every bone, so
// switching from one to another never leaves a limb stuck.
import { quatFromEuler } from './gltf.mjs';

export class Rig {
  constructor(m) {
    this.m = m;
    this.bones = {};
    this.order = [];
    m.skeleton = { joints: [] };
  }

  /** Adds a bone at a world position (x, y, z) under `parent` (a bone name, or null for the first one). */
  bone(name, parent, pos) {
    const parentBone = parent ? this.bones[parent] : null;
    const base = parentBone ? parentBone.pos : [0, 0, 0];
    const t = [pos[0] - base[0], pos[1] - base[1], pos[2] - base[2]];
    const node = this.m.node(name, parentBone ? parentBone.node : this.m.root, { t });
    const b = { name, node, pos, rest: t };
    this.bones[name] = b;
    this.order.push(name);
    this.m.skeleton.joints.push(node);
    return b;
  }

  /**
   * An animation. `pose(phase)` gets phase 0..1 through the loop and returns { boneName: [rx, ry, rz] } plus
   * optional `move: { boneName: [dx, dy, dz] }` offsets from the rest position. `steps` keyframes are sampled.
   * For loops the last key equals the first.
   */
  animate(name, seconds, pose, { steps = 16, loop = true } = {}) {
    const times = [];
    const rot = Object.fromEntries(this.order.map((n) => [n, []]));
    const mov = Object.fromEntries(this.order.map((n) => [n, []]));
    const n = loop ? steps : steps;
    for (let i = 0; i <= n; i++) {
      const phase = i / n;
      times.push(phase * seconds);
      const p = pose(loop && i === n ? 0 : phase);
      for (const b of this.order) {
        const r = p[b] ?? [0, 0, 0];
        rot[b].push(quatFromEuler(r[0], r[1], r[2]));
        const mv = p.move?.[b] ?? [0, 0, 0];
        const rest = this.bones[b].rest;
        mov[b].push([rest[0] + mv[0], rest[1] + mv[1], rest[2] + mv[2]]);
      }
    }
    const tracks = [];
    for (const b of this.order) {
      tracks.push({ node: this.bones[b].node, path: 'rotation', times, values: rot[b] });
      if (mov[b].some((v, i) => i && (v[0] !== mov[b][0][0] || v[1] !== mov[b][0][1] || v[2] !== mov[b][0][2])) || b === this.order[0])
        tracks.push({ node: this.bones[b].node, path: 'translation', times, values: mov[b] });
    }
    this.m.animate(name, tracks);
  }
}

export const sin = Math.sin;
export const cos = Math.cos;
export const TAU = Math.PI * 2;
