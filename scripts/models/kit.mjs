// Small helpers for writing a recipe: place shapes by where their BASE sits, instead of their centre.
// Every helper takes a colour (a name from pal.mjs's values, or any "#rrggbb"), a size, and a position [x, y, z]
// where x and z are the centre and y is the bottom. Options: ry / rx / rz (turns, in radians), s (scale), r (edge rounding).
import { box, cyl, sphere, rbox, lathe, torus, capsule, dome, extrude, frustum, tube, blob, rcyl, frame, flat } from './shapes.mjs';

export { box, cyl, sphere, rbox, lathe, torus, capsule, dome, extrude, frustum, tube, blob, rcyl, frame, flat };

export function kit(m, node = m.root) {
  const add = (g, mat, xf) => m.add(node, g, mat, xf);
  const at = (pos = [0, 0, 0], dy = 0, o = {}) => ({ t: [pos[0], pos[1] + dy, pos[2]], rx: o.rx, ry: o.ry, rz: o.rz, s: o.s });
  const k = {
    add,
    m,
    /** a box (rounded when o.r > 0) */
    bx(mat, [w, h, d], pos, o = {}) {
      add(o.r ? rbox(w, h, d, o.r, o.n ?? 2) : box(w, h, d), mat, at(pos, h / 2, o));
      return k;
    },
    /** a cylinder, straight (r, h) */
    cy(mat, r, h, pos, o = {}) {
      add(cyl(r, r, h, o.seg ?? 16), mat, at(pos, h / 2, o));
      return k;
    },
    /** a cone or cup: radius at the bottom, radius at the top, height */
    cn(mat, rBot, rTop, h, pos, o = {}) {
      add(cyl(rTop, rBot, h, o.seg ?? 16, o.caps ?? true), mat, at(pos, h / 2, o));
      return k;
    },
    /** a rounded cylinder (cushion, drum, stool top) */
    rc(mat, r, h, pos, o = {}) {
      add(rcyl(r, h, o.e ?? 0.02, o.seg ?? 20), mat, at(pos, h / 2, o));
      return k;
    },
    /** a ball centred at pos; o.sx / o.sy / o.sz stretch it */
    sp(mat, r, pos, o = {}) {
      add(sphere(r, o.ws ?? 12, o.hs ?? 8), mat, { t: pos, rx: o.rx, ry: o.ry, rz: o.rz, s: [o.sx ?? 1, o.sy ?? 1, o.sz ?? 1] });
      return k;
    },
    /** a lathe: profile of [radius, height from the base] points, placed with its base at pos */
    lt(mat, profile, pos, o = {}) {
      const ys = profile.map((p) => p[1]);
      const mid = (Math.min(...ys) + Math.max(...ys)) / 2;
      add(lathe(profile, o.seg ?? 16), mat, at(pos, mid, o));
      return k;
    },
    /** a half dome sitting on pos */
    dm(mat, r, pos, o = {}) {
      add(dome(r, o.seg ?? 14, 5, o.sy ?? 1), mat, at(pos, (r * (o.sy ?? 1)) / 2, o));
      return k;
    },
    /** a ring lying flat (R big radius, r tube radius), centred at pos */
    ring(mat, R, r, pos, o = {}) {
      add(torus(R, r, o.seg ?? 18, o.segr ?? 8), mat, { t: pos, rx: o.rx, ry: o.ry, rz: o.rz });
      return k;
    },
    /** a flat polygon [[x, y], ...] pushed to a thickness; plane 'xy' stands up facing +Z, 'xz' lies on the floor */
    ex(mat, poly, thick, pos, o = {}) {
      add(extrude(poly, thick, o.plane ?? 'xy'), mat, { t: pos, rx: o.rx, ry: o.ry, rz: o.rz, s: o.s });
      return k;
    },
    /** a roof or wedge: bottom w x d, top w2 x d2, height h */
    fr(mat, wBot, dBot, wTop, dTop, h, pos, o = {}) {
      add(frustum(wBot, dBot, wTop, dTop, h), mat, at(pos, h / 2, o));
      return k;
    },
    /** a tube along points (given relative to pos) */
    tb(mat, pts, r, pos = [0, 0, 0], o = {}) {
      const moved = pts.map((p) => [p[0] + pos[0], p[1] + pos[1], p[2] + pos[2]]);
      add(tube(moved, r, o.seg ?? 6, o.closed ?? false), mat);
      return k;
    },
    /** a lumpy faceted ball (foliage, rocks) centred at pos */
    bl(mat, r, pos, o = {}) {
      add(blob(r, o.seed ?? 1, o.jitter ?? 0.18, o.detail ?? 1), mat, { t: pos, rx: o.rx, ry: o.ry, rz: o.rz, s: [o.sx ?? 1, o.sy ?? 1, o.sz ?? 1] });
      return k;
    },
    /** four legs under a top: footprint w x d, leg thickness t, height h, inset from the edge */
    legs(mat, w, d, h, t, pos = [0, 0, 0], inset = 0.04) {
      for (const sx of [-1, 1])
        for (const sz of [-1, 1]) k.bx(mat, [t, h, t], [pos[0] + sx * (w / 2 - inset - t / 2), pos[1], pos[2] + sz * (d / 2 - inset - t / 2)]);
      return k;
    },
    /** a picture frame or window frame standing up facing +Z, bottom edge at pos.y */
    fm(mat, w, h, border, thick, pos, o = {}) {
      add(frame(w, h, border, thick), mat, at(pos, h / 2, o));
      return k;
    },
  };
  return k;
}
