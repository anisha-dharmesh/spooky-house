class_name InputSetup
extends RefCounted
## Registers the game's one key: Escape pauses. Everything else is a mouse click or a finger tap.

static func ensure() -> void:
	_key("pause", [KEY_ESCAPE])


static func _key(action: String, keys: Array) -> void:
	if not InputMap.has_action(action):
		InputMap.add_action(action)
	for k in keys:
		var ev := InputEventKey.new()
		ev.physical_keycode = k
		InputMap.action_add_event(action, ev)
