extends SceneTree
## Headless: the rules of the continuous world: locked rooms, doing tasks in order, early pickups, getting caught.
##   godot --headless --path godot --script tests/rules_test.gd
## Exit code 1 if anything fails.

var failed := false
var opened: Array = []
const HOME := [1, 2, 3, 4, 5, 6] # the six home tasks come first; the cement task is 7, the lemon task is 8


func _expect(what: String, ok: bool) -> void:
	print("%s %s" % ["ok  " if ok else "FAIL", what])
	if not ok:
		failed = true


func _init() -> void:
	var gd: Node = load("res://scripts/core/game_data.gd").new()
	gd._ready()
	var world := WorldBuilder.build(gd.world_def, gd.tasks, gd.world_rooms())
	var logic := GameLogic.new(world, gd.tasks, gd.baddie_kinds, HOME)
	logic.room_unlocked.connect(func(id: String) -> void: opened.append(id))
	var store: Rect2 = (world.room_by_id("gh_store_room").interior as Rect2).grow(-0.5)

	# the start
	_expect("she starts in her room", logic.player_pos == world.respawn)
	_expect("the cement task is current", int(logic.task.id) == 7)
	_expect("the store room starts locked", logic.locked.has("gh_store_room"))
	var shut := LevelCheck.new(world, logic.locked)
	_expect("a locked room can't be walked into", not shut.can_reach_rect(shut.flood(world.respawn), store, 0.0))
	var open := LevelCheck.new(world, {})
	_expect("...but it can once it is open", open.can_reach_rect(open.flood(world.respawn), store, 0.0))

	# she may pick up things for a later task early (the lemon is for task 2)
	_stand_on(logic, logic.pick_by_id("gh_kitchen/lemon_1"))
	logic.use()
	_expect("an item for a later task can be picked up early", logic.inventory.has("gh_kitchen/lemon_1"))
	_expect("...and it can't be picked up twice", logic.reachable().get("kind", "") != "pickup")

	# walking into a locked door says it is locked
	var door: Dictionary = logic.closed_doors[0]
	var told := []
	logic.toast.connect(func(key: String, _v: Dictionary) -> void: told.append(key))
	logic.player_pos = (door.rect as Rect2).get_center() + Vector2(0, 0.45)
	logic.tick(0.01, Vector2(0.01, 0))
	_expect("a locked door says it is locked", told.has("doorLocked"))

	# a use out of order is refused (shoes before the cement)
	_stand_on(logic, _target(world, "shoes"))
	logic.use()
	_expect("a prank out of order is refused", int(logic.step_index) == 0)

	# caught: back to her room with empty hands, items back on their shelves
	logic.player_pos = _target(world, "shoes").rect.get_center()
	logic.result = "caught"
	logic.respawn()
	_expect("caught: she is back in her room", logic.player_pos == world.respawn)
	_expect("caught: her hands are empty", logic.inventory.is_empty())
	_expect("caught: the lemon is back on its shelf", not logic.picked.has("gh_kitchen/lemon_1"))
	_expect("caught: she can play again", logic.result == "")

	# task 1, by walking to each thing
	_stand_on(logic, logic.pick_by_id("gh_kitchen/cement_bag_1"))
	logic.use()
	_expect("cement task: the first step is ticked", logic.step_index == 1)
	_stand_on(logic, _target(world, "shoes"))
	logic.use()
	_expect("cement task: the cement went into the shoes", logic.step_index == 2 and logic.inventory.is_empty())
	logic.player_pos = world.room_by_id("lh_hall").interior.get_center()
	logic.tick(0.01, Vector2.ZERO)
	_expect("cement task done: the lemon task is next", int(logic.task.get("id", -1)) == 8 and logic.completed == HOME + [7])
	_expect("cement task done: nothing opened yet", opened.is_empty() and logic.locked.has("gh_store_room"))
	_expect("the cement stays used up", logic.picked.has("gh_kitchen/cement_bag_1"))

	# task 2 opens the store room
	_stand_on(logic, logic.pick_by_id("gh_kitchen/lemon_1"))
	logic.use()
	_stand_on(logic, _target(world, "gh_kitchen/tea_cup_1"))
	logic.use()
	logic.player_pos = world.room_by_id("lh_hall").interior.get_center()
	logic.tick(0.01, Vector2.ZERO)
	_expect("lemon task done: the store room opened", opened == ["gh_store_room"] and not logic.locked.has("gh_store_room"))
	_expect("lemon task done: no tasks left", logic.task.is_empty())
	var now_open := LevelCheck.new(world, logic.locked)
	_expect("the store room can be reached now", now_open.can_reach_rect(now_open.flood(world.respawn), store, 0.0))
	_expect("an open door is no longer a wall", logic.closed_doors.is_empty())

	# loading a save: finished tasks stay finished
	var saved := GameLogic.new(world, gd.tasks, gd.baddie_kinds, HOME + [7])
	_expect("a save with the cement task done starts on the lemon task", int(saved.task.id) == 8 and saved.completed == HOME + [7])
	_expect("...with its cement used up and the store room still locked", saved.picked.has("gh_kitchen/cement_bag_1") and saved.locked.has("gh_store_room"))
	var all_done := GameLogic.new(world, gd.tasks, gd.baddie_kinds, HOME + [7, 8])
	_expect("a save with every task done has the store room open", all_done.task.is_empty() and all_done.locked.is_empty())

	_home_tasks(gd, world)
	_tap_tests(gd, world)
	quit(1 if failed else 0)


