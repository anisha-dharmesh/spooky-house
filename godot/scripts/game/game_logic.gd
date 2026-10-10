class_name GameLogic
extends RefCounted
## The rules of the game with no drawing: movement, patrolling baddies, sight, the "seen" meter, locked doors,
## items, hiding, the tasks one after another and pet help. The 3D view just shows this state; tests play it headless.
## The world is one continuous map. Tasks are done in order; finishing one can unlock rooms.
## Getting caught sends Anisha back to her room, empty-handed (see respawn()).

const PLAYER_RADIUS := 0.4
const WALK_SPEED := 2.83
const REACH := 0.9
const BADDIE_RADIUS := 0.53
const MAX_ITEMS := 3
const METER_FILL := 0.35
const METER_DRAIN := 0.3
const PET_DISTRACTION := 5.0
const TURN_RATE := 3.2
const NOT_SEEN_LIMIT := 0.6
const PX_PER_M := 60.0 # speeds and ranges in the data are pixels of the old 2D version (1 tile = 60 px = 1 m)
const DOOR_NOTICE := 0.15 # how close to a locked door counts as bumping into it
const ARRIVE := 0.12      # how close to a route point counts as being there
const STUCK_SECONDS := 0.7

signal steps_changed
signal inventory_changed
signal toast(key: String, vars: Dictionary) # a text key for GameData.t() plus its fill-in values
signal item_picked(id: String)
signal items_restored(ids: Array)           # items that went back to where they were (caught)
signal target_used(id: String)
signal pet_called(from: Vector2, to: Vector2)
signal baddies_changed
signal task_completed(task: Dictionary, rating: Dictionary, opened: Array) # rating: see rating()
signal room_unlocked(room_id: String)
signal finished(result: String)             # "caught"; the game goes on after respawn()
signal respawned
signal hint(rect: Rect2, item: String, key: String, vars: Dictionary) # a bubble over a tapped thing: the item's picture, a text key

var world: WorldData
var tasks: Array
var kinds: Dictionary
var blockers: Array[Rect2]
var closed_doors: Array[Dictionary] = []
var locked: Dictionary = {}          # room id -> true, for rooms that are still shut

var task: Dictionary = {}            # the task Anisha is on, or {} when every task is done
var task_index := 0
var step_index := 0
var completed: Array[int] = []       # ids of finished tasks
var star_log := {}                   # task id -> stars earned in this session

var player_pos := Vector2.ZERO
var player_facing := PI / 2.0
var route: Array[Vector2] = []       # the way she is walking now (from a tap)
var pending: Dictionary = {}         # the thing she will use when she gets there
var _stuck := 0.0
var _chk: LevelCheck
var hiding: Dictionary = {}          # the hide spot we're inside, or {}
var _pre_hide := Vector2.ZERO
var inventory: Array[String] = []    # what she carries
var task_used: Array[String] = []    # carried items already used up for the current task (they come back if she is caught)
var picked := {}                     # every item that is not on its shelf: carried, or used up for good
var meter := 0.0
var max_meter := 0.0
var elapsed := 0.0                   # seconds on the current task
var pets_left := 0
var result := ""                     # "" or "caught"
var caught_by := "teacher"
var baddies: Array[Dictionary] = []
var _bump_cooldown := 0.0


## `done_ids`: the tasks already finished (from the save). Their items are used up and the rooms they unlock are open.
func _init(p_world: WorldData, p_tasks: Array, p_kinds: Dictionary, done_ids: Array = []) -> void:
	world = p_world
	tasks = p_tasks
	kinds = p_kinds
	task_index = tasks.size()
	for i in tasks.size():
		var t: Dictionary = tasks[i]
		if done_ids.has(int(t.id)):
			completed.append(int(t.id))
			for s in t.steps:
				if s.type == "pickup" or s.type == "use":
					picked[s.item] = true
		else:
			for r in t.get("unlocks", []):
				locked[r] = true
			task_index = mini(task_index, i)
	player_pos = world.respawn
	_rebuild_blockers()
	_start_task()


func _rebuild_blockers() -> void:
	blockers = world.blockers(locked)
	closed_doors = world.closed_doors(locked)
	_chk = null
	route.clear()
	pending = {}


func current_step() -> Dictionary:
	if not task.is_empty() and step_index < task.steps.size():
		return task.steps[step_index]
	return {}


func is_hiding() -> bool:
	return not hiding.is_empty()


func pick_by_id(id: String) -> Dictionary:
	for p in world.pickups:
		if p.uid == id:
			return p
	return {}


