import manifest from '../data/pack-manifest.json';

interface ManifestRoom {
  id: string;
  json: string; // e.g. "rooms/granny_house/gh_kitchen.json"
}

const ROOMS = (manifest as unknown as { rooms: ManifestRoom[] }).rooms;

/** Where a room's data and floor picture live under public/assets. */
export function roomFiles(id: string): { json: string; floor: string } {
  const m = ROOMS.find((x) => x.id === id);
  if (!m) throw new Error(`Room "${id}" is not in the art pack (check the spelling)`);
  return { json: 'assets/' + m.json, floor: 'assets/' + m.json.replace(/\.json$/, '_floor.png') };
}

export const roomExists = (id: string): boolean => ROOMS.some((x) => x.id === id);
