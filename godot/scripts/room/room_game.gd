class_name RoomGame
extends RefCounted
## The rules of one room (no drawing): Anisha walks about on the floor, grabs things, hides, and a baddie watches.
## The room is seen all at once from the front. Positions are in tiles: x along the back wall, y from the back wall
## towards the viewer. The art pack's room files (data/rooms/*.json) give the size, the furniture and the doors; what she
## carries and how far the task is live in a RunState that goes with her from room to room.

signal toast(text: String)
signal inventory_changed
signal steps_changed
signal door_touched(to: String)   # a room's id, or "@lift" for the lift door
signal caught(by_name: String)

const LIFT := "@lift"
const RADIUS := 0.32
const WALK_SPEED := 3.4
const SNEAK_SPEED := 1.6
const MAX_ITEMS := 3
const REACH := 1.3
const CELL := 0.25

var room_id := ""
var room: Dictionary = {}
var state: RunState
var task: Dictionary = {}
var size := Vector2.ZERO
var camera: RoomCamera
var solids: Array[Rect2] = []
var items: Array = []     # {uid, id, sprite, name, tags, rect, pos, host, taken, draw}
var doors: Array = []     # {to, side, rect (where touching it counts), mid, lift}
var lift_wall: Dictionary = {}   # {side, v, label} when this room has the lift door
var pos := Vector2.ZERO
var face := Vector2.DOWN
var walking := false
var sneaking := false
var hidden := false
var move_dir := Vector2.ZERO    # from the keys, set by the view every frame
var meter := 0.0                # 0..1: how much a baddie has noticed her
var seen_now := false
var baddie: Dictionary = {}
var result := ""

var inventory: Array:
	get:
		return state.inventory
var step_index: int:
	get:
		return state.step_index
	set(v):
		state.step_index = v

var _grid: AStarGrid2D
var _path: PackedVector2Array = PackedVector2Array()
var _goal_item := ""
var _stuck := 0.0
var _door_cooldown := 0.0


## `from`: the room she came from ("" for the start, LIFT when she came out of the lift): she appears at that door.
func _init(p_room_id: String, p_state: RunState, from: String = "") -> void:
	room_id = p_room_id
	state = p_state
	room = GameData.room(p_room_id)
	task = GameData.get_task(state.task_id)
	size = Vector2(float(room.size.w), float(room.size.h))
	state.visited[room_id] = true
	for c in room.get("colliders", []):
		solids.append(Rect2(float(c.x), float(c.y), float(c.w), float(c.h)))
	for it in room.items:
		if it.tags.has("stairs") or it.tags.has("lift"):
			continue   # floors are joined by the lift door, which is not furniture
		var r := Rect2(float(it.x), float(it.y), float(it.w), float(it.h))
		items.append({"uid": it.uid, "id": "%s/%s" % [room_id, it.uid], "sprite": it.sprite, "name": it.name,
			"tags": it.tags, "rect": r, "pos": r.get_center(), "host": "", "anchor": str(it.anchor), "taken": false})
	for e in items:
		if e.anchor.begins_with("on:"):
			for o in items:
				if o.sprite == e.anchor.substr(3) and o.uid != e.uid and (o.rect as Rect2).has_point(e.pos):
					e.host = o.uid
	camera = RoomCamera.new(size, PackArt.room(room_id).get("camera", {}))
	_merge_pack(PackArt.room(room_id))
	for e in items:
		e.taken = state.taken.has(e.id)
	for d in room.doors:
		doors.append(_make_door(d))
	_add_lift()
	pos = _spawn_for(from)
	_build_grid()
	_add_baddie()
	_check_steps()


## The art pack says where each thing is drawn. Things it has that the room file lacks (plums, cakes...) join the room.
func _merge_pack(pack: Dictionary) -> void:
	for d in pack.get("drawOrder", []):
		if d.sprite == "stairs" or d.sprite == "lift":
			continue
		var e := item_by_uid(str(d.uid))
		if e.is_empty():
			e = _item_from_pack(d)
			if e.is_empty():
				continue
			items.append(e)
		e["draw"] = d