# ---------- tasks ----------

func _start_task() -> void:
	if task_index >= tasks.size():
		task = {}
		steps_changed.emit()
		return
	task = tasks[task_index]
	step_index = 0
	elapsed = 0.0
	max_meter = meter
	pets_left = int(task.get("petHelp", 0))
	_apply_baddies()
	_sync_steps()


func _complete_task() -> void:
	var done := task
	var earned := rating()
	completed.append(int(done.id))
	star_log[int(done.id)] = earned.stars
	for s in done.steps: # things she kept carrying for this task are finished with (they stay gone)
		if (s.type == "pickup" or s.type == "use") and inventory.has(s.item):
			inventory.erase(s.item)
	inventory_changed.emit()
	task_used.clear()
	var opened: Array = []
	for r in done.get("unlocks", []):
		if locked.erase(r):
			opened.append(r)
	if not opened.is_empty():
		_rebuild_blockers()
		for r in opened:
			room_unlocked.emit(r)
	task_index += 1
	_start_task()
	task_completed.emit(done, earned, opened)


## How the current task went: 1 star for the prank, +1 if she was hardly seen, +1 if she was quick.
func rating() -> Dictionary:
	var not_seen := max_meter < NOT_SEEN_LIMIT
	var quick := elapsed <= float(task.get("parTime", 60))
	return {"stars": 1 + int(not_seen) + int(quick), "not_seen": not_seen, "quick": quick}


## Caught (or "back to my room" from the pause menu): Anisha wakes up in her room and drops everything.
## Items go back where they were, the current task starts again, the baddies go back to their first spot.
## Finished tasks and unlocked rooms stay.
func respawn() -> void:
	var back: Array = []
	for id in inventory:
		back.append(id)
	for id in task_used:
		back.append(id)
	for id in back:
		picked.erase(id)
	inventory.clear()
	task_used.clear()
	hiding = {}
	stop_walking()
	player_pos = world.respawn
	player_facing = PI / 2.0
	meter = 0.0
	max_meter = 0.0
	elapsed = 0.0
	step_index = 0
	pets_left = int(task.get("petHelp", 0))
	result = ""
	baddies.clear()
	_apply_baddies()
	items_restored.emit(back)
	inventory_changed.emit()
	steps_changed.emit()
	respawned.emit()


# ---------- baddies ----------

func _patrol_of(def: Dictionary) -> Array:
	var out: Array = []
	for pt in def.patrol:
		out.append({"pos": world.spot(pt), "wait": float(pt.get("wait", 0.0))})
	return out


func _find_baddie(id: String) -> Dictionary:
	for b in baddies:
		if b.id == id:
			return b
	return {}


## The baddies the current task asks for walk their patrols; any others go away. A baddie that is
## already around carries on from the nearest point of its new route.
func _apply_baddies() -> void:
	var wanted := {}
	for def in task.get("baddies", []):
		wanted[def.id] = def
	for i in range(baddies.size() - 1, -1, -1):
		if not wanted.has(baddies[i].id):
			baddies.remove_at(i)
	for id in wanted:
		var def: Dictionary = wanted[id]
		var patrol := _patrol_of(def)
		if patrol.size() < 2:
			continue
		var kind: Dictionary = kinds.get(def.kind, {})
		var b := _find_baddie(id)
		if b.is_empty():
			b = {"id": id, "pos": patrol[0].pos, "facing": 0.0, "target": 1, "wait_left": 0.0,
				"distracted_left": 0.0, "look_at": Vector2.ZERO, "sees": false}
			b.facing = (patrol[1].pos - b.pos).angle()
			baddies.append(b)
		b.kind = def.kind
		b.name = kind.get("name", "Baddie")
		b.speed = float(def.get("speed", kind.get("speed", 70))) / PX_PER_M
		b.range = float(def.get("range", kind.get("range", 300))) / PX_PER_M
		b.half_angle = deg_to_rad(float(def.get("halfAngle", kind.get("halfAngle", 28))))
		b.patrol = patrol
		var best := 0
		var best_d := INF
		for i in patrol.size():
			var d: float = b.pos.distance_to(patrol[i].pos)
			if d < best_d:
				best_d = d
				best = i
		b.target = best
		b.wait_left = 0.0
	baddies_changed.emit()


# ---------- the main step ----------

