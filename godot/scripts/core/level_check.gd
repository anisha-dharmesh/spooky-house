class_name LevelCheck
extends RefCounted
## Checks the world and its tasks for mistakes and can plan walking routes.

const CELL := 0.2

var world: WorldData
var origin := Vector2.ZERO
var cols := 0
var rows := 0
var blocked := PackedByteArray()


## `locked`: the rooms that are shut at this point of the game (their doors count as walls).
func _init(p_world: WorldData, locked: Dictionary = {}) -> void:
	world = p_world
	var b := world.bounds
	origin = b.position
	cols = int(ceil(b.size.x / CELL))
	rows = int(ceil(b.size.y / CELL))
	blocked.resize(cols * rows)
	var r := GameLogic.PLAYER_RADIUS
	for cy in rows:
		for cx in cols:
			var p := cell_center(cx, cy)
			if p.x < b.position.x + r or p.y < b.position.y + r or p.x > b.end.x - r or p.y > b.end.y - r:
				blocked[cy * cols + cx] = 1
	# mark the cells near each blocker (instead of testing every cell against every blocker: the world is big)
	for rc in world.blockers(locked):
		var x0 := maxi(0, int(floor((rc.position.x - r - origin.x) / CELL)))
		var x1 := mini(cols - 1, int(ceil((rc.end.x + r - origin.x) / CELL)))
		var y0 := maxi(0, int(floor((rc.position.y - r - origin.y) / CELL)))
		var y1 := mini(rows - 1, int(ceil((rc.end.y + r - origin.y) / CELL)))
		for cy in range(y0, y1 + 1):
			for cx in range(x0, x1 + 1):
				var i := cy * cols + cx
				if blocked[i] == 0 and Geo.dist_to_rect(cell_center(cx, cy), rc) < r - 0.02:
					blocked[i] = 1


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


## True when the straight line between two points stays on free cells.
func line_free(a: Vector2, b: Vector2) -> bool:
	var n := int(ceil(a.distance_to(b) / (CELL * 0.5)))
	for i in n + 1:
		if not is_free(cell_of(a.lerp(b, float(i) / maxf(n, 1)))):
			return false
	return true


## Cuts the corners off a grid route: keeps only the points where the way really bends.
func smooth(path: Array[Vector2]) -> Array[Vector2]:
	if path.size() < 3:
		return path
	var out: Array[Vector2] = []
	var i := 0
	while i < path.size() - 1:
		var j := path.size() - 1
		while j > i + 1 and not line_free(path[i], path[j]):
			j -= 1
		out.append(path[j])
		i = j
	return out


