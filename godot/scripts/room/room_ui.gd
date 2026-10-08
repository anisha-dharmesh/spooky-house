class_name RoomUI
extends Control
## Everything on top of the room: the task card (top left), the seen meter (top middle), the mini map (top right), what she
## is carrying (bottom middle), the big action button and the sneak button (bottom right), little messages, and the
## "caught" card. Big round buttons, so thumbs can hit them.

signal restart_requested

var game: RoomGame
var view: RoomView

var _steps_box: VBoxContainer
var _expanded := false   # the task card shows only the step she is on, until she taps it
var _task_title: Label
var _meter: SeenMeter
var _map: MiniMap
var _slots: Array[Control] = []
var _action: Button
var _action_hint: PanelContainer
var _action_hint_label: Label
var _sneak: Button
var _toast: PanelContainer
var _toast_label: Label
var _toast_tween: Tween
var _keys: PanelContainer
var _caught: Control


func setup(g: RoomGame, v: RoomView, touch: bool) -> void:
	game = g
	view = v
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_vignette()
	_build_task_card()
	_build_meter()
	_build_map()
	_build_slots()
	_build_buttons()
	_build_toast()
	if not touch:
		_build_keys()
	game.steps_changed.connect(_refresh_steps)
	game.inventory_changed.connect(_refresh_slots)
	game.toast.connect(show_toast)
	game.caught.connect(_show_caught)
	_refresh_steps()
	_refresh_slots()


## Dark corners, so the room feels like a spooky house at night.
func _vignette() -> void:
	var tex := GradientTexture2D.new()
	tex.width = 256
	tex.height = 256
	tex.fill = GradientTexture2D.FILL_RADIAL
	tex.fill_from = Vector2(0.5, 0.5)
	tex.fill_to = Vector2(1.0, 0.5)
	var grad := Gradient.new()
	grad.offsets = PackedFloat32Array([0.0, 0.62, 1.0])
	grad.colors = PackedColorArray([Color(0.1, 0.04, 0.16, 0.0), Color(0.1, 0.04, 0.16, 0.0), Color(0.1, 0.04, 0.16, 0.2)])
	tex.gradient = grad
	var r := TextureRect.new()
	r.texture = tex
	r.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	r.stretch_mode = TextureRect.STRETCH_SCALE
	r.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	r.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(r)


## Puts a control in a corner or edge of the screen at its own size, `dx` / `dy` in from the edge.
func _place(c: Control, preset: int, dx: float, dy: float) -> void:
	c.set_anchors_and_offsets_preset(preset, Control.PRESET_MODE_MINSIZE)
	if preset in [Control.PRESET_TOP_RIGHT, Control.PRESET_BOTTOM_RIGHT]:
		c.grow_horizontal = Control.GROW_DIRECTION_BEGIN
	elif preset in [Control.PRESET_CENTER_TOP, Control.PRESET_CENTER_BOTTOM]:
		c.grow_horizontal = Control.GROW_DIRECTION_BOTH
	if preset in [Control.PRESET_BOTTOM_RIGHT, Control.PRESET_CENTER_BOTTOM, Control.PRESET_BOTTOM_LEFT]:
		c.grow_vertical = Control.GROW_DIRECTION_BEGIN
	c.offset_left += dx
	c.offset_right += dx
	c.offset_top += dy
	c.offset_bottom += dy


