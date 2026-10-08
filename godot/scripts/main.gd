extends Node
## Runs the game: the title screen, then the rooms. One room is on screen at a time; doors fade to the next room, and the
## lift door opens the lift screen, where she picks a floor.
##
## Handy for testing:  --room gh_hall      starts straight in a room
##                     --shot path.png     saves a picture of the screen after a moment and quits
##                     --lift              (with --shot) opens the lift screen
##                     --unlock            every room open from the start
##                     --touch             shows the phone buttons, not the keyboard hints
##                     --selftest          (headless) checks the rules of the rooms and the lift

const START_ROOM := "gh_kitchen"
const START_TASK := 1

var _title: TitleScreen
var _view: RoomView
var _ui: RoomUI
var _lift: LiftView
var _layer: CanvasLayer
var _fade: ColorRect
var _state: RunState
var _busy := false


func _ready() -> void:
	InputSetup.ensure()
	get_window().min_size = Vector2i(640, 360)
	_layer = CanvasLayer.new()
	add_child(_layer)
	var top := CanvasLayer.new()
	top.layer = 20
	add_child(top)
	_fade = ColorRect.new()
	_fade.color = UIKit.NIGHT
	_fade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_fade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_fade.modulate.a = 0.0
	top.add_child(_fade)
	var args := OS.get_cmdline_user_args()
	if "--selftest" in args:
		_selftest()
		return
	if "--room" in args or "--shot" in args:
		_new_run(args)
		start_room(String(args[args.find("--room") + 1]) if "--room" in args else START_ROOM)
		if "--lift" in args:
			_view.game.door_touched.emit(RoomGame.LIFT)
	else:
		show_title()
	if "--shot" in args:
		_take_shot(String(args[args.find("--shot") + 1]), args)


func _new_run(args: Array = []) -> void:
	_state = RunState.new(START_TASK)
	if "--unlock" in args or "--unlock" in OS.get_cmdline_user_args():
		_state.locked.clear()


func _use_touch() -> bool:
	if "--touch" in OS.get_cmdline_user_args() or OS.has_feature("mobile"):
		return true
	if OS.has_feature("web"):
		return bool(JavaScriptBridge.eval("(('ontouchstart' in window) || (navigator.maxTouchPoints > 0))", true))
	return false


func show_title() -> void:
	_clear()
	_title = TitleScreen.new()
	_title.play_pressed.connect(func() -> void:
		_new_run()
		start_room(START_ROOM))
	_title.language_chosen.connect(func(lang: String) -> void:
		GameData.set_lang(lang)
		SaveGame.save_lang(lang)
		show_title())
	_layer.add_child(_title)


func _clear() -> void:
	for n in [_title, _view, _ui, _lift]:
		if is_instance_valid(n):
			n.queue_free()
	_title = null
	_view = null
	_ui = null
	_lift = null


## Shows a room. `from`: the room she came from (she appears at that door), or RoomGame.LIFT when she stepped out of the lift.
func start_room(room_id: String, from: String = "") -> void:
	_clear()
	var game := RoomGame.new(room_id, _state, from)
	_view = RoomView.new()
	add_child(_view)
	_view.setup(game)
	_ui = RoomUI.new()
	_layer.add_child(_ui)
	_ui.setup(game, _view, _use_touch())
	_ui.restart_requested.connect(func() -> void: start_room(room_id, from))
	game.door_touched.connect(func(to: String) -> void: _on_door(game, to))


## Fades out, shows the other room, fades back in.
func go_to_room(room_id: String, from: String) -> void:
	if _busy:
		return
	_busy = true
	var out := create_tween()
	out.tween_property(_fade, "modulate:a", 1.0, 0.22)
	await out.finished
	start_room(room_id, from)
	var back := create_tween()
	back.tween_property(_fade, "modulate:a", 0.0, 0.22)
	await back.finished
	_busy = false


func _on_door(game: RoomGame, to: String) -> void:
	if to == RoomGame.LIFT:
		_open_lift(game)
	elif _state.is_locked(to):
		game.bounce_from_door(to)
		_ui.show_toast(GameData.t("doorLocked"))
	elif GameData.has_room(to):
		go_to_room(to, game.room_id)
	else:
		game.bounce_from_door(to)
		_ui.show_toast(GameData.t("doorSoon", {"room": GameData.room(to).get("name", to)}))


