# Anisha's Spooky House

A stealth-prank game, designed by Anisha (age 8). Sneak around Granny's spooky house, pull pranks on the baddies, and don't
get caught. A **2D game in Godot 4.7** (GDScript), made to play in a browser (phone Safari included).

## How it looks

**One room on the screen at a time**, seen from the front (back wall, two side walls, floor). Anisha walks anywhere on the
floor. A **mini map** (top right) shows the house, where she is, and which room the task wants next.

The first room built is **Granny's kitchen** (task 1: grab the cement). See [docs/2D_VERSION.md](docs/2D_VERSION.md).

## Quick start

```bash
brew install --cask godot     # once
godot --path godot            # play
godot --path godot -- --room gh_kitchen                   # start in the kitchen
godot --path godot -- --room gh_kitchen --touch           # with the phone buttons
godot --path godot -- --shot out.png [--grab|--hide|--caught]   # save a picture of the screen
godot --headless --path godot -- --selftest               # check the rules of the room
```

## Folders

| Folder | What |
| --- | --- |
| `godot/` | The game |
| `godot/scripts/room/` | The room: rules (`room_game`), drawing (`room_view`, `room_backdrop`), screen buttons and cards (`room_ui`), mini map (`mini_map`) |
| `godot/data/` | Tasks, baddies, text (English and Hindi), the rooms (`rooms/`) and the house layout (`places.json`) |
| `godot/assets/pack/` | The colourful art: item pictures, characters, room backgrounds and layouts (from the Claude Design pack) |
| `docs/` | The game design spec, how to add tasks, the 2D notes and the art pack |

Hindi text was written by Claude and should be checked by a Hindi speaker.