func _build_task_card() -> void:
	var card := PanelContainer.new()
	card.add_theme_stylebox_override("panel", UIKit.card())
	card.custom_minimum_size = Vector2(290, 0)
	card.mouse_filter = Control.MOUSE_FILTER_STOP
	card.gui_input.connect(func(ev: InputEvent) -> void:
		if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
			_expanded = not _expanded
			_refresh_steps())
	add_child(card)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 2)
	card.add_child(col)
	var pill := PanelContainer.new()
	pill.add_theme_stylebox_override("panel", UIKit.box(UIKit.PUMPKIN, UIKit.INK, 14, 2))
	pill.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	pill.add_child(UIKit.label(GameData.t("task", {"n": int(game.task.get("id", 1))}).to_upper(), 16))
	col.add_child(pill)
	_task_title = UIKit.label(GameData.L(game.task.get("task", "")), 22)
	_task_title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_task_title.custom_minimum_size = Vector2(258, 0)
	col.add_child(_task_title)
	_steps_box = VBoxContainer.new()
	_steps_box.add_theme_constant_override("separation", 5)
	col.add_child(_steps_box)
	_place(card, Control.PRESET_CENTER_TOP, 0, 20)
	card.grow_horizontal = Control.GROW_DIRECTION_BOTH


func _build_meter() -> void:
	_meter = SeenMeter.new()
	_meter.game = game
	_meter.custom_minimum_size = Vector2(260, 46)
	add_child(_meter)
	_place(_meter, Control.PRESET_TOP_LEFT, 20, 20)


func _build_map() -> void:
	var card := PanelContainer.new()
	card.add_theme_stylebox_override("panel", UIKit.card())
	card.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(card)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 4)
	card.add_child(col)
	var house := HouseData.house_of(game.room_id)
	col.add_child(UIKit.label(str(HouseData.houses().get(house, {}).get("name", "")), 18, UIKit.PUMPKIN_DARK))
	_map = MiniMap.new()
	_map.setup(game, house)
	col.add_child(_map)
	_place(card, Control.PRESET_TOP_RIGHT, -20, 20)


func _build_slots() -> void:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	add_child(row)
	for i in RoomGame.MAX_ITEMS:
		var slot := PanelContainer.new()
		slot.custom_minimum_size = Vector2(76, 76)
		slot.add_theme_stylebox_override("panel", UIKit.card(UIKit.PAPER_DARK, 20, 3))
		slot.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var pic := TextureRect.new()
		pic.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		pic.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		pic.mouse_filter = Control.MOUSE_FILTER_IGNORE
		slot.add_child(pic)
		row.add_child(slot)
		_slots.append(slot)
	_place(row, Control.PRESET_CENTER_BOTTOM, 0, -18)


func _build_buttons() -> void:
	_action = UIKit.button("", "primary", 28, func() -> void: game.do_action(), 70)
	_action.custom_minimum_size = Vector2(140, 140)
	_action.add_theme_color_override("font_disabled_color", Color("b8a58a"))
	add_child(_action)
	_place(_action, Control.PRESET_BOTTOM_RIGHT, -24, -24)
	_action_hint = PanelContainer.new()
	_action_hint.add_theme_stylebox_override("panel", UIKit.card(UIKit.PAPER, 16, 2))
	_action_hint.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_action_hint_label = UIKit.label("", 20)
	_action_hint.add_child(_action_hint_label)
	add_child(_action_hint)
	_action_hint.grow_horizontal = Control.GROW_DIRECTION_BEGIN
	_place(_action_hint, Control.PRESET_BOTTOM_RIGHT, -24, -176)
	_sneak = UIKit.button(GameData.t("sneak"), "dark", 20, _toggle_sneak, 48)
	_sneak.custom_minimum_size = Vector2(96, 96)
	add_child(_sneak)
	_place(_sneak, Control.PRESET_BOTTOM_RIGHT, -184, -24)


func _toggle_sneak() -> void:
	view.sneak_toggle = not view.sneak_toggle


func _build_toast() -> void:
	_toast = PanelContainer.new()
	_toast.add_theme_stylebox_override("panel", UIKit.card(UIKit.PAPER, 22, 3))
	_toast.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_toast_label = UIKit.label("", 26)
	_toast.add_child(_toast_label)
	_toast.modulate.a = 0.0
	_toast_label.text = "Hello there"
	add_child(_toast)
	_place(_toast, Control.PRESET_CENTER_BOTTOM, 0, -112)
	_toast.grow_horizontal = Control.GROW_DIRECTION_BOTH


