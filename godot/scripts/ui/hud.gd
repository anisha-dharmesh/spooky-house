class_name Hud
extends CanvasLayer
## Heads-up display and the pause / caught / task-done screens.

signal respawn_requested   # back to her room (after being caught, or from the pause menu)
signal menu_requested
signal continue_requested  # carry on after a finished task
signal resume_requested
signal pause_requested
signal camera_requested
signal pet_requested

var view: LevelView
var logic: GameLogic

var _steps_box: VBoxContainer
var _meter_fill: ColorRect
var _meter_track: Panel
var _pet_btn: Button
var _slots: HBoxContainer
var _toast: Label
var _toast_time := 0.0
var _overlay: Control


func setup(p_view: LevelView) -> void:
	view = p_view
	logic = p_view.logic
	layer = 10
	var root := Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(root)

	# task list, top left
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", UIKit.box(Color(0.04, 0.04, 0.043, 0.82), UIKit.BORDER, 16))
	panel.position = Vector2(24, 24)
	panel.custom_minimum_size = Vector2(300, 0)
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(panel)
	_steps_box = VBoxContainer.new()
	_steps_box.add_theme_constant_override("separation", 6)
	panel.add_child(_steps_box)

	# top right: seen meter, pet help, camera, pause
	var top := HBoxContainer.new()
	top.add_theme_constant_override("separation", 10)
	top.anchor_left = 1.0
	top.anchor_right = 1.0
	top.offset_left = -480
	top.offset_right = -24
	top.offset_top = 24
	top.alignment = BoxContainer.ALIGNMENT_END
	top.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(top)
	var meter_chip := PanelContainer.new()
	meter_chip.add_theme_stylebox_override("panel", UIKit.box(Color(0.04, 0.04, 0.043, 0.88), UIKit.BORDER, 26))
	var meter_row := HBoxContainer.new()
	meter_row.add_theme_constant_override("separation", 10)
	meter_chip.add_child(meter_row)
	meter_row.add_child(UIKit.label(GameData.t("seen"), 20, UIKit.DIM))
	_meter_track = Panel.new()
	_meter_track.custom_minimum_size = Vector2(110, 12)
	_meter_track.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	_meter_track.add_theme_stylebox_override("panel", UIKit.box(Color("2a2a2d"), Color(0, 0, 0, 0), 6))
	meter_row.add_child(_meter_track)
	_meter_fill = ColorRect.new()
	_meter_fill.color = UIKit.WHITE
	_meter_fill.size = Vector2(0, 12)
	_meter_track.add_child(_meter_fill)
	top.add_child(meter_chip)
	_pet_btn = UIKit.button("", "dark", 20, func() -> void: logic.call_pet())
	top.add_child(_pet_btn)
	var pause := UIKit.button("II", "dark", 20, func() -> void: pause_requested.emit())
	pause.custom_minimum_size = Vector2(52, 0)
	top.add_child(pause)

	# bottom: item slots, toast
	var bottom := VBoxContainer.new()
	bottom.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	bottom.grow_horizontal = Control.GROW_DIRECTION_BOTH
	bottom.grow_vertical = Control.GROW_DIRECTION_BEGIN
	bottom.offset_bottom = -34
	bottom.alignment = BoxContainer.ALIGNMENT_END
	bottom.add_theme_constant_override("separation", 10)
	bottom.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(bottom)
	_toast = UIKit.label("", 26)
	_toast.add_theme_stylebox_override("normal", UIKit.box(UIKit.BG, Color(0, 0, 0, 0), 12))
	_toast.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_toast.visible = false
	bottom.add_child(_toast)
	_slots = HBoxContainer.new()
	_slots.add_theme_constant_override("separation", 10)
	_slots.alignment = BoxContainer.ALIGNMENT_CENTER
	_slots.mouse_filter = Control.MOUSE_FILTER_IGNORE
	bottom.add_child(_slots)

	logic.steps_changed.connect(_refresh_steps)
	logic.inventory_changed.connect(_refresh_slots)
	logic.toast.connect(func(key: String, vars: Dictionary) -> void: show_toast(GameData.t(key, vars)))
	logic.finished.connect(_on_finished)
	logic.task_completed.connect(func(task: Dictionary, rating: Dictionary, opened: Array) -> void:
		get_tree().create_timer(0.7).timeout.connect(func() -> void: _show_task_done(task, rating, opened)))
	_refresh_steps()
	_refresh_slots()


