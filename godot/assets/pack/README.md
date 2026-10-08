# Anisha's House: colourful game art (fixed room view)

The pack has 267 items, 41 rooms, 7 characters plus 3 pets, and a town street. Everything is bright and nothing is spooky.

## Files
```
manifest.json                 items (name, footprint, sprite size, mount, tags), rooms, characters
categories.json               category of each item: home, granny, playground, garden, pool, school, sand_park,
                              hospital, palace, game_object, vehicle, environment, building, pet
sprites/svg|png|png@2x/<id>   one picture per item, front view, ground line at the bottom
atlas/items_atlas@2x.*        all items in one texture atlas (Phaser "JSON hash" format)
characters/                   anisha, scary_teacher, granny, rani, kamala, kabla, labubu (original look)
rooms/<place>/<room>_bg.png   walls, floor, windows and doors only (use as the background)
rooms/<place>/<room>.png      the full room with every item placed
rooms/<place>/<room>.json     where to draw each item on screen, in back-to-front order
rooms/town_street.png         the town: every place's front on one street
preview/                      labelled rooms, one sheet per place, the category sheets, Level 1 shots
```

## Placing things yourself
Each room JSON has a `camera` block. To turn a floor tile position (u across, v deep) into a screen position:
```
t = v / D * depthShown          k = 1 + perspective * t
x = 800 + (u - W/2) * pxPerTileBack * k
y = floorBackY + t * (900 - floorBackY)
sprite scale = pxPerTileBack * k / 64
```
Draw everything in `drawOrder` from first to last (back to front). Insert each character by its `z` value (its depth).

## Notes
- **Labubu** is Anisha's name for a baddie. Here it has an original fluffy-monster look, because the real Labubu toy is someone else's character.
- **Stand-ins:** Anisha, Rani, Kamala and Kabla are placeholders until Anisha decides their looks.
- **New from the reference sheet (83 items):** placed in the right rooms where they fit:
  - Furniture: armchair, washing machine, playpen, grandfather clock and more
  - Playground: climbing frame, spring rider, sandbox, hopscotch
  - Garden: arch, gazebo, greenhouse, wheelbarrow
  - Pool: water slide, diving board, swan float, cabana
  - Sand park: play tower, beach hut, rocks
  - Hospital: stretcher, heart monitor, trolley
  - Palace: golden lamp, crown, sceptre
  - Prank items: cake, plum, chocolate, eye drops, onion, key, magic wand, toolbox, balloon, rubber duck, toy rocket and more
  - Vehicles: pink car, school bus, ambulance
  - Building fronts for all 9 places
