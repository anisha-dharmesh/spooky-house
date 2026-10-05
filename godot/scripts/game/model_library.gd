class_name ModelLibrary
extends RefCounted
## Makes the 3D object for each thing in a room. Right now they are grey placeholder boxes.
##
## To use a real model, drop a glTF file named after the object into res://assets/models/
## (for example `fridge.glb` for the "fridge" object). It is picked up automatically, no code change.
## Models should be built so 1 unit = 1 metre and the object fills its footprint (see the room files),
## with its origin at the centre of the base.

const MODEL_DIR := "res://assets/models/"
# pickup and caught_you play once; the rest loop (glTF has no loop flag, so it is set here)
const LOOPING := ["idle", "walk", "sneak", "look_around"]

static var _index: Dictionary = {}
static var _index_loaded := false


## Heights and sizes of the generated models (made by `npm run models`).
static func model_index() -> Dictionary:
	if not _index_loaded:
		_index_loaded = true
		var f := FileAccess.open(MODEL_DIR + "index.json", FileAccess.READ)
		if f != null:
			var parsed: Variant = JSON.parse_string(f.get_as_text())
			if parsed is Dictionary:
				_index = parsed
	return _index


static func has_model(id: String) -> bool:
	return ResourceLoader.exists(MODEL_DIR + id + ".glb")


## Loads a model by name, or returns null when there isn't one.
static func load_model(id: String) -> Node3D:
	if not has_model(id):
		return null
	var scene: PackedScene = load(MODEL_DIR + id + ".glb")
	return scene.instantiate() as Node3D


## Replaces every colour in a model with its grey. Granny's house stays black, grey and white, so the props in it
## are shown this way; the models themselves keep the colours of the pictures for the rest of the town.
static func greyscale(node: Node) -> void:
	for mi in node.find_children("*", "MeshInstance3D", true, false):
		var m: MeshInstance3D = mi
		for s in m.mesh.get_surface_count():
			var src := m.mesh.surface_get_material(s)
			if src is BaseMaterial3D:
				var copy: BaseMaterial3D = src.duplicate()
				var l := copy.albedo_color.get_luminance()
				copy.albedo_color = Color(l, l, l, copy.albedo_color.a)
				if copy.emission_enabled:
					var le := copy.emission.get_luminance()
					copy.emission = Color(le, le, le)
				m.set_surface_override_material(s, copy)


static func find_animation_player(node: Node) -> AnimationPlayer:
	var found := node.find_children("*", "AnimationPlayer", true, false)
	if found.size() > 0:
		var ap: AnimationPlayer = found[0]
		for anim_name in ap.get_animation_list():
			if anim_name in LOOPING:
				ap.get_animation(anim_name).loop_mode = Animation.LOOP_LINEAR
		return ap
	return null


## A character (Anisha, a baddie). Uses `<model_id>.glb` when it exists, otherwise a capsule.
## Returns {node, anim (AnimationPlayer or null), fade (Array of materials whose alpha can be changed)}.
static func make_character(model_id: String, tone: float, height: float, radius: float, eyes: bool) -> Dictionary:
	var model := load_model(model_id) if model_id != "" else null
	if model == null:
		var cap := make_person(tone, height, radius, eyes)
		var mat: StandardMaterial3D = cap.get_child(0).material_override
		mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		return {"node": cap, "anim": null, "fade": [mat]}
	# the model faces +Z; the game's characters face +X when unrotated, so turn it a quarter
	var holder := Node3D.new()
	model.rotation.y = PI / 2.0
	holder.add_child(model)
	var fade: Array = []
	for mi in model.find_children("*", "MeshInstance3D", true, false):
		var m: MeshInstance3D = mi
		for s in m.mesh.get_surface_count():
			var src := m.mesh.surface_get_material(s)
			if src is BaseMaterial3D:
				var copy: BaseMaterial3D = src.duplicate()
				copy.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
				m.set_surface_override_material(s, copy)
				fade.append(copy)
	return {"node": holder, "anim": find_animation_player(model), "fade": fade}

# height in metres. Items not listed are sized from their tags (see _height_for).
const HEIGHTS := {
	"fridge": 2.0, "counter": 0.9, "gas_stove": 0.9, "sink": 0.9, "table_dining": 0.75, "chair": 0.9,
	"spice_rack": 1.3, "sofa": 0.85, "tv_big": 0.7, "tv_small": 0.6, "cupboard_big": 2.0, "wardrobe_small": 1.7,
	"piano": 1.2, "alexa": 0.3, "lamp_floor": 1.6, "bunk_bed": 1.7, "bed_single": 0.5, "bed_double": 0.55,
	"drawer_unit": 0.6, "bathtub": 0.6, "toilet": 0.5, "wash_basin": 0.85, "shower": 2.0, "stairs": 0.2, "lift": 0.05,
	"bookshelf": 1.9, "desk": 0.75, "treadmill": 1.1, "climbing_wall": 2.4, "pool": 0.02, "slide_chute": 1.2,
	"throne": 1.6, "pillar": 2.4, "tree": 2.2, "tree_dead": 2.2, "street_lamp": 2.6, "car_parked": 1.3,
	"scooty": 1.0, "bullet_bike": 1.0, "bicycle_big": 1.0, "box_stack": 1.2, "box_cardboard": 0.6,
	"big_plant_pot": 0.9, "plant_pot": 0.5, "baby_stroller": 0.9, "yoga_mat": 0.03, "rug": 0.02,
	"front_door_mat": 0.03, "royal_carpet": 0.02, "hanging_bulb": 0.03, "wall_clock": 0.03,
	"photo_frame": 0.03, "cobweb": 0.03,
}


