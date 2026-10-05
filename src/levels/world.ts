// Turns a level (a list of rooms from the art pack) into walls, furniture, hiding spots and so on.
// No Phaser in here, so tests can use it.
import type { Text } from '../i18n';
import { PACK_TILE as T, PACK_WALL as B, WORLD_SCALE as S } from '../config';
import type { Pt, Rect } from '../game/geometry';
import type { LevelDef } from './types';

export type Side = 'N' | 'E' | 'S' | 'W';

export interface RoomItem {
  uid: string;
  sprite: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  tags: string[];
}
export interface RoomDoor {
  side: Side;
  to: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
/** One room file from the art pack (public/assets/rooms/...). Sizes are in tiles. */
export interface RoomJson {
  id: string;
  name: string;
  size: { w: number; h: number };
  ground: string;
  safeZone: boolean;
  doors: RoomDoor[];
  spawn: { x: number; y: number };
  items: RoomItem[];
  colliders: { uid: string; x: number; y: number; w: number; h: number }[];
  hideSpots: string[];
}

export interface Sprite {
  uid: string;
  frame: string;
  name: string;
  cx: number;
  cy: number;
  angle: number;
  rect: Rect;
}
export interface Pickup {
  uid: string;
  frame: string;
  name: string;
  rect: Rect;
}
export interface Target {
  id: string;
  rect: Rect;
  label: Text;
  kind: 'item' | 'shoes';
}
export interface Hide {
  uid: string;
  name: string;
  rect: Rect;
}
export interface ExitZone {
  id: string;
  rect: Rect;
  label?: Text;
  side: Side;
}
export interface PlacedRoom {
  id: string;
  name: string;
  ground: string;
  floorKey: string; // texture key of the floor picture
  floorX: number;
  floorY: number;
  interior: Rect;
}
export interface MapBaddie {
  id: string;
  patrol: { x: number; y: number; wait: number }[];
}
export interface World {
  bounds: Rect;
  rooms: PlacedRoom[];
  walls: Rect[]; // walls of every room, with gaps where doors are open
  doorways: Rect[]; // open doors, to draw as a floor-coloured gap
  solids: Rect[]; // furniture you can't walk through (also blocks sight)
  sprites: Sprite[];
  pickups: Pickup[];
  targets: Target[];
  hides: Hide[];
  safes: Rect[];
  exits: ExitZone[];
  spawn: Pt;
  baddies: MapBaddie[];
}

const OPPOSITE: Record<Side, Side> = { N: 'S', S: 'N', E: 'W', W: 'E' };
const r = (x: number, y: number, w: number, h: number): Rect => ({ x: x * S, y: y * S, w: w * S, h: h * S });

/** Door span along its wall, in pack pixels, relative to the room's interior. */
function span(d: RoomDoor): [number, number] {
  return d.side === 'N' || d.side === 'S' ? [d.x * T, (d.x + d.w) * T] : [d.y * T, (d.y + d.h) * T];
}

interface Placed {
  room: RoomJson;
  ox: number;
  oy: number; // interior top-left, in pack pixels
}

/** Places the rooms next to each other so their connecting doors line up. */
function layout(ids: string[], rooms: Record<string, RoomJson>): Record<string, Placed> {
  const placed: Record<string, Placed> = {};
  const first = rooms[ids[0]];
  if (!first) throw new Error(`Unknown room "${ids[0]}"`);
  placed[first.id] = { room: first, ox: 0, oy: 0 };
  const queue = [first.id];
  while (queue.length) {
    const a = placed[queue.shift()!];
    for (const d of a.room.doors) {
      if (!ids.includes(d.to) || placed[d.to]) continue;
      const nRoom = rooms[d.to];
      if (!nRoom) throw new Error(`Unknown room "${d.to}"`);
      const back = nRoom.doors.find((x) => x.to === a.room.id && x.side === OPPOSITE[d.side]);
      if (!back) throw new Error(`Room "${nRoom.id}" has no ${OPPOSITE[d.side]} door back to "${a.room.id}"`);
      const aw = a.room.size.w * T;
      const ah = a.room.size.h * T;
      let ox = 0;
      let oy = 0;
      if (d.side === 'E' || d.side === 'W') {
        ox = d.side === 'E' ? a.ox + aw + 2 * B : a.ox - 2 * B - nRoom.size.w * T;
        oy = a.oy + (d.y - back.y) * T;
      } else {
        oy = d.side === 'S' ? a.oy + ah + 2 * B : a.oy - 2 * B - nRoom.size.h * T;
        ox = a.ox + (d.x - back.x) * T;
      }
      placed[nRoom.id] = { room: nRoom, ox, oy };
      queue.push(nRoom.id);
    }
  }
  for (const id of ids) if (!placed[id]) throw new Error(`Room "${id}" is not joined to "${ids[0]}" by a door`);
  return placed;
}

/** The four walls of a room (pack px, relative to interior), with gaps for the open doors. */
function wallRects(room: RoomJson, open: RoomDoor[]): Rect[] {
  const W = room.size.w * T;
  const H = room.size.h * T;
  const out: Rect[] = [];
  const cut = (side: Side, from: number, to: number, make: (a: number, b: number) => Rect) => {
    const gaps = open.filter((d) => d.side === side).map(span).sort((p, q) => p[0] - q[0]);
    let cur = from;
    for (const [g0, g1] of gaps) {
      if (g0 > cur) out.push(make(cur, g0));
      cur = Math.max(cur, g1);
    }
    if (cur < to) out.push(make(cur, to));
  };
  cut('N', -B, W + B, (a, b) => ({ x: a, y: -B, w: b - a, h: B }));
  cut('S', -B, W + B, (a, b) => ({ x: a, y: H, w: b - a, h: B }));
  cut('W', 0, H, (a, b) => ({ x: -B, y: a, w: B, h: b - a }));
  cut('E', 0, H, (a, b) => ({ x: W, y: a, w: B, h: b - a }));
  return out;
}

/** A little enclosed porch outside an exit door: the zone you walk into, plus walls around it. */
function alcove(room: RoomJson, door: RoomDoor): { zone: Rect; walls: Rect[] } {
  const W = room.size.w * T;
  const H = room.size.h * T;
  const [s0, s1] = span(door);
  const n = s1 - s0;
  switch (door.side) {
    case 'S':
      return {
        zone: { x: s0, y: H + B, w: n, h: T },
        walls: [
          { x: s0 - B, y: H + B, w: B, h: T + B },
          { x: s1, y: H + B, w: B, h: T + B },
          { x: s0 - B, y: H + B + T, w: n + 2 * B, h: B },
        ],
      };
    case 'N':
      return {
        zone: { x: s0, y: -B - T, w: n, h: T },
        walls: [
          { x: s0 - B, y: -B - T - B, w: B, h: T + B },
          { x: s1, y: -B - T - B, w: B, h: T + B },
          { x: s0 - B, y: -B - T - B, w: n + 2 * B, h: B },
        ],
      };
    case 'E':
      return {
        zone: { x: W + B, y: s0, w: T, h: n },
        walls: [
          { x: W + B, y: s0 - B, w: T + B, h: B },
          { x: W + B, y: s1, w: T + B, h: B },
          { x: W + B + T, y: s0 - B, w: B, h: n + 2 * B },
        ],
      };
    default:
      return {
        zone: { x: -B - T, y: s0, w: T, h: n },
        walls: [
          { x: -B - T - B, y: s0 - B, w: T + B, h: B },
          { x: -B - T - B, y: s1, w: T + B, h: B },
          { x: -B - T - B, y: s0 - B, w: B, h: n + 2 * B },
        ],
      };
  }
}

const shift = (rc: Rect, ox: number, oy: number): Rect => r(rc.x + ox, rc.y + oy, rc.w, rc.h);

export function buildWorld(level: LevelDef, rooms: Record<string, RoomJson>): World {
  const placed = layout(level.rooms, rooms);
  const exits = level.exits ?? [];
  const world: World = {
    bounds: { x: 0, y: 0, w: 0, h: 0 },
    rooms: [],
    walls: [],
    doorways: [],
    solids: [],
    sprites: [],
    pickups: [],
    targets: [],
    hides: [],
    safes: [],
    exits: [],
    spawn: { x: 0, y: 0 },
    baddies: [],
  };
  const edges: Rect[] = [];

  // Items the steps need to pick up / use.
  const wantedPickups = new Set<string>();
  for (const s of level.steps) {
    if (s.type === 'pickup') wantedPickups.add(s.item);
    if (s.type === 'use') wantedPickups.add(s.item);
  }
  const wantedTargets = new Set<string>();
  for (const s of level.steps) if (s.type === 'use') wantedTargets.add(s.target);

  for (const id of level.rooms) {
    const { room, ox, oy } = placed[id];
    const W = room.size.w * T;
    const H = room.size.h * T;

    // doors: open when they lead to another room in this level, or are listed as exits
    const open: RoomDoor[] = [];
    for (const d of room.doors) {
      const isExit = exits.some((e) => e.room === id && e.to === d.to);
      if (level.rooms.includes(d.to) || isExit) open.push(d);
    }
    for (const w of wallRects(room, open)) world.walls.push(shift(w, ox, oy));
    for (const d of open) {
      const [s0, s1] = span(d);
      const gap: Rect =
        d.side === 'N' ? { x: s0, y: -B, w: s1 - s0, h: B }
        : d.side === 'S' ? { x: s0, y: H, w: s1 - s0, h: B }
        : d.side === 'W' ? { x: -B, y: s0, w: B, h: s1 - s0 }
        : { x: W, y: s0, w: B, h: s1 - s0 };
      world.doorways.push(shift(gap, ox, oy));
    }

    // exits: a porch you can walk into
    for (const e of exits.filter((x) => x.room === id)) {
      const d = room.doors.find((x) => x.to === e.to);
      if (!d) continue;
      const a = alcove(room, d);
      for (const w of a.walls) world.walls.push(shift(w, ox, oy));
      world.exits.push({ id: e.id, rect: shift(a.zone, ox, oy), label: e.label, side: d.side });
      world.doorways.push(shift(a.zone, ox, oy));
      edges.push(shift({ x: a.zone.x - B, y: a.zone.y - B, w: a.zone.w + 2 * B, h: a.zone.h + 2 * B }, ox, oy));
    }

    const interior = r(ox, oy, W, H);
    world.rooms.push({
      id,
      name: room.name,
      ground: room.ground,
      floorKey: 'floor:' + id,
      floorX: (ox - B) * S,
      floorY: (oy - B) * S,
      interior,
    });
    edges.push(r(ox - B, oy - B, W + 2 * B, H + 2 * B));
    if (room.safeZone) world.safes.push(interior);

    // furniture
    const byUid = new Map(room.items.map((i) => [i.uid, i]));
    for (const it of room.items) {
      const rect = r(ox + it.x * T, oy + it.y * T, it.w * T, it.h * T);
      world.sprites.push({
        uid: it.uid,
        frame: it.sprite,
        name: it.name,
        cx: rect.x + rect.w / 2,
        cy: rect.y + rect.h / 2,
        angle: it.rotation,
        rect,
      });
      if (wantedPickups.has(it.uid) && it.tags.includes('pickup')) world.pickups.push({ uid: it.uid, frame: it.sprite, name: it.name, rect });
      if (wantedTargets.has(it.uid)) world.targets.push({ id: it.uid, rect, label: it.name, kind: 'item' });
    }
    for (const c of room.colliders) world.solids.push(r(ox + c.x * T, oy + c.y * T, c.w * T, c.h * T));
    for (const uid of room.hideSpots) {
      const it = byUid.get(uid);
      if (it) world.hides.push({ uid, name: it.name, rect: r(ox + it.x * T, oy + it.y * T, it.w * T, it.h * T) });
    }
  }

  const spot = (s: { room: string; tile: [number, number] }): Pt => {
    const p = placed[s.room];
    if (!p) throw new Error(`Unknown room "${s.room}" in level ${level.id}`);
    return { x: (p.ox + s.tile[0] * T) * S, y: (p.oy + s.tile[1] * T) * S };
  };
  world.spawn = spot(level.spawn);
  for (const e of level.extras ?? []) {
    const c = spot(e);
    const w = 1.4 * T * S;
    const h = 1.0 * T * S;
    world.targets.push({ id: e.id, rect: { x: c.x - w / 2, y: c.y - h / 2, w, h }, label: e.label, kind: e.kind });
  }
  for (const b of level.baddies) {
    world.baddies.push({ id: b.id, patrol: b.patrol.map((p) => ({ ...spot(p), wait: p.wait ?? 0 })) });
  }

  const x0 = Math.min(...edges.map((e) => e.x));
  const y0 = Math.min(...edges.map((e) => e.y));
  const x1 = Math.max(...edges.map((e) => e.x + e.w));
  const y1 = Math.max(...edges.map((e) => e.y + e.h));
  world.bounds = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  return world;
}

/** Everything the player cannot walk through. */
export const blockers = (w: World): Rect[] => [...w.walls, ...w.solids];
