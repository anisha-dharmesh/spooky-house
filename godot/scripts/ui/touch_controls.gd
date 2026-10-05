class_name TouchControls
extends Control
## On-screen controls for phones and tablets: a floating stick on the left, Use / Hide / Sneak buttons on the
## right, and a drag on the right half turns the third-person camera.

var move_vec := Vector2.ZERO
var sneak_on := false
var cam_turn := 0.0

var _stick_finger := -1
var _stick_origin := Vector2.ZERO
var _stick_pos := Vector2.ZERO
var _cam_finger := -1
var _buttons: Array[Button] = []
var _sneak_btn: Button
const STICK_MAX := 80.0


func setup(logic_use: Callable, logic_hide: Callable) -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	var use := UIKit.button(GameData.t("use"), "primary", 30, logic_use)
	use.custom_minimum_size = Vector2(120, 120)
	_place(use, -150, -150)
	var hide_btn := UIKit.button(GameData.t("hide"), "dark", 22, logic_hide)
	hide_btn.custom_minimum_size = Vector2(88, 88)
	_place(hide_btn, -260, -110)
	_sneak_btn = UIKit.button(GameData.t("sneak"), "dark", 22, _toggle_sneak)
	_sneak_btn.custom_minimum_size = Vector2(88, 88)
	_place(_sneak_btn, -170, -260)
	_buttons = [use, hide_btn, _sneak_btn]


func _place(b: Button, dx: float, dy: float) -> void:
	add_child(b)
	b.anchor_left = 1.0
	b.anchor_right = 1.0
	b.anchor_top = 1.0
	b.anchor_bottom = 1.0
	b.offset_left = dx
	b.offset_top = dy
	b.offset_right = dx + b.custom_minimum_size.x
	b.offset_bottom = dy + b.custom_minimum_size.y


func _toggle_sneak() -> void:
	sneak_on = not sneak_on
	var on := sneak_on
	_sneak_btn.add_theme_stylebox_override("normal", UIKit.box(Color("bdbdb8") if on else Color(0.04, 0.04, 0.043, 0.88), UIKit.WHITE if on else UIKit.BORDER, 26, 3))
	for c in ["font_color", "font_hover_color", "font_pressed_color", "font_focus_color"]:
		_sneak_btn.add_theme_color_override(c, UIKit.BG if on else UIKit.WHITE)


func _over_button(p: Vector2) -> bool:
	for b in _buttons:
		if b.get_global_rect().grow(8).has_point(p):
			return true
	return false


func _input(event: InputEvent) -> void:
	var vs := get_viewport_rect().size
	if event is InputEventScreenTouch:
		var pos: Vector2 = event.position
		if event.pressed:
			if _over_button(pos):
				return
			if pos.x < vs.x * 0.5 and pos.y > vs.y * 0.3 and _stick_finger < 0:
				_stick_finger = event.index
				_stick_origin = pos
				_stick_pos = pos
			elif pos.x >= vs.x * 0.5 and _cam_finger < 0 and pos.y > vs.y * 0.15:
				_cam_finger = event.index
		else:
			if event.index == _stick_finger:
				_stick_finger = -1
				move_vec = Vector2.ZERO
			if event.index == _cam_finger:
				_cam_finger = -1
				cam_turn = 0.0
		queue_redraw()
	elif event is InputEventScreenDrag:
		if event.index == _stick_finger:
			_stick_pos = event.position
			var d: Vector2 = _stick_pos - _stick_origin
			move_vec = (d / STICK_MAX).limit_length(1.0)
			queue_redraw()
		elif event.index == _cam_finger:
			cam_turn = clampf(event.relative.x * 0.12, -1.5, 1.5)


func _process(_delta: float) -> void:
	cam_turn = lerpf(cam_turn, 0.0, 0.2)


func _draw() -> void:
	if _stick_finger >= 0:
		draw_circle(_stick_origin, STICK_MAX, Color(1, 1, 1, 0.1))
		draw_arc(_stick_origin, STICK_MAX, 0, TAU, 48, Color(1, 1, 1, 0.4), 2.0)
		draw_circle(_stick_origin + (_stick_pos - _stick_origin).limit_length(STICK_MAX), 32, Color(1, 1, 1, 0.35))
