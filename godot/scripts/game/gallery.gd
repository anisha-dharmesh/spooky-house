class_name Gallery
extends Node3D
## Shows every small model in rows with its name: `godot --path godot -- --gallery` (buildings and vehicles: use `--sheet`).
## Handy for checking the models and for showing them to Anisha.

var _cam: Camera3D


func _ready() -> void:
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.05, 0.05, 0.06)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.7, 0.7, 0.74)
	env.ambient_light_energy = 0.4
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-55, -30, 0)
	sun.light_energy = 0.7
	sun.shadow_enabled = true
	add_child(sun)

	var index := ModelLibrary.model_index()
	var ids: Array = []
	for id in index.keys():
		# buildings and vehicles are too big for one picture of everything: look at them with `--sheet` instead
		if not ["building", "vehicle"].has(String(index[id].kind)):
			ids.append(id)
	ids.sort_custom(func(a: String, b: String) -> bool:
		var ka: String = index[a].kind
		var kb: String = index[b].kind
		if ka != kb:
			return ka > kb  # objects first, then extras, then characters
		return a < b)
	var x := 0.0
	var z := 0.0
	var row_depth := 0.0
	var max_w := 0.0
	const ROW_W := 46.0
	for id in ids:
		var foot: Array = index[id].foot
		var w := maxf(float(foot[0]), 1.2) + 0.8
		var d := maxf(float(foot[1]), 1.2) + 0.8
		if x + w > ROW_W:
			x = 0.0
			z += row_depth + 0.6
			row_depth = 0.0
		var model := ModelLibrary.load_model(id)
		if model == null:
			continue
		var holder := Node3D.new()
		holder.position = Vector3(x + w / 2.0, 0, z + d / 2.0)
		holder.add_child(model)
		add_child(holder)
		var ap := ModelLibrary.find_animation_player(model)
		if ap != null and ap.has_animation("walk"):
			ap.play("walk")
		# a footprint outline on the floor
		var pad := MeshInstance3D.new()
		var bm := BoxMesh.new()
		bm.size = Vector3(float(foot[0]), 0.01, float(foot[1]))
		pad.mesh = bm
		var pm := StandardMaterial3D.new()
		pm.albedo_color = Color(0.16, 0.16, 0.18)
		pad.material_override = pm
		pad.position = Vector3(0, -0.006, 0)
		holder.add_child(pad)
		var label := Label3D.new()
		label.text = id
		label.font_size = 36
		label.pixel_size = 0.006
		label.rotation_degrees.x = -90
		label.position = Vector3(0, 0.02, d / 2.0 - 0.15)
		label.modulate = Color(1, 1, 1, 0.7)
		holder.add_child(label)
		x += w
		row_depth = maxf(row_depth, d)
		max_w = maxf(max_w, x)
	var depth := z + row_depth
	_cam = Camera3D.new()
	_cam.fov = 38
	add_child(_cam)
	var center := Vector3(ROW_W / 2.0, 0, depth / 2.0)
	_cam.position = center + Vector3(0, depth * 0.62 + 11.0, depth * 0.5 + 8.0)
	_cam.look_at(center)
	_cam.make_current()
