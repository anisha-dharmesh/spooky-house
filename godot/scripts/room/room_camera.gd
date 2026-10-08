class_name RoomCamera
extends RefCounted
## The fixed room camera from the art pack: where a spot on the floor (u across, v deep, in tiles) is on the 1600 x 900
## picture, and how big things are there. (The numbers are in each room's file under "camera".)
##   t = v / D * depthShown      k = 1 + perspective * t
##   x = 800 + (u - W/2) * pxPerTileBack * k      y = floorBackY + t * (900 - floorBackY)
##   scale = pxPerTileBack * k / 64              (for the 1x pictures; the files here are 2x, so use half)

const SCREEN := Vector2(1600, 900)

var width := 14.0      # W: the room's size in tiles
var depth := 9.0       # D
var px_back := 78.57
var floor_back_y := 415.7
var perspective := 0.4
var depth_shown := 0.9


func _init(room_size: Vector2, cam: Dictionary = {}) -> void:
	width = room_size.x
	depth = room_size.y
	px_back = float(cam.get("pxPerTileBack", px_back))
	floor_back_y = float(cam.get("floorBackY", floor_back_y))
	perspective = float(cam.get("perspective", perspective))
	depth_shown = float(cam.get("depthShown", depth_shown))


func _t(v: float) -> float:
	return v / depth * depth_shown


func k_at(v: float) -> float:
	return 1.0 + perspective * _t(v)


func map(p: Vector2) -> Vector2:
	var t := _t(p.y)
	return Vector2(SCREEN.x / 2.0 + (p.x - width / 2.0) * px_back * k_at(p.y), floor_back_y + t * (SCREEN.y - floor_back_y))


## Screen point on the floor back to a floor spot (u, v).
func unmap(sp: Vector2) -> Vector2:
	var t := (sp.y - floor_back_y) / (SCREEN.y - floor_back_y)
	var v := t * depth / depth_shown
	return Vector2(width / 2.0 + (sp.x - SCREEN.x / 2.0) / (px_back * (1.0 + perspective * t)), v)


## Size of the 1x pictures at this depth (the 2x files are drawn at half of it).
func scale_at(v: float) -> float:
	return px_back * k_at(v) / 64.0
