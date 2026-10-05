# Anisha's Spooky House: 3D (Godot)

The 3D version of the game, built with **Godot 4.7** and GDScript. It is **one continuous world**: Anisha starts in her room,
walks through town to Granny's house and does tasks one after another. Finishing a task can unlock rooms (until then the door
says LOCKED). If she is caught she wakes up in her room and drops everything she carried. The world is built automatically
from the art pack's room layouts. Objects without a model yet are grey boxes.

## Run it

1. Install Godot 4.7 (`brew install --cask godot`).
2. Open this `godot/` folder in Godot (Project Manager → Import → `project.godot`) and press **Play** (F5).
   The first time, Godot imports the fonts; wait for it to finish.

From a terminal: `godot --path godot`. To start at a later task: `godot --path godot -- --task 2`.

## Controls

| | Keyboard | Touch |
| --- | --- | --- |
| Move | WASD / arrows | Stick (left side) |
| Sneak | Hold Shift | Sneak button (toggle) |
| Use / grab | E or Space | Use button |
| Hide / come out | H | Hide button |
| Call a pet | C | Pet button (top) |
| Switch camera | V | View button (top) |
| Turn the third-person camera | Q / R, or right-mouse drag | Drag on the right half |
| Pause | Esc or P | II button (top) |

Two cameras: the tilted **dollhouse** view (walls drop low so you can see in) and **third person** behind Anisha
(walls rise to full height). Touch controls turn on by themselves on phones and tablets (`--touch` forces them on a computer).

## Where things are

| Path | What |
| --- | --- |
| `scripts/core/world_builder.gd` | Turns the world's rooms (from the art pack) into walls, doors, furniture and hiding spots |
| `scripts/core/geo.gd` | Floor-plan geometry: sight rays, cones, collisions |
| `scripts/game/game_logic.gd` | The rules: movement, patrols, sight, "seen" meter, locked rooms, items, hiding, the tasks in order, getting caught, pets. No drawing |
| `scripts/game/level_view.gd` | Shows the logic in 3D, plus both cameras, the sight cones and the light (dark in Granny's house, bright elsewhere) |
| `scripts/game/model_library.gd` | Makes each object (a grey box today). **This is where real 3D models plug in** |
| `scripts/ui/` | Title screen, HUD, pause / caught / prank-done screens, touch controls |
| `data/` | The world, the tasks, baddies, text (English and Hindi) and the room layouts. Edit these directly |
| `tests/` | Headless checks |

## Data

The world (`world.json`), the tasks (`tasks.json`), baddie kinds, text and room layouts are plain JSON in `data/`.
Adding a task or a room: see [../docs/ADDING_TASKS.md](../docs/ADDING_TASKS.md).

## 3D models

Level 1's kitchen and hall use real low-poly models in **real colours**: 31 objects plus Anisha and the scary teacher, made by
Claude Design, and her shoes, made by a small script. They are in `assets/models/`. `MODELS.md` there lists everything, and the
pictures are in [../docs/art/3d-batch1/](../docs/art/3d-batch1/). The characters are skinned and animated (Anisha: `idle`, `walk`,
`sneak`, `pickup`, `hide`; the teacher: `idle`, `walk`, `look_around`, `caught_you`).

```bash
npm run models                    # refreshes index.json (sizes, mount heights) and rebuilds the generated models
godot --path godot -- --gallery   # shows all of them in rows with their names
```

To replace a model, overwrite its file: the game picks up `assets/models/<object id>.glb` automatically. Wall and ceiling pieces
(clock, frames, bulb) are modelled at floor level and raised by the `mount` height in `batch1.manifest.json`; `npm run models`
copies that into `index.json`. Rules for models (1 unit = 1 metre, origin at the centre of the base, front faces +Z, under 3,000
triangles, 8,000 for characters) are in [../docs/3D_MODEL_BRIEF.md](../docs/3D_MODEL_BRIEF.md), and `npm test` checks every file.

Objects with no model yet are grey boxes sized from the room files. Stairs and the lift are solid, since they are big blocks now
but do not take you anywhere yet.

## Checks

```bash
godot --headless --path godot --script tests/task_test.gd     # validates the world and every task, and has a bot do each task
godot --headless --path godot --script tests/rules_test.gd    # locked rooms, tasks in order, early pickups, getting caught, saves
godot --headless --path godot --script tests/world_test.gd    # prints where every room is
npm run check                                                 # all of the checks, including the model checks
godot --headless --path godot -- --selftest                   # presses keys in the real game: move, camera, pick up, finish a task, get caught
```

After a fresh clone, run `godot --headless --path godot --import` once so Godot registers the scripts and fonts.

The bot starts in Anisha's room with the earlier tasks done, waits a different time each try, then walks the shortest route
(sneaking, never hiding). A task must be winnable at some moment. The share of start moments it wins shows how hard the task is.

## Publishing

Not set up yet. Godot's web export needs its export templates (a large download, done in the editor under Editor → Manage Export
Templates), and web builds of 3D games are big (about 30 to 40 MB) and can struggle on older phones. Desktop and Android builds
are easier. We should decide the target before setting up exports.

## Not built yet

Stairs and lift between floors (the models are there but are decoration for now), the rest of the town (playground, school,
hospital, palace; there is only a short street between the two houses), an arrow pointing to where the task is, sound, models for
the other 150 objects, the other baddies (Labubu, Kabla), and only two tasks exist (task 2, the lemon in the tea, is a stand-in from
the approved suggestions until Anisha picks hers). Anisha's look is a stand-in until she decides.
