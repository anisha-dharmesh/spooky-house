class_name RoomBackdrop
extends Node2D
## The room's empty background picture from the art pack (walls, floor, windows, doors), plus a paper label at each door
## and a trapdoor drawn where a door is in the floor. The furniture and the people are separate pictures on top.

const WOOD := Color("8a5a3c")
const DOOR_HOLE := Color("3a2740")

var view: RoomView
var _g: RoomGame
var _bg: Texture2D


func setup(v: RoomView) -> void:
	view = v
	_g = v.game
	_bg = PackArt.background(_g.room_id)
	z_index = -100
	queue_redraw()


func _draw() -> void:
	if _bg != null:
		draw_texture(_bg, Vector2.ZERO)
	else:
		draw_rect(Rect2(Vector2.ZERO, RoomCamera.SCREEN), Color("f7e3bd"))
	_lift()
	for d in _g.doors:
		_door(d)


## The lift door on a side wall (slanted like the wall), with a LIFT label above it.
func _lift() -> void:
	var tex := PackArt.sprite("lift")
	if _g.lift_wall.is_empty() or tex == null:
		return
	var v: float = _g.lift_wall.v
	var u := 0.0 if _g.lift_wall.side == "W" else _g.size.x
	var p0 := view.map(Vector2(u, v))
	var p1 := view.map(Vector2(u, v + 2.0))
	var sy := view.scale_at(v + 1.0) * 0.5
	var sz := tex.get_size()
	draw_set_transform_matrix(Transform2D((p1 - p0) / sz.x, Vector2(0, sy), p0 - Vector2(0, sy * sz.y)))
	draw_texture(tex, Vector2.ZERO)
	draw_set_transform_matrix(Transform2D.IDENTITY)
	_chip("LIFT", (p0 + p1) / 2.0 + Vector2(0, -sy * sz.y - 26.0), UIKit.PUMPKIN)


func _door(d: Dictionary) -> void:
	if d.lift:
		return
	var target: String = GameData.room(d.to).get("name", GameData.t("outside"))
	var mid: Vector2 = d.mid
	var base := view.map(mid)
	var rect: Rect2 = d.rect
	match str(d.side):
		"E", "W":
			_chip(target, base + Vector2(0, -250))
		"N":
			_chip(target, base + Vector2(0, -250))
		_:
			var q := PackedVector2Array([view.map(Vector2(rect.position.x, rect.position.y + 0.15)), view.map(Vector2(rect.end.x, rect.position.y + 0.15)),
				view.map(rect.end), view.map(Vector2(rect.position.x, rect.end.y))])
			draw_colored_polygon(_grow(q, 8.0), WOOD)
			draw_colored_polygon(q, DOOR_HOLE)
			for s in 3:
				var yy := rect.position.y + 0.15 + (rect.size.y - 0.15) * float(s + 1) / 4.0
				draw_line(view.map(Vector2(rect.position.x + 0.15, yy)), view.map(Vector2(rect.end.x - 0.15, yy)), Color("6a4a66"), 5.0)
			_chip(target, view.map(Vector2(mid.x, rect.position.y)) + Vector2(0, -34))


func _grow(p: PackedVector2Array, by: float) -> PackedVector2Array:
	var c := Vector2.ZERO
	for v in p:
		c += v
	c /= float(p.size())
	var out := PackedVector2Array()
	for v in p:
		out.append(v + (v - c).normalized() * by)
	return out


## A small paper label.
func _chip(text: String, at: Vector2, fill: Color = UIKit.PAPER) -> void:
	var font := UIKit.body_font()
	var size := 30
	var tw := font.get_string_size(text, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x
	var r := Rect2(at - Vector2(tw / 2.0 + 18.0, 21.0), Vector2(tw + 36.0, 42.0))
	draw_style_box(UIKit.card(fill, 20, 3), r)
	draw_string(font, Vector2(r.position.x + 18.0, r.position.y + 31.0), text, HORIZONTAL_ALIGNMENT_LEFT, -1, size, UIKit.INK)
