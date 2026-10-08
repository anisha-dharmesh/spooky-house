class_name MiniMap
extends Control
## A little plan of the house: floors stacked, rooms side by side. The room she is in glows and shows a dot where she
## stands; the room the task wants has a bouncing star; shut rooms have a padlock; stairs join the floors.

const PX_PER_M := 7.6
const ROW_H := 34.0
const ROW_GAP := 8.0
const LABEL_SIZE := 13

var game: RoomGame
var house_id := "gh"

var _rows: Array = []     # {id, rect, name} for every room, from the top floor down
var _lifts: Array = []    # {room, pos} of each lift stop, top floor first


func setup(g: RoomGame, p_house: String) -> void:
	game = g
	house_id = p_house
	_layout()


func _layout() -> void:
	var house: Dictionary = GameData.places_def.houses[house_id]
	var floors: Array = (house.floors as Array).duplicate()
	floors.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return int(a.index) > int(b.index))
	var cell_pos := {}   # room id -> Rect2
	var y := 4.0
	var widest := 0.0
	for f in floors:
		var x: float = 4.0 + float(f.get("x0", 0.0)) * PX_PER_M
		for id in f.rooms:
			var rw := float(GameData.room(id).size.w) * PX_PER_M
			var r := Rect2(x, y, rw - 3.0, ROW_H)
			cell_pos[id] = r
			_rows.append({"id": id, "rect": r, "name": GameData.room(id).name})
			x += rw
		widest = maxf(widest, x)
		y += ROW_H + ROW_GAP
	for s in HouseData.lift_stops(house_id):
		var r: Rect2 = cell_pos[s.room]
		var west: bool = s.side == "W"
		_lifts.append({"room": s.room, "pos": Vector2(r.position.x + 5.0 if west else r.end.x - 5.0, r.end.y - 9.0)})
	custom_minimum_size = Vector2(widest + 4.0, y - ROW_GAP + 4.0)


func _process(_dt: float) -> void:
	queue_redraw()


func _draw() -> void:
	if game == null:
		return
	var pulse := 0.5 + 0.5 * sin(Time.get_ticks_msec() / 260.0)
	var goal := game.objective_room()
	# the lift shaft joins the stops
	for i in range(_lifts.size() - 1):
		draw_line(_lifts[i].pos, _lifts[i + 1].pos, UIKit.INK, 7.0)
		draw_line(_lifts[i].pos, _lifts[i + 1].pos, Color("cbd5de"), 3.0)
	for c in _rows:
		var r: Rect2 = c.rect
		var here: bool = c.id == game.room_id
		var shut: bool = game.state.is_locked(c.id)
		var fill := UIKit.PAPER_DARK
		if here:
			fill = UIKit.PUMPKIN
		elif shut:
			fill = Color("b8aab5")
		elif game.state.visited.has(c.id):
			fill = Color("ffe9b8")
		else:
			fill = Color("e3d3f2")
		draw_style_box(UIKit.box(fill, UIKit.INK, 8, 2), r)
		if here:
			draw_rect(r.grow(3.0 + pulse * 2.0), Color(1, 0.84, 0.36, 0.55 - pulse * 0.25), false, 3.0)
		var font := UIKit.body_font()
		var name_color := UIKit.INK if not shut else Color("6f6275")
		draw_string(font, r.position + Vector2(6.0, 14.0), str(c.name), HORIZONTAL_ALIGNMENT_LEFT, r.size.x - 8.0, LABEL_SIZE, name_color)
		if shut:
			_padlock(r.get_center() + Vector2(0, 7.0))
		if c.id == goal and not here:
			_star(r.get_center() + Vector2(0, 6.0 - pulse * 3.0), 9.0)
		if here:
			var q: Vector2 = game.pos / game.size
			var dot := Vector2(lerpf(r.position.x + 8.0, r.end.x - 8.0, q.x), lerpf(r.position.y + 19.0, r.end.y - 5.0, q.y))
			draw_circle(dot, 5.5, UIKit.INK)
			draw_circle(dot, 3.5, Color.WHITE)
	_draw_lifts()


func _draw_lifts() -> void:
	for l in _lifts:
		_lift_icon(l.pos)


func _lift_icon(p: Vector2) -> void:
	draw_rect(Rect2(p - Vector2(5, 8), Vector2(10, 16)), Color("cbd5de"))
	draw_rect(Rect2(p - Vector2(5, 8), Vector2(10, 16)), UIKit.INK, false, 2.0)
	draw_line(p + Vector2(0, -6), p + Vector2(0, 6), UIKit.INK, 1.5)


func _padlock(c: Vector2) -> void:
	draw_arc(c + Vector2(0, -3.0), 4.5, PI, TAU, 10, UIKit.INK, 2.0)
	draw_rect(Rect2(c + Vector2(-6, -3), Vector2(12, 9)), UIKit.INK)


func _star(c: Vector2, rad: float) -> void:
	var pts := PackedVector2Array()
	for k in 10:
		var a := -PI / 2.0 + k * PI / 5.0
		pts.append(c + Vector2(cos(a), sin(a)) * (rad if k % 2 == 0 else rad * 0.45))
	draw_colored_polygon(pts, UIKit.SUN)
	pts.append(pts[0])
	draw_polyline(pts, UIKit.INK, 2.0, true)
