// Shared constants. Colours are black, grey and white only, as Anisha asked.
export const W = 1280;
export const H = 720;

export const C = {
  bg: 0x0a0a0b,
  floor: 0x19191b,
  grid: 0x222225,
  wall: 0x2e2e31,
  panel: 0x0a0a0b,
  panelStroke: 0x3a3a3d,
  chip: 0x1c1c1e,
  white: 0xf2f2ef,
  light: 0xd4d4cf,
  mid: 0xa3a39e,
  dim: 0x6a6a66,
  dark: 0x2a2a2d,
} as const;

export const hex = (n: number): string => '#' + n.toString(16).padStart(6, '0');

export const FONT = "'Patrick Hand', 'Kalam', 'Comic Sans MS', cursive";
export const TITLE_FONT = "'Creepster', 'Patrick Hand', 'Kalam', cursive";

// The art pack is drawn on a 40 px tile grid with a 14 px wall border. We draw it 1.5x bigger (60 px tiles).
export const PACK_TILE = 40;
export const PACK_WALL = 14;
export const WORLD_SCALE = 1.5;
export const TILE = PACK_TILE * WORLD_SCALE;

// Gameplay tuning
export const PLAYER_RADIUS = 24;
export const WALK_SPEED = 170;
export const SNEAK_SPEED = 90;
export const REACH = 54; // how close you must be to use / hide
export const MAX_ITEMS = 3;
export const NOT_SEEN_LIMIT = 0.6; // meter above this loses the "not seen" star
export const TOTAL_LEVELS = 100;
