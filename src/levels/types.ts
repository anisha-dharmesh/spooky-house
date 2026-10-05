import type { Text } from '../i18n';

export type Step =
  | { type: 'pickup'; item: string; text: Text } // item = uid of an item in a room (it must have the "pickup" tag)
  | { type: 'use'; item: string; target: string; text: Text } // target = uid of a room item, or the id of an "extra"
  | { type: 'reach'; zone: string; text: Text }; // zone = id of an "exit"

/** Default behaviour of a kind of baddie (see src/data/baddies.json). */
export interface BaddieKind {
  name: Text;
  speed: number; // px per second
  range: number; // sight distance in px
  halfAngle: number; // half the width of the sight cone, in degrees
}

/** A spot inside a room, measured in tiles from the room's top-left corner (decimals are fine). */
export interface RoomSpot {
  room: string;
  tile: [number, number];
}

export interface PatrolPoint extends RoomSpot {
  wait?: number; // seconds to pause when he gets there
}

export interface LevelBaddie {
  id: string;
  kind: string;
  patrol: PatrolPoint[]; // walks these in a loop; he starts at the first one
  speed?: number;
  range?: number;
  halfAngle?: number;
}

/** A way out of the level: a door in a room that leads outside (or to somewhere not in this level). */
export interface LevelExit {
  id: string;
  room: string;
  to: string; // the id the room's door leads to, e.g. "town"
  label?: Text;
}

/** Something the pack has no picture for (e.g. her shoes). Drawn by the game. */
export interface LevelExtra extends RoomSpot {
  id: string;
  kind: 'shoes';
  label: Text;
}

export interface LevelDef {
  id: number;
  name: Text;
  rooms: string[]; // room ids from the art pack. The first is the anchor; the rest are joined by their doors.
  exits?: LevelExit[];
  extras?: LevelExtra[];
  spawn: RoomSpot;
  task: Text;
  steps: Step[];
  needs: Text;
  watchOut: Text;
  hideIn: Text;
  baddies: LevelBaddie[];
  petHelp: number;
  parTime: number; // seconds for the "quick" star
  tip: Text;
  completeText: Text;
}
