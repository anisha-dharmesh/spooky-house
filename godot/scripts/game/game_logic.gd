class_name GameLogic
extends RefCounted
## The rules of the game with no drawing: movement, patrolling baddies, sight, the "seen" meter,
## items, hiding, prank steps and pet help. The 3D view just shows this state; tests play it headless.
## A port of the rules in src/scenes/GameScene.ts, in metres.

const PLAYER_RADIUS := 0.4
const WALK_SPEED := 2.83
const SNEAK_SPEED := 1.5
const REACH := 0.9
const BADDIE_RADIUS := 0.53
const MAX_ITEMS := 3
const METER_FILL := 0.55
const METER_DRAIN := 0.3
const PET_DISTRACTION := 5.0
const TURN_RATE := 3.2
const NOT_SEEN_LIMIT := 0.6
const PX_PER_M := 60.0 # speeds and ranges in the level data are pixels of the 2D version (1 tile = 60 px = 1 m)

signal steps_changed
signal inventory_changed
signal toast(key: String, vars: Dictionary) # a text key for GameData.t() plus its fill-in values
signal item_picked(uid: String)
signal pet_called(from: Vector2, to: Vector2)
signal finished(result: String) # "won" or "caught"

var level: Dictionary
var world: WorldData
var blockers: Array[Rect2]

var player_pos := Vector2.ZERO
var player_facing := 0.0
var sneaking := false
var hiding: Dictionary = {}          # the hide spot we're inside, or {}
var _pre_hide := Vector2.ZERO
var inventory: Array[String] = []
var picked := {}
var step_index := 0
var meter := 0.0
var max_meter := 0.0
var elapsed := 0.0
var pets_left := 0
var result := ""                     # "", "won" or "caught"
var caught_by := "teacher"
var baddies: Array[Dictionary] = []


func _init(p_level: Dictionary, p_world: WorldData, kinds: Dictionary) -> void:
	level = p_level
	world = p_world
	blockers = world.blockers()
	player_pos = world.spawn
	pets_left = int(level.get("petHelp", 0))
	for mb in world.baddies:
		var def := {}
		for b in level.baddies:
			if b.id == mb.id:
				def = b
		if def.is_empty():
			continue
		var kind: Dictionary = kinds.get(def.kind, {})
		baddies.append({
			"id": mb.id,
			"kind": def.kind,
			"name": kind.get("name", "Baddie"),
			"pos": mb.patrol[0].pos,
			"facing": 0.0,
			"target": 1,
			"wait_left": 0.0,
			"distracted_left": 0.0,
			"look_at": Vector2.ZERO,
			"speed": float(def.get("speed", kind.get("speed", 70))) / PX_PER_M,
			"range": float(def.get("range", kind.get("range", 300))) / PX_PER_M,
			"half_angle": deg_to_rad(float(def.get("halfAngle", kind.get("halfAngle", 28)))),
			"patrol": mb.patrol,
			"sees": false,
		})
		var b2: Dictionary = baddies[baddies.size() - 1]
		b2.facing = (b2.patrol[1].pos - b2.pos).angle()


func current_step() -> Dictionary:
	if step_index < level.steps.size():
		return level.steps[step_index]
	return {}


func is_hiding() -> bool:
	return not hiding.is_empty()


func pick_by_uid(uid: String) -> Dictionary:
	for p in world.pickups:
		if p.uid == uid:
			return p
	return {}


# ---------- the main step ----------

## move_dir is a world-space direction (length <= 1). Does nothing once the level is over.
func tick(dt: float, move_dir: Vector2, want_sneak: bool) -> void:
	if result != "":
		return
	elapsed += dt
	sneaking = want_sneak
	if not is_hiding() and move_dir.length() > 0.001:
		var speed := SNEAK_SPEED if sneaking else WALK_SPEED
		player_facing = move_dir.angle()
		var p := player_pos + move_dir.normalized() * move_dir.length() * speed * dt
		p = Geo.resolve_circle(p, PLAYER_RADIUS, blockers)
		var b := world.bounds
		player_pos = Vector2(
			clampf(p.x, b.position.x + PLAYER_RADIUS, b.end.x - PLAYER_RADIUS),
			clampf(p.y, b.position.y + PLAYER_RADIUS, b.end.y - PLAYER_RADIUS))
	for b in baddies:
		_update_baddie(b, dt)
	_detect(dt)
	if result != "":
		return
	var step := current_step()
	if step.get("type", "") == "reach":
		for e in world.exits:
			if e.id == step.zone and Geo.dist_to_rect(player_pos, e.rect) < PLAYER_RADIUS * 0.6:
				_complete_step()


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
		meter += METER_FILL * (0.5 if sneaking else 1.0) * dt
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
	var best := {}
	var best_d := REACH
	for p in world.pickups:
		if inventory.has(p.uid):
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
		if d3 < best_d:
			best_d = d3
			best = {"kind": "hide", "hide": h, "rect": h.rect}
	return best


func item_name(uid: String) -> String:
	var p := pick_by_uid(uid)
	return p.get("name", uid)


func use() -> void:
	if result != "":
		return
	var near := reachable()
	if near.is_empty():
		return
	match near.kind:
		"hide":
			toggle_hide()
		"pickup":
			if inventory.size() >= MAX_ITEMS:
				return
			inventory.append(near.pickup.uid)
			picked[near.pickup.uid] = true
			item_picked.emit(near.pickup.uid)
			inventory_changed.emit()
			_sync_steps()
		"target":
			var step := current_step()
			if step.get("type", "") == "use" and step.target == near.target.id:
				if not inventory.has(step.item):
					toast.emit("needItem", {"item": item_name(step.item)})
					return
				inventory.erase(step.item)
				inventory_changed.emit()
				_complete_step()
				return
			for s in level.steps:
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
	_pre_hide = player_pos
	hiding = near.hide
	player_pos = (near.hide.rect as Rect2).get_center()


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


## Auto-completes pickup steps whose item is already in the bag.
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
	if step_index >= level.steps.size() and result == "":
		result = "won"
		finished.emit("won")


## Stars earned (always 1 for the prank, +1 not seen, +1 quick).
func stars() -> int:
	var n := 1
	if max_meter < NOT_SEEN_LIMIT:
		n += 1
	if elapsed <= float(level.get("parTime", 60)):
		n += 1
	return n
