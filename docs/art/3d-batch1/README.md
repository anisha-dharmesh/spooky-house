# Anisha's Spooky House: 3D models, batch 1 (Level 1)

This batch has 31 low-poly objects from granny's kitchen and hall, plus 2 rigged stand-in characters. Every file is glTF binary (`.glb`) and passes the Khronos glTF Validator with 0 errors and 0 warnings.

## Follows the spec
- **Units:** 1 unit = 1 m. 1 tile of the 2D art = 1 m, and each object fills its tile footprint.
- **Origin and facing:** the origin is at the centre of the base on the floor (y = 0), and the front faces **+Z**.
- **File names:** each file is named by its object id (`fridge.glb`, `sofa.glb`...), so you can drop them into `godot/assets/models/`.
- **Triangles:**
  - Objects: 24 to 1,020 triangles each (limit 3,000).
  - Characters: about 2,000 to 2,400 (limit 8,000).
- **Materials:** plain colours with no textures. Only lamps, bulbs, screens and the lift/Alexa lights glow.
- **Colours:** real colours, as you chose for this batch.

## Files
```
models/            31 objects + anisha.glb + scary_teacher.glb
manifest.json      size, height, triangles, materials and mount point for every model
previews/          a 3/4 view picture of each model
sheets/            model sheets (front/side/back/top + sizes), hero objects, animation strips
```

## Characters
- **Anisha** is about 1.2 m tall. This is a simple stand-in until Anisha decides her look.
- **Scary teacher** is about 1.6 m tall, with a grey bun, glasses, angry brows and a frown.
- **Skeleton:** root › hips › spine › head, and spine › arm_L / arm_R, and hips › thigh_L › shin_L / thigh_R › shin_R.
  - Each body part follows exactly one bone (rigid skinning), which is enough for a stand-in.
- **Animations**, named exactly as in the spec:
  - Anisha: `idle`, `walk`, `sneak` (crouched), `pickup`, `hide`
  - Teacher: `idle`, `walk`, `look_around`, `caught_you`
  - `pickup` and `caught_you` play once. All the others loop cleanly, with the first and last frames the same.
  - Every animation sets every bone, so switching from one animation to another never leaves a limb stuck.

## Notes
- **Wall items:** `wall_clock` and `photo_frame` hang on the wall, and `hanging_bulb` hangs from the ceiling. Each one's mount height is in `manifest.json`.
- **Big cupboard:** `cupboard_big` is 2 m wide × 4 m deep to match the 2D footprint, which makes it a walk-in hiding cupboard. If you'd rather have a normal 4 × 1 wardrobe, change its footprint in the 2D data and rebuild.
- **Quick look:** to see any file, drag it into Blender (File › Import › glTF) or into an online glTF viewer.
