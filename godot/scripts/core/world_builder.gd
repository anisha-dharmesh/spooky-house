class_name WorldBuilder
extends RefCounted
## Turns the world (the rooms listed in data/world.json, from the art pack) into walls, furniture, hiding spots and so on.
## Units: 1 pack tile (40 px) = 1 metre, wall thickness 14 px = 0.35 m.

const T := 1.0
const B := 0.35
const OPPOSITE := {"N": "S", "S": "N", "E": "W", "W": "E"}


## Door span along its wall, relative to the room's interior.
static func _span(d: Dictionary) -> Vector2:
	if d.side == "N" or d.side == "S":
		return Vector2(d.x * T, (d.x + d.w) * T)
	return Vector2(d.y * T, (d.y + d.h) * T)


static func _shift(r: Rect2, ox: float, oy: float) -> Rect2:
	return Rect2(r.position.x + ox, r.position.y + oy, r.size.x, r.size.y)


## Places the rooms next to each other so their connecting doors line up. The first room sits at (0, 0).
## Problems (a missing room, a door with no matching door on the other side) are added to `errors`.
static func layout(ids: Array, rooms: Dictionary, errors: Array) -> Dictionary:
	var placed := {}
	for id in ids:
		if not rooms.has(id):
			errors.append('unknown room "%s"' % id)
	if errors.size() > 0:
		return placed
	var first: Dictionary = rooms[ids[0]]
	placed[first.id] = {"room": first, "ox": 0.0, "oy": 0.0}
	var queue: Array = [first.id]
	while queue.size() > 0:
		var a: Dictionary = placed[queue.pop_front()]
		for d in a.room.doors:
			if not ids.has(d.to) or placed.has(d.to):
				continue
			var n: Dictionary = rooms[d.to]
			var back: Variant = null
			for nd in n.doors:
				if nd.to == a.room.id and nd.side == OPPOSITE[d.side]:
					back = nd
					break
			if back == null:
				errors.append("Room %s has no %s door back to %s" % [n.id, OPPOSITE[d.side], a.room.id])
				continue
			var aw: float = a.room.size.w * T
			var ah: float = a.room.size.h * T
			var ox := 0.0
			var oy := 0.0
			if d.side == "E" or d.side == "W":
				ox = a.ox + aw + 2 * B if d.side == "E" else a.ox - 2 * B - n.size.w * T
				oy = a.oy + (d.y - back.y) * T
			else:
				oy = a.oy + ah + 2 * B if d.side == "S" else a.oy - 2 * B - n.size.h * T
				ox = a.ox + (d.x - back.x) * T
			placed[n.id] = {"room": n, "ox": ox, "oy": oy}
			queue.append(n.id)
	for id in ids:
		if not placed.has(id):
			errors.append("Room %s is not joined to %s by a door" % [id, ids[0]])
	return placed


## The four walls of a room, relative to its interior, with gaps for the open doors.
static func _wall_rects(room: Dictionary, open: Array) -> Array[Rect2]:
	var w: float = room.size.w * T
	var h: float = room.size.h * T
	var out: Array[Rect2] = []
	for side in ["N", "S", "W", "E"]:
		var gaps: Array[Vector2] = []
		for d in open:
			if d.side == side:
				gaps.append(_span(d))
		gaps.sort_custom(func(p: Vector2, q: Vector2) -> bool: return p.x < q.x)
		var from_v := -B if (side == "N" or side == "S") else 0.0
		var to_v := w + B if (side == "N" or side == "S") else h
		var cur := from_v
		var pieces: Array[Vector2] = []
		for g in gaps:
			if g.x > cur:
				pieces.append(Vector2(cur, g.x))
			cur = maxf(cur, g.y)
		if cur < to_v:
			pieces.append(Vector2(cur, to_v))
		for p in pieces:
			match side:
				"N": out.append(Rect2(p.x, -B, p.y - p.x, B))
				"S": out.append(Rect2(p.x, h, p.y - p.x, B))
				"W": out.append(Rect2(-B, p.x, B, p.y - p.x))
				"E": out.append(Rect2(w, p.x, B, p.y - p.x))
	return out


