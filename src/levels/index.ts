import levelsJson from '../data/levels.json';
import baddiesJson from '../data/baddies.json';
import type { BaddieKind, LevelDef } from './types';

export const LEVELS = (levelsJson as unknown as { levels: LevelDef[] }).levels;
export const BADDIE_KINDS = baddiesJson as Record<string, BaddieKind>;

export const getLevel = (id: number): LevelDef | undefined => LEVELS.find((l) => l.id === id);
export const nextLevel = (id: number): LevelDef | undefined => LEVELS.find((l) => l.id === id + 1);