func _build_keys() -> void:
	_keys = PanelContainer.new()
	_keys.add_theme_stylebox_override("panel", UIKit.box(Color(0.2, 0.14, 0.23, 0.78), Color(0, 0, 0, 0), 14, 0))
	_keys.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_keys.add_child(UIKit.label(GameData.t("keysRoom"), 17, UIKit.PAPER))
	add_child(_keys)
	_place(_keys, Control.PRESET_TOP_LEFT, 20, 76)
	var tw := create_tween()
	tw.tween_interval(14.0)
	tw.tween_property(_keys, "modulate:a", 0.0, 1.5)


# ---------------------------------------------------------------- updates

func _process(_dt: float) -> void:
	var a := game.current_action()
	var kind: String = a.get("kind", "")
	_action.disabled = kind == ""
	match kind:
		"grab":
			_action.text = GameData.t("use")
			_action_hint_label.text = GameData.t("grab", {"item": a.item.name})
		"hide":
			_action.text = GameData.t("hide")
			_action_hint_label.text = GameData.t("hideHere")
		"unhide":
			_action.text = GameData.t("getOut")
			_action_hint_label.text = GameData.t("getOut")
		_:
			_action.text = GameData.t("use")
			_action_hint_label.text = ""
	_action_hint.visible = kind != ""
	_sneak.modulate = Color(1, 1, 1, 1) if view.sneak_toggle else Color(1, 1, 1, 0.85)
	_sneak.add_theme_stylebox_override("normal", UIKit.card(UIKit.PUMPKIN if view.sneak_toggle else UIKit.INK, 48))
	for c in ["font_color", "font_hover_color", "font_pressed_color"]:
		_sneak.add_theme_color_override(c, UIKit.INK if view.sneak_toggle else UIKit.PAPER)


func _refresh_steps() -> void:
	for c in _steps_box.get_children():
		c.queue_free()
	var steps: Array = game.task.get("steps", [])
	var now := mini(game.step_index, steps.size() - 1)
	for i in steps.size():
		if not _expanded and i != now:
			continue
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 10)
		var check := StepCheck.new()
		check.state = 2 if i < game.step_index else (1 if i == game.step_index else 0)
		row.add_child(check)
		var color := UIKit.INK if i <= game.step_index else UIKit.MUTED
		var l := UIKit.label(GameData.L(steps[i].text), 19, color)
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		l.custom_minimum_size = Vector2(212, 0)
		l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(l)
		_steps_box.add_child(row)
	if not _expanded and steps.size() > 1:
		_steps_box.add_child(UIKit.label(GameData.t("allSteps"), 15, UIKit.MUTED))


func _refresh_slots() -> void:
	for i in _slots.size():
		var pic: TextureRect = _slots[i].get_child(0)
		pic.texture = null
		if i < game.inventory.size():
			pic.texture = PackArt.sprite(str(game.state.sprites.get(game.inventory[i], "")))


func show_toast(text: String) -> void:
	_toast_label.text = text
	if _toast_tween != null:
		_toast_tween.kill()
	_toast.modulate.a = 1.0
	_toast_tween = create_tween()
	_toast_tween.tween_interval(2.2)
	_toast_tween.tween_property(_toast, "modulate:a", 0.0, 0.5)


