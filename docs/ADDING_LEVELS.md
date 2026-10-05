# Adding a level

Levels are built from the **rooms in the art pack** (41 rooms, 184 objects, already laid out). A level is one entry in
`godot/data/levels.json`: pick rooms, say where Anisha starts, where the baddie walks, and what the prank steps are.
No map editor and no code needed.

To see every room with all its objects named, open the pictures in `docs/art/preview/` (for example `gh_kitchen_labelled.png`).
After adding a level, run `npm run check`. It tells you in plain words if something is missing or the player can't reach it, and has a bot try to win it.

## The parts of a level

```json
{
  "id": 2,
  "name": { "en": "Granny's dining room", "hi": "…" },
  "rooms": ["gh_hall", "gh_dining_room"],
  "exits": [{ "id": "exit", "room": "gh_hall", "to": "town", "label": { "en": "front door" } }],
  "extras": [{ "id": "shoes", "kind": "shoes", "room": "gh_hall", "tile": [14.5, 8.2], "label": { "en": "her shoes" } }],
  "spawn": { "room": "gh_hall", "tile": [2, 5] },
  "task": { "en": "…" },
  "steps": [ … ],
  "needs": …, "watchOut": …, "hideIn": …,
  "baddies": [ … ],
  "petHelp": 2,
  "parTime": 75,
  "tip": …, "completeText": …
}
```

- **`id`** is the next number (1, 2, 3…).
- **`rooms`**: ids from the pack (the room list is in `docs/art/ASSET_PACK_README.md`). The first is the anchor; the others are
  joined to it through their doors automatically (a room's door `to` must name another room in the list). A door that leads to
  a room *not* in the level stays a closed wall.
- **`exits`**: a door that leads outside (usually `"to": "town"`). It opens, and the player can walk out through it.
  Use its `id` in a `reach` step.
- **`spawn`**, **patrol points** and **`extras`** use `room` plus `tile: [x, y]`, counted in tiles from the room's top-left.
  Decimals are fine (`[14.5, 8.2]` is the middle of a tile).
- **`extras`**: things the pack has no picture for. At the moment only `"kind": "shoes"`.

## Steps

Done in order. Objects are named by their **uid** in the room's file (`godot/data/rooms/<room>.json`, under `items`,
or on the labelled preview picture's matching file).

| Type | Fields | Meaning |
| --- | --- | --- |
| `pickup` | `item` | Grab an object that has the `pickup` tag (e.g. `cement_bag_1`, `chilli_1`, `lemon_1`) |
| `use` | `item`, `target` | Use a carried item on a target: another object's uid (e.g. `tv_big_1`, `alexa_1`) or an `extras` id |
| `reach` | `zone` | Walk into an `exits` id |

Each step has `"text": { "en": "…", "hi": "…" }` for the task list.

## Baddies

```json
{ "id": "teacher1", "kind": "teacher", "speed": 80,
  "patrol": [ { "room": "gh_hall", "tile": [7, 2.5], "wait": 0.8 }, { "room": "gh_hall", "tile": [10.5, 6.5] } ] }
```

He walks the points in a loop (at least 2) and starts at the first. Keep points on open floor, not on furniture.
`speed`, `range` (sight distance, in pixels) and `halfAngle` (half the width of the sight cone, in degrees) override the
defaults for that kind in `godot/data/baddies.json`.

**Making levels a little harder, one thing at a time:** raise `speed`, `range` or `halfAngle`, add a patrol point, add a second
baddie, add another item to collect, or lower `parTime`.

## Hiding spots and safe zones

These come from the pack: objects tagged `hide` (big cupboard, pots, beds) are hiding spots automatically, and rooms marked
`safeZone` (roof, play zone) are safe. Nothing to set up.

## A new kind of baddie

Add it to `godot/data/baddies.json`, then use its key as `"kind"`. Labubu and Kabla are ready to add this way. Giving each its
own model and behaviour (guarding, chasing, quiet) needs a small change in `godot/scripts/game/game_logic.gd` and a model in `godot/assets/models/`.

## Text

Any text can be a plain string or `{ "en": "…", "hi": "…" }`. Missing Hindi falls back to English. Object names (like
"Cement bag") are English only for now.

## Try it

```bash
npm run check            # catches typos, missing items, unreachable things (needs Godot installed)
godot --path godot -- --level 2   # play level 2 straight away
```
