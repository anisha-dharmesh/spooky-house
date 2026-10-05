# 3D models, batch 2: everything in the reference picture

Built from `docs/art/reference/01-asset-pack-overview.webp` (shapes and colours matched by eye, panel by panel).
**Every object of the art pack now has a model** (184 objects), plus the 10 characters, 3 vehicles and a school bus and
ambulance, 40 small game items, street pieces, extra furniture and play things from the picture, and 8 buildings.
The full list with sizes is in `godot/assets/models/MODELS.md`. The pictures in `sheets/` show every model.

## How they were made

Not converted from the picture by a program: a picture of a 3D model cannot be turned into a mesh at this size. Each model is
a small recipe in `scripts/models/sets/*.mjs` (boxes, rounded boxes, lathes, tubes, lumpy blobs...) with the colours of the
picture, written out as a `.glb` by `npm run models`. Change a recipe and the model changes.

| Set (recipes) | What | Picture panel |
| --- | --- | --- |
| `home.mjs` | little house: living room, bedroom, kitchen, pet room, bathroom | 1 |
| `granny.mjs` | Granny's bedrooms, store room, fun rooms, study, play zone | 2 |
| `park.mjs` | playground, garden, sand park, trees | 3, 4, 7 |
| `pool.mjs` | pool, slides, loungers, umbrellas, floaties | 5 |
| `school.mjs` | desks, board, lab, canteen, lockers | 6 |
| `hospital.mjs` | beds, X-ray, reception, medicine | 8 |
| `palace.mjs` | throne, carpet, chandelier, bed, treasure | 9 |
| `vehicles.mjs` | scooty, Bullet bike, bicycle, school bus, ambulance, car | vehicles strip, banner |
| `items.mjs` | cake, bottles, tools, fruit, buckets and the other small things | game objects strip |
| `env.mjs` | roads, pavement, grass, bins, cones, lamps | environment strip |
| `characters.mjs` | Anisha, Granny, scary teacher, Labubu, Kabla, Rani, Kamala, parrot, dog, cat | characters strip |
| `buildings.mjs` | little house, Granny's house, school, hospital, palace, greenhouse, watch tower, beach shack | banner and panels |

## Colours

The models keep the colours of the picture. **Granny's house stays black, grey and white** (Dharmesh's choice): the game turns
every prop that is placed in Granny's house into grey when it builds the room (`ModelLibrary.greyscale`), so the same file
works in both places. Things Anisha can pick up for a task keep their colours so she can find them.

## Look at one model

```bash
node scripts/sheet.mjs --out /tmp/look.png sofa bed_single --cols 2 [--yaw 40] [--anim walk --time 0.2] [--grey]
godot --path godot -- --sheet sofa,bed_single      # or the same thing live in a window
```

## Not done / ideas

- The picture is detailed, glossy concept art. These are simpler, chunky low-poly versions: a good base, not a copy.
- Rooms in the pictures that the game data does not have (for example the baddies' rooms in Granny's house, the music and art rooms
  in the school) have no room files yet, so their special props are not here either.
- The buildings are outsides only. The game builds the rooms from the room files and puts these models inside.
