extends SceneTree
## Headless check: builds every level's world and prints a summary.
##   godot --headless --path godot --script tests/world_test.gd

func _init() -> void:
	var gd: Node = load("res://scripts/core/game_data.gd").new()
	gd._ready()
	for level in gd.levels:
		var w := WorldBuilder.build(level, gd.rooms_for(level))
		print("Level %d: bounds=%s spawn=%s walls=%d solids=%d sprites=%d pickups=%d targets=%d hides=%d exits=%d baddies=%d" % [
			int(level.id), w.bounds, w.spawn, w.walls.size(), w.solids.size(), w.sprites.size(),
			w.pickups.size(), w.targets.size(), w.hides.size(), w.exits.size(), w.baddies.size()])
	quit()
