import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BADDIE_KINDS, LEVELS } from '../src/levels';
import { roomFiles } from '../src/levels/rooms';
import { validateLevel } from '../src/levels/validate';
import type { RoomJson } from '../src/levels/world';

function loadRooms(ids: string[]): Record<string, RoomJson> {
  const out: Record<string, RoomJson> = {};
  for (const id of ids) {
    const file = path.resolve('public', roomFiles(id).json);
    out[id] = JSON.parse(fs.readFileSync(file, 'utf8')) as RoomJson;
  }
  return out;
}

describe('levels', () => {
  it('has numbered, unique levels', () => {
    const ids = LEVELS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id, i) => expect(id).toBe(i + 1));
  });

  for (const level of LEVELS) {
    it(`level ${level.id} is valid and winnable`, () => {
      // also load rooms next to the level's rooms so door-joins can be checked
      const rooms = loadRooms(level.rooms);
      expect(validateLevel(level, rooms, BADDIE_KINDS)).toEqual([]);
    });
  }
});