func _show_caught(by_name: String) -> void:
	_caught = ColorRect.new()
	(_caught as ColorRect).color = Color(0.1, 0.04, 0.16, 0.7)
	_caught.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(_caught)
	var card := PanelContainer.new()
	card.add_theme_stylebox_override("panel", UIKit.card(UIKit.PAPER, 30, 4))
	card.set_anchors_preset(Control.PRESET_CENTER)
	card.grow_horizontal = Control.GROW_DIRECTION_BOTH
	card.grow_vertical = Control.GROW_DIRECTION_BOTH
	_caught.add_child(card)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 12)
	col.alignment = BoxContainer.ALIGNMENT_CENTER
	card.add_child(col)
	var t := UIKit.label(GameData.t("caught"), 84, UIKit.BERRY, true)
	t.add_theme_color_override("font_outline_color", UIKit.INK)
	t.add_theme_constant_override("outline_size", 12)
	t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(t)
	var s := UIKit.label(GameData.t("sawYou", {"name": by_name}), 28)
	s.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(s)
	var b := UIKit.button(GameData.t("tryAgain"), "primary", 32, func() -> void: restart_requested.emit(), 22)
	b.custom_minimum_size = Vector2(260, 68)
	b.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	col.add_child(b)


## A round tick-box for a step of the task.
class StepCheck extends Control:
	var state := 0   # 0 later, 1 now, 2 done

	func _init() -> void:
		custom_minimum_size = Vector2(26, 26)
		mouse_filter = Control.MOUSE_FILTER_IGNORE

	func _draw() -> void:
		var c := Vector2(13, 14)
		if state == 2:
			draw_circle(c, 12.0, UIKit.MINT)
			draw_arc(c, 12.0, 0.0, TAU, 24, UIKit.INK, 2.5, true)
			draw_polyline(PackedVector2Array([c + Vector2(-5, 0), c + Vector2(-1.5, 4), c + Vector2(6, -4)]), UIKit.INK, 3.0, true)
		elif state == 1:
			draw_circle(c, 12.0, UIKit.SUN)
			draw_arc(c, 12.0, 0.0, TAU, 24, UIKit.INK, 2.5, true)
			draw_circle(c, 4.0, UIKit.INK)
		else:
			draw_arc(c, 11.0, 0.0, TAU, 24, UIKit.MUTED, 2.5, true)


## "Seen": an eye and a bar that fills as a baddie notices her.
class SeenMeter extends Control:
	var game: RoomGame

	func _process(_dt: float) -> void:
		queue_redraw()

	func _draw() -> void:
		var danger := game.meter
		var pulse := 0.5 + 0.5 * sin(Time.get_ticks_msec() / 90.0) if danger > 0.6 else 0.0
		draw_style_box(UIKit.card(UIKit.PAPER, 22, 3), Rect2(Vector2.ZERO, size))
		# the eye
		var c := Vector2(30, size.y / 2.0)
		var open := 0.35 + 0.65 * minf(1.0, danger * 1.6)
		var pts := PackedVector2Array()
		for i in 21:
			var t := float(i) / 20.0
			pts.append(c + Vector2(lerpf(-16.0, 16.0, t), -sin(t * PI) * 11.0 * open))
		for i in 21:
			var t := 1.0 - float(i) / 20.0
			pts.append(c + Vector2(lerpf(-16.0, 16.0, t), sin(t * PI) * 11.0 * open))
		draw_colored_polygon(pts, Color.WHITE)
		pts.append(pts[0])
		draw_polyline(pts, UIKit.INK, 2.5, true)
		draw_circle(c, 5.5 * (0.6 + 0.4 * open), UIKit.BERRY if danger > 0.05 else UIKit.INK)
		# the bar
		var bar := Rect2(58, size.y / 2.0 - 8.0, size.x - 74.0, 16.0)
		draw_style_box(UIKit.box(UIKit.PAPER_DARK, UIKit.INK, 8, 2), bar)
		if danger > 0.01:
			var col := UIKit.SUN.lerp(UIKit.BERRY, clampf(danger * 1.2, 0.0, 1.0))
			col = col.lightened(pulse * 0.25)
			var fill := Rect2(bar.position + Vector2(2, 2), Vector2((bar.size.x - 4.0) * danger, bar.size.y - 4.0))
			draw_style_box(UIKit.box(col, Color(0, 0, 0, 0), 6, 0), fill)
