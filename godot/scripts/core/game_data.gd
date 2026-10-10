extends Node
## Autoload "GameData": the world, the tasks, baddie kinds, rooms and text, loaded from res://data.
## These files are edited directly: see docs/ADDING_TASKS.md.

const OPPOSITE := {"N": "S", "S": "N", "E": "W", "W": "E"}

var world_def: Dictionary = {}
var tasks: Array = []
var baddie_kinds: Dictionary = {}
var strings: Dictionary = {}
var _rooms: Dictionary = {}
var _world_rooms: Dictionary = {}


func _ready() -> void:
	world_def = _load_json("res://data/world.json")
	tasks = _playable(_load_json("res://data/tasks.json").get("tasks", []))
	baddie_kinds = _load_json("res://data/baddies.json")
	strings = _load_json("res://data/strings.json")


## tasks.json lists every task, built or not. Only the ones that have `steps` are played, in `play` order.
## The game's own number is `play` (the `id` it uses everywhere); the planning id (like "E19") is kept as `ref`.
func _playable(all: Array) -> Array:
	var out: Array = []
	for t in all:
		if not t.has("steps"):
			continue
		var r: Dictionary = t.duplicate(true)
		r.ref = t.id
		r.id = int(t.play)
		r.name = t.get("name", t.get("title", t.id))
		r.task = t.get("task", t.text)
		out.append(r)
	out.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return a.id < b.id)
	return out


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
		_rooms[id] = _load_json("res://data/rooms/%s.json" % id)
	return _rooms[id]


## Every room of the world by id. Streets are made up here (the pack has none): a street is a long outdoor room,
## and the doors of the houses that open "to town" are pointed at it.
func world_rooms() -> Dictionary:
	if not _world_rooms.is_empty():
		return _world_rooms
	var street_of := {}   # house room id -> street id
	for st in world_def.get("streets", []):
		for link in st.doors:
			street_of[link.to] = st.id
	for id in world_def.get("rooms", []):
		if street_of.values().has(id):
			continue
		var r: Dictionary = room(id).duplicate(true)
		if r.is_empty():
			continue
		for d in r.doors:
			if d.to == "town" and street_of.has(id):
				d.to = street_of[id]
		_world_rooms[id] = r
	for st in world_def.get("streets", []):
		_world_rooms[st.id] = _make_street(st)
	return _world_rooms


func _make_street(st: Dictionary) -> Dictionary:
	var doors: Array = []
	for link in st.doors:
		var house := room(link.to)
		var src := {}
		for d in house.doors:
			if d.to == "town":
				src = d
		if src.is_empty():
			continue
		# only houses whose front door is on their south side are supported: the street runs along their front
		doors.append({"side": OPPOSITE[src.side], "to": link.to, "x": link.x, "y": 0, "w": src.w, "h": 1})
	return {
		"id": st.id, "name": st.name, "location": st.get("location", "town"), "floor": "Outside",
		"size": {"w": st.w, "h": st.h}, "ground": st.get("ground", "road"), "outdoor": true, "safeZone": false,
		"doors": doors, "items": [], "colliders": [], "hideSpots": [],
	}


func _fill(s: String, vars: Dictionary) -> String:
	for k in vars:
		s = s.replace("{%s}" % k, str(vars[k]))
	return s


## Menu / game text by key (data/strings.json). An unknown key is shown as it is.
func t(key: String, vars: Dictionary = {}) -> String:
	return _fill(str(strings.get(key, key)), vars)


## Task or item text, with {name} placeholders filled in. A missing text is empty.
func L(text: Variant, vars: Dictionary = {}) -> String:
	if text == null:
		return ""
	return _fill(str(text), vars)
