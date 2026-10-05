# Anisha's Spooky House: asset pack

This pack is ready to use. Everything is top-down, black/grey/white, and built on a **40 px tile grid**.

```
manifest.json            all 7 locations → their rooms, unlock levels, item counts
items.json               184 items: id, name, size in tiles, tags, which rooms use it
sprites/svg/<id>.svg     one vector per item (w×h tiles × 40px)
sprites/png/<id>.png     same, 1x      sprites/png@2x/<id>.png  2x
atlas/items_atlas@2x.*   every item in one texture atlas (Phaser "JSON hash" format)
rooms/<location>/<room>.json   layout: doors, items (x,y,w,h in tiles, rotation), colliders,
                               hideSpots, pickups, prankTargets, climbables, stairs/lift, spawn
rooms/<location>/<room>.svg|png   ready-made picture of the whole room (no labels)
rooms/<location>/<room>_floor.png floor + walls + doors only (put item sprites on top)
locations/town.json|svg|png       town map (20 px tiles): buildings, roads, decor
preview/*_labelled.png            the same rooms with every item named (for planning with Anisha)
```

## Item tags
`solid` (blocks you) · `hide` (hiding spot) · `pickup` (goes in your bag) · `prank` (can be pranked) ·
`climb` · `safe` (safe zone) · `stairs` / `lift` · `pet` · `decor` (just for looks).

## Using it with Phaser 3
```js
preload() {
  this.load.atlas('items', 'atlas/items_atlas@2x.png', 'atlas/items_atlas@2x.json');
  this.load.json('room', 'rooms/granny_house/gh_kitchen.json');
  this.load.image('room-floor', 'rooms/granny_house/gh_kitchen_floor.png');
}
create() {
  const room = this.cache.json.get('room'), T = room.tileSize;
  const B = 14;                                       // room PNGs have a 14px wall border
  this.add.image(-B, -B, 'room-floor').setOrigin(0);
  const walls = this.physics.add.staticGroup();
  for (const it of room.items) {
    const img = this.add.image((it.x + it.w / 2) * T, (it.y + it.h / 2) * T, 'items', it.sprite)
      .setScale(0.5).setAngle(it.rotation);           // atlas is @2x
    img.setData(it);                                  // tags, uid, onTopOf…
  }
  for (const c of room.colliders)
    walls.add(this.add.zone((c.x + c.w / 2) * T, (c.y + c.h / 2) * T, c.w * T, c.h * T));
}
```
If you'd rather keep it simple, draw `rooms/<loc>/<room>.png` as the background. Then use the JSON only for colliders, hiding spots, pickups and doors.

## Places and rooms (41)
- **My little house:** hall, bathroom, animal room, fluffy room
- **Granny's house (16):**
  - Ground: kitchen, hall, store room
  - Floor 1: bedroom, dining room, bathroom, granny's room
  - Floor 2: craft room / office, puja room, exercise room
  - Floor 3: dance room, study, yoga room, climbing room
  - Roof: play zone, roof
- **Park:** playground, garden, sand park
- **Swimming pool:** pool deck, changing room
- **School:** classroom, corridor, staff room, library, science lab, canteen
- **Hospital:** reception, doctor's room, ward, pharmacy, X-ray room
- **Palace:** throne room, queen's room, king's room, treasury, royal dining hall

School and hospital are new places. Their unlock levels (25 and 40) are only suggestions until Anisha agrees.