func show_toast(text: String, seconds: float = 2.2) -> void:
	_toast.text = text
	_toast.visible = true
	_toast_time = seconds


func _process(delta: float) -> void:
	_meter_fill.size.x = 110.0 * logic.meter
	_pet_btn.text = "× %d" % logic.pets_left
	if _toast_time > 0.0:
		_toast_time -= delta
		if _toast_time <= 0.0:
			_toast.visible = false


func _refresh_steps() -> void:
	for c in _steps_box.get_children():
		c.queue_free()
	var task := logic.task
	if task.is_empty():
		var all := UIKit.label(GameData.t("allDone"), 23)
		all.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		all.custom_minimum_size = Vector2(264, 0)
		_steps_box.add_child(all)
		return
	_steps_box.add_child(UIKit.label(GameData.t("task", {"n": int(task.id)}), 18, UIKit.DIM))
	var title := UIKit.label(GameData.L(task.task), 23)
	title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	title.custom_minimum_size = Vector2(264, 0)
	_steps_box.add_child(title)
	var i := 0
	for s in task.steps:
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 8)
		var done := i < logic.step_index
		var active := i == logic.step_index
		var box := Panel.new()
		box.custom_minimum_size = Vector2(18, 18)
		box.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		var fill := UIKit.WHITE if done else Color(0, 0, 0, 0)
		box.add_theme_stylebox_override("panel", UIKit.box(fill, UIKit.WHITE if (done or active) else UIKit.MUTED, 4))
		row.add_child(box)
		row.add_child(UIKit.label(GameData.L(s.text), 19, UIKit.WHITE if (done or active) else UIKit.DIM))
		_steps_box.add_child(row)
		i += 1


func _refresh_slots() -> void:
	for c in _slots.get_children():
		c.queue_free()
	for i in GameLogic.MAX_ITEMS:
		var p := PanelContainer.new()
		p.custom_minimum_size = Vector2(110, 56)
		if i < logic.inventory.size():
			p.add_theme_stylebox_override("panel", UIKit.box(Color("2a2a2d"), UIKit.WHITE, 10))
			var l := UIKit.label(logic.item_name(logic.inventory[i]), 16)
			l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
			l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
			l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
			p.add_child(l)
		else:
			p.add_theme_stylebox_override("panel", UIKit.box(Color(0.04, 0.04, 0.043, 0.6), Color("4a4a4d"), 10))
		_slots.add_child(p)


# ---------- overlays ----------

func _clear_overlay() -> void:
	if _overlay != null:
		_overlay.queue_free()
		_overlay = null


func _make_overlay() -> VBoxContainer:
	_clear_overlay()
	_overlay = Control.new()
	_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(_overlay)
	var dim := ColorRect.new()
	dim.color = Color(0, 0, 0, 0.72)
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_overlay.add_child(dim)
	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_overlay.add_child(center)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 16)
	box.alignment = BoxContainer.ALIGNMENT_CENTER
	center.add_child(box)
	return box


func _center(l: Label) -> Label:
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	return l


func show_pause() -> void:
	var box := _make_overlay()
	box.add_child(_center(UIKit.label(GameData.t("paused"), 64, UIKit.WHITE, true)))
	for spec in [["resume", "primary", resume_requested], ["backHome", "ghost", respawn_requested], ["menu", "ghost", menu_requested]]:
		var b := UIKit.button(GameData.t(spec[0]), spec[1], 28, func() -> void: spec[2].emit())
		b.custom_minimum_size = Vector2(320, 64)
		box.add_child(b)


func hide_overlay() -> void:
	_clear_overlay()


func has_overlay() -> bool:
	return _overlay != null


func _on_finished(_result: String) -> void: # she was caught
	get_tree().create_timer(0.6).timeout.connect(_show_caught)