## The calm home tasks: "do" steps, items she keeps carrying, a baddie stepping on the doormat, hiding in the bed.
func _home_tasks(gd: Node, world: WorldData) -> void:
	var h := GameLogic.new(world, gd.tasks, gd.baddie_kinds)
	_expect("home: the first task is Good Morning (E19)", int(h.task.id) == 1 and h.task.ref == "E19")
	var bed := _target(world, "lh_fluffy_room/bed_single_1")
	h.player_pos = Vector2(bed.rect.get_center().x + 1.5, bed.rect.end.y + 0.4)
	h.use()
	_expect("home: a 'do' step needs no item (fold the bed)", h.step_index == 1 and h.inventory.is_empty())
	# next to Teddy, the bed step still means the bed (tested on a fresh game)
	var f := GameLogic.new(world, gd.tasks, gd.baddie_kinds)
	f.player_pos = Vector2(bed.rect.position.x + 1.5, bed.rect.end.y + 0.4) # right under Teddy
	f.use()
	_expect("home: beside Teddy, 'fold your bed' folds the bed and Teddy stays put", f.step_index == 1 and not f.picked.has("lh_fluffy_room/teddy_1"))

	var w := GameLogic.new(world, gd.tasks, gd.baddie_kinds, [1, 2, 3])
	_expect("home: the watering can task is current (E21)", w.task.ref == "E21")
	_stand_on(w, w.pick_by_id("lh_bathroom/watering_can_1"))
	w.use()
	_stand_on(w, _target(world, "lh_bathroom/wash_basin_1"))
	w.use()
	_expect("home: the can is still in her hands after filling it", w.inventory.has("lh_bathroom/watering_can_1") and w.step_index == 2)
	_stand_on(w, _target(world, "lh_hall/plant_pot_1"))
	w.use()
	_expect("home: watering the plant finishes the task and the can is put away", int(w.task.id) == 5 and w.inventory.is_empty())

	var d := GameLogic.new(world, gd.tasks, gd.baddie_kinds, [1, 2, 3, 4, 5])
	_expect("home: the doormat task is current (E23)", d.task.ref == "E23" and d.baddies.size() == 1)
	d.player_pos = Vector2(bed.rect.get_center().x + 1.5, bed.rect.end.y + 0.4)
	_expect("home: the bed is a hiding spot when it is not part of the task", d.reachable().get("kind", "") == "hide")
	_stand_on(d, d.pick_by_id("lh_animal_room/pet_toys_1"))
	d.use()
	_stand_on(d, _target(world, "lh_hall/front_door_mat_1"))
	d.use()
	_expect("home: the toy is under the doormat, now we wait", d.step_index == 2 and d.current_step().type == "watch")
	d.baddies[0].pos = _target(world, "lh_hall/front_door_mat_1").rect.get_center()
	d.player_pos = world.room_by_id("lh_fluffy_room").interior.get_center()
	d.tick(0.01, Vector2.ZERO)
	_expect("home: the teacher steps on the mat and the task is done", d.completed.has(6) and int(d.task.get("id", -1)) == 7)


## Taps: tap the ground and she walks there; tap a thing and she walks there and uses it; a bubble says what it is.
func _tap_tests(gd: Node, world: WorldData) -> void:
	var l := GameLogic.new(world, gd.tasks, gd.baddie_kinds)
	var hints := []
	l.hint.connect(func(_r: Rect2, item: String, key: String, _v: Dictionary) -> void: hints.append([item, key]))
	var start := l.player_pos
	var bed := _target(world, "lh_fluffy_room/bed_single_1")
	l.tap_thing({"kind": "target", "target": bed, "rect": bed.rect})
	_expect("tap: a thing that is the current step gets a bubble and she sets off", hints.size() == 1 and hints[0][1] == "@text" and (not l.route.is_empty() or l.step_index == 1))
	for i in 600:
		l.tick(1.0 / 30.0)
	_expect("tap: she walked there by herself and folded the bed", l.step_index == 1 and l.player_pos.distance_to(start) > 0.0)

	var g := GameLogic.new(world, gd.tasks, gd.baddie_kinds, [1, 2, 3, 4, 5])
	var spot := g.player_pos + Vector2(1.5, 0.0)
	g.tap_ground(spot)
	for i in 300:
		g.tick(1.0 / 30.0)
	_expect("tap: a tap on the ground walks there", g.player_pos.distance_to(spot) < 0.5)
	var toy := g.pick_by_id("lh_animal_room/pet_toys_1")
	g.tap_thing({"kind": "pickup", "pickup": toy, "rect": toy.rect})
	for i in 900:
		g.tick(1.0 / 30.0)
	_expect("tap: a tap on an item walks there and picks it up", g.inventory.has("lh_animal_room/pet_toys_1"))
	var mat := _target(world, "lh_hall/front_door_mat_1")
	var shoes_hint: Dictionary = g.hint_for({"kind": "target", "target": _target(world, "lh_hall/plant_pot_1"), "rect": _target(world, "lh_hall/plant_pot_1").rect})
	_expect("tap: a thing that is not ready says so and she stays put", not shoes_hint.go)
	g.tap_thing({"kind": "target", "target": mat, "rect": mat.rect})
	for i in 900:
		g.tick(1.0 / 30.0)
	_expect("tap: a tap on the target uses the item", g.step_index == 2 or int(g.task.id) != 6) # (the teacher may already have stepped on the mat)
	var h := GameLogic.new(world, gd.tasks, gd.baddie_kinds)
	h.tap_ground(Vector2(-500, -500))
	_expect("tap: a tap far outside goes nowhere", h.route.is_empty())


func _stand_on(logic: GameLogic, thing: Dictionary) -> void:
	logic.player_pos = (thing.rect as Rect2).get_center()


func _target(world: WorldData, id: String) -> Dictionary:
	for t in world.targets:
		if t.id == id:
			return t
	return {}
