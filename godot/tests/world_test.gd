extends SceneTree
## Headless check: builds the world and prints a summary.
##   godot --headless --path godot --script tests/world_test.gd

func _init() -> void:
	var gd: Node = load("res://scripts/core/game_data.gd").new()
	gd._ready()
	var w := WorldBuilder.build(gd.world_def, gd.tasks, gd.world_rooms())
	print("World: bounds=%s respawn=%s walls=%d solids=%d doors=%d sprites=%d pickups=%d targets=%d hides=%d" % [
		w.bounds, w.respawn, w.walls.size(), w.solids.size(), w.doors.size(), w.sprites.size(),
		w.pickups.size(), w.targets.size(), w.hides.size()])
	for r in w.rooms:
		print("  %-16s %-14s at %s" % [r.id, r.location, r.interior])
	quit()