## She walks along `route` (set by a tap). `move_dir` (a world-space direction, length <= 1) is only for tests and
## overrides the route. Does nothing while she is caught (until respawn()).
func tick(dt: float, move_dir: Vector2 = Vector2.ZERO) -> void:
	if result != "":
		return
	elapsed += dt
	var walking_route := false
	if move_dir.length() <= 0.001 and not is_hiding():
		move_dir = _route_dir()
		walking_route = move_dir != Vector2.ZERO
	var before := player_pos
	if not is_hiding() and move_dir.length() > 0.001:
		var speed := WALK_SPEED
		player_facing = move_dir.angle()
		var p := player_pos + move_dir.normalized() * move_dir.length() * speed * dt
		p = Geo.resolve_circle(p, PLAYER_RADIUS, Geo.near(p, PLAYER_RADIUS + 1.0, blockers))
		var b := world.bounds
		player_pos = Vector2(
			clampf(p.x, b.position.x + PLAYER_RADIUS, b.end.x - PLAYER_RADIUS),
			clampf(p.y, b.position.y + PLAYER_RADIUS, b.end.y - PLAYER_RADIUS))
		_check_locked_door(dt)
	if walking_route:
		_stuck = _stuck + dt if player_pos.distance_to(before) < WALK_SPEED * dt * 0.25 else 0.0
		if _stuck > STUCK_SECONDS:
			stop_walking()
	_arrive()
	for b in baddies:
		_update_baddie(b, dt)
	_detect(dt)
	if result != "":
		return
	var step := current_step()
	if step.get("type", "") == "reach":
		var r := world.room_by_id(step.room)
		if not r.is_empty() and Geo.point_in_rect(player_pos, (r.interior as Rect2).grow(-0.5)):
			_complete_step()
	elif step.get("type", "") == "watch" and _baddie_on(step.target):
		_complete_step()


## True when a baddie is standing on the target (a "watch" step: the teacher steps on the doormat).
func _baddie_on(target_id: String) -> bool:
	for t in world.targets:
		if t.id == target_id:
			for b in baddies:
				if (t.rect as Rect2).has_point(b.pos):
					return true
	return false


func _check_locked_door(dt: float) -> void:
	_bump_cooldown -= dt
	if _bump_cooldown > 0.0:
		return
	for d in closed_doors:
		if Geo.dist_to_rect(player_pos, d.rect) < PLAYER_RADIUS + DOOR_NOTICE:
			toast.emit("doorLocked", {})
			_bump_cooldown = 3.0
			return


func _turn_toward(b: Dictionary, angle: float, dt: float) -> void:
	var d := Geo.angle_diff(b.facing, angle)
	var step := TURN_RATE * dt
	b.facing += clampf(d, -step, step)


func _update_baddie(b: Dictionary, dt: float) -> void:
	var patrol: Array = b.patrol
	if b.distracted_left > 0.0:
		b.distracted_left -= dt
		_turn_toward(b, (b.look_at - b.pos).angle(), dt)
	elif patrol.size() >= 2:
		var tp: Dictionary = patrol[b.target]
		if b.wait_left > 0.0:
			b.wait_left -= dt
			_turn_toward(b, (tp.pos - b.pos).angle(), dt)
		else:
			var delta: Vector2 = tp.pos - b.pos
			var d := delta.length()
			var step: float = b.speed * dt
			_turn_toward(b, delta.angle(), dt)
			if d <= step:
				b.pos = tp.pos
				b.wait_left = tp.wait
				b.target = (b.target + 1) % patrol.size()
			else:
				b.pos += delta / d * step


func _detect(dt: float) -> void:
	var covered := is_hiding()
	if not covered:
		for s in world.safes:
			if Geo.point_in_rect(player_pos, s):
				covered = true
	var sees := false
	var touched := false
	for b in baddies:
		var now := false
		if not covered and b.distracted_left <= 0.0:
			now = Geo.in_cone(b.pos, b.facing, b.half_angle, b.range, player_pos) \
				and Geo.has_line_of_sight(b.pos, player_pos, blockers)
			if b.pos.distance_to(player_pos) < BADDIE_RADIUS + PLAYER_RADIUS:
				touched = true
				caught_by = b.kind
		b.sees = now
		if now:
			sees = true
			caught_by = b.kind
	if sees:
		meter += METER_FILL * dt
	else:
		meter -= METER_DRAIN * dt
	meter = clampf(meter, 0.0, 1.0)
	max_meter = maxf(max_meter, meter)
	if meter >= 1.0 or touched:
		result = "caught"
		finished.emit("caught")


# ---------- things Anisha can do ----------

