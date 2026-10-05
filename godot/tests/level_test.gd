extends SceneTree
## Headless: validates every level and has a bot try each one.
##   godot --headless --path godot --script tests/level_test.gd
## Exit code 1 if anything fails.

var failed := false


func _init() -> void:
	var gd: Node = load("res://scripts/core/game_data.gd").new()
	gd._ready()
	for level in gd.levels:
		var rooms: Dictionary = gd.rooms_for(level)
		var errs := LevelCheck.validate(level, rooms, gd.baddie_kinds)
		if errs.size() > 0:
			failed = true
			for e in errs:
				printerr("FAIL " + e)
			continue
		print("Level %d: valid" % int(level.id))
		_bot_run(level, rooms, gd.baddie_kinds)
	quit(1 if failed else 0)


## A bot walks the shortest route through the steps (sneaking), leaving at different moments.
## A level must be winnable at some starting moment; the share that wins shows how hard it is.
func _bot_run(level: Dictionary, rooms: Dictionary, kinds: Dictionary) -> void:
	var wins := 0
	var tries := 0
	var best_time := INF
	for wait in range(0, 40, 2):
		tries += 1
		var world := WorldBuilder.build(level, rooms)
		var logic := GameLogic.new(level, world, kinds)
		var chk := LevelCheck.new(world)
		var t := 0.0
		var dt := 1.0 / 30.0
		while t < float(wait):
			logic.tick(dt, Vector2.ZERO, true)
			t += dt
		var guard := 0
		while logic.result == "" and guard < 30 * 120:
			guard += 1
			var step := logic.current_step()
			var goal := Rect2()
			var within := GameLogic.REACH - 0.15
			match step.get("type", ""):
				"pickup": goal = logic.pick_by_uid(step.item).rect
				"use":
					for tg in world.targets:
						if tg.id == step.target:
							goal = tg.rect
				"reach":
					for e in world.exits:
						if e.id == step.zone:
							goal = e.rect
					within = 0.1
			var route := chk.path_to_rect(logic.player_pos, goal, within)
			if route.size() == 0:
				break
			var stype: String = step.get("type", "")
			if stype != "reach" and Geo.dist_to_rect(logic.player_pos, goal) < GameLogic.REACH - 0.05:
				logic.use()
				logic.tick(dt, Vector2.ZERO, true)
				continue
			var next := route[mini(route.size() - 1, 2)]
			logic.tick(dt, (next - logic.player_pos).normalized(), true)
		if logic.result == "won":
			wins += 1
			best_time = minf(best_time, logic.elapsed)
	print("  bot: won %d of %d start times (fastest %.1fs)" % [wins, tries, best_time])
	if wins == 0:
		failed = true
		printerr("FAIL Level %d: the bot could never win it" % int(level.id))
