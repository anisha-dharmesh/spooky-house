# Anisha's Spooky House

A stealth-prank game, designed by Anisha (age 8). Sneak around Granny's spooky house, pull pranks on the baddies, and don't
get caught. Built in **3D with Godot 4.7** (GDScript).

The game is in [godot/](godot/README.md): how to run it, the controls, and where everything is.

## Quick start

```bash
brew install --cask godot     # once
godot --path godot            # play
godot --path godot -- --gallery   # look at all the 3D models
```

## Folders

| Folder | What |
| --- | --- |
| `godot/` | The game |
| `godot/data/` | Levels, baddies, text (English and Hindi) and the room layouts |
| `godot/assets/models/` | The 3D models (generated; see `MODELS.md` there) |
| `scripts/` | Tools that build the 3D models (`npm run models`) |
| `tests/` | Checks for the generated models (`npm test`) |
| `docs/` | The game design spec, how to add levels, how to get 3D models, and the art pack notes and pictures |

## Checks

```bash
npm install     # once
npm run check   # model checks, then Godot's level check, a bot that plays each level, and a controls test
```

## Adding levels and making models

- Levels: [docs/ADDING_LEVELS.md](docs/ADDING_LEVELS.md). Pick rooms from the art pack and add one entry to
  `godot/data/levels.json`. No code needed.
- 3D models: [docs/3D_MODEL_BRIEF.md](docs/3D_MODEL_BRIEF.md). The rules every model follows and how to make more.

## History

A first 2D version (Phaser, in the browser) was built and later removed in favour of the 3D game. It is still in the git
history: commit `fff3950`.

Hindi text was written by Claude and should be checked by a Hindi speaker.