func _open_lift(game: RoomGame) -> void:
	_view.paused = true
	_lift = LiftView.new()
	_layer.add_child(_lift)
	_lift.setup(game.room_id, _state)
	_lift.stepped_out.connect(func() -> void:
		_lift.queue_free()
		_lift = null
		game.bounce_from_door(RoomGame.LIFT)
		_view.paused = false)
	_lift.chosen.connect(func(room_id: String) -> void:
		_lift.queue_free()
		_lift = null
		if room_id == game.room_id:
			game.bounce_from_door(RoomGame.LIFT)
			_view.paused = false
		else:
			go_to_room(room_id, RoomGame.LIFT))


## Saves a picture a moment after the room is up. Extra: --grab (she picks up the cement first), --hide, --caught,
## --at x,y (where she stands), --wait seconds.
func _take_shot(path: String, args: Array) -> void:
	await get_tree().create_timer(0.4).timeout
	if "--at" in args:
		var xy := String(args[args.find("--at") + 1]).split(",")
		_view.game.pos = Vector2(float(xy[0]), float(xy[1]))
	if "--grab" in args:
		_view.game.pos = Vector2(1.0, 7.6)
		_view.game.do_action()
	if "--hide" in args:
		_view.game.pos = Vector2(7.5, 6.5)
		_view.game.do_action()
	if "--ride" in args and _lift != null:
		_lift._pick(int(args[args.find("--ride") + 1]))
	if "--caught" in args:
		_view.game.result = "caught"
		_view.game.caught.emit("Scary teacher")
	await get_tree().create_timer(0.5 if "--grab" in args or "--at" in args or "--lift" in args else 0.2).timeout
	var wait := float(args[args.find("--wait") + 1]) if "--wait" in args else 0.0
	if wait > 0.0:
		await get_tree().create_timer(wait).timeout
	get_viewport().get_texture().get_image().save_png(path)
	get_tree().quit()


func _run(g: RoomGame, seconds: float) -> void:
	var t := 0.0
	while t < seconds:
		g.update(0.05)
		t += 0.05