## Returns a list of problems (empty = fine).
static func validate(world_def: Dictionary, tasks: Array, rooms: Dictionary, kinds: Dictionary) -> Array[String]:
	var errors: Array[String] = []
	var ids: Array = world_def.get("rooms", [])
	var layout_errors: Array = []
	var placed := WorldBuilder.layout(ids, rooms, layout_errors)
	for e in layout_errors:
		errors.append("World: " + String(e))
	if errors.size() > 0:
		return errors
	for i in ids.size():
		for j in range(i + 1, ids.size()):
			if _footprint(placed[ids[i]]).intersects(_footprint(placed[ids[j]])):
				errors.append('World: rooms "%s" and "%s" overlap' % [ids[i], ids[j]])
	if not world_def.has("respawn") or not ids.has(world_def.respawn.room):
		errors.append('World: "respawn" must name a room of the world')
	if errors.size() > 0:
		return errors
	var world := WorldBuilder.build(world_def, tasks, rooms)
	var everything := world.blockers()

	# which task opens which room
	var opens_at := {}
	var task_ids := {}
	var item_owner := {}
	var extra_ids := {}
	for i in tasks.size():
		var t: Dictionary = tasks[i]
		var tag := "Task %d: " % int(t.id)
		if task_ids.has(int(t.id)):
			errors.append(tag + "the id is used twice")
		task_ids[int(t.id)] = true
		for r in t.get("unlocks", []):
			if not ids.has(r):
				errors.append(tag + 'unlocks "%s", which is not a room of the world' % r)
			opens_at[r] = i
		for e in t.get("extras", []):
			if extra_ids.has(e.id):
				errors.append(tag + 'extra "%s" is also in another task' % e.id)
			extra_ids[e.id] = true
		for s in t.steps:
			if s.type == "pickup" or s.type == "use":
				if item_owner.has(s.item) and item_owner[s.item] != i:
					errors.append(tag + 'item "%s" is also used by task %d' % [s.item, int(tasks[item_owner[s.item]].id)])
				item_owner[s.item] = i

	var checks := {}   # which rooms are shut -> its LevelCheck (several tasks share one)
	var reach := GameLogic.REACH - 0.07
	for i in tasks.size():
		var t: Dictionary = tasks[i]
		var tag := "Task %d: " % int(t.id)
		var locked := _locked_at(opens_at, i)
		var chk := _check_for(world, locked, checks)
		var dist := chk.flood(world.respawn)
		if not chk.reachable_from(dist, world.respawn):
			errors.append(tag + "the respawn point is inside a wall or furniture")
			return errors
		if t.steps.size() == 0:
			errors.append(tag + "has no steps")
		var n := 0
		for s in t.steps:
			n += 1
			var at := tag + "step %d: " % n
			match s.type:
				"pickup", "use":
					var sprite: Variant = null
					for sp in world.sprites:
						if sp.uid == s.item:
							sprite = sp
					if sprite == null:
						errors.append(at + 'no item "%s" (write it as room id/uid, like gh_kitchen/cement_bag_1)' % s.item)
					elif not sprite.tags.has("pickup"):
						errors.append(at + '"%s" can\'t be picked up (no "pickup" tag)' % s.item)
					else:
						for p in world.pickups:
							if p.uid == s.item and not chk.can_reach_rect(dist, p.rect, reach):
								errors.append(at + 'the player can\'t get to "%s" at this point (a locked room?)' % s.item)
					if s.type == "use":
						var tg: Variant = null
						for tt in world.targets:
							if tt.id == s.target:
								tg = tt
						if tg == null:
							errors.append(at + 'no target "%s" (room id/uid of an item, or an id from "extras")' % s.target)
						elif not chk.can_reach_rect(dist, tg.rect, reach):
							errors.append(at + 'the player can\'t get to "%s" at this point (a locked room?)' % s.target)
				"do", "watch":
					var tg2: Variant = null
					for tt2 in world.targets:
						if tt2.id == s.target:
							tg2 = tt2
					if tg2 == null:
						errors.append(at + 'no target "%s" (room id/uid of an item)' % s.target)
					elif s.type == "do" and not chk.can_reach_rect(dist, tg2.rect, reach):
						errors.append(at + 'the player can\'t get to "%s" at this point (a locked room?)' % s.target)
					if s.type == "watch" and t.get("baddies", []).is_empty():
						errors.append(at + '"watch" needs a baddie in the task')
				"reach":
					var rm := world.room_by_id(String(s.get("room", "")))
					if rm.is_empty():
						errors.append(at + 'no room "%s" to reach' % s.get("room", ""))
					elif not chk.can_reach_rect(dist, (rm.interior as Rect2).grow(-0.5), 0.0):
						errors.append(at + 'the player can\'t get into "%s" at this point' % s.room)
				_:
					errors.append(at + 'unknown step type "%s"' % s.type)
		# the rooms this task opens must be reachable once it is done
		var after := _check_for(world, _locked_at(opens_at, i + 1), checks)
		var dist_after := after.flood(world.respawn)
		for r in t.get("unlocks", []):
			var rm2 := world.room_by_id(r)
			if not rm2.is_empty() and not after.can_reach_rect(dist_after, (rm2.interior as Rect2).grow(-0.5), 0.0):
				errors.append(tag + 'the room "%s" it unlocks can\'t be reached' % r)
		for b in t.get("baddies", []):
			if not kinds.has(b.kind):
				errors.append(tag + 'baddie "%s": unknown kind "%s"' % [b.id, b.kind])
			if b.patrol.size() < 2:
				errors.append(tag + 'baddie "%s": needs at least 2 patrol points' % b.id)
				continue
			var pts: Array[Vector2] = []
			var ok := true
			for pt in b.patrol:
				if not world.origins.has(pt.room):
					errors.append(tag + 'baddie "%s": no room "%s"' % [b.id, pt.room])
					ok = false
					continue
				pts.append(world.spot(pt))
			if not ok:
				continue
			for k in pts.size():
				for rc in everything:
					if Geo.point_in_rect(pts[k], rc):
						errors.append(tag + 'baddie "%s": patrol point %d is inside a wall or furniture' % [b.id, k + 1])
						break
				var nxt := pts[(k + 1) % pts.size()]
				if not Geo.has_line_of_sight(pts[k], nxt, everything):
					errors.append(tag + 'baddie "%s": the walk from point %d to the next one crosses a wall or furniture' % [b.id, k + 1])

	# with everything open, every hiding spot must be reachable
	var open_chk := _check_for(world, {}, checks)
	var open_dist := open_chk.flood(world.respawn)
	for h in world.hides:
		if not open_chk.can_reach_rect(open_dist, h.rect, reach):
			errors.append('World: hiding spot "%s" (%s) can\'t be reached' % [h.name, h.uid])
	return errors


## The rooms still shut when task number `i` (0-based) starts.
static func _locked_at(opens_at: Dictionary, i: int) -> Dictionary:
	var locked := {}
	for r in opens_at:
		if opens_at[r] >= i:
			locked[r] = true
	return locked


static func _check_for(world: WorldData, locked: Dictionary, cache: Dictionary) -> LevelCheck:
	var keys := locked.keys()
	keys.sort()
	var key := ",".join(keys)
	if not cache.has(key):
		cache[key] = LevelCheck.new(world, locked)
	return cache[key]


## A room with its walls, as a slightly shrunk rect (so rooms that share a doorway wall don't count as overlapping).
static func _footprint(p: Dictionary) -> Rect2:
	var w: float = p.room.size.w * WorldBuilder.T
	var h: float = p.room.size.h * WorldBuilder.T
	return Rect2(p.ox - WorldBuilder.B, p.oy - WorldBuilder.B, w + 2 * WorldBuilder.B, h + 2 * WorldBuilder.B).grow(-0.01)
