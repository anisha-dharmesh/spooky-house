class_name LiftView
extends Control
## Inside the lift: the doors in front of her, the floor display above them and a panel of floor buttons on the right.
## Tap a floor and the doors close, the display counts the floors, and the doors open there. Shut floors have a padlock.
## Floors are joined by this lift only (no stairs).

signal chosen(room_id: String)   # the doors have opened on this floor's room
signal stepped_out               # she stayed on this floor

var stops: Array = []             # top floor first
var from_room := ""
var state: RunState

var _at := 0                      # index in stops of the floor the lift is on
var _shown := 0                   # index of the floor the display shows while riding
var _arrow := 0                   # 1 going up, -1 going down, 0 still
var _open := 0.0                  # 0 doors shut, 1 doors open
var _riding := false
var _shake := Vector2.ZERO
var _buttons: Array = []
var _note: Label
var _note_tween: Tween
var _t := 0.0


func setup(p_from_room: String, p_state: RunState) -> void:
	from_room = p_from_room
	state = p_state
	stops = HouseData.lift_stops(HouseData.house_of(p_from_room))
	for i in stops.size():
		if stops[i].room == p_from_room:
			_at = i
	_shown = _at
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	for i in stops.size():
		var b := FloorButton.new()
		var room_name: String = GameData.room(stops[i].room).get("name", stops[i].room)
		b.setup(str(stops[i].label), room_name, i == _at, state.is_locked(stops[i].room))
		b.picked.connect(_pick.bind(i))
		add_child(b)
		_buttons.append(b)
	var out := UIKit.button(GameData.t("stepOut"), "ghost", 28, func() -> void: stepped_out.emit(), 22)
	out.custom_minimum_size = Vector2(230, 64)
	add_child(out)
	out.set_anchors_and_offsets_preset(Control.PRESET_CENTER_BOTTOM, Control.PRESET_MODE_MINSIZE)
	out.grow_horizontal = Control.GROW_DIRECTION_BOTH
	out.grow_vertical = Control.GROW_DIRECTION_BEGIN
	out.offset_top -= 18
	out.offset_bottom -= 18
	_note = UIKit.label("", 28, UIKit.PAPER)
	_note.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_note.set_anchors_and_offsets_preset(Control.PRESET_CENTER_BOTTOM, Control.PRESET_MODE_MINSIZE)
	_note.grow_horizontal = Control.GROW_DIRECTION_BOTH
	_note.grow_vertical = Control.GROW_DIRECTION_BEGIN
	_note.offset_top -= 100
	_note.offset_bottom -= 100
	_note.modulate.a = 0.0
	add_child(_note)
	_layout()
	resized.connect(_layout)
	var tw := create_tween()
	tw.tween_property(self, "_open", 1.0, 0.6)


func _car() -> Rect2:
	return Rect2(size.x / 2.0 - 430.0, 24.0, 860.0, 590.0)


func _doors() -> Rect2:
	var c := _car()
	return Rect2(c.position.x + 100.0, c.position.y + 170.0, 340.0, 340.0)


func _layout() -> void:
	var c := _car()
	var n := _buttons.size()
	for i in n:
		var b: Control = _buttons[i]
		b.position = Vector2(c.end.x - 290.0, c.position.y + 130.0 + i * 100.0) + _shake
		b.size = Vector2(250, 84)


func _pick(i: int) -> void:
	if _riding:
		return
	if state.is_locked(stops[i].room):
		_say(GameData.t("doorLocked"))
		return
	if i == _at:
		return
	_ride(i)


func _say(text: String) -> void:
	_note.text = text
	if _note_tween != null:
		_note_tween.kill()
	_note.modulate.a = 1.0
	_note_tween = create_tween()
	_note_tween.tween_interval(2.0)
	_note_tween.tween_property(_note, "modulate:a", 0.0, 0.4)


func _ride(target: int) -> void:
	_riding = true
	for b in _buttons:
		b.enabled = false
	var close := create_tween()
	close.tween_property(self, "_open", 0.0, 0.55)
	await close.finished
	var step := 1 if target > _shown else -1
	_arrow = -step   # a lower index is a higher floor
	while _shown != target:
		await get_tree().create_timer(0.75).timeout
		_shown += step
	_arrow = 0
	_at = target
	await get_tree().create_timer(0.25).timeout
	var open := create_tween()
	open.tween_property(self, "_open", 1.0, 0.65)
	await open.finished
	await get_tree().create_timer(0.35).timeout
	chosen.emit(stops[target].room)


func _unhandled_key_input(event: InputEvent) -> void:
	if event.is_action_pressed("pause") and not _riding:
		stepped_out.emit()


func _process(delta: float) -> void:
	_t += delta
	if _riding and _arrow != 0:
		_shake = Vector2(sin(_t * 47.0) * 2.5, cos(_t * 39.0) * 2.0)
	else:
		_shake = Vector2.ZERO
	_layout()
	for i in _buttons.size():
		(_buttons[i] as FloorButton).current = i == _at
	queue_redraw()


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(0.1, 0.06, 0.16, 0.82))
	var c := _car()
	c.position += _shake
	# the car: a steel frame, walls, a floor
	draw_style_box(UIKit.card(Color("8a98a6"), 40, 5), c)
	var inner := c.grow(-22.0)
	draw_style_box(UIKit.box(Color("cbd5de"), UIKit.INK, 26, 3), inner)
	var floor_r := Rect2(inner.position.x, inner.end.y - 60.0, inner.size.x, 60.0)
	for i in int(floor_r.size.x / 60.0) + 1:
		draw_rect(Rect2(floor_r.position.x + i * 60.0, floor_r.position.y, 60.0, 60.0).intersection(floor_r), Color("8d7a9e") if i % 2 == 0 else Color("a592b3"))
	draw_line(Vector2(inner.position.x, floor_r.position.y), Vector2(inner.end.x, floor_r.position.y), UIKit.INK, 4.0)
	_door_area()
	_display(c)
	_panel(c)


