extends Node
## Autoload "SaveGame": language and stars per level, kept in user://save.cfg.

const PATH := "user://save.cfg"
var _cfg := ConfigFile.new()


func _ready() -> void:
	_cfg.load(PATH)
	GameData.lang = _cfg.get_value("settings", "lang", "en")


func save_lang(lang: String) -> void:
	_cfg.set_value("settings", "lang", lang)
	_cfg.save(PATH)


func is_completed(level_id: int) -> bool:
	return _cfg.has_section_key("levels", str(level_id))


func stars(level_id: int) -> int:
	return int(_cfg.get_value("levels", str(level_id), 0))


func record(level_id: int, star_count: int) -> void:
	_cfg.set_value("levels", str(level_id), maxi(star_count, stars(level_id)))
	_cfg.save(PATH)


func total_stars() -> int:
	var n := 0
	if _cfg.has_section("levels"):
		for k in _cfg.get_section_keys("levels"):
			n += int(_cfg.get_value("levels", k, 0))
	return n
