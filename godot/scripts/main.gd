extends Node
## Runs the game: title screen, the world, and the pause / caught / task-done overlays.

var _title: TitleScreen
var _view: LevelView
var _hud: Hud
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
	if "--sheet" in args:
		var ids := String(args[args.find("--sheet") + 1]).split(",")
		var cols := int(args[args.find("--cols") + 1]) if "--cols" in args else 0
		var sheet := Sheet.new()
		var yaw := float(args[args.find("--yaw") + 1]) if "--yaw" in args else 0.0
		var anim := String(args[args.find("--anim") + 1]) if "--anim" in args else ""
		var anim_time := float(args[args.find("--time") + 1]) if "--time" in args else 0.0
		sheet.setup(Array(ids), cols, "--real" in args, "--grey" in args, yaw, anim, anim_time)
		add_child(sheet)
		return
	if "--selftest" in args:
		_selftest()
		return
	if "--task" in args:
		start_game(int(args[args.find("--task") + 1]))
	else:
		show_title()


func show_title() -> void:
	_clear_game()
	_title = TitleScreen.new()
	_title.play_pressed.connect(func() -> void: start_game())
	_ui_layer.add_child(_title)


func _clear_game() -> void:
	for n in [_title, _view, _hud]:
		if is_instance_valid(n):
			n.queue_free()
	_title = null
	_view = null
	_hud = null


## Starts the world. `from_task` (a task id, for testing: --task 2) skips ahead as if the tasks before it were done;
## otherwise the game carries on from the saved progress.
func start_game(from_task: int = 0) -> void:
	_clear_game()
	var done: Array = []
	if from_task > 0:
		for t in GameData.tasks:
			if int(t.id) < from_task:
				done.append(int(t.id))
	else:
		done = SaveGame.completed_ids()
	_view = LevelView.new()
	add_child(_view)
	_view.setup(done)
	_hud = Hud.new()
	add_child(_hud)
	_hud.setup(_view)
	# handy for taking screenshots: --third starts in third person, --at x,y starts somewhere else
	var args := OS.get_cmdline_user_args()
	if "--at" in args:
		var xy := String(args[args.find("--at") + 1]).split(",")
		_view.logic.player_pos = Vector2(float(xy[0]), float(xy[1]))
	if "--third" in args:
		_view.toggle_camera()
	if "--result" in args: # screenshot helper: show the caught or task-done screen straight away
		if String(args[args.find("--result") + 1]) == "caught":
			_view.logic.result = "caught"
			_view.logic.finished.emit("caught")
		else:
			_view.logic.task_completed.emit(_view.logic.task, _view.logic.rating(), [])
	if "--pause" in args:
		_pause()
	_view.pause_requested.connect(_pause)
	_view.logic.task_completed.connect(_on_task_completed)
	_hud.pause_requested.connect(_pause)
	_hud.resume_requested.connect(_resume)
	_hud.respawn_requested.connect(_respawn)
	_hud.continue_requested.connect(_resume)
	_hud.menu_requested.connect(show_title)


func _on_task_completed(task: Dictionary, rating: Dictionary, _opened: Array) -> void:
	SaveGame.record(int(task.id), int(rating.stars))
	_view.active = false # the world waits while the "prank done" screen is up


func _pause() -> void:
	if _view.logic.result != "" or _hud.has_overlay():
		return
	_view.active = false
	_hud.show_pause()


func _resume() -> void:
	_view.active = true
	_hud.hide_overlay()


## Back to her room after being caught (or from the pause menu).
func _respawn() -> void:
	_view.logic.respawn()
	_resume()


## `godot --headless --path godot -- --selftest`: clicks in the real game and checks the controls work.
func _selftest() -> void:
	start_game(7)
	# click the ground a little way off and let her walk there
	var cement: Dictionary = _view.logic.pick_by_id("gh_kitchen/cement_bag_1")
	var target := (cement.rect as Rect2).get_center()
	_view.logic.player_pos = target + Vector2(1.0, 0.0) # right beside it, so it is on screen
	for i in 3:
		await get_tree().process_frame
	_view._update_camera(1.0, true) # the camera jumps to her
	var cam := _view.cam
	var click_at := cam.unproject_position(Vector3(target.x, 0.2, target.y))
	var click := InputEventMouseButton.new()
	click.button_index = MOUSE_BUTTON_LEFT
	click.pressed = true
	var sent := get_window().get_final_transform() * click_at # (the window may be scaled)
	click.position = sent
	click.global_position = sent
	Input.parse_input_event(click)
	for i in 60:
		await get_tree().process_frame
	var bubble: bool = _view._bubble.visible
	for i in 1800:
		if _view.logic.inventory.has("gh_kitchen/cement_bag_1"):
			break
		await get_tree().process_frame
	var has_cement: bool = _view.logic.inventory.has("gh_kitchen/cement_bag_1")
	print("clicked the cement: bubble shown: %s; picked up cement: %s" % [bubble, has_cement])
	var ok: bool = bubble and has_cement

	# finish the lemon task (8) in the real game: the store room door should slide away and the "prank done" screen should show
	start_game(8)
	var logic := _view.logic
	var slabs_before := _view._door_slabs.size()
	var spots := [logic.pick_by_id("gh_kitchen/lemon_1").rect]
	for t in logic.world.targets:
		if t.id == "gh_kitchen/tea_cup_1":
			spots.append(t.rect)
	for r in spots:
		logic.player_pos = (r as Rect2).get_center()
		logic.use()
	logic.player_pos = logic.world.room_by_id("lh_hall").interior.get_center()
	await get_tree().create_timer(1.3).timeout # the door slides open, then the screen comes up
	var slabs_after := _view._door_slabs.size()
	var screen := _hud.has_overlay()
	print("lemon task done: door slabs %d -> %d; prank-done screen up: %s; world waiting: %s" % [slabs_before, slabs_after, screen, not _view.active])
	ok = ok and slabs_before > 0 and slabs_after == 0 and screen and not _view.active
	_resume()
	logic.result = "caught"
	logic.finished.emit("caught")
	await get_tree().create_timer(1.2).timeout
	var caught_screen := _hud.has_overlay()
	_respawn()
	print("caught: screen up: %s; back in her room: %s" % [caught_screen, logic.player_pos == logic.world.respawn])
	ok = ok and caught_screen and logic.player_pos == logic.world.respawn and logic.result == ""
	get_tree().quit(0 if ok else 1)
