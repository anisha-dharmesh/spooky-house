class_name HouseData
extends RefCounted
## What data/places.json says about the houses: which rooms are on which floor, and where the lift stops. Floors are joined
## by a lift only (no stairs): each house has a list of stops, one room per floor, with the lift door on a side wall.


static func houses() -> Dictionary:
	return GameData.places_def.get("houses", {})


## The id of the house this room is in ("" for a room outside the houses).
static func house_of(room_id: String) -> String:
	var all := houses()
	for id in all:
		for f in all[id].floors:
			if (f.rooms as Array).has(room_id):
				return id
	return ""


## The lift's stops of a house, top floor first: {floor, room, side, v, label}.
static func lift_stops(house_id: String) -> Array:
	var stops: Array = (houses().get(house_id, {}).get("lift", {}).get("stops", []) as Array).duplicate()
	stops.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return int(a.floor) > int(b.floor))
	return stops


## The lift stop in this room ({} if the room has no lift door).
static func lift_stop(room_id: String) -> Dictionary:
	for s in lift_stops(house_of(room_id)):
		if s.room == room_id:
			return s
	return {}
