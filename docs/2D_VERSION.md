# The 2D version

The game is 2D (decided Oct 6, 2026, by Dharmesh) and plays in a browser, phones included. Rules we keep to:

- **One room on the screen at a time.** The camera is fixed; the whole room is in view (a "fixed room view").
- **A mini map** shows the whole house: floors stacked, rooms side by side, her place, the room the task wants (a star),
  shut rooms (a padlock).
- **Touch first:** tap the floor to walk, tap a thing to walk to it and grab it, one big action button, a sneak button.
  Keyboard works too (arrows / WASD, Space or E, Shift).

## Doors and the lift

- A **door** is a gap in a side or back wall or a hatch in the floor, with a paper label. Walk into it (or tap it) to fade to the next room;
  she appears in front of the door she came through. What she holds and how far the task is go with her (`run_state.gd`).
  Shut rooms (`lockedAtStart` in `places.json`) bounce her back.
- **Floors are joined by a lift only, no stairs.** The lift door is on a side wall of one room per floor, with a **LIFT** label above it.
  Walking into it opens the lift screen (`lift_view.gd`): the doors, a floor display, and a panel with a button for each floor
  (padlock on a shut floor). Tap a floor: the doors close, the display counts the floors, the doors open there, and she
  steps out in front of that floor's lift door. `Step out` stays on the same floor.
- The lift stops are in `places.json` (`houses.<id>.lift.stops`: `floor`, `room`, `side` W or E, `v` (how far back along the wall), `label`).
  To add a floor, add a stop for a room on it. The mini map draws the lift door in each stop and the shaft between them.

## The art

The colourful pack (`anisha-house-fixed-view.zip`, made by Dharmesh in Claude Design) is unpacked in
`godot/assets/pack/`: `sprites/` (every item, drawn at 2x), `characters/`, `rooms/<id>_bg.png` (empty walls and floor, 1600 x 900),
`rooms/<id>.json` (the camera formula and where each item is drawn, back to front) and `manifest.json` (names, tags).
`pack_art.gd` loads it and `room_camera.gd` is the camera formula. The pictures are shown at 0.8 on the 1280 x 720 screen.
Only one picture of each character exists, so walking is a bob and a tilt (no walk frames yet).

## The room screen

Room positions are in tiles: `x` along the back wall, `y` from the back wall towards the viewer. `RoomCamera.map()` turns a
position into a point on the 1600 x 900 picture (things further back are higher up and smaller); `unmap()` goes the other way
(for taps). Where each thing is drawn comes from the pack's room file; things the old room file lacks (plums, cakes...) are
added from it.

| Layer | What |
| --- | --- |
| `room_backdrop.gd` | the pack background picture, a paper label at each door, a trapdoor where a door is in the floor |
| `room_view.gd` | furniture pictures sorted by depth, Anisha and the baddie, the baddie's light cone, the arrow on the thing the task wants, taps |
| `room_game.gd` | the rules (no drawing): walking round furniture (A*), grabbing, hiding under the table, the baddie and the "Seen" meter, task steps |
| `room_ui.gd`, `mini_map.gd` | task card, seen meter, mini map, things carried, action and sneak buttons, messages, the caught card |

## What is built

Only **Granny's kitchen** (`gh_kitchen`): grab the cement (task 1, step 1), grab other things, hide under the table, a
teacher who patrols and sees her (the meter fills, then she is caught). Doors lead to the rooms next to it; rooms with no pack picture yet say "coming soon".

## Not done yet

The other rooms (each needs its own look: colours, window, floor), doors that move between rooms, the street, locked rooms
opening after tasks (the lift shows floor 1 as shut until then), pets, stars and the "prank done" screen, a pause menu, the title screen in the new style, sound,
and walk frames for the characters.