## `godot --headless --path godot -- --selftest`: checks the rules of the rooms, the doors and the lift.
func _selftest() -> void:
	var ok := true
	var st := RunState.new(1)
	# 1. tap the cement in the kitchen: she walks round the table and grabs it
	var g := RoomGame.new("gh_kitchen", st)
	g.go_to(g.item_by_uid("cement_bag_1").pos, "cement_bag_1")
	var t := 0.0
	while t < 20.0 and g.step_index == 0:
		g.update(0.05)
		t += 0.05
	var got: bool = g.step_index == 1 and st.inventory.has("gh_kitchen/cement_bag_1")
	print("walked to the cement and grabbed it by tapping: %s (%.1f s); next room for the mini map: %s" % [got, t, g.objective_room()])
	ok = ok and got and g.objective_room() == "gh_hall"
	# 2. the east door leads to the hall, and what she holds goes with her
	var door_hits: Array = []
	g.door_touched.connect(func(to: String) -> void: door_hits.append(to))
	g.pos = Vector2(12.0, 4.0)
	g.move_dir = Vector2.RIGHT
	_run(g, 2.0)
	var to_hall: bool = door_hits.size() > 0 and door_hits[0] == "gh_hall" and GameData.has_room("gh_hall")
	var hall := RoomGame.new("gh_hall", st, "gh_kitchen")
	var carried: bool = hall.inventory.has("gh_kitchen/cement_bag_1") and hall.step_index == 1 and hall.pos.x < 3.0
	print("east door reports the hall: %s; in the hall she still holds the cement and appears at the kitchen door: %s" % [to_hall, carried])
	ok = ok and to_hall and carried
	# 3. the hall has a baddie that sees her; hiding is not seen
	print("hall baddie: %s" % (not hall.baddie.is_empty()))
	ok = ok and not hall.baddie.is_empty()
	hall.pos = Vector2(5.0, 2.5)
	hall.baddie.pos = Vector2(8.0, 2.5)
	hall.baddie.face = Vector2.LEFT
	hall.baddie.wait = 5.0
	hall.update(0.1)
	var sees: bool = hall.seen_now
	for i in 80:
		hall.baddie.wait = 5.0
		hall.update(0.05)
	print("baddie sees her in the open: %s; caught after a while: %s" % [sees, hall.result == "caught"])
	ok = ok and sees and hall.result == "caught"
	var k := RoomGame.new("gh_kitchen", st)
	k.pos = Vector2(7.5, 6.4)
	k.do_action()
	print("she hides under the kitchen table: %s" % k.hidden)
	ok = ok and k.hidden
	# 4. the lift: the hall has the lift door, stairs are gone, shut floors are shut
	var lift_door: Array = hall.doors.filter(func(d: Dictionary) -> bool: return d.lift)
	var stops := HouseData.lift_stops("gh")
	var floors: Array = stops.map(func(s: Dictionary) -> String: return str(s.label))
	var no_stairs := true
	for r in ["gh_hall", "gh_dining_room", "gh_store_room", "lh_hall"]:
		for e in RoomGame.new(r, RunState.new(1)).items:
			if e.sprite == "stairs" or e.sprite == "lift":
				no_stairs = false
	print("lift doors in the hall: %d; the lift stops (top first): %s; no stairs or loose lift pictures among the items: %s" % [lift_door.size(), floors, no_stairs])
	ok = ok and lift_door.size() == 1 and floors == ["1", "G", "B"] and no_stairs
	var shut: bool = st.is_locked("gh_dining_room") and not st.is_locked("gh_store_room")
	print("floor 1 (dining room) is shut, the store room is open: %s" % shut)
	ok = ok and shut
	# every lift stop has a lift door, in a room that exists
	var all_stops := true
	for house in HouseData.houses():
		for s in HouseData.lift_stops(house):
			var rg := RoomGame.new(s.room, RunState.new(1))
			all_stops = all_stops and rg.lift_wall.size() > 0 and GameData.has_room(s.room)
	print("every lift stop has its door: %s" % all_stops)
	ok = ok and all_stops
	# walking into the lift door asks for the lift
	var lh := RoomGame.new("gh_hall", st)
	var lift_hits: Array = []
	lh.door_touched.connect(func(to: String) -> void: lift_hits.append(to))
	lh.pos = Vector2(3.0, 3.0)
	lh.move_dir = Vector2.LEFT
	_run(lh, 2.0)
	print("walking into the lift door: %s" % [lift_hits])
	ok = ok and lift_hits.size() > 0 and lift_hits[0] == RoomGame.LIFT
	# stepping out of the lift on another floor puts her in front of that floor's lift door
	var store := RoomGame.new("gh_store_room", st, RoomGame.LIFT)
	var at_door: bool = store.pos.x < 3.0 and absf(store.pos.y - (float(store.lift_wall.v) + 1.0)) < 0.1
	print("out of the lift in the store room, in front of its door: %s" % at_door)
	ok = ok and at_door
	# 5. the lift screen: a shut floor does not move the lift; B takes her down and the doors open on the store room
	_state = st
	var lv := LiftView.new()
	_layer.add_child(lv)
	lv.setup("gh_hall", st)
	var got_room: Array = []
	lv.chosen.connect(func(r: String) -> void: got_room.append(r))
	lv._pick(0)   # floor 1 is shut
	await get_tree().create_timer(0.3).timeout
	var stayed: bool = got_room.is_empty() and not lv._riding
	lv._pick(2)   # B
	var waited := 0.0
	while got_room.is_empty() and waited < 8.0:
		await get_tree().create_timer(0.1).timeout
		waited += 0.1
	print("shut floor does not move the lift: %s; riding to B opens the doors on: %s (%.1f s)" % [stayed, got_room, waited])
	ok = ok and stayed and got_room == ["gh_store_room"]
	lv.queue_free()
	# 6. going through a door switches rooms with a fade, and what she holds goes on
	_clear()
	start_room("gh_hall", "gh_kitchen")
	await go_to_room("gh_store_room", RoomGame.LIFT)
	var in_store: bool = _view != null and _view.game.room_id == "gh_store_room" and _view.game.inventory.has("gh_kitchen/cement_bag_1")
	print("switched to the store room with the cement still held: %s" % in_store)
	ok = ok and in_store
	get_tree().quit(0 if ok else 1)