static func _height_for(frame: String, tags: Array) -> float:
	var idx := model_index()
	if idx.has(frame):
		return float(idx[frame].height)
	if HEIGHTS.has(frame):
		return HEIGHTS[frame]
	if tags.has("hide"):
		return 1.6
	if tags.has("pickup"):
		return 0.3
	if tags.has("solid"):
		return 0.9
	return 0.03 # decor and the rest lie flat on the floor


static func _tone(frame: String, tags: Array, interactive: bool) -> float:
	if tags.has("pickup") and interactive:
		return 0.9
	if tags.has("hide"):
		return 0.5
	if not tags.has("solid"):
		return 0.17
	return 0.3 + float(hash(frame) % 100) / 100.0 * 0.12


static func _material(tone: float, glow: bool = false) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = Color(tone, tone, tone)
	m.roughness = 0.95
	if glow:
		m.emission_enabled = true
		m.emission = Color(tone, tone, tone)
		m.emission_energy_multiplier = 0.35
	return m


## Builds the node for one object. `rect` is its footprint on the floor, `base` the height it sits at
## (it sits on top of another object when `base` is above 0). Returns {node, top} where top is the new height.
## `grey`: show it in black, grey and white (Granny's house). Things Anisha can pick up for a task keep their colours so she can find them.
static func make(sprite: Dictionary, base: float, interactive: bool = false, grey: bool = false) -> Dictionary:
	var frame: String = sprite.frame
	var tags: Array = sprite.tags
	var rect: Rect2 = sprite.rect
	var path := MODEL_DIR + frame + ".glb"
	var h := _height_for(frame, tags)
	if tags.has("pickup") and not interactive:
		h = maxf(h, 0.12) # things that can't be picked up in this level are just scenery
	var center := rect.get_center()
	if ResourceLoader.exists(path):
		var scene: PackedScene = load(path)
		var model: Node3D = scene.instantiate()
		if grey and not interactive:
			greyscale(model)
		# pets and anything else with an idle animation just plays it (a sitting dog, a bobbing parrot)
		var ap := find_animation_player(model)
		if ap != null and ap.has_animation("idle"):
			ap.play("idle")
		# wall and ceiling pieces are modelled at floor level and carry their mount height in the index
		var mount_y := float(model_index().get(frame, {}).get("mount_y", 0.0))
		model.position = Vector3(center.x, base + mount_y, center.y)
		model.rotation_degrees.y = -float(sprite.angle)
		return {"node": model, "top": base + h}
	var size := rect.size - Vector2(0.08, 0.08)
	if tags.has("pickup") and not tags.has("solid"):
		size = Vector2(minf(size.x, 0.5), minf(size.y, 0.5))
	size = Vector2(maxf(size.x, 0.05), maxf(size.y, 0.05))
	var mesh := BoxMesh.new()
	mesh.size = Vector3(size.x, h, size.y)
	var mi := MeshInstance3D.new()
	mi.mesh = mesh
	mi.material_override = _material(_tone(frame, tags, interactive), (tags.has("pickup") and interactive) or tags.has("hide"))
	mi.position = Vector3(center.x, base + h / 2.0, center.y)
	return {"node": mi, "top": base + h}


static func make_person(body_tone: float, height: float, radius: float, eyes: bool) -> Node3D:
	var root := Node3D.new()
	var body := MeshInstance3D.new()
	var cap := CapsuleMesh.new()
	cap.radius = radius
	cap.height = height
	body.mesh = cap
	body.material_override = _material(body_tone, false)
	body.position.y = height / 2.0
	root.add_child(body)
	# a nose (a small block) on +X shows which way the character faces; rotation.y = -facing
	var nose := MeshInstance3D.new()
	var nm := BoxMesh.new()
	nm.size = Vector3(0.22, 0.14, 0.14)
	nose.mesh = nm
	nose.material_override = _material(1.0 - body_tone * 0.5, true)
	nose.position = Vector3(radius, height * 0.72, 0)
	root.add_child(nose)
	if eyes:
		for z in [-0.14, 0.14]:
			var eye := MeshInstance3D.new()
			var sm := SphereMesh.new()
			sm.radius = 0.07
			sm.height = 0.14
			eye.mesh = sm
			eye.material_override = _material(1.0, true)
			eye.position = Vector3(radius * 0.85, height * 0.78, z)
			root.add_child(eye)
	return root
