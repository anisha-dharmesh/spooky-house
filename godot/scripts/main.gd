extends Node
## Runs the game: title screen, the level, and the pause / caught / prank-done overlays.

var _title: TitleScreen
var _view: LevelView
var _hud: Hud
var _touch: TouchControls
var _level_id := 1
var _ui_layer: CanvasLayer


func _ready() -> void:
	InputSetup.ensure()
	get_window().min_size = Vector2i(640, 360)
	_ui_layer = CanvasLayer.new()
	add_child(_ui_layer)
	var args := OS.get_cmdline_user_args()
	if "--gallery" in args:
		add_child(Gallery.new())
		return
	if "--selftest" in args:
		_selftest()
		return
	if "--level" in args:
		start_level(int(args[args.find("--level") + 1]))
	else:
		show_title()


func _use_touch() -> bool:
	if "--touch" in OS.get_cmdline_user_args() or OS.has_feature("mobile"):
		return true
	if OS.has_feature("web"):
		return bool(JavaScriptBridge.eval("(('ontouchstart' in window) || (navigator.maxTouchPoints > 0))", true))
	return false


func show_title() -> void:
	_clear_game()
	_title = TitleScreen.new()
	_title.play_pressed.connect(func() -> void: start_level(_next_level_id()))
	_title.language_chosen.connect(func(lang: String) -> void:
		GameData.set_lang(lang)
		SaveGame.save_lang(lang)
		show_title())
	_ui_layer.add_child(_title)


func _next_level_id() -> int:
	for l in GameData.levels:
		if not SaveGame.is_completed(int(l.id)):
			return int(l.id)
	return int(GameData.levels[GameData.levels.size() - 1].id)


func _clear_game() -> void:
	for n in [_title, _view, _hud, _touch]:
		if is_instance_valid(n):
			n.queue_free()
	_title = null
	_view = null
	_hud = null
	_touch = null


func start_level(id: int) -> void:
	_clear_game()
	_level_id = id
	var level := GameData.get_level(id)
	if level.is_empty():
		show_title()
		return
	_view = LevelView.new()
	add_child(_view)
	_view.setup(level)
	_hud = Hud.new()
	add_child(_hud)
	var touch := _use_touch()
	if touch:
		_touch = TouchControls.new()
		_ui_layer.add_child(_touch)
		_touch.setup(func() -> void: _view.logic.use(), func() -> void: _view.logic.toggle_hide())
		_view.touch = _touch
	_hud.setup(_view, not touch)
	# handy for taking screenshots: --third starts in third person, --at x,y starts somewhere else
	var args := OS.get_cmdline_user_args()
	if "--at" in args:
		var xy := String(args[args.find("--at") + 1]).split(",")
		_view.logic.player_pos = Vector2(float(xy[0]), float(xy[1]))
	if "--third" in args:
		_view.toggle_camera()
	if "--result" in args: # screenshot helper: show the caught / prank-done screen straight away
		var res := String(args[args.find("--result") + 1])
		_view.logic.result = res
		_view.logic.finished.emit(res)
	if "--pause" in args:
		_pause()
	_view.pause_requested.connect(_pause)
	_hud.pause_requested.connect(_pause)
	_hud.resume_requested.connect(_resume)
	_hud.retry_requested.connect(func() -> void: start_level(_level_id))
	_hud.next_requested.connect(func() -> void: start_level(_level_id + 1))
	_hud.menu_requested.connect(show_title)


func _pause() -> void:
	if _view.logic.result != "":
		return
	_view.active = false
	_hud.show_pause()


func _resume() -> void:
	_view.active = true
	_hud.hide_overlay()


## `godot --headless --path godot -- --selftest`: presses keys in the real game and checks the controls work.
func _selftest() -> void:
	start_level(1)
	var start := _view.logic.player_pos
	Input.action_press("move_left")
	for i in 90:
		await get_tree().process_frame
	Input.action_release("move_left")
	var moved := _view.logic.player_pos.distance_to(start)
	_view.toggle_camera()
	var cam_mode := _view.cam_mode
	# grab the cement by standing next to it and pressing Use
	var cement: Dictionary = _view.logic.pick_by_uid("cement_bag_1")
	_view.logic.player_pos = (cement.rect as Rect2).get_center() + Vector2(1.0, 0)
	var ev := InputEventAction.new()
	ev.action = "use"
	ev.pressed = true
	Input.parse_input_event(ev)
	await get_tree().process_frame
	await get_tree().process_frame
	var has_cement := _view.logic.inventory.has("cement_bag_1")
	print("moved %.2f m holding left; camera mode %d; picked up cement: %s" % [moved, cam_mode, has_cement])
	get_tree().quit(0 if (moved > 1.0 and cam_mode == 1 and has_cement) else 1)
