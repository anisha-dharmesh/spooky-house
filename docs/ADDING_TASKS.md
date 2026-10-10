# Adding a task (and rooms to the world)

The game is **one continuous world** (`godot/data/world.json`): Anisha's little house, a street, and Granny's house, all
joined by doors, so she can walk anywhere that is open. She does **tasks in order** (`godot/data/tasks.json`). Finishing a
task can **unlock rooms**: until then the door is shut and says LOCKED. She can look around and pick up items for later tasks
early, but a prank only counts when it is the current task.

If she is caught she wakes up in her room, drops everything she carried (the items go back where they were) and starts the
current task again. Finished tasks and unlocked rooms stay.

No map editor and no code needed. After a change, run `npm run check`: it tells you in plain words if something is missing or
cannot be reached, and has a bot try every task.

To see every room with all its objects named, open the pictures in `docs/art/preview/` (for example `gh_kitchen_labelled.png`).

## The world: `godot/data/world.json`

```json
{
  "rooms": ["town_street", "lh_fluffy_room", "lh_hall", "gh_hall", "gh_kitchen", "gh_store_room"],
  "streets": [{ "id": "town_street", "name": "Street", "location": "town", "w": 52, "h": 8, "ground": "road",
                "doors": [{ "to": "gh_hall", "x": 12 }, { "to": "lh_hall", "x": 34 }] }],
  "respawn": { "room": "lh_fluffy_room", "tile": [4, 6] }
}
```

- **`rooms`**: ids from the art pack (the list is in `docs/art/ASSET_PACK_README.md`). The first one sits at the corner of
  the map and the others are placed next to it through their doors automatically (a room's door `to` must name another room
  in the list, and that room needs a matching door on the opposite side). A door that leads to a room *not* in the list is a wall.
- **`streets`**: the pack has no streets, so they are made here. A street is a long outdoor room. Each entry in its `doors`
  joins it to the front door (the door that goes "to town") of a house, `x` metres along the street.
  The world test (`godot --headless --path godot --script tests/world_test.gd`) prints where every room ends up.
- **`respawn`**: where Anisha starts and where she wakes up when she is caught.

Adding a place means adding its rooms to `rooms`, and (for a new house) a street door.

## Which tasks the game plays

`godot/data/tasks.json` lists **every** task, built or not (planning fields like `title`, `difficulty`, `kind`, `learn`, `message`).
The game plays only the ones that have **`steps`**, in order of **`play`** (1, 2, 3…). The game's own number is `play`; the
planning id (like `E19`) is kept as `ref`. To build a task, add `play`, `steps`, `needs`, `watchOut`, `hideIn`, `baddies`,
`petHelp`, `parTime`, `tip` and `completeText` to its record. `message` is shown on the "well done" screen, and tasks without
`prank` in `kind` get "Well done!" instead of "Prank done!".

## A task: `godot/data/tasks.json`

```json
{
  "id": 2,
  "name": "Sour tea",
  "task": "Put lemon in the scary teacher's tea",
  "unlocks": ["gh_store_room"],
  "extras": [{ "id": "shoes", "kind": "shoes", "room": "gh_hall", "tile": [14.5, 8.2], "label": "her shoes" }],
  "steps": [ … ],
  "needs": …, "watchOut": …, "hideIn": …,
  "baddies": [ … ],
  "petHelp": 2,
  "parTime": 70,
  "tip": …, "completeText": …
}
```

- **`id`**: 1, 2, 3… Tasks are done in the order they are listed.
- **`unlocks`**: rooms that open when this task is done. A room that is in some task's `unlocks` is locked until then;
  every other room is open from the start. The checker makes sure the task itself never needs a room that is still locked.
- **`extras`**: things the pack has no picture for. At the moment only `"kind": "shoes"`. They use `room` plus `tile: [x, y]`,
  counted in tiles from the room's top-left (decimals are fine).
- **`parTime`**: seconds for the "quick" star. The checker's bot prints how fast it walks the task; a normal player walking
  can beat that.

## Steps

Done in order. Items are named **`room id/uid`** (the uid is in the room's file, `godot/data/rooms/<room>.json`, under `items`)
because the same uid can be in different rooms: `gh_kitchen/cement_bag_1`.

| Type | Fields | Meaning |
| --- | --- | --- |
| `pickup` | `item` | Grab an object that has the `pickup` tag (e.g. `gh_kitchen/chilli_1`, `gh_kitchen/lemon_1`) |
| `use` | `item`, `target` | Use a carried item on a target: another object (e.g. `gh_hall/tv_big_1`) or an `extras` id |
| `reach` | `room` | Walk into a room (for example back home: `lh_hall`) |
| `do` | `target` | Do something to an object without carrying anything (fold the bed, take a shower, switch on the lights) |
| `watch` | `target`, `hide` (optional) | Wait until a baddie steps on the target (the teacher on the doormat). `hide` names a hiding spot for the bot |

A `use` step may have `"keep": true`: the item stays in her hands (Teddy, the watering can, the pet food sack) and is put away when
the task is done.

Each step has `"text": "…"` for the task list. An item belongs to one task only.

## Baddies

```json
{ "id": "teacher1", "kind": "teacher", "speed": 80,
  "patrol": [ { "room": "gh_hall", "tile": [7, 2.5], "wait": 0.8 }, { "room": "gh_hall", "tile": [10.5, 6.5] } ] }
```

Baddies belong to the world, not to a level. The task says who is around and where they walk; baddies the task does not
list go away, and one that was already there carries on from the nearest point of its new route. They start at the first point
when a task starts and again after she is caught.

He walks the points in a loop (at least 2) in straight lines, so keep points on open floor and every walk between two points
clear of walls and furniture (the checker tells you if not). `speed`, `range` (sight distance, in pixels) and `halfAngle`
(half the width of the sight cone, in degrees) override the defaults for that kind in `godot/data/baddies.json`.

**Making tasks a little harder, one thing at a time:** raise `speed`, `range` or `halfAngle`, add a patrol point, add a second
baddie, add another item to collect, or lower `parTime`.

## Hiding spots and safe zones

These come from the pack: objects tagged `hide` (big cupboard, pots, beds) are hiding spots automatically, and rooms marked
`safeZone` (roof, play zone) are safe. Nothing to set up.

## A new kind of baddie

Add it to `godot/data/baddies.json`, then use its key as `"kind"`. Labubu and Kabla are ready to add this way. Giving each its
own model and behaviour (guarding, chasing, quiet) needs a small change in `godot/scripts/game/game_logic.gd` and a model in `godot/assets/models/`.

## Text

All text is plain English strings, for example `"tip": "Tip: wait for her to pass, then dash."`. Menu text is in
`godot/data/strings.json`.

## Try it

```bash
npm run check                        # catches typos, missing items, locked or unreachable things (needs Godot installed)
godot --path godot -- --task 2       # play from task 2 straight away (tasks before it count as done)
```