## The nearest thing within reach: {kind: "pickup"|"target"|"hide", rect, ...} or {}.
func reachable() -> Dictionary:
	if is_hiding():
		return {"kind": "hide", "hide": hiding, "rect": hiding.rect}
	var wanted := _wanted_near()
	if not wanted.is_empty():
		return wanted
	var best := {}
	var best_d := REACH
	for p in world.pickups:
		if picked.has(p.uid):
			continue
		var d := Geo.dist_to_rect(player_pos, p.rect)
		if d < best_d:
			best_d = d
			best = {"kind": "pickup", "pickup": p, "rect": p.rect}
	for t in world.targets:
		var d2 := Geo.dist_to_rect(player_pos, t.rect)
		if d2 < best_d:
			best_d = d2
			best = {"kind": "target", "target": t, "rect": t.rect}
	for h in world.hides:
		var d3 := Geo.dist_to_rect(player_pos, h.rect)
		if d3 < best_d or (d3 <= best_d and best.get("kind", "") == "target" and not _in_task(best.target.id)):
			best_d = d3
			best = {"kind": "hide", "hide": h, "rect": h.rect}
	return best


## The thing the current step is about, when she is close to it. It wins over anything else that is just as close
## (Teddy lies on the bed, but when the step says "fold your bed" the bed is what she means).
func _wanted_near() -> Dictionary:
	var step := current_step()
	match step.get("type", ""):
		"pickup":
			var p := pick_by_id(step.item)
			if not p.is_empty() and not picked.has(p.uid) and Geo.dist_to_rect(player_pos, p.rect) < REACH:
				return {"kind": "pickup", "pickup": p, "rect": p.rect}
		"use", "do":
			for t in world.targets:
				if t.id == step.target and Geo.dist_to_rect(player_pos, t.rect) < REACH:
					return {"kind": "target", "target": t, "rect": t.rect}
	return {}


## True when a step of the current task uses this target.
func _in_task(target_id: String) -> bool:
	for s in task.get("steps", []):
		if s.get("target", "") == target_id:
			return true
	return false


func item_name(id: String) -> String:
	var p := pick_by_id(id)
	return p.get("name", id)


## Does what the nearest thing in reach asks for (used by tests; the game uses taps).
func use() -> void:
	if result != "":
		return
	_act(reachable())


## Uses one thing: {kind: "pickup"|"target"|"hide", ...} as reachable() describes it.
func _act(near: Dictionary) -> void:
	if near.is_empty():
		return
	match near.kind:
		"hide":
			if is_hiding():
				toggle_hide()
			else:
				_enter_hide(near.hide)
		"pickup":
			if inventory.size() >= MAX_ITEMS:
				toast.emit("bagFull", {})
				return
			inventory.append(near.pickup.uid)
			picked[near.pickup.uid] = true
			item_picked.emit(near.pickup.uid)
			inventory_changed.emit()
			_sync_steps()
		"target":
			var step := current_step()
			var type: String = step.get("type", "")
			if (type == "use" or type == "do") and step.target == near.target.id:
				if type == "use":
					if not inventory.has(step.item):
						toast.emit("needItem", {"item": item_name(step.item)})
						return
					if not step.get("keep", false): # "keep": the item stays in her hands (Teddy, the watering can)
						inventory.erase(step.item)
						task_used.append(step.item)
					inventory_changed.emit()
				target_used.emit(near.target.id)
				_complete_step()
				return
			for i in range(step_index, task.get("steps", []).size()):
				var s: Dictionary = task.steps[i]
				if s.type == "use" and s.target == near.target.id and not inventory.has(s.item):
					toast.emit("needItem", {"item": item_name(s.item)})
					return
			toast.emit("notYet", {})


func toggle_hide() -> void:
	if result != "":
		return
	if is_hiding():
		player_pos = _pre_hide
		hiding = {}
		return
	var near := reachable()
	if near.get("kind", "") != "hide":
		return
	_enter_hide(near.hide)


func _enter_hide(spot: Dictionary) -> void:
	stop_walking()
	_pre_hide = player_pos
	hiding = spot
	player_pos = (spot.rect as Rect2).get_center()


# ---------- taps: walk there, then do the thing ----------

func _checker() -> LevelCheck:
	if _chk == null:
		_chk = LevelCheck.new(world, locked)
	return _chk


func stop_walking() -> void:
	route.clear()
	pending = {}
	_stuck = 0.0


## The way to a point or to within `within` metres of a rect, with the corners cut off ([] when there is none).
func plan_route(rect: Rect2, within: float) -> Array[Vector2]:
	var chk := _checker()
	return chk.smooth(chk.path_to_rect(player_pos, rect, within))


