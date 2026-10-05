class_name LevelCheck
extends RefCounted
## Checks a level for mistakes and can plan walking routes. A port of src/levels/validate.ts.

const CELL := 0.2

var world: WorldData
var origin := Vector2.ZERO
var cols := 0
var rows := 0
var blocked := PackedByteArray()


func _init(p_world: WorldData) -> void:
	world = p_world
	var b := world.bounds
	origin = b.position
	cols = int(ceil(b.size.x / CELL))
	rows = int(ceil(b.size.y / CELL))
	blocked.resize(cols * rows)
	var blockers := world.blockers()
	var r := GameLogic.PLAYER_RADIUS
	for cy in rows:
		for cx in cols:
			var p := cell_center(cx, cy)
			var bad := p.x < b.position.x + r or p.y < b.position.y + r or p.x > b.end.x - r or p.y > b.end.y - r
			if not bad:
				for rc in blockers:
					if Geo.dist_to_rect(p, rc) < r - 0.02:
						bad = true
						break
			blocked[cy * cols + cx] = 1 if bad else 0


func cell_center(cx: int, cy: int) -> Vector2:
	return origin + Vector2((cx + 0.5) * CELL, (cy + 0.5) * CELL)


func cell_of(p: Vector2) -> Vector2i:
	return Vector2i(int(floor((p.x - origin.x) / CELL)), int(floor((p.y - origin.y) / CELL)))


func is_free(c: Vector2i) -> bool:
	return c.x >= 0 and c.y >= 0 and c.x < cols and c.y < rows and blocked[c.y * cols + c.x] == 0


## Breadth-first flood fill from a point. Returns a PackedInt32Array of distances (-1 = unreachable).
func flood(from: Vector2) -> PackedInt32Array:
	var dist := PackedInt32Array()
	dist.resize(cols * rows)
	dist.fill(-1)
	var start := cell_of(from)
	if not is_free(start):
		return dist
	var queue: Array[Vector2i] = [start]
	dist[start.y * cols + start.x] = 0
	var head := 0
	while head < queue.size():
		var c := queue[head]
		head += 1
		for d in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
			var n: Vector2i = c + d
			if is_free(n) and dist[n.y * cols + n.x] < 0:
				dist[n.y * cols + n.x] = dist[c.y * cols + c.x] + 1
				queue.append(n)
	return dist


func reachable_from(dist: PackedInt32Array, p: Vector2) -> bool:
	var c := cell_of(p)
	return c.x >= 0 and c.y >= 0 and c.x < cols and c.y < rows and dist[c.y * cols + c.x] >= 0


## True if the player can stand within `within` metres of the rect.
func can_reach_rect(dist: PackedInt32Array, r: Rect2, within: float) -> bool:
	var pad := within + CELL
	var y := r.position.y - pad
	while y <= r.end.y + pad:
		var x := r.position.x - pad
		while x <= r.end.x + pad:
			var p := Vector2(x, y)
			if Geo.dist_to_rect(p, r) <= within and reachable_from(dist, p):
				return true
			x += CELL
		y += CELL
	return false


## A walking route (list of points) from `from` to anywhere within `within` of the rect, or [] if none.
func path_to_rect(from: Vector2, r: Rect2, within: float) -> Array[Vector2]:
	var start := cell_of(from)
	var empty: Array[Vector2] = []
	if not is_free(start):
		# standing right against a wall: begin from the closest free cell instead
		var found := false
		for ring in range(1, 5):
			for dy in range(-ring, ring + 1):
				for dx in range(-ring, ring + 1):
					var c := start + Vector2i(dx, dy)
					if not found and is_free(c):
						start = c
						found = true
		if not found:
			return empty
	var prev := PackedInt32Array()
	prev.resize(cols * rows)
	prev.fill(-2)
	var queue: Array[Vector2i] = [start]
	prev[start.y * cols + start.x] = -1
	var head := 0
	var goal := Vector2i(-1, -1)
	while head < queue.size():
		var c := queue[head]
		head += 1
		if Geo.dist_to_rect(cell_center(c.x, c.y), r) <= within:
			goal = c
			break
		for d in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
			var n: Vector2i = c + d
			if is_free(n) and prev[n.y * cols + n.x] == -2:
				prev[n.y * cols + n.x] = c.y * cols + c.x
				queue.append(n)
	if goal.x < 0:
		return empty
	var out: Array[Vector2] = []
	var i := goal.y * cols + goal.x
	while i >= 0:
		out.push_front(cell_center(i % cols, i / cols))
		i = prev[i]
	return out


## Returns a list of problems (empty = fine).
static func validate(level: Dictionary, rooms: Dictionary, kinds: Dictionary) -> Array[String]:
	var errors: Array[String] = []
	var tag := "Level %d: " % int(level.id)
	for id in level.rooms:
		if rooms.get(id, {}).is_empty():
			errors.append(tag + 'unknown room "%s"' % id)
	if errors.size() > 0:
		return errors
	var world := WorldBuilder.build(level, rooms)
	var chk := LevelCheck.new(world)
	var dist := chk.flood(world.spawn)
	if not chk.reachable_from(dist, world.spawn):
		errors.append(tag + "the spawn point is inside a wall or furniture")
		return errors
	var all_items: Array = []
	for id in level.rooms:
		all_items.append_array(rooms[id].items)
	var reach := GameLogic.REACH - 0.07
	if level.steps.size() == 0:
		errors.append(tag + "has no steps")
	var n := 0
	for s in level.steps:
		n += 1
		var at := tag + "step %d: " % n
		if s.type == "pickup" or s.type == "use":
			var found: Variant = null
			for it in all_items:
				if it.uid == s.item:
					found = it
			if found == null:
				errors.append(at + 'no item "%s" in the rooms of this level' % s.item)
			elif not found.tags.has("pickup"):
				errors.append(at + '"%s" can\'t be picked up (no "pickup" tag)' % s.item)
			else:
				for p in world.pickups:
					if p.uid == s.item and not chk.can_reach_rect(dist, p.rect, reach):
						errors.append(at + 'the player can\'t get to "%s"' % s.item)
		if s.type == "use":
			var tg: Variant = null
			for t in world.targets:
				if t.id == s.target:
					tg = t
			if tg == null:
				errors.append(at + 'no target "%s" (a room item uid, or an id from "extras")' % s.target)
			elif not chk.can_reach_rect(dist, tg.rect, reach):
				errors.append(at + 'the player can\'t get to "%s"' % s.target)
		if s.type == "reach":
			var ex: Variant = null
			for e in world.exits:
				if e.id == s.zone:
					ex = e
			if ex == null:
				errors.append(at + 'no exit "%s" (add it to "exits")' % s.zone)
			elif not chk.can_reach_rect(dist, ex.rect, 0.0):
				errors.append(at + 'the player can\'t get to exit "%s"' % s.zone)
	for h in world.hides:
		if not chk.can_reach_rect(dist, h.rect, reach):
			errors.append(tag + 'hiding spot "%s" (%s) can\'t be reached' % [h.name, h.uid])
	for b in level.baddies:
		if not kinds.has(b.kind):
			errors.append(tag + 'baddie "%s": unknown kind "%s"' % [b.id, b.kind])
		if b.patrol.size() < 2:
			errors.append(tag + 'baddie "%s": needs at least 2 patrol points' % b.id)
	var blockers := world.blockers()
	for mb in world.baddies:
		for p in mb.patrol:
			for r in blockers:
				if Geo.point_in_rect(p.pos, r):
					errors.append(tag + 'baddie "%s": a patrol point is inside a wall or furniture' % mb.id)
					break
	return errors
