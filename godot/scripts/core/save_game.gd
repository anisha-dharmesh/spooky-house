extends Node
## Autoload "SaveGame": stars per task, kept in user://save.cfg.
## A finished task and its stars are all that is saved: the game always starts in Anisha's room.

const PATH := "user://save.cfg"
var _cfg := ConfigFile.new()


func _ready() -> void:
	_cfg.load(PATH)
	if _cfg.has_section("levels") and not _cfg.has_section("tasks"): # saves from when tasks were called levels
		for k in _cfg.get_section_keys("levels"):
			_cfg.set_value("tasks", k, _cfg.get_value("levels", k))


func completed_ids() -> Array:
	var out: Array = []
	if _cfg.has_section("tasks"):
		for k in _cfg.get_section_keys("tasks"):
			out.append(int(k))
	return out


func is_completed(task_id: int) -> bool:
	return _cfg.has_section_key("tasks", str(task_id))


func stars(task_id: int) -> int:
	return int(_cfg.get_value("tasks", str(task_id), 0))


func record(task_id: int, star_count: int) -> void:
	_cfg.set_value("tasks", str(task_id), maxi(star_count, stars(task_id)))
	_cfg.save(PATH)


func total_stars() -> int:
	var n := 0
	if _cfg.has_section("tasks"):
		for k in _cfg.get_section_keys("tasks"):
			n += int(_cfg.get_value("tasks", k, 0))
	return n
