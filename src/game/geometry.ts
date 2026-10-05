// Pure geometry helpers (no Phaser) so they can be unit-tested.
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Pt {
  x: number;
  y: number;
}

export const dist = (ax: number, ay: number, bx: number, by: number): number => Math.hypot(bx - ax, by - ay);
export const rectCenter = (r: Rect): Pt => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
export const pointInRect = (px: number, py: number, r: Rect): boolean =>
  px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;

/** Shortest signed difference from angle a to angle b, in (-PI, PI]. */
export function angleDiff(a: number, b: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

/** Distance from point to the nearest edge/inside of a rect (0 if inside). */
export function distToRect(px: number, py: number, r: Rect): number {
  const cx = Math.max(r.x, Math.min(px, r.x + r.w));
  const cy = Math.max(r.y, Math.min(py, r.y + r.h));
  return Math.hypot(px - cx, py - cy);
}

/** Ray (origin, unit direction) vs rect. Returns hit distance, or null. */
export function rayRect(ox: number, oy: number, dx: number, dy: number, r: Rect): number | null {
  let tmin = 0;
  let tmax = Infinity;
  const axes: [number, number, number, number][] = [
    [ox, dx, r.x, r.x + r.w],
    [oy, dy, r.y, r.y + r.h],
  ];
  for (const [o, d, lo, hi] of axes) {
    if (Math.abs(d) < 1e-9) {
      if (o < lo || o > hi) return null;
    } else {
      let t1 = (lo - o) / d;
      let t2 = (hi - o) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }
  }
  return tmin;
}

/** How far a ray travels before hitting a rect (or maxDist). */
export function castRay(ox: number, oy: number, angle: number, maxDist: number, rects: Rect[]): number {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let best = maxDist;
  for (const r of rects) {
    const t = rayRect(ox, oy, dx, dy, r);
    if (t !== null && t < best) best = t;
  }
  return best;
}

export function hasLineOfSight(ax: number, ay: number, bx: number, by: number, rects: Rect[]): boolean {
  const d = dist(ax, ay, bx, by);
  if (d < 1e-6) return true;
  return castRay(ax, ay, Math.atan2(by - ay, bx - ax), d, rects) >= d - 0.01;
}

export function inCone(
  ox: number,
  oy: number,
  facing: number,
  halfAngle: number,
  range: number,
  px: number,
  py: number,
): boolean {
  if (dist(ox, oy, px, py) > range) return false;
  return Math.abs(angleDiff(facing, Math.atan2(py - oy, px - ox))) <= halfAngle;
}

/** Polygon of a vision cone clipped by walls. First point is the origin. */
export function conePolygon(
  ox: number,
  oy: number,
  facing: number,
  halfAngle: number,
  range: number,
  blockers: Rect[],
  steps = 28,
): Pt[] {
  const pts: Pt[] = [{ x: ox, y: oy }];
  for (let i = 0; i <= steps; i++) {
    const a = facing - halfAngle + (2 * halfAngle * i) / steps;
    const d = castRay(ox, oy, a, range, blockers);
    pts.push({ x: ox + Math.cos(a) * d, y: oy + Math.sin(a) * d });
  }
  return pts;
}

/** Push a circle out of any rects it overlaps. */
export function resolveCircle(px: number, py: number, radius: number, rects: Rect[]): Pt {
  let x = px;
  let y = py;
  for (let pass = 0; pass < 3; pass++) {
    for (const r of rects) {
      const cx = Math.max(r.x, Math.min(x, r.x + r.w));
      const cy = Math.max(r.y, Math.min(y, r.y + r.h));
      let dx = x - cx;
      let dy = y - cy;
      const d = Math.hypot(dx, dy);
      if (d >= radius) continue;
      if (d > 1e-6) {
        x += (dx / d) * (radius - d);
        y += (dy / d) * (radius - d);
      } else {
        // centre is inside the rect: leave by the nearest side
        const left = x - r.x;
        const right = r.x + r.w - x;
        const top = y - r.y;
        const bottom = r.y + r.h - y;
        const m = Math.min(left, right, top, bottom);
        if (m === left) x = r.x - radius;
        else if (m === right) x = r.x + r.w + radius;
        else if (m === top) y = r.y - radius;
        else y = r.y + r.h + radius;
        dx = 0;
        dy = 0;
      }
    }
  }
  return { x, y };
}
