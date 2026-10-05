class_name WorldData
extends RefCounted
## What a level looks like on the floor plan (all in metres). Built by WorldBuilder.

var bounds := Rect2()
var rooms: Array[Dictionary] = []      # {id, name, ground, interior: Rect2}
var walls: Array[Rect2] = []           # wall pieces, with gaps where doors are open
var doorways: Array[Rect2] = []        # open doors (drawn as a gap)
var solids: Array[Rect2] = []          # furniture you can't walk through (also blocks sight)
var sprites: Array[Dictionary] = []    # {uid, frame, name, rect, angle, tags, host}
var pickups: Array[Dictionary] = []    # {uid, frame, name, rect}
var targets: Array[Dictionary] = []    # {id, rect, label, kind}
var hides: Array[Dictionary] = []      # {uid, name, rect}
var safes: Array[Rect2] = []
var exits: Array[Dictionary] = []      # {id, rect, label, side}
var spawn := Vector2.ZERO
var baddies: Array[Dictionary] = []    # {id, patrol: [{pos: Vector2, wait: float}]}


## Everything the player cannot walk through.
func blockers() -> Array[Rect2]:
	var out: Array[Rect2] = []
	out.append_array(walls)
	out.append_array(solids)
	return out
