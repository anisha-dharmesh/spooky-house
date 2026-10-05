extends Node
## Autoload "GameData": levels, baddie kinds, rooms and translated text, loaded from res://data.
## These files are edited directly: see docs/ADDING_LEVELS.md.

signal language_changed

var levels: Array = []
var baddie_kinds: Dictionary = {}
var strings: Dictionary = {}
var lang := "en"
var _rooms: Dictionary = {}


func _ready() -> void:
	levels = _load_json("res://data/levels.json").get("levels", [])
	baddie_kinds = _load_json("res://data/baddies.json")
	strings = _load_json("res://data/strings.json")


func _load_json(path: String) -> Variant:
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		push_error("Cannot open " + path)
		return {}
	var parsed: Variant = JSON.parse_string(f.get_as_text())
	return parsed if parsed != null else {}


func get_level(id: int) -> Dictionary:
	for l in levels:
		if int(l.id) == id:
			return l
	return {}


func next_level(id: int) -> Dictionary:
	return get_level(id + 1)


func room(id: String) -> Dictionary:
	if not _rooms.has(id):
		_rooms[id] = _load_json("res://data/rooms/%s.json" % id)
	return _rooms[id]


func rooms_for(level: Dictionary) -> Dictionary:
	var out := {}
	for id in level.rooms:
		out[id] = room(id)
	return out


func set_lang(l: String) -> void:
	lang = l
	language_changed.emit()


func _fill(s: String, vars: Dictionary) -> String:
	for k in vars:
		s = s.replace("{%s}" % k, str(vars[k]))
	return s


## Menu / game text by key, in the current language.
func t(key: String, vars: Dictionary = {}) -> String:
	var e: Variant = strings.get(key)
	if e == null:
		return key
	var s: String = e.get(lang, "")
	if s == "":
		s = e.get("en", key)
	return _fill(s, vars)


## Level or item text that may be a plain string or {en, hi}. Falls back to English.
func L(text: Variant, vars: Dictionary = {}) -> String:
	if text == null:
		return ""
	if text is String:
		return _fill(text, vars)
	var s: String = text.get(lang, "")
	if s == "":
		s = text.get("en", "")
	return _fill(s, vars)
