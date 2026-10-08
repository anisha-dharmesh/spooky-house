class_name RunState
extends RefCounted
## What carries on from room to room while she plays: what she holds, what has been taken, how far the task is, the rooms
## she has been in and which rooms are still shut.

var task_id := 1
var inventory: Array = []     # ids like "gh_kitchen/cement_bag_1"
var taken := {}               # id -> true, for things picked up (they stay gone)
var sprites := {}             # id -> the item's picture name, so the carried things show in any room
var step_index := 0
var visited := {}
var locked: Array = []


func _init(p_task_id: int = 1) -> void:
	task_id = p_task_id
	locked = (GameData.places_def.get("lockedAtStart", []) as Array).duplicate()


## Is this room shut? A floor's lift button is shut when the room the lift opens into is.
func is_locked(room_id: String) -> bool:
	return locked.has(room_id)
