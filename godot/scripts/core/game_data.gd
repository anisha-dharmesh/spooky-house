extends Node
## Autoload "GameData": the world, the tasks, baddie kinds, rooms and translated text, loaded from res://data.
## These files are edited directly: see docs/ADDING_TASKS.md.

signal language_changed

var places_def: Dictionary = {}
var tasks: Array = []
var baddie_kinds: Dictionary = {}
var strings: Dictionary = {}
var lang := "en"
var _rooms: Dictionary = {}


func _ready() -> void:
	places_def = _load_json("res://data/places.json")
	tasks = _load_json("res://data/tasks.json").get("tasks", [])
	baddie_kinds = _load_json("res://data/baddies.json")
	strings = _load_json("res://data/strings.json")


func _load_json(path: String) -> Variant:
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		push_error("Cannot open " + path)
		return {}
	var parsed: Variant = JSON.parse_string(f.get_as_text())
	return parsed if parsed != null else {}


func get_task(id: int) -> Dictionary:
	for t in tasks:
		if int(t.id) == id:
			return t
	return {}


## A room straight from the art pack's files.
func room(id: String) -> Dictionary:
	if not _rooms.has(id):
		var path := "res://data/rooms/%s.json" % id
		_rooms[id] = _load_json(path) if FileAccess.file_exists(path) else {}
	return _rooms[id]


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


## Task or item text that may be a plain string or {en, hi}. Falls back to English.
func L(text: Variant, vars: Dictionary = {}) -> String:
	if text == null:
		return ""
	if text is String:
		return _fill(text, vars)
	var s: String = text.get(lang, "")
	if s == "":
		s = text.get("en", "")
	return _fill(s, vars)


## Does the art pack's room file exist for this room (so the room can be played)?
func has_room(id: String) -> bool:
	return FileAccess.file_exists("res://data/rooms/%s.json" % id) and FileAccess.file_exists("res://assets/pack/rooms/%s.json" % id)
