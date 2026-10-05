# Anisha's Spooky House: 3D (Godot)

The 3D version of the game, built with **Godot 4.7** and GDScript. Everything is grey placeholder boxes for now,
built automatically from the art pack's room layouts. Objects without a model yet are grey boxes.

## Run it

1. Install Godot 4.7 (`brew install --cask godot`).
2. Open this `godot/` folder in Godot (Project Manager → Import → `project.godot`) and press **Play** (F5).
   The first time, Godot imports the fonts; wait for it to finish.

From a terminal: `godot --path godot`.

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
| `scripts/core/world_builder.gd` | Turns a level's rooms (from the art pack) into walls, furniture, hiding spots, exits |
| `scripts/core/geo.gd` | Floor-plan geometry: sight rays, cones, collisions |
| `scripts/game/game_logic.gd` | The rules: movement, patrols, sight, "seen" meter, items, hiding, steps, pets. No drawing |
| `scripts/game/level_view.gd` | Shows the logic in 3D, plus both cameras and the sight cones |
| `scripts/game/model_library.gd` | Makes each object (a grey box today). **This is where real 3D models plug in** |
| `scripts/ui/` | Title screen, HUD, pause / caught / prank-done screens, touch controls |
| `data/` | Levels, baddies, text (English and Hindi) and the room layouts. Edit these directly |
| `tests/` | Headless checks |

## Data

Levels, baddie kinds, text and room layouts are plain JSON in `data/`. Adding a level: see [../docs/ADDING_LEVELS.md](../docs/ADDING_LEVELS.md).

## 3D models

Level 1's kitchen and hall now use **generated low-poly models**: 31 objects plus shoes, Anisha and the scary teacher
(the two characters have idle / walk / sneak / pickup / hide, and look_around / caught_you for the teacher).
They live in `assets/models/` (`MODELS.md` lists what exists and what is still a plain grey box) and are made by a script,
not by hand:

```bash
npm run models        # rebuilds every .glb from scripts/models/recipes.mjs
godot --path godot -- --gallery   # shows all of them in rows with their names
```

To change a model, edit its recipe in `scripts/models/recipes.mjs` and run `npm run models`. To replace one with a model made
elsewhere (Blender, a 3D artist), just overwrite its file: the game picks up `assets/models/<object id>.glb` automatically.
Rules for models (1 unit = 1 metre, origin at the centre of the base, front faces +Z, under 3,000 triangles) are in
[../docs/3D_MODEL_BRIEF.md](../docs/3D_MODEL_BRIEF.md); `npm test` checks them for the generated ones.

Objects with no model yet are grey boxes sized from the room files, and the characters fall back to capsules.

## Checks

```bash
godot --headless --path godot --script tests/level_test.gd    # validates every level and has a bot play it
godot --headless --path godot --script tests/world_test.gd    # prints a summary of each built level
npm run check                                                 # all of the checks, including the model checks
godot --headless --path godot -- --selftest                   # presses keys in the real game: move, camera, pick up
```

After a fresh clone, run `godot --headless --path godot --import` once so Godot registers the scripts and fonts.

The bot walks the shortest route (sneaking, never hiding) at many different start moments. A level must be winnable at some
moment. The share of start moments it wins shows how hard the level is: Level 1 is won 15 times out of 20.

## Publishing

Not set up yet. Godot's web export needs its export templates (a large download, done in the editor under Editor → Manage Export
Templates), and web builds of 3D games are big (about 30 to 40 MB) and can struggle on older phones. Desktop and Android builds
are easier. We should decide the target before setting up exports.

## Not built yet

Level map screen, stairs and lift between floors (the models are there but are decoration for now), sound, models for the other 150 objects, the other baddies (Labubu, Kabla), and only Level 1 exists. Anisha's look is a stand-in until she decides.
