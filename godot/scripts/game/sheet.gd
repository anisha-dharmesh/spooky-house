class_name Sheet
extends Node3D
## A contact sheet of models for checking them against a picture:
##   godot --path godot -- --sheet fridge,sofa,bunk_bed [--cols 4] [--real] [--grey]
## Every model is shown in a grid, from a three-quarter view, with its id and real size under it.
## Models are scaled to the same size so small things are easy to see (`--real` keeps their real size).
## `--grey` shows them as they look in Granny's house (black, grey and white).

const CELL := 3.1
const SHOW := 1.9
const GREY_FLAG := "--grey"


var ids: Array = []
var cols := 0
var real := false
var grey := false
var yaw := 0.0
var anim := ""
var anim_time := 0.0


func setup(p_ids: Array, p_cols: int, p_real: bool, p_grey: bool, p_yaw: float = 0.0, p_anim: String = "", p_anim_time: float = 0.0) -> void:
	anim = p_anim
	anim_time = p_anim_time
	yaw = p_yaw
	ids = p_ids
	cols = p_cols
	real = p_real
	grey = p_grey


func _ready() -> void:
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.27, 0.29, 0.34)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.85, 0.85, 0.9)
	env.ambient_light_energy = 0.42
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)
	var key := DirectionalLight3D.new()
	key.rotation_degrees = Vector3(-48, 28, 0)
	key.light_energy = 0.72
	key.shadow_enabled = true
	add_child(key)
	var fill := DirectionalLight3D.new()
	fill.rotation_degrees = Vector3(-20, -140, 0)
	fill.light_energy = 0.35
	add_child(fill)

	var n := ids.size()
	if cols <= 0:
		cols = maxi(1, int(ceil(sqrt(float(n) * 1.5))))
	var rows := int(ceil(float(n) / cols))
	for i in n:
		var id: String = ids[i]
		var model := ModelLibrary.load_model(id)
		var cx := (i % cols) * CELL
		var cz := (i / cols) * CELL
		var label := Label3D.new()
		label.font = UIKit.body_font()
		label.font_size = 36
		label.pixel_size = 0.0068
		label.modulate = Color(1, 1, 1, 0.9)
		label.rotation_degrees.x = -55
		label.position = Vector3(cx, 0.01, cz + CELL * 0.36)
		if model == null:
			label.text = id + " (no model)"
			add_child(label)
			continue
		var holder := Node3D.new()
		holder.position = Vector3(cx, 0, cz)
		holder.rotation_degrees.y = yaw
		add_child(holder)
		holder.add_child(model)
		if grey:
			ModelLibrary.greyscale(model)
		var box := _aabb(model)
		var biggest := maxf(box.size.x, maxf(box.size.y, box.size.z))
		var k := 1.0 if real else SHOW / maxf(biggest, 0.01)
		model.scale = Vector3.ONE * k
		model.position = -Vector3(box.get_center().x, box.position.y, box.get_center().z) * k
		label.text = "%s\n%.2f x %.2f x %.2f m" % [id, box.size.x, box.size.z, box.size.y]
		add_child(label)
		var pad := MeshInstance3D.new() # a floor tile under each model
		var bm := BoxMesh.new()
		bm.size = Vector3(CELL - 0.15, 0.02, CELL - 0.15)
		pad.mesh = bm
		var pm := StandardMaterial3D.new()
		pm.albedo_color = Color(0.2, 0.22, 0.26)
		pad.material_override = pm
		pad.position = Vector3(cx, -0.012, cz)
		add_child(pad)
		var ap := ModelLibrary.find_animation_player(model)
		if ap != null:
			var first := "idle" if ap.has_animation("idle") else ap.get_animation_list()[0]
			if anim != "" and ap.has_animation(anim):
				ap.play(anim)
				ap.seek(anim_time, true)
				ap.pause()
			else:
				ap.play(first)

	var cam := Camera3D.new()
	cam.fov = 34
	add_child(cam)
	var aspect := get_viewport().get_visible_rect().size.x / get_viewport().get_visible_rect().size.y
	var width := cols * CELL
	var depth := rows * CELL
	var center := Vector3((cols - 1) * CELL / 2.0, 0.55, (rows - 1) * CELL / 2.0)
	var tan_half := tan(deg_to_rad(cam.fov / 2.0))
	var dist := maxf((width / 2.0 + 0.4) / (tan_half * aspect), (depth * 0.5 + 1.6) / tan_half) * 1.0
	cam.position = center + Vector3(0.18, 0.95, 1.0).normalized() * dist
	cam.look_at(center)
	cam.make_current()


## The box around everything visible in the model, in the model's own space (at scale 1).
func _aabb(model: Node3D) -> AABB:
	var found := false
	var box := AABB()
	for mi in model.find_children("*", "MeshInstance3D", true, false):
		var m: MeshInstance3D = mi
		var local := _to_model_space(m, model) * m.get_aabb()
		box = local if not found else box.merge(local)
		found = true
	return box


func _to_model_space(m: Node3D, model: Node3D) -> Transform3D:
	var t := Transform3D.IDENTITY
	var n: Node = m
	while n != null and n != model:
		if n is Node3D:
			t = (n as Node3D).transform * t
		n = n.get_parent()
	return t
