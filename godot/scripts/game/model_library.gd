class_name ModelLibrary
extends RefCounted
## Makes the 3D object for each thing in a room. Right now they are grey placeholder boxes.
##
## To use a real model, drop a glTF file named after the object into res://assets/models/
## (for example `fridge.glb` for the "fridge" object). It is picked up automatically, no code change.
## Models should be built so 1 unit = 1 metre and the object fills its footprint (see the room files),
## with its origin at the centre of the base.

const MODEL_DIR := "res://assets/models/"

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
static func make(sprite: Dictionary, base: float, interactive: bool = false) -> Dictionary:
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
		model.position = Vector3(center.x, base, center.y)
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