func _item_from_pack(d: Dictionary) -> Dictionary:
	var info := PackArt.item_info(str(d.sprite))
	var p := Vector2.ZERO
	var host := ""
	var tags: Array = (info.get("tags", ["decor"]) as Array).duplicate()
	if str(d.kind) == "on-top":
		var h := item_by_uid(str(d.on))
		if h.is_empty():
			return {}
		p = Vector2(camera.unmap(Vector2(float(d.x), camera.map(h.pos).y)).x, h.pos.y)
		host = str(d.on)
	elif d.has("quad"):   # a rug or mat lying on the floor, drawn as a slanted quad
		var q: Array = d.quad
		p = camera.unmap(Vector2((float(q[0][0]) + float(q[2][0])) / 2.0, (float(q[0][1]) + float(q[2][1])) / 2.0))
		tags = ["decor"]
	elif d.has("matrix"):   # on a side wall: drawn with a slanted transform, only for looks
		p = camera.unmap(Vector2(float(d.matrix[4]), float(d.matrix[5]) + 100.0))
		tags = ["decor"]
	else:
		p = camera.unmap(Vector2(float(d.x), float(d.y)))
		if str(d.kind) != "floor":
			tags = ["decor"]
	return {"uid": str(d.uid), "id": "%s/%s" % [room_id, d.uid], "sprite": str(d.sprite), "name": info.get("name", d.sprite),
		"tags": tags, "rect": Rect2(p - Vector2(0.5, 0.5), Vector2.ONE), "pos": p, "host": host, "anchor": "", "taken": false}


func _make_door(d: Dictionary) -> Dictionary:
	var rect := Rect2()
	var mid := Vector2.ZERO
	match str(d.side):
		"E":
			rect = Rect2(size.x - 0.8, float(d.y), 0.8, float(d.h))
			mid = Vector2(size.x, float(d.y) + float(d.h) / 2.0)
		"W":
			rect = Rect2(0, float(d.y), 0.8, float(d.h))
			mid = Vector2(0, float(d.y) + float(d.h) / 2.0)
		"N":
			rect = Rect2(float(d.x), 0, float(d.w), 0.8)
			mid = Vector2(float(d.x) + float(d.w) / 2.0, 0)
		_:
			rect = Rect2(float(d.x), size.y - 0.8, float(d.w), 0.8)
			mid = Vector2(float(d.x) + float(d.w) / 2.0, size.y)
	return {"to": str(d.to), "side": str(d.side), "rect": rect, "mid": mid, "lift": false}


## The lift door of this room, if the house's lift stops here: on a side wall, 2 tiles wide.
func _add_lift() -> void:
	var stop := HouseData.lift_stop(room_id)
	if stop.is_empty():
		return
	var v := float(stop.v)
	var west: bool = stop.side == "W"
	var rect := Rect2(0, v, 0.8, 2.0) if west else Rect2(size.x - 0.8, v, 0.8, 2.0)
	lift_wall = {"side": str(stop.side), "v": v, "label": str(stop.label)}
	doors.append({"to": LIFT, "side": str(stop.side), "rect": rect, "mid": Vector2(0.0 if west else size.x, v + 1.0), "lift": true})


## Where she appears: in front of the door she came through, or at the room's usual spot.
func _spawn_for(from: String) -> Vector2:
	for d in doors:
		if from != "" and d.to == from:
			var m: Vector2 = d.mid
			if d.side == "W":
				return Vector2(1.8, m.y)
			if d.side == "E":
				return Vector2(size.x - 1.8, m.y)
			if d.side == "N":
				return Vector2(m.x, 1.8)
			return Vector2(m.x, size.y - 1.8)
	return Vector2(float(room.spawn.x), float(room.spawn.y))


## A baddie of the task that walks a loop in this room (its patrol points are all here).
func _add_baddie() -> void:
	for b in task.get("baddies", []):
		var pts: Array = []
		var all_here := true
		for w in b.get("patrol", []):
			if w.room != room_id:
				all_here = false
			pts.append(Vector2(float(w.tile[0]), float(w.tile[1])))
		if not all_here or pts.size() < 2:
			continue
		var kind: Dictionary = GameData.baddie_kinds.get(b.kind, {})
		baddie = {"kind": b.kind, "char": str(kind.get("model", "scary_teacher")), "name": GameData.L(kind.get("name", "Baddie")),
			"pos": pts[0], "face": Vector2.RIGHT, "i": 1, "wait": 0.0, "speed": 1.25, "range": 5.4,
			"half": deg_to_rad(30.0), "wp": pts}
		return


# ---------------------------------------------------------------- walking

func _build_grid() -> void:
	_grid = AStarGrid2D.new()
	_grid.region = Rect2i(0, 0, int(ceil(size.x / CELL)), int(ceil(size.y / CELL)))
	_grid.cell_size = Vector2(CELL, CELL)
	_grid.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES
	_grid.default_compute_heuristic = AStarGrid2D.HEURISTIC_EUCLIDEAN
	_grid.update()
	for cx in _grid.region.size.x:
		for cy in _grid.region.size.y:
			var p := _cell_pos(Vector2i(cx, cy))
			if not _free(p) or _in_door_zone(p):
				_grid.set_point_solid(Vector2i(cx, cy), true)   # routes go round doors; walking into one is on purpose