## A tap on the ground: walk there (or as near as she can get).
func tap_ground(p: Vector2) -> void:
	if result != "":
		return
	if is_hiding():
		toggle_hide()
	stop_walking()
	var spot := Rect2(p - Vector2(0.05, 0.05), Vector2(0.1, 0.1))
	var path := plan_route(spot, 0.3)
	if path.is_empty():
		path = plan_route(spot, 1.2)
	if path.is_empty():
		for d in closed_doors:
			if Geo.dist_to_rect(p, d.rect) < 1.2:
				toast.emit("doorLocked", {})
		return
	route = path


## A tap on a thing ({kind, ...} like reachable()): show what it is and, when it makes sense, walk there and use it.
func tap_thing(near: Dictionary) -> void:
	if result != "" or near.is_empty():
		return
	if is_hiding():
		toggle_hide()
	stop_walking()
	var info := hint_for(near)
	hint.emit(near.rect, info.item, info.key, info.vars)
	if not info.go:
		return
	if Geo.dist_to_rect(player_pos, near.rect) < REACH - 0.15:
		_act(near)
		return
	var path := plan_route(near.rect, REACH - 0.2)
	if path.is_empty():
		toast.emit("doorLocked", {})
		return
	route = path
	pending = near


## What a bubble over a tapped thing says: {item: the item to draw or "", key, vars, go: whether she walks there}.
func hint_for(near: Dictionary) -> Dictionary:
	match near.kind:
		"pickup":
			if inventory.size() >= MAX_ITEMS:
				return {"item": "", "key": "bagFull", "vars": {}, "go": false}
			return {"item": near.pickup.uid, "key": "grab", "vars": {"item": near.pickup.name}, "go": true}
		"hide":
			return {"item": "", "key": "hideHere", "vars": {}, "go": true}
		"target":
			var step := current_step()
			var type: String = step.get("type", "")
			if (type == "use" or type == "do") and step.target == near.target.id:
				if type == "do":
					return {"item": "", "key": "@text", "vars": {"text": step.text}, "go": true} # "@text": the step's own words
				if not inventory.has(step.item):
					return {"item": step.item, "key": "needShort", "vars": {"item": item_name(step.item)}, "go": false}
				return {"item": step.item, "key": "useItem", "vars": {"item": item_name(step.item)}, "go": true}
			for i in range(step_index, task.get("steps", []).size()):
				var s: Dictionary = task.steps[i]
				if s.type == "use" and s.target == near.target.id and not inventory.has(s.item):
					return {"item": s.item, "key": "needShort", "vars": {"item": item_name(s.item)}, "go": false}
			return {"item": "", "key": "notYetShort", "vars": {}, "go": false}
	return {"item": "", "key": "notYetShort", "vars": {}, "go": false}


func _route_dir() -> Vector2:
	while not route.is_empty() and player_pos.distance_to(route[0]) < ARRIVE:
		route.pop_front()
	if route.is_empty():
		return Vector2.ZERO
	return (route[0] - player_pos).normalized()


## Uses the tapped thing as soon as she is close enough.
func _arrive() -> void:
	if pending.is_empty():
		return
	if Geo.dist_to_rect(player_pos, pending.rect) < REACH - 0.1 or route.is_empty():
		var thing := pending
		stop_walking()
		if Geo.dist_to_rect(player_pos, thing.rect) < REACH:
			_act(thing)


func call_pet() -> void:
	if result != "":
		return
	if pets_left <= 0:
		toast.emit("noPets", {})
		return
	if baddies.is_empty():
		return
	var nearest: Dictionary = baddies[0]
	for b in baddies:
		if b.pos.distance_to(player_pos) < nearest.pos.distance_to(player_pos):
			nearest = b
	pets_left -= 1
	toast.emit("petRuns", {})
	nearest.distracted_left = PET_DISTRACTION
	nearest.look_at = nearest.pos + Vector2(2.0, 1.4)
	pet_called.emit(player_pos, nearest.pos)


## Auto-completes pickup steps whose item is already in the bag (she may have grabbed it early).
func _sync_steps() -> void:
	var s := current_step()
	while s.get("type", "") == "pickup" and inventory.has(s.item):
		step_index += 1
		s = current_step()
	_after_step_change()


func _complete_step() -> void:
	step_index += 1
	_sync_steps()


func _after_step_change() -> void:
	steps_changed.emit()
	if not task.is_empty() and step_index >= task.steps.size():
		_complete_task()
