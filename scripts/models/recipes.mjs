// The registry of every generated model: id -> { build(m, ctx), kind, foot, name, mount, maxTris }.
//  - kind: 'object' (an item of the art pack, must fit its footprint), or 'extra' | 'item' | 'vehicle' | 'building' | 'character'
//  - foot: footprint [w, d] in metres; only needed for things that are not in the art pack
//  - mount: { y, wall } for things hung on a wall or ceiling, modelled at floor level and raised in the game
// Each set of recipes lives in scripts/models/sets/. Front is +Z, origin is the centre of the base, 1 unit = 1 metre.
import { RECIPES as extras } from './sets/extras.mjs';
import { RECIPES as home } from './sets/home.mjs';
import { RECIPES as granny } from './sets/granny.mjs';
import { RECIPES as park } from './sets/park.mjs';
import { RECIPES as pool } from './sets/pool.mjs';
import { RECIPES as school } from './sets/school.mjs';
import { RECIPES as hospital } from './sets/hospital.mjs';
import { RECIPES as palace } from './sets/palace.mjs';
import { RECIPES as vehicles } from './sets/vehicles.mjs';
import { RECIPES as items } from './sets/items.mjs';
import { RECIPES as env } from './sets/env.mjs';
import { RECIPES as characters } from './sets/characters.mjs';
import { RECIPES as buildings } from './sets/buildings.mjs';

export const RECIPES = { ...extras, ...home, ...granny, ...park, ...pool, ...school, ...hospital, ...palace, ...vehicles, ...items, ...env, ...characters, ...buildings };