func _door_area() -> void:
	var d := _doors()
	d.position += _shake
	# what is outside: a bright hallway, with the room's name
	var room: String = stops[_at].room
	var outside_name: String = GameData.room(room).get("name", room)
	draw_rect(d, Color("fff0cf"))
	draw_rect(Rect2(d.position.x, d.end.y - 70.0, d.size.x, 70.0), Color("e9cfa0"))
	if _open > 0.05 and not _riding or _open > 0.9:
		var font := UIKit.body_font()
		draw_string(font, d.position + Vector2(0, 150.0), outside_name, HORIZONTAL_ALIGNMENT_CENTER, d.size.x, 40, UIKit.INK)
		draw_string(font, d.position + Vector2(0, 200.0), GameData.t("floorWord", {"f": str(stops[_at].label)}), HORIZONTAL_ALIGNMENT_CENTER, d.size.x, 28, UIKit.PUMPKIN_DARK)
	# the two sliding doors
	var half := d.size.x / 2.0
	var slide := half * (1.0 - _open)
	var left := Rect2(d.position.x, d.position.y, slide, d.size.y)
	var right := Rect2(d.end.x - slide, d.position.y, slide, d.size.y)
	for p in [left, right]:
		if (p as Rect2).size.x > 1.0:
			draw_rect(p, Color("b4bfc9"))
			draw_rect(p, UIKit.INK, false, 4.0)
			draw_line(p.position + Vector2(10, 14), p.position + Vector2(10, p.size.y - 14), Color("d7e0e8"), 6.0)
	draw_rect(d.grow(8.0), UIKit.INK, false, 6.0)


func _display(c: Rect2) -> void:
	var d := _doors()
	var box := Rect2(d.position.x + d.size.x / 2.0 - 110.0, c.position.y + 52.0, 220.0, 92.0)
	box.position += _shake
	draw_style_box(UIKit.box(UIKit.INK, Color("5b4670"), 22, 4), box)
	var label := str(stops[_shown].label)
	draw_string(UIKit.title_font(), box.position + Vector2(0, 72.0), label, HORIZONTAL_ALIGNMENT_CENTER, box.size.x, 66, UIKit.SUN)
	# arrows: lit while she moves that way
	var up := PackedVector2Array([box.position + Vector2(36, 62), box.position + Vector2(52, 30), box.position + Vector2(68, 62)])
	var down := PackedVector2Array([box.position + Vector2(box.size.x - 68, 30), box.position + Vector2(box.size.x - 52, 62), box.position + Vector2(box.size.x - 36, 30)])
	draw_colored_polygon(up, UIKit.MINT if _arrow > 0 else Color("4a3a55"))
	draw_colored_polygon(down, UIKit.BERRY if _arrow < 0 else Color("4a3a55"))


func _panel(c: Rect2) -> void:
	var r := Rect2(c.end.x - 320.0, c.position.y + 92.0, 285.0, maxf(240.0, _buttons.size() * 100.0 + 80.0))
	r.position += _shake
	draw_style_box(UIKit.card(Color("aab6c1"), 28, 4), r)


## A round floor button with the floor's name beside it.
class FloorButton extends Control:
	signal picked

	var label := ""
	var room_name := ""
	var current := false
	var locked := false
	var enabled := true

	func setup(p_label: String, p_room: String, p_current: bool, p_locked: bool) -> void:
		label = p_label
		room_name = p_room
		current = p_current
		locked = p_locked
		mouse_filter = Control.MOUSE_FILTER_STOP
		mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND

	func _gui_input(event: InputEvent) -> void:
		if enabled and event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
			picked.emit()

	func _draw() -> void:
		var c := Vector2(42, 42)
		var fill := Color("f7f1e4")
		if current:
			fill = UIKit.SUN
		elif locked:
			fill = Color("9c9aa6")
		draw_circle(c + Vector2(0, 4), 38.0, Color(0, 0, 0, 0.25))
		draw_circle(c, 38.0, fill)
		draw_arc(c, 38.0, 0.0, TAU, 32, UIKit.INK, 4.0, true)
		var font := UIKit.title_font()
		draw_string(font, Vector2(0, 55), label, HORIZONTAL_ALIGNMENT_CENTER, 84.0, 42, UIKit.INK if not locked else Color("5e5a68"))
		var name_color := UIKit.INK if not locked else Color("6f6a78")
		draw_string(UIKit.body_font(), Vector2(92, 52), room_name, HORIZONTAL_ALIGNMENT_LEFT, 150.0, 24, name_color)
		if locked:
			var p := c + Vector2(26, 24)
			draw_arc(p + Vector2(0, -2), 7.0, PI, TAU, 10, UIKit.INK, 3.0)
			draw_rect(Rect2(p + Vector2(-9, -2), Vector2(18, 14)), UIKit.INK)