func _cell_pos(c: Vector2i) -> Vector2:
	return (Vector2(c) + Vector2(0.5, 0.5)) * CELL


func _pos_cell(p: Vector2) -> Vector2i:
	return Vector2i(clampi(int(p.x / CELL), 0, _grid.region.size.x - 1), clampi(int(p.y / CELL), 0, _grid.region.size.y - 1))


## Is the spot clear for Anisha (inside the room, not in furniture)?
func _free(p: Vector2) -> bool:
	if p.x < 0.35 or p.x > size.x - 0.35 or p.y < 0.35 or p.y > size.y - 0.3:
		return false
	for r in solids:
		if r.grow(RADIUS - 0.04).has_point(p):
			return false
	return true


func _in_door_zone(p: Vector2) -> bool:
	for d in doors:
		if (d.rect as Rect2).has_point(p):
			return true
	return false


func _nearest_free_cell(c: Vector2i) -> Vector2i:
	for ring in 12:
		for dx in range(-ring, ring + 1):
			for dy in range(-ring, ring + 1):
				if maxi(absi(dx), absi(dy)) != ring:
					continue
				var n := Vector2i(c.x + dx, c.y + dy)
				if _grid.is_in_boundsv(n) and not _grid.is_point_solid(n):
					return n
	return c


## Walk to a spot by the shortest way round the furniture. `item_uid`: grab that when she gets there.
func go_to(p: Vector2, item_uid: String = "") -> void:
	if hidden:
		hidden = false
	var from := _nearest_free_cell(_pos_cell(pos))
	var to := _nearest_free_cell(_pos_cell(p))
	_path = PackedVector2Array()
	for c in _grid.get_id_path(from, to):
		_path.append(_cell_pos(c))
	if _path.size() > 0:
		_path.remove_at(0)
	for d in doors:   # a tap on a door walks up to it and then through
		if (d.rect as Rect2).grow(0.1).has_point(p):
			_path.append((d.rect as Rect2).get_center())
	_goal_item = item_uid
	_stuck = 0.0


func stop_walking() -> void:
	_path = PackedVector2Array()
	_goal_item = ""


func update(dt: float) -> void:
	if result != "":
		return
	_door_cooldown = maxf(0.0, _door_cooldown - dt)
	_walk(dt)
	_baddie_tick(dt)
	_see(dt)


func _walk(dt: float) -> void:
	if hidden:
		walking = false
		return
	var dir := move_dir.limit_length(1.0)
	if dir.length() > 0.1:
		stop_walking()
	elif _path.size() > 0:
		var to := _path[0] - pos
		if to.length() < 0.1:
			_path.remove_at(0)
			if _path.is_empty():
				_arrived()
		else:
			dir = to.normalized()
	walking = dir.length() > 0.1
	if not walking:
		return
	face = dir.normalized()
	var step := dir * (SNEAK_SPEED if sneaking else WALK_SPEED) * dt
	var before := pos
	if _free(pos + Vector2(step.x, 0)):
		pos.x += step.x
	if _free(pos + Vector2(0, step.y)):
		pos.y += step.y
	if pos.distance_to(before) < step.length() * 0.2:
		_stuck += dt
		if _stuck > 0.4:
			stop_walking()
	else:
		_stuck = 0.0
	_touch_doors()


func _arrived() -> void:
	var uid := _goal_item
	_goal_item = ""
	if uid != "":
		do_action()


func _touch_doors() -> void:
	if _door_cooldown > 0.0:
		return
	for d in doors:
		if (d.rect as Rect2).has_point(pos):
			_door_cooldown = 1.2
			stop_walking()
			door_touched.emit(d.to)
			return


## After a shut door (or stepping out of the lift), move away so the same door does not fire again at once.
func bounce_from_door(to: String) -> void:
	for d in doors:
		if d.to == to:
			var m: Vector2 = d.mid
			pos = Vector2(1.8, m.y) if d.side == "W" else (Vector2(size.x - 1.8, m.y) if d.side == "E" else (Vector2(m.x, 1.8) if d.side == "N" else Vector2(m.x, size.y - 1.8)))
			return


# ---------------------------------------------------------------- doing things

func item_by_uid(uid: String) -> Dictionary:
	for e in items:
		if e.uid == uid:
			return e
	return {}


