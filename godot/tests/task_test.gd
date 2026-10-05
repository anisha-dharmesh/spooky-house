extends SceneTree
## Headless: checks the world and every task, then has a bot do each task.
##   godot --headless --path godot --script tests/task_test.gd
## Exit code 1 if anything fails.

const DT := 1.0 / 30.0

var failed := false


func _init() -> void:
	var gd: Node = load("res://scripts/core/game_data.gd").new()
	gd._ready()
	var errs := LevelCheck.validate(gd.world_def, gd.tasks, gd.world_rooms(), gd.baddie_kinds)
	if errs.size() > 0:
		for e in errs:
			printerr("FAIL " + e)
		quit(1)
		return
	print("World and %d tasks: valid" % gd.tasks.size())
	var world := WorldBuilder.build(gd.world_def, gd.tasks, gd.world_rooms())
	var done: Array = []
	for t in gd.tasks:
		_bot_run(gd, world, t, done.duplicate())
		done.append(int(t.id))
	quit(1 if failed else 0)


## The bot starts in Anisha's room (as after being caught) with the earlier tasks done, waits a while, then walks the
## shortest route through the task, sneaking all the way. A task must be winnable at some starting moment; the share
## of start moments it wins shows how hard it is.
func _bot_run(gd: Node, world: WorldData, task: Dictionary, done: Array) -> void:
	var wins := 0
	var tries := 0
	var best_time := INF
	var chk: LevelCheck = null
	for wait in range(0, 60, 3):
		tries += 1
		var logic := GameLogic.new(world, gd.tasks, gd.baddie_kinds, done)
		if chk == null:
			chk = LevelCheck.new(world, logic.locked)
		var t := 0.0
		while t < float(wait):
			logic.tick(DT, Vector2.ZERO, true)
			t += DT
		var took := _do_task(logic, chk, int(task.id))
		if took >= 0.0:
			wins += 1
			best_time = minf(best_time, took)
	print("Task %d: bot won %d of %d start times (fastest %.1fs sneaking)" % [int(task.id), wins, tries, best_time])
	if wins == 0:
		failed = true
		printerr("FAIL Task %d: the bot could never do it" % int(task.id))


## Returns the seconds it took, or -1 if she was caught or got stuck.
func _do_task(logic: GameLogic, chk: LevelCheck, task_id: int) -> float:
	var route: Array[Vector2] = []
	var ri := 0
	var route_step := -1
	var last_pos := logic.player_pos
	var still := 0.0
	var guard := 0
	while logic.result == "" and int(logic.task.get("id", -1)) == task_id and guard < 30 * 240:
		guard += 1
		var step := logic.current_step()
		var goal := Rect2()
		var within := GameLogic.REACH - 0.15
		var is_use := true
		match step.get("type", ""):
			"pickup":
				goal = logic.pick_by_id(step.item).rect
			"use":
				for tg in logic.world.targets:
					if tg.id == step.target:
						goal = tg.rect
			"reach":
				goal = (logic.world.room_by_id(step.room).interior as Rect2).grow(-1.0)
				within = 0.0
				is_use = false
		if route_step != logic.step_index or still > 2.0:
			route = chk.path_to_rect(logic.player_pos, goal, within)
			ri = 0
			route_step = logic.step_index
			still = 0.0
			if route.size() == 0:
				return -1.0
		if is_use and Geo.dist_to_rect(logic.player_pos, goal) < GameLogic.REACH - 0.05:
			logic.use()
			logic.tick(DT, Vector2.ZERO, true)
			continue
		while ri < route.size() - 1 and logic.player_pos.distance_to(route[ri]) < 0.35:
			ri += 1
		var aim := route[mini(ri + 1, route.size() - 1)]
		logic.tick(DT, (aim - logic.player_pos).normalized(), true)
		if logic.player_pos.distance_to(last_pos) < 0.01:
			still += DT
		else:
			still = 0.0
			last_pos = logic.player_pos
	if logic.result == "" and int(logic.task.get("id", -1)) != task_id:
		return logic.elapsed if logic.task.is_empty() else _task_seconds(logic, guard)
	return -1.0


func _task_seconds(_logic: GameLogic, ticks: int) -> float:
	return ticks * DT
