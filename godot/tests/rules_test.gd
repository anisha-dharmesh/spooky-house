extends SceneTree
## Headless: the rules of the continuous world: locked rooms, doing tasks in order, early pickups, getting caught.
##   godot --headless --path godot --script tests/rules_test.gd
## Exit code 1 if anything fails.

var failed := false
var opened: Array = []


func _expect(what: String, ok: bool) -> void:
	print("%s %s" % ["ok  " if ok else "FAIL", what])
	if not ok:
		failed = true


func _init() -> void:
	var gd: Node = load("res://scripts/core/game_data.gd").new()
	gd._ready()
	var world := WorldBuilder.build(gd.world_def, gd.tasks, gd.world_rooms())
	var logic := GameLogic.new(world, gd.tasks, gd.baddie_kinds)
	logic.room_unlocked.connect(func(id: String) -> void: opened.append(id))
	var store: Rect2 = (world.room_by_id("gh_store_room").interior as Rect2).grow(-0.5)

	# the start
	_expect("she starts in her room", logic.player_pos == world.respawn)
	_expect("task 1 is current", int(logic.task.id) == 1)
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
	logic.tick(0.01, Vector2(0.01, 0), false)
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
	_expect("task 1: the first step is ticked", logic.step_index == 1)
	_stand_on(logic, _target(world, "shoes"))
	logic.use()
	_expect("task 1: the cement went into the shoes", logic.step_index == 2 and logic.inventory.is_empty())
	logic.player_pos = world.room_by_id("lh_hall").interior.get_center()
	logic.tick(0.01, Vector2.ZERO, false)
	_expect("task 1 done: task 2 is next", int(logic.task.get("id", -1)) == 2 and logic.completed == [1])
	_expect("task 1 done: nothing opened yet", opened.is_empty() and logic.locked.has("gh_store_room"))
	_expect("the cement stays used up", logic.picked.has("gh_kitchen/cement_bag_1"))

	# task 2 opens the store room
	_stand_on(logic, logic.pick_by_id("gh_kitchen/lemon_1"))
	logic.use()
	_stand_on(logic, _target(world, "gh_kitchen/tea_cup_1"))
	logic.use()
	logic.player_pos = world.room_by_id("lh_hall").interior.get_center()
	logic.tick(0.01, Vector2.ZERO, false)
	_expect("task 2 done: the store room opened", opened == ["gh_store_room"] and not logic.locked.has("gh_store_room"))
	_expect("task 2 done: no tasks left", logic.task.is_empty())
	var now_open := LevelCheck.new(world, logic.locked)
	_expect("the store room can be reached now", now_open.can_reach_rect(now_open.flood(world.respawn), store, 0.0))
	_expect("an open door is no longer a wall", logic.closed_doors.is_empty())

	# loading a save: finished tasks stay finished
	var saved := GameLogic.new(world, gd.tasks, gd.baddie_kinds, [1])
	_expect("a save with task 1 done starts on task 2", int(saved.task.id) == 2 and saved.completed == [1])
	_expect("...with its cement used up and the store room still locked", saved.picked.has("gh_kitchen/cement_bag_1") and saved.locked.has("gh_store_room"))
	var all_done := GameLogic.new(world, gd.tasks, gd.baddie_kinds, [1, 2])
	_expect("a save with every task done has the store room open", all_done.task.is_empty() and all_done.locked.is_empty())

	quit(1 if failed else 0)


func _stand_on(logic: GameLogic, thing: Dictionary) -> void:
	logic.player_pos = (thing.rect as Rect2).get_center()


func _target(world: WorldData, id: String) -> Dictionary:
	for t in world.targets:
		if t.id == id:
			return t
	return {}
