class_name WorldData
extends RefCounted
## What the whole world looks like on the floor plan (all in metres). Built by WorldBuilder.

var bounds := Rect2()
var rooms: Array[Dictionary] = []      # {id, name, ground, location, outdoor, interior: Rect2}
var origins := {}                      # room id -> Vector2: where the room's top-left corner is in the world
var walls: Array[Rect2] = []           # wall pieces, with gaps where doors are
var wall_rooms: Array[String] = []     # the room each wall piece belongs to (same order as walls)
var doorways: Array[Rect2] = []        # doors (drawn as a gap)
var doors: Array[Dictionary] = []      # {room, to, rect}: every doorway, so a locked room can close it
var solids: Array[Rect2] = []          # furniture you can't walk through (also blocks sight)
var sprites: Array[Dictionary] = []    # {uid, frame, name, rect, angle, tags, host, room}
var pickups: Array[Dictionary] = []    # {uid, frame, name, rect}
var targets: Array[Dictionary] = []    # {id, rect, label, kind}
var hides: Array[Dictionary] = []      # {uid, name, rect}
var safes: Array[Rect2] = []
var respawn := Vector2.ZERO            # where Anisha starts, and where she wakes up when she is caught


## An item's id in the world is "room id/uid in the room's file", for example "gh_kitchen/cement_bag_1",
## because the same uid can appear in different rooms.
static func gid(room_id: String, uid: String) -> String:
	return "%s/%s" % [room_id, uid]


## A place given as {room, tile: [x, y]} in world metres.
func spot(s: Dictionary) -> Vector2:
	var o: Vector2 = origins[s.room]
	return Vector2(o.x + float(s.tile[0]), o.y + float(s.tile[1]))


func room_by_id(id: String) -> Dictionary:
	for r in rooms:
		if r.id == id:
			return r
	return {}


## The room a point is in, or {} (in a doorway or outside).
func room_at(p: Vector2) -> Dictionary:
	for r in rooms:
		if Geo.point_in_rect(p, r.interior):
			return r
	return {}


## Everything the player cannot walk through. `locked` is a set of room ids that are shut: their doors count as walls.
func blockers(locked: Dictionary = {}) -> Array[Rect2]:
	var out: Array[Rect2] = []
	out.append_array(walls)
	out.append_array(solids)
	for d in closed_doors(locked):
		out.append(d.rect)
	return out


## The doorways that lead into or out of a locked room.
func closed_doors(locked: Dictionary = {}) -> Array[Dictionary]:
	var out: Array[Dictionary] = []
	if locked.is_empty():
		return out
	for d in doors:
		if locked.has(d.room) or locked.has(d.to):
			out.append(d)
	return out