## Builds the whole world once. `tasks` tell which items can be picked up or used.
static func build(world_def: Dictionary, tasks: Array, rooms: Dictionary) -> WorldData:
	var world := WorldData.new()
	var ids: Array = world_def.rooms
	var errors: Array = []
	var placed := layout(ids, rooms, errors)
	for e in errors:
		push_error(String(e))
	var edges: Array[Rect2] = []

	var wanted_pickups := {}
	var wanted_targets := {}
	for t in tasks:
		for s in t.steps:
			if s.type == "pickup" or s.type == "use":
				wanted_pickups[s.item] = true
			if s.type == "use":
				wanted_targets[s.target] = true

	for id in ids:
		if not placed.has(id):
			continue
		var p: Dictionary = placed[id]
		var room: Dictionary = p.room
		var ox: float = p.ox
		var oy: float = p.oy
		var w: float = room.size.w * T
		var h: float = room.size.h * T
		world.origins[id] = Vector2(ox, oy)

		# doors are open when they lead to another room of the world (the game closes them again while that room is locked)
		var open: Array = []
		for d in room.doors:
			if ids.has(d.to):
				open.append(d)
		for r in _wall_rects(room, open):
			world.walls.append(_shift(r, ox, oy))
			world.wall_rooms.append(id)
		for d in open:
			var sp := _span(d)
			var gap: Rect2
			match d.side:
				"N": gap = Rect2(sp.x, -B, sp.y - sp.x, B)
				"S": gap = Rect2(sp.x, h, sp.y - sp.x, B)
				"W": gap = Rect2(-B, sp.x, B, sp.y - sp.x)
				_: gap = Rect2(w, sp.x, B, sp.y - sp.x)
			var shifted := _shift(gap, ox, oy)
			world.doorways.append(shifted)
			world.doors.append({"room": id, "to": d.to, "rect": shifted})

		var interior := Rect2(ox, oy, w, h)
		world.rooms.append({"id": id, "name": room.name, "ground": room.ground, "location": room.get("location", ""),
			"outdoor": room.get("outdoor", false), "interior": interior})
		edges.append(Rect2(ox - B, oy - B, w + 2 * B, h + 2 * B))
		if room.safeZone:
			world.safes.append(interior)

		# furniture
		var by_uid := {}
		for it in room.items:
			by_uid[it.uid] = it
		for it in room.items:
			var gid := WorldData.gid(id, it.uid)
			var rect := Rect2(ox + it.x * T, oy + it.y * T, it.w * T, it.h * T)
			var host := ""
			if str(it.anchor).begins_with("on:"):
				var host_sprite: String = str(it.anchor).substr(3)
				var c := rect.get_center()
				for other in room.items:
					if other.sprite == host_sprite and other.uid != it.uid:
						var orect := Rect2(ox + other.x * T, oy + other.y * T, other.w * T, other.h * T)
						if orect.has_point(c):
							host = WorldData.gid(id, other.uid)
			world.sprites.append({"uid": gid, "frame": it.sprite, "name": it.name, "rect": rect,
				"angle": it.rotation, "tags": it.tags, "host": host, "room": id})
			if wanted_pickups.has(gid) and it.tags.has("pickup"):
				world.pickups.append({"uid": gid, "frame": it.sprite, "name": it.name, "rect": rect})
			if wanted_targets.has(gid):
				world.targets.append({"id": gid, "rect": rect, "label": it.name, "kind": "item"})
		for c in room.colliders:
			world.solids.append(Rect2(ox + c.x * T, oy + c.y * T, c.w * T, c.h * T))
		# stairs and lifts are big solid models (they don't take you anywhere yet), so they block the way too
		for it in room.items:
			if it.tags.has("stairs") or it.tags.has("lift"):
				world.solids.append(Rect2(ox + it.x * T, oy + it.y * T, it.w * T, it.h * T))
		for uid in room.hideSpots:
			if by_uid.has(uid):
				var it2: Dictionary = by_uid[uid]
				world.hides.append({"uid": WorldData.gid(id, uid), "name": it2.name,
					"rect": Rect2(ox + it2.x * T, oy + it2.y * T, it2.w * T, it2.h * T)})

	if world_def.has("respawn") and world.origins.has(world_def.respawn.room):
		world.respawn = world.spot(world_def.respawn)
	for t in tasks:
		for e in t.get("extras", []):
			if not world.origins.has(e.room):
				continue
			var c := world.spot(e)
			world.targets.append({"id": e.id, "rect": Rect2(c.x - 0.7, c.y - 0.5, 1.4, 1.0), "label": e.label, "kind": e.kind})

	if edges.is_empty():
		return world
	var bounds := edges[0]
	for e in edges:
		bounds = bounds.merge(e)
	world.bounds = bounds
	return world
