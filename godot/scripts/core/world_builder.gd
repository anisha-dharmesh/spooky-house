class_name WorldBuilder
extends RefCounted
## Turns a level (a list of rooms from the art pack) into walls, furniture, hiding spots and so on.
## A port of src/levels/world.ts. Units: 1 pack tile (40 px) = 1 metre, wall thickness 14 px = 0.35 m.

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


## Places the rooms next to each other so their connecting doors line up.
static func _layout(ids: Array, rooms: Dictionary) -> Dictionary:
	var placed := {}
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
				push_error("Room %s has no %s door back to %s" % [n.id, OPPOSITE[d.side], a.room.id])
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
			push_error("Room %s is not joined to %s by a door" % [id, ids[0]])
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


## A little enclosed porch outside an exit door: the zone you walk into, plus walls around it.
static func _alcove(room: Dictionary, door: Dictionary) -> Dictionary:
	var w: float = room.size.w * T
	var h: float = room.size.h * T
	var sp := _span(door)
	var s0 := sp.x
	var s1 := sp.y
	var n := s1 - s0
	match door.side:
		"S":
			return {"zone": Rect2(s0, h + B, n, T), "walls": [
				Rect2(s0 - B, h + B, B, T + B), Rect2(s1, h + B, B, T + B), Rect2(s0 - B, h + B + T, n + 2 * B, B)]}
		"N":
			return {"zone": Rect2(s0, -B - T, n, T), "walls": [
				Rect2(s0 - B, -B - T - B, B, T + B), Rect2(s1, -B - T - B, B, T + B), Rect2(s0 - B, -B - T - B, n + 2 * B, B)]}
		"E":
			return {"zone": Rect2(w + B, s0, T, n), "walls": [
				Rect2(w + B, s0 - B, T + B, B), Rect2(w + B, s1, T + B, B), Rect2(w + B + T, s0 - B, B, n + 2 * B)]}
		_:
			return {"zone": Rect2(-B - T, s0, T, n), "walls": [
				Rect2(-B - T - B, s0 - B, T + B, B), Rect2(-B - T - B, s1, T + B, B), Rect2(-B - T - B, s0 - B, B, n + 2 * B)]}


static func build(level: Dictionary, rooms: Dictionary) -> WorldData:
	var world := WorldData.new()
	var placed := _layout(level.rooms, rooms)
	var exits: Array = level.get("exits", [])
	var edges: Array[Rect2] = []

	var wanted_pickups := {}
	var wanted_targets := {}
	for s in level.steps:
		if s.type == "pickup" or s.type == "use":
			wanted_pickups[s.item] = true
		if s.type == "use":
			wanted_targets[s.target] = true

	for id in level.rooms:
		var p: Dictionary = placed[id]
		var room: Dictionary = p.room
		var ox: float = p.ox
		var oy: float = p.oy
		var w: float = room.size.w * T
		var h: float = room.size.h * T

		# doors are open when they lead to another room in this level, or are listed as exits
		var open: Array = []
		for d in room.doors:
			var is_exit := false
			for e in exits:
				if e.room == id and e.to == d.to:
					is_exit = true
			if level.rooms.has(d.to) or is_exit:
				open.append(d)
		for r in _wall_rects(room, open):
			world.walls.append(_shift(r, ox, oy))
		for d in open:
			var sp := _span(d)
			var gap: Rect2
			match d.side:
				"N": gap = Rect2(sp.x, -B, sp.y - sp.x, B)
				"S": gap = Rect2(sp.x, h, sp.y - sp.x, B)
				"W": gap = Rect2(-B, sp.x, B, sp.y - sp.x)
				_: gap = Rect2(w, sp.x, B, sp.y - sp.x)
			world.doorways.append(_shift(gap, ox, oy))

		# exits: a porch you can walk into
		for e in exits:
			if e.room != id:
				continue
			var door: Variant = null
			for d in room.doors:
				if d.to == e.to:
					door = d
					break
			if door == null:
				continue
			var a := _alcove(room, door)
			for wr in a.walls:
				world.walls.append(_shift(wr, ox, oy))
			var zone := _shift(a.zone, ox, oy)
			world.exits.append({"id": e.id, "rect": zone, "label": e.get("label"), "side": door.side})
			world.doorways.append(zone)
			edges.append(Rect2(zone.position - Vector2(B, B), zone.size + Vector2(2 * B, 2 * B)))

		var interior := Rect2(ox, oy, w, h)
		world.rooms.append({"id": id, "name": room.name, "ground": room.ground, "interior": interior})
		edges.append(Rect2(ox - B, oy - B, w + 2 * B, h + 2 * B))
		if room.safeZone:
			world.safes.append(interior)

		# furniture
		var by_uid := {}
		for it in room.items:
			by_uid[it.uid] = it
		for it in room.items:
			var rect := Rect2(ox + it.x * T, oy + it.y * T, it.w * T, it.h * T)
			var host := ""
			if str(it.anchor).begins_with("on:"):
				var host_sprite: String = str(it.anchor).substr(3)
				var c := rect.get_center()
				for other in room.items:
					if other.sprite == host_sprite and other.uid != it.uid:
						var orect := Rect2(ox + other.x * T, oy + other.y * T, other.w * T, other.h * T)
						if orect.has_point(c):
							host = other.uid
			world.sprites.append({"uid": it.uid, "frame": it.sprite, "name": it.name, "rect": rect,
				"angle": it.rotation, "tags": it.tags, "host": host, "room": id})
			if wanted_pickups.has(it.uid) and it.tags.has("pickup"):
				world.pickups.append({"uid": it.uid, "frame": it.sprite, "name": it.name, "rect": rect})
			if wanted_targets.has(it.uid):
				world.targets.append({"id": it.uid, "rect": rect, "label": it.name, "kind": "item"})
		for c in room.colliders:
			world.solids.append(Rect2(ox + c.x * T, oy + c.y * T, c.w * T, c.h * T))
		for uid in room.hideSpots:
			if by_uid.has(uid):
				var it2: Dictionary = by_uid[uid]
				world.hides.append({"uid": uid, "name": it2.name, "rect": Rect2(ox + it2.x * T, oy + it2.y * T, it2.w * T, it2.h * T)})

	world.spawn = _spot(placed, level.spawn)
	for e in level.get("extras", []):
		var c := _spot(placed, e)
		world.targets.append({"id": e.id, "rect": Rect2(c.x - 0.7, c.y - 0.5, 1.4, 1.0), "label": e.label, "kind": e.kind})
	for b in level.baddies:
		var patrol: Array = []
		for pt in b.patrol:
			patrol.append({"pos": _spot(placed, pt), "wait": float(pt.get("wait", 0.0))})
		world.baddies.append({"id": b.id, "patrol": patrol})

	var bounds := edges[0]
	for e in edges:
		bounds = bounds.merge(e)
	world.bounds = bounds
	return world


static func _spot(placed: Dictionary, s: Dictionary) -> Vector2:
	var p: Dictionary = placed[s.room]
	return Vector2(p.ox + s.tile[0] * T, p.oy + s.tile[1] * T)