func _rect_dist(p: Vector2, r: Rect2) -> float:
	var dx := maxf(maxf(r.position.x - p.x, 0.0), p.x - r.end.x)
	var dy := maxf(maxf(r.position.y - p.y, 0.0), p.y - r.end.y)
	return Vector2(dx, dy).length()


func _nearest_grabbable() -> Dictionary:
	var best := {}
	var best_d := REACH
	for e in items:
		if e.taken or not e.tags.has("pickup"):
			continue
		var d := _rect_dist(pos, e.rect)
		if d <= best_d:
			best_d = d
			best = e
	return best


func _hide_spot() -> Dictionary:
	for e in items:
		if e.sprite == "table_dining" and _rect_dist(pos, e.rect) < 0.9:
			return e
	return {}


## What the action button would do right now: {kind: "grab" | "hide" | "unhide", item: Dictionary} or {}.
func current_action() -> Dictionary:
	if result != "":
		return {}
	if hidden:
		return {"kind": "unhide"}
	var g := _nearest_grabbable()
	if not g.is_empty():
		return {"kind": "grab", "item": g}
	var h := _hide_spot()
	if not h.is_empty():
		return {"kind": "hide", "item": h}
	return {}


func do_action() -> void:
	var a := current_action()
	match a.get("kind", ""):
		"grab":
			_grab(a.item)
		"hide":
			hidden = true
			stop_walking()
			pos = Vector2((a.item.rect as Rect2).get_center().x, (a.item.rect as Rect2).end.y - 0.35)
			toast.emit(GameData.t("hiding"))
		"unhide":
			hidden = false
			_leave_hiding()


func _leave_hiding() -> void:
	for e in items:
		if e.sprite == "table_dining":
			pos = Vector2((e.rect as Rect2).get_center().x, (e.rect as Rect2).end.y + 0.6)
			return


func _grab(e: Dictionary) -> void:
	if inventory.size() >= MAX_ITEMS:
		toast.emit(GameData.t("handsFull"))
		return
	e.taken = true
	state.taken[e.id] = true
	state.sprites[e.id] = e.sprite
	inventory.append(e.id)
	inventory_changed.emit()
	toast.emit(GameData.t("gotIt", {"item": e.name}))
	_check_steps()


func _check_steps() -> void:
	var steps: Array = task.get("steps", [])
	var changed := false
	while step_index < steps.size():
		var s: Dictionary = steps[step_index]
		var ok := false
		match str(s.type):
			"pickup":
				ok = inventory.has(s.item)
			"reach":
				ok = str(s.room) == room_id
		if not ok:
			break
		step_index += 1
		changed = true
	if changed:
		steps_changed.emit()


## Which room the current step wants her in (for the mini map).
func objective_room() -> String:
	var steps: Array = task.get("steps", [])
	if step_index >= steps.size():
		return ""
	var s: Dictionary = steps[step_index]
	match str(s.type):
		"pickup":
			return str(s.item).split("/")[0]
		"reach":
			return str(s.room)
		"use":
			for ex in task.get("extras", []):
				if ex.id == s.target:
					return str(ex.room)
	return ""


## The item to point at in this room (the thing the current step wants), or "".
func objective_item() -> String:
	var steps: Array = task.get("steps", [])
	if step_index < steps.size() and str(steps[step_index].type) == "pickup":
		var id := str(steps[step_index].item)
		if id.begins_with(room_id + "/") and not inventory.has(id):
			return id.split("/")[1]
	return ""


# ---------------------------------------------------------------- the baddie

func _baddie_tick(dt: float) -> void:
	if baddie.is_empty():
		return
	if baddie.wait > 0.0:
		baddie.wait -= dt
		return
	var wp: Array = baddie.wp
	var target: Vector2 = wp[baddie.i]
	var to: Vector2 = target - baddie.pos
	if to.length() < 0.08:
		baddie.i = (int(baddie.i) + 1) % wp.size()
		baddie.wait = 0.9
		return
	baddie.face = to.normalized()
	baddie.pos += (baddie.face as Vector2) * float(baddie.speed) * dt


func _see(dt: float) -> void:
	seen_now = false
	if baddie.is_empty():
		return
	if not hidden:
		var to := pos - (baddie.pos as Vector2)
		var reach := float(baddie.range) * (0.6 if sneaking else 1.0)
		if to.length() <= reach and absf((baddie.face as Vector2).angle_to(to)) <= float(baddie.half):
			seen_now = true
	if seen_now:
		meter = minf(1.0, meter + dt / (2.4 if sneaking else 1.5))
		if meter >= 1.0:
			result = "caught"
			caught.emit(str(baddie.name))
	else:
		meter = maxf(0.0, meter - dt * 0.45)
