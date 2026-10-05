import { describe, expect, it } from 'vitest';
import { angleDiff, castRay, conePolygon, hasLineOfSight, inCone, resolveCircle } from '../src/game/geometry';

const wall = { x: 100, y: 0, w: 10, h: 200 };

describe('geometry', () => {
  it('angleDiff wraps around', () => {
    expect(angleDiff(Math.PI - 0.1, -Math.PI + 0.1)).toBeCloseTo(0.2);
    expect(angleDiff(0, Math.PI / 2)).toBeCloseTo(Math.PI / 2);
  });

  it('rays stop at walls', () => {
    expect(castRay(0, 50, 0, 500, [wall])).toBeCloseTo(100);
    expect(castRay(0, 50, Math.PI, 500, [wall])).toBe(500);
  });

  it('line of sight is blocked by a wall', () => {
    expect(hasLineOfSight(0, 50, 200, 50, [wall])).toBe(false);
    expect(hasLineOfSight(0, 50, 90, 50, [wall])).toBe(true);
  });

  it('cone checks distance and angle', () => {
    const half = (30 * Math.PI) / 180;
    expect(inCone(0, 0, 0, half, 300, 200, 20)).toBe(true);
    expect(inCone(0, 0, 0, half, 300, 200, 200)).toBe(false);
    expect(inCone(0, 0, 0, half, 300, 400, 0)).toBe(false);
  });

  it('cone polygon is clipped by walls', () => {
    const pts = conePolygon(0, 50, 0, 0.3, 300, [wall], 8);
    expect(pts[0]).toEqual({ x: 0, y: 50 });
    expect(Math.max(...pts.map((p) => p.x))).toBeLessThan(120);
  });

  it('circles are pushed out of rects', () => {
    const p = resolveCircle(95, 50, 24, [wall]);
    expect(p.x).toBeCloseTo(76);
    const inside = resolveCircle(103, 50, 24, [wall]);
    expect(inside.x).toBeLessThan(100);
  });
});