func _show_caught() -> void:
	var box := _make_overlay()
	var kind: Dictionary = GameData.baddie_kinds.get(logic.caught_by, {})
	box.add_child(_center(UIKit.label(GameData.t("caught"), 110, UIKit.WHITE, true)))
	box.add_child(_center(UIKit.label(GameData.t("sawYou", {"name": GameData.L(kind.get("name", "The baddie"))}), 32, UIKit.LIGHT)))
	var sent := _center(UIKit.label(GameData.t("sentHome"), 24, UIKit.LIGHT))
	sent.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	sent.custom_minimum_size = Vector2(560, 0)
	box.add_child(sent)
	if not logic.task.is_empty():
		var tip := UIKit.label(GameData.L(logic.task.tip), 22, UIKit.LIGHT)
		tip.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		tip.custom_minimum_size = Vector2(520, 0)
		var tip_panel := PanelContainer.new()
		tip_panel.add_theme_stylebox_override("panel", UIKit.box(UIKit.CHIP, UIKit.BORDER, 16))
		tip_panel.add_child(tip)
		box.add_child(tip_panel)
	var row := HBoxContainer.new()
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	row.add_theme_constant_override("separation", 14)
	var again := UIKit.button(GameData.t("backHome"), "primary", 30, func() -> void: respawn_requested.emit())
	again.custom_minimum_size = Vector2(320, 68)
	var menu := UIKit.button(GameData.t("menu"), "ghost", 26, func() -> void: menu_requested.emit())
	menu.custom_minimum_size = Vector2(150, 68)
	row.add_child(again)
	row.add_child(menu)
	box.add_child(row)


func _show_task_done(task: Dictionary, rating: Dictionary, opened: Array) -> void:
	var box := _make_overlay()
	box.add_child(_center(UIKit.label(GameData.t("taskComplete", {"n": int(task.id)}), 24, UIKit.DIM)))
	var is_prank: bool = task.get("kind", ["prank"]).has("prank")
	box.add_child(_center(UIKit.label(GameData.t("prankDone" if is_prank else "wellDone"), 100, UIKit.WHITE, true)))
	var text := UIKit.label(GameData.L(task.completeText), 28, UIKit.LIGHT)
	text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	text.custom_minimum_size = Vector2(760, 0)
	box.add_child(text)
	if task.has("message"): # the good message every task leaves (see CLAUDE.md)
		var msg := UIKit.label(GameData.L(task.message), 24, UIKit.WHITE)
		msg.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		msg.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		msg.custom_minimum_size = Vector2(760, 0)
		box.add_child(msg)
	var sr := UIKit.StarRow.new()
	sr.earned = [true, rating.not_seen, rating.quick]
	var center := CenterContainer.new()
	center.add_child(sr)
	box.add_child(center)
	var labels := HBoxContainer.new()
	labels.alignment = BoxContainer.ALIGNMENT_CENTER
	labels.add_theme_constant_override("separation", 0)
	var texts := [GameData.t("starPrankDone" if is_prank else "starTaskDone"), GameData.t("starNotSeenLabel") if sr.earned[1] else GameData.t("starNotSeen"), GameData.t("starQuickLabel") if sr.earned[2] else GameData.t("starBeQuicker")]
	for i in 3:
		var l := UIKit.label(texts[i], 22, UIKit.WHITE if sr.earned[i] else UIKit.DIM)
		l.custom_minimum_size = Vector2(2.6 * sr.star_r, 0)
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		labels.add_child(l)
	box.add_child(labels)
	if not opened.is_empty():
		var names: Array = []
		for id in opened:
			names.append(String(logic.world.room_by_id(id).get("name", id)))
		box.add_child(_center(UIKit.label(GameData.t("newArea", {"rooms": ", ".join(names)}), 28, UIKit.WHITE)))
	var row := HBoxContainer.new()
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	row.add_theme_constant_override("separation", 14)
	var main_btn: Button
	if logic.task.is_empty():
		box.add_child(_center(UIKit.label(GameData.t("allTasksDone"), 24, UIKit.LIGHT)))
		main_btn = UIKit.button(GameData.t("menu"), "primary", 30, func() -> void: menu_requested.emit())
		var keep := UIKit.button(GameData.t("resume"), "ghost", 26, func() -> void: continue_requested.emit())
		keep.custom_minimum_size = Vector2(220, 68)
		row.add_child(main_btn)
		row.add_child(keep)
	else:
		main_btn = UIKit.button(GameData.t("nextTask"), "primary", 30, func() -> void: continue_requested.emit())
		row.add_child(main_btn)
	main_btn.custom_minimum_size = Vector2(300, 68)
	box.add_child(row)
