// Checks a level for mistakes before a player finds them. Used by `npm test`.
import type { BaddieKind, LevelDef } from './types';
import { buildWorld, blockers, type RoomJson } from './world';
import { distToRect, pointInRect, type Rect } from '../game/geometry';
import { PLAYER_RADIUS, REACH } from '../config';

const CELL = 10;

/** Flood-fills the floor (walls grown by the player's size) and says which spots can be reached. */
function reachability(spawn: { x: number; y: number }, bounds: Rect, block: Rect[]): (x: number, y: number) => boolean {
  const cols = Math.ceil(bounds.w / CELL);
  const rows = Math.ceil(bounds.h / CELL);
  const blocked = new Uint8Array(cols * rows);
  const near = block.map((b) => ({ b, x0: b.x - PLAYER_RADIUS, y0: b.y - PLAYER_RADIUS, x1: b.x + b.w + PLAYER_RADIUS, y1: b.y + b.h + PLAYER_RADIUS }));
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const px = bounds.x + cx * CELL + CELL / 2;
      const py = bounds.y + cy * CELL + CELL / 2;
      for (const n of near) {
        if (px < n.x0 || px > n.x1 || py < n.y0 || py > n.y1) continue;
        if (distToRect(px, py, n.b) < PLAYER_RADIUS - 1) {
          blocked[cy * cols + cx] = 1;
          break;
        }
      }
    }
  }
  const idx = (x: number, y: number) => Math.floor((y - bounds.y) / CELL) * cols + Math.floor((x - bounds.x) / CELL);
  const seen = new Uint8Array(cols * rows);
  const start = idx(spawn.x, spawn.y);
  const queue: number[] = [start];
  if (!blocked[start]) seen[start] = 1;
  while (queue.length) {
    const i = queue.pop()!;
    const cx = i % cols;
    const cy = Math.floor(i / cols);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const j = ny * cols + nx;
      if (seen[j] || blocked[j]) continue;
      seen[j] = 1;
      queue.push(j);
    }
  }
  return (x, y) => {
    const cx = Math.floor((x - bounds.x) / CELL);
    const cy = Math.floor((y - bounds.y) / CELL);
    return cx >= 0 && cy >= 0 && cx < cols && cy < rows && seen[cy * cols + cx] === 1;
  };
}

/** True if the player can stand within `within` px of the rect. */
function canReach(isReachable: (x: number, y: number) => boolean, r: Rect, within: number): boolean {
  const pad = within + CELL;
  for (let y = r.y - pad; y <= r.y + r.h + pad; y += CELL) {
    for (let x = r.x - pad; x <= r.x + r.w + pad; x += CELL) {
      if (distToRect(x, y, r) <= within && isReachable(x, y)) return true;
    }
  }
  return false;
}

export function validateLevel(level: LevelDef, rooms: Record<string, RoomJson>, kinds: Record<string, BaddieKind>): string[] {
  const errors: string[] = [];
  const err = (m: string) => errors.push(`Level ${level.id}: ${m}`);

  for (const id of level.rooms) if (!rooms[id]) err(`unknown room "${id}"`);
  if (errors.length) return errors;

  let world;
  try {
    world = buildWorld(level, rooms);
  } catch (e) {
    err((e as Error).message);
    return errors;
  }
  const block = blockers(world);
  const ok = reachability(world.spawn, world.bounds, block);
  if (!ok(world.spawn.x, world.spawn.y)) {
    err('the spawn point is inside a wall or furniture');
    return errors;
  }

  const allItems = level.rooms.flatMap((id) => rooms[id].items);
  const targetIds = new Set(world.targets.map((t) => t.id));
  const exitIds = new Set(world.exits.map((e) => e.id));
  if (level.steps.length === 0) err('has no steps');

  level.steps.forEach((s, i) => {
    const at = `step ${i + 1}`;
    const checkItem = (uid: string) => {
      const it = allItems.find((x) => x.uid === uid);
      if (!it) err(`${at}: no item "${uid}" in the rooms of this level`);
      else if (!it.tags.includes('pickup')) err(`${at}: "${uid}" can't be picked up (it has no "pickup" tag)`);
      else {
        const p = world.pickups.find((x) => x.uid === uid);
        if (p && !canReach(ok, p.rect, REACH - 4)) err(`${at}: the player can't get to "${uid}"`);
      }
    };
    if (s.type === 'pickup') checkItem(s.item);
    else if (s.type === 'use') {
      checkItem(s.item);
      const tg = world.targets.find((x) => x.id === s.target);
      if (!targetIds.has(s.target) || !tg) err(`${at}: no target "${s.target}" (use a room item uid, or an id from "extras")`);
      else if (!canReach(ok, tg.rect, REACH - 4)) err(`${at}: the player can't get to "${s.target}"`);
    } else if (s.type === 'reach') {
      const z = world.exits.find((x) => x.id === s.zone);
      if (!exitIds.has(s.zone) || !z) err(`${at}: no exit "${s.zone}" (add it to "exits")`);
      else if (!canReach(ok, z.rect, 0)) err(`${at}: the player can't get to exit "${s.zone}"`);
    }
  });

  for (const e of level.exits ?? []) {
    if (!rooms[e.room]?.doors.some((d) => d.to === e.to)) err(`exit "${e.id}": room "${e.room}" has no door leading to "${e.to}"`);
  }
  for (const h of world.hides) if (!canReach(ok, h.rect, REACH - 4)) err(`hiding spot "${h.name}" (${h.uid}) can't be reached`);

  for (const b of level.baddies) {
    if (!kinds[b.kind]) err(`baddie "${b.id}": unknown kind "${b.kind}" (add it to src/data/baddies.json)`);
    if (b.patrol.length < 2) err(`baddie "${b.id}": needs at least 2 patrol points`);
  }
  for (const mb of world.baddies) {
    for (const p of mb.patrol) {
      if (block.some((r) => pointInRect(p.x, p.y, r))) err(`baddie "${mb.id}": a patrol point is inside a wall or furniture`);
    }
  }
  return errors;
}
