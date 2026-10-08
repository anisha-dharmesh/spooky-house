class_name PackArt
extends RefCounted
## The colourful art pack (assets/pack/, from anisha-house-fixed-view.zip): item pictures (drawn at 2x), the characters,
## each room's empty background picture and its layout (where every item is drawn, back to front).

const DIR := "res://assets/pack/"

static var _tex := {}
static var _manifest := {}
static var _rooms := {}


static func _texture(path: String) -> Texture2D:
	if not _tex.has(path):
		_tex[path] = load(path) if ResourceLoader.exists(path) else null
	return _tex[path]


## An item's picture (front view, ground line at the bottom), drawn at 2x: show it at half the scale the room file gives.
static func sprite(id: String) -> Texture2D:
	return _texture(DIR + "sprites/%s.png" % id)


static func character(id: String) -> Texture2D:
	return _texture(DIR + "characters/%s.png" % id)


## The room's walls and floor, with no furniture in them (1600 x 900).
static func background(room_id: String) -> Texture2D:
	return _texture(DIR + "rooms/%s_bg.png" % room_id)


## The pack's room file: camera, drawOrder (every item: sprite, kind, x, y, scale, z...). {} if the room has none.
static func room(room_id: String) -> Dictionary:
	if not _rooms.has(room_id):
		var f := FileAccess.open(DIR + "rooms/%s.json" % room_id, FileAccess.READ)
		var parsed: Variant = JSON.parse_string(f.get_as_text()) if f != null else null
		_rooms[room_id] = parsed if parsed is Dictionary else {}
	return _rooms[room_id]


## Name, footprint and tags of an item from manifest.json ({} if unknown).
static func item_info(id: String) -> Dictionary:
	if _manifest.is_empty():
		var f := FileAccess.open(DIR + "manifest.json", FileAccess.READ)
		var parsed: Variant = JSON.parse_string(f.get_as_text()) if f != null else null
		if parsed is Dictionary:
			for it in parsed.items:
				_manifest[it.id] = it
	return _manifest.get(id, {})
