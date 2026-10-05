class_name InputSetup
extends RefCounted
## Registers the game's keyboard controls (so there is nothing to click through in the editor).

static func ensure() -> void:
	_key("move_left", [KEY_A, KEY_LEFT])
	_key("move_right", [KEY_D, KEY_RIGHT])
	_key("move_up", [KEY_W, KEY_UP])
	_key("move_down", [KEY_S, KEY_DOWN])
	_key("sneak", [KEY_SHIFT])
	_key("use", [KEY_E, KEY_SPACE])
	_key("hide", [KEY_H])
	_key("pet", [KEY_C])
	_key("pause", [KEY_ESCAPE, KEY_P])
	_key("cam_toggle", [KEY_V])
	_key("cam_left", [KEY_Q])
	_key("cam_right", [KEY_R])


static func _key(action: String, keys: Array) -> void:
	if not InputMap.has_action(action):
		InputMap.add_action(action)
	for k in keys:
		var ev := InputEventKey.new()
		ev.physical_keycode = k
		InputMap.action_add_event(action, ev)
