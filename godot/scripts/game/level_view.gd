class_name LevelView
extends Node3D
## Shows the world in 3D and drives the game each frame. A tilted "dollhouse" view from above (a third-person view
## is kept for screenshots). The only controls are taps: a tap on the ground walks there, a tap on a thing that
## matters walks there and uses it, with a bubble over it that shows what it is.
## Only Granny's house is spooky: the light and fog change as Anisha walks in and out of it.

signal pause_requested

const WALL_H_DOLLHOUSE := 1.0
const WALL_H_THIRD := 2.6

var logic: GameLogic
var world: WorldData
var active := true

var cam: Camera3D
var cam_mode := 0        # 0 = dollhouse, 1 = third person
var yaw := 0.0

var _player: Node3D
var _player_fade: Array = []   # materials whose alpha shows hiding
var _player_anim: AnimationPlayer
var _prev_player := Vector2.ZERO
var _you_label: Label3D
var _bnodes := {}              # baddie id -> {node, bubble, cone, anim}
var _cone_mat: StandardMaterial3D
var _walls: Array[MeshInstance3D] = []   # walls and shut doors: all drop low for the dollhouse view
var _door_slabs: Array[Dictionary] = []  # {room, to, node, label} for doors that are shut
var _wall_mats := {}
var _floor_tex := {}
var _wall_h := WALL_H_DOLLHOUSE
var _pickup_nodes := {}
var _target_nodes := {}
var _marker: MeshInstance3D
var _rings := {}               # id -> a pulsing ring on a thing the current task needs
var _bubble: Node3D            # the speech bubble over a tapped thing
var _bubble_text: Label3D
var _bubble_item: Node3D
var _bubble_time := 0.0
var _wiggle: Node3D
var _wiggle_time := 0.0
var _tap_ring: MeshInstance3D
var _light: OmniLight3D
var _sun: DirectionalLight3D
var _env: Environment
var _mood := {}                # the blended look of the light right now
var _time := 0.0


## `done_ids`: tasks already finished (from the save).
func setup(done_ids: Array) -> void:
	world = WorldBuilder.build(GameData.world_def, GameData.tasks, GameData.world_rooms())
	logic = GameLogic.new(world, GameData.tasks, GameData.baddie_kinds, done_ids)
	_build_environment()
	_build_rooms()
	_build_walls()
	_build_doors()
	_build_props()
	_build_extras()
	_build_characters()
	_sync_baddie_nodes()
	_build_camera()
	_build_bubble()
	logic.hint.connect(_show_hint)
	logic.item_picked.connect(func(id: String) -> void:
		if _pickup_nodes.has(id):
			_pickup_nodes[id].visible = false)
	logic.items_restored.connect(func(ids: Array) -> void:
		for id in ids:
			if _pickup_nodes.has(id):
				_pickup_nodes[id].visible = true)
	logic.steps_changed.connect(_place_marker)
	logic.steps_changed.connect(_refresh_rings)
	logic.item_picked.connect(func(_id: String) -> void: _refresh_rings())
	logic.items_restored.connect(func(_ids: Array) -> void: _refresh_rings())
	logic.pet_called.connect(_on_pet_called)
	logic.target_used.connect(_pop_target)
	logic.baddies_changed.connect(_sync_baddie_nodes)
	logic.room_unlocked.connect(_open_doors_into)
	logic.respawned.connect(_on_respawned)
	for id in logic.picked: # used up in tasks that are already done
		if _pickup_nodes.has(id):
			_pickup_nodes[id].visible = false
	_place_marker()
	_refresh_rings()


# ---------- building ----------

## Only Granny's house is spooky. Every other place gets a normal, bright daytime mood.
const SPOOKY_LOCATIONS := ["granny_house"]
const MOODS := {
	"spooky": {"bg": Color(0.03, 0.03, 0.035), "ambient": Color(0.62, 0.62, 0.66), "ambient_energy": 0.55,
		"fog": 0.012, "sun": 0.55, "sun_color": Color(0.85, 0.87, 1.0), "light": 1.1},
	"day": {"bg": Color(0.62, 0.66, 0.72), "ambient": Color(0.9, 0.9, 0.92), "ambient_energy": 0.9,
		"fog": 0.0, "sun": 1.0, "sun_color": Color(1.0, 0.97, 0.9), "light": 0.0},
}


func _is_spooky(location: String) -> bool:
	return SPOOKY_LOCATIONS.has(location)


func _mood_for(location: String) -> Dictionary:
	return MOODS["spooky" if _is_spooky(location) else "day"]


func _build_environment() -> void:
	_env = Environment.new()
	_env.background_mode = Environment.BG_COLOR
	_env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	_env.fog_enabled = true
	_env.fog_light_color = Color(0.05, 0.05, 0.06)
	var we := WorldEnvironment.new()
	we.environment = _env
	add_child(we)
	_sun = DirectionalLight3D.new()
	_sun.rotation_degrees = Vector3(-62, -25, 0)
	_sun.shadow_enabled = true
	add_child(_sun)
	# the light that follows Anisha is only needed in the dark
	_light = OmniLight3D.new()
	_light.omni_range = 7.0
	_light.light_color = Color(1, 0.98, 0.92)
	add_child(_light)
	_mood = _mood_for(world.room_at(logic.player_pos).get("location", "")).duplicate()
	_apply_mood()


func _apply_mood() -> void:
	_env.background_color = _mood.bg
	_env.ambient_light_color = _mood.ambient
	_env.ambient_light_energy = _mood.ambient_energy
	_env.fog_density = _mood.fog
	_sun.light_energy = _mood.sun
	_sun.light_color = _mood.sun_color
	_light.light_energy = _mood.light


## Eases the light toward the look of the place Anisha is standing in.
func _blend_mood(delta: float) -> void:
	var here := world.room_at(logic.player_pos)
	if here.is_empty():
		return
	var target := _mood_for(here.location)
	var k := 1.0 - exp(-2.5 * delta)
	for key in target:
		_mood[key] = lerp(_mood[key], target[key], k)
	_apply_mood()


## A dark grid for Granny's house, a lighter one for the rest, a grey one for the street.
func _grid_texture(kind: String) -> ImageTexture:
	if _floor_tex.has(kind):
		return _floor_tex[kind]
	var base := Color(0.1, 0.1, 0.11)
	var line := Color(0.15, 0.15, 0.165)
	if kind == "day":
		base = Color(0.5, 0.48, 0.46)
		line = Color(0.58, 0.56, 0.54)
	elif kind == "road":
		base = Color(0.3, 0.3, 0.32)
		line = Color(0.36, 0.36, 0.38)
	var img := Image.create(64, 64, true, Image.FORMAT_RGB8)
	img.fill(base)
	for i in 64:
		for k in 2:
			img.set_pixel(i, k, line)
			img.set_pixel(k, i, line)
	img.generate_mipmaps()
	_floor_tex[kind] = ImageTexture.create_from_image(img)
	return _floor_tex[kind]


func _box(rect: Rect2, height: float, y0: float, mat: Material) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = Vector3(rect.size.x, height, rect.size.y)
	mi.mesh = bm
	mi.material_override = mat
	var c := rect.get_center()
	mi.position = Vector3(c.x, y0 + height / 2.0, c.y)
	return mi


func _flat_material(c: Color, glow: bool = false) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = c
	m.roughness = 1.0
	if glow:
		m.emission_enabled = true
		m.emission = c
		m.emission_energy_multiplier = 0.4
	return m


func _build_rooms() -> void:
	for room in world.rooms:
		var r: Rect2 = room.interior
		var kind := "road" if room.ground == "road" else ("spooky" if _is_spooky(room.location) else "day")
		var mat := StandardMaterial3D.new()
		mat.albedo_texture = _grid_texture(kind)
		mat.uv1_scale = Vector3(r.size.x, r.size.y, 1)
		mat.texture_repeat = true
		mat.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
		mat.roughness = 1.0
		var floor_node := _box(r, 0.1, -0.1, mat)
		add_child(floor_node)
		var label := Label3D.new()
		label.text = String(room.name).to_upper()
		label.font = UIKit.body_font()
		label.font_size = 48
		label.pixel_size = 0.006
		label.modulate = Color(1, 1, 1, 0.25)
		label.rotation_degrees.x = -90
		label.position = Vector3(r.position.x + 1.6, 0.02, r.end.y - 0.45)
		label.no_depth_test = false
		add_child(label)
	for s in world.safes:
		add_child(_box(s, 0.02, 0.0, _flat_material(Color(1, 1, 1, 1) * 0.2)))
	var gap_mat := _flat_material(Color(0.07, 0.07, 0.08))
	for d in world.doorways:
		add_child(_box(d, 0.12, -0.1, gap_mat))


func _build_walls() -> void:
	_wall_mats["spooky"] = _flat_material(Color(0.2, 0.2, 0.22))
	_wall_mats["day"] = _flat_material(Color(0.74, 0.72, 0.68))
	for i in world.walls.size():
		var w: Rect2 = world.walls[i]
		var loc: String = world.room_by_id(world.wall_rooms[i]).get("location", "")
		var mi := _box(w, 1.0, 0.0, _wall_mats["spooky" if _is_spooky(loc) else "day"])
		mi.set_meta("rect", w)
		add_child(mi)
		_walls.append(mi)
	_apply_wall_height(WALL_H_DOLLHOUSE)


## Doors into rooms that are still locked are solid slabs with a LOCKED label, until the task that unlocks them is done.
func _build_doors() -> void:
	var mat := _flat_material(Color(0.9, 0.9, 0.86), true)
	for d in logic.closed_doors:
		var rect: Rect2 = d.rect
		var mi := _box(rect, 1.0, 0.0, mat)
		mi.set_meta("rect", rect)
		add_child(mi)
		_walls.append(mi)
		var label: Label3D = null
		if not logic.locked.has(d.room): # the side you walk up to
			label = Label3D.new()
			label.text = GameData.t("lockedLabel")
			label.font = UIKit.body_font()
			label.font_size = 40
			label.pixel_size = 0.006
			label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
			label.no_depth_test = true
			var c := rect.get_center()
			label.position = Vector3(c.x, 1.9, c.y)
			add_child(label)
		_door_slabs.append({"room": d.room, "to": d.to, "node": mi, "label": label})


func _open_doors_into(room_id: String) -> void:
	for i in range(_door_slabs.size() - 1, -1, -1):
		var d: Dictionary = _door_slabs[i]
		if d.room != room_id and d.to != room_id:
			continue
		if logic.locked.has(d.room) or logic.locked.has(d.to):
			continue # the other room beyond it is still locked
		var node: MeshInstance3D = d.node
		_walls.erase(node)
		var tw := create_tween()
		tw.tween_property(node, "scale:y", 0.01, 0.4)
		tw.tween_callback(node.queue_free)
		if d.label != null:
			(d.label as Label3D).queue_free()
		_door_slabs.remove_at(i)


func _apply_wall_height(h: float) -> void:
	_wall_h = h
	for mi in _walls:
		var w: Rect2 = mi.get_meta("rect")
		var c := w.get_center()
		mi.scale = Vector3(1, h, 1)
		mi.position = Vector3(c.x, h / 2.0, c.y)


func _build_props() -> void:
	var tops := {}
	for s in world.sprites:
		var base := 0.0
		if s.host != "" and tops.has(s.host):
			base = tops[s.host]
		var in_granny := _is_spooky(String(world.room_by_id(s.room).get("location", "")))
		var made := ModelLibrary.make(s, base, _pickup_uid(s.uid), in_granny)
		tops[s.uid] = made.top
		var node: Node3D = made.node
		add_child(node)
		if _pickup_uid(s.uid):
			node.set_meta("y0", node.position.y)
			_pickup_nodes[s.uid] = node
		if _is_target(s.uid):
			_target_nodes[s.uid] = node
	for h in world.hides:
		var label := Label3D.new()
		label.text = GameData.t("hide")
		label.font = UIKit.body_font()
		label.font_size = 40
		label.pixel_size = 0.008
		label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
		label.modulate = Color(1, 1, 1, 0.85)
		label.no_depth_test = true
		var c := (h.rect as Rect2).get_center()
		label.position = Vector3(c.x, 2.3, c.y)
		add_child(label)


func _pickup_uid(uid: String) -> bool:
	for p in world.pickups:
		if p.uid == uid:
			return true
	return false


func _is_target(uid: String) -> bool:
	for t in world.targets:
		if t.id == uid:
			return true
	return false


func _build_extras() -> void:
	for t in world.targets:
		if t.kind != "shoes":
			continue
		var node := Node3D.new()
		var c := (t.rect as Rect2).get_center()
		node.position = Vector3(c.x, 0, c.y)
		var model := ModelLibrary.load_model("shoes")
		if model != null:
			node.add_child(model)
		else:
			for dz in [-0.2, 0.2]:
				var shoe := MeshInstance3D.new()
				var cm := CapsuleMesh.new()
				cm.radius = 0.12
				cm.height = 0.5
				shoe.mesh = cm
				shoe.material_override = ModelLibrary._material(0.75, true)
				shoe.rotation_degrees = Vector3(0, 0, 90)
				shoe.position = Vector3(0, 0.12, dz)
				node.add_child(shoe)
		var label := Label3D.new()
		label.text = GameData.L(t.label)
		label.font = UIKit.body_font()
		label.font_size = 36
		label.pixel_size = 0.008
		label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
		label.position = Vector3(0, 0.9, 0)
		node.add_child(label)
		add_child(node)
		_target_nodes[t.id] = node
	# pulsing ring on whatever the current step needs
	_marker = MeshInstance3D.new()
	var tm := TorusMesh.new()
	tm.inner_radius = 0.46
	tm.outer_radius = 0.52
	_marker.mesh = tm
	_marker.material_override = _flat_material(Color(1, 1, 1), true)
	add_child(_marker)


func _build_characters() -> void:
	var anisha := ModelLibrary.make_character("anisha", 0.82, 1.2, GameLogic.PLAYER_RADIUS * 0.8, false)
	_player = anisha.node
	_player_fade = anisha.fade
	_player_anim = anisha.anim
	add_child(_player)
	_prev_player = logic.player_pos
	_you_label = Label3D.new()
	_you_label.text = GameData.t("you")
	_you_label.font = UIKit.body_font()
	_you_label.font_size = 40
	_you_label.pixel_size = 0.005
	_you_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	_you_label.position = Vector3(0, 1.7, 0)
	_you_label.no_depth_test = true
	_player.add_child(_you_label)
	var tween := create_tween()
	tween.tween_interval(5.0)
	tween.tween_property(_you_label, "modulate:a", 0.0, 0.8)

	_cone_mat = StandardMaterial3D.new()
	_cone_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_cone_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_cone_mat.vertex_color_use_as_albedo = true
	_cone_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	_cone_mat.no_depth_test = false


## Baddies come and go with the tasks, so their nodes are made (and removed) to match logic.baddies.
func _sync_baddie_nodes() -> void:
	var present := {}
	for b in logic.baddies:
		present[b.id] = true
		if not _bnodes.has(b.id):
			_bnodes[b.id] = _make_baddie_node(b)
	for id in _bnodes.keys():
		if not present.has(id):
			var e: Dictionary = _bnodes[id]
			(e.node as Node3D).queue_free()
			(e.cone as MeshInstance3D).queue_free()
			_bnodes.erase(id)


func _make_baddie_node(b: Dictionary) -> Dictionary:
	var kind: Dictionary = GameData.baddie_kinds.get(b.kind, {})
	var made := ModelLibrary.make_character(String(kind.get("model", "")), 0.28, 1.5, GameLogic.BADDIE_RADIUS * 0.85, true)
	var node: Node3D = made.node
	var name_label := Label3D.new()
	name_label.text = GameData.L(b.name)
	name_label.font = UIKit.body_font()
	name_label.font_size = 40
	name_label.pixel_size = 0.005
	name_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	name_label.position = Vector3(0, 2.0, 0)
	name_label.no_depth_test = true
	node.add_child(name_label)
	var bubble := Label3D.new()
	bubble.text = "?"
	bubble.font = UIKit.title_font()
	bubble.font_size = 90
	bubble.pixel_size = 0.01
	bubble.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	bubble.position = Vector3(0, 2.6, 0)
	bubble.visible = false
	bubble.no_depth_test = true
	node.add_child(bubble)
	node.position = Vector3(b.pos.x, 0, b.pos.y)
	add_child(node)
	var cone := MeshInstance3D.new()
	cone.mesh = ImmediateMesh.new()
	cone.material_override = _cone_mat
	add_child(cone)
	return {"node": node, "bubble": bubble, "cone": cone, "anim": made.anim}


func _build_camera() -> void:
	cam = Camera3D.new()
	cam.fov = 52
	cam.far = 120
	add_child(cam)
	cam.make_current()
	_update_camera(1.0, true)


# ---------- each frame ----------

func _process(delta: float) -> void:
	_time += delta
	var dt := minf(delta, 0.05)
	if active and logic.result == "":
		logic.tick(dt)
	_sync_visuals(delta)
	_update_camera(dt, false)


func _unhandled_input(event: InputEvent) -> void:
	if not active or logic.result != "":
		if event.is_action_pressed("pause") and logic.result == "":
			pause_requested.emit()
		return
	if event.is_action_pressed("pause"):
		pause_requested.emit()
	elif event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		_tap(event.position)


# ---------- taps ----------

## A tap or click at a screen position: a thing that matters, or else the ground.
func _tap(screen: Vector2) -> void:
	var o := cam.project_ray_origin(screen)
	var d := cam.project_ray_normal(screen)
	var thing := _thing_on_ray(o, d)
	if not thing.is_empty():
		logic.tap_thing(thing)
		return
	if absf(d.y) < 0.001:
		return
	var t := -o.y / d.y
	if t <= 0.0:
		return
	var hit := o + d * t
	logic.tap_ground(Vector2(hit.x, hit.z))
	_show_tap(Vector2(hit.x, hit.z))


## The thing a ray points at (a loose box around each thing, so a fat finger is fine). Things the current step
## wants win over things that only happen to be in front.
func _thing_on_ray(o: Vector3, d: Vector3) -> Dictionary:
	var best := {}
	var best_t := INF
	var candidates: Array[Dictionary] = []
	for p in world.pickups:
		if not logic.picked.has(p.uid):
			candidates.append({"kind": "pickup", "pickup": p, "rect": p.rect})
	for tg in world.targets:
		candidates.append({"kind": "target", "target": tg, "rect": tg.rect})
	for h in world.hides:
		candidates.append({"kind": "hide", "hide": h, "rect": h.rect})
	for c in candidates:
		var t := _ray_box(o, d, (c.rect as Rect2).grow(0.15), 1.6)
		if t < 0.0:
			continue
		if logic.hint_for(c).go:
			t -= 1.0
		if t < best_t:
			best_t = t
			best = c
	return best


## Where a ray enters a box standing on the floor (-1 when it misses).
func _ray_box(o: Vector3, d: Vector3, r: Rect2, height: float) -> float:
	var lo := Vector3(r.position.x, 0.0, r.position.y)
	var hi := Vector3(r.end.x, height, r.end.y)
	var tmin := 0.0
	var tmax := INF
	for axis in 3:
		if absf(d[axis]) < 1e-9:
			if o[axis] < lo[axis] or o[axis] > hi[axis]:
				return -1.0
		else:
			var t1: float = (lo[axis] - o[axis]) / d[axis]
			var t2: float = (hi[axis] - o[axis]) / d[axis]
			tmin = maxf(tmin, minf(t1, t2))
			tmax = minf(tmax, maxf(t1, t2))
			if tmin > tmax:
				return -1.0
	return tmin


## A small ring that ripples where she was sent.
func _show_tap(p: Vector2) -> void:
	if _tap_ring == null:
		_tap_ring = MeshInstance3D.new()
		var tm := TorusMesh.new()
		tm.inner_radius = 0.2
		tm.outer_radius = 0.26
		_tap_ring.mesh = tm
		_tap_ring.material_override = _flat_material(Color(1, 1, 1), true)
		add_child(_tap_ring)
	_tap_ring.position = Vector3(p.x, 0.06, p.y)
	_tap_ring.visible = true
	_tap_ring.scale = Vector3(0.3, 1, 0.3)
	var tw := create_tween()
	tw.tween_property(_tap_ring, "scale", Vector3(1.4, 1, 1.4), 0.45)
	tw.tween_callback(func() -> void: _tap_ring.visible = false)


# ---------- the bubble over a tapped thing ----------

func _build_bubble() -> void:
	_bubble = Node3D.new()
	_bubble.visible = false
	add_child(_bubble)
	var img := Image.create(128, 128, false, Image.FORMAT_RGBA8)
	for y in 128:
		for x in 128:
			var dd := Vector2(x - 63.5, y - 63.5).length()
			img.set_pixel(x, y, Color(1, 1, 1, clampf(64.0 - dd, 0.0, 1.0)))
	var disc := Sprite3D.new()
	disc.texture = ImageTexture.create_from_image(img)
	disc.pixel_size = 0.0125
	disc.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	disc.no_depth_test = true
	disc.shaded = false
	disc.render_priority = 1
	_bubble.add_child(disc)
	_bubble_item = Node3D.new()
	_bubble_item.position.y = -0.1
	_bubble.add_child(_bubble_item)
	_bubble_text = Label3D.new()
	_bubble_text.font = UIKit.body_font()
	_bubble_text.font_size = 48
	_bubble_text.pixel_size = 0.006
	_bubble_text.modulate = Color(0.04, 0.04, 0.043)
	_bubble_text.outline_size = 0
	_bubble_text.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	_bubble_text.no_depth_test = true
	_bubble_text.render_priority = 2
	_bubble_text.position = Vector3(0, -0.5, 0)
	_bubble.add_child(_bubble_text)


func _show_hint(rect: Rect2, item: String, key: String, vars: Dictionary) -> void:
	var text := GameData.L(vars.text) if key == "@text" else GameData.t(key, vars)
	_bubble_text.text = text
	for c in _bubble_item.get_children():
		c.queue_free()
	_bubble_text.position.y = -0.5
	if item != "":
		for sp in world.sprites:
			if sp.uid == item:
				var made := ModelLibrary.make(sp, 0.0, true)
				var node: Node3D = made.node
				node.position = Vector3.ZERO
				node.rotation_degrees = Vector3(0, 30, 0)
				node.scale = Vector3.ONE * clampf(0.55 / maxf(float(made.top), 0.1), 0.4, 3.0)
				_bubble_item.add_child(node)
				break
	var c := rect.get_center()
	_bubble.position = Vector3(c.x, 2.3, c.y)
	_bubble.visible = true
	_bubble_time = 2.4
	# a thing that is not ready yet gives a little wiggle
	_wiggle = null
	if key == "needShort" or key == "notYetShort" or key == "bagFull":
		for id in _target_nodes:
			var n: Node3D = _target_nodes[id]
			if Geo.point_in_rect(Vector2(n.position.x, n.position.z), rect.grow(0.3)):
				_wiggle = n
		_wiggle_time = 0.5


func _animate_bubble(delta: float) -> void:
	if _bubble_time > 0.0:
		_bubble_time -= delta
		_bubble.scale = Vector3.ONE * minf(1.0, (2.4 - _bubble_time) * 8.0 + 0.2) * minf(1.0, _bubble_time * 4.0)
		if _bubble_time <= 0.0:
			_bubble.visible = false
	if _wiggle != null and is_instance_valid(_wiggle):
		_wiggle_time -= delta
		_wiggle.rotation.z = sin(_time * 40.0) * 0.12 * maxf(_wiggle_time, 0.0) * 2.0
		if _wiggle_time <= 0.0:
			_wiggle.rotation.z = 0.0
			_wiggle = null


## A soft pulsing ring under each thing the current task needs, so you can tell what matters from the scenery.
func _refresh_rings() -> void:
	var wanted := {}
	for st in logic.task.get("steps", []):
		for k in ["item", "target"]:
			if st.has(k):
				wanted[st[k]] = true
	for id in _rings.keys():
		if not wanted.has(id):
			(_rings[id] as Node3D).queue_free()
			_rings.erase(id)
	for id in wanted:
		var r := Rect2()
		var found := false
		var pk := logic.pick_by_id(id)
		if not pk.is_empty():
			r = pk.rect
			found = true
		else:
			for t in world.targets:
				if t.id == id:
					r = t.rect
					found = true
		if not found:
			continue
		if not _rings.has(id):
			var ring := MeshInstance3D.new()
			var tm := TorusMesh.new()
			var rad := maxf(0.4, minf(r.size.x, r.size.y) / 2.0 + 0.1)
			tm.inner_radius = rad - 0.025
			tm.outer_radius = rad + 0.025
			ring.mesh = tm
			ring.material_override = _flat_material(Color(1, 1, 1), true)
			var c := r.get_center()
			ring.position = Vector3(c.x, 0.04, c.y)
			add_child(ring)
			_rings[id] = ring
		(_rings[id] as Node3D).visible = pk.is_empty() or not logic.picked.has(id)


func toggle_camera() -> void:
	cam_mode = 1 - cam_mode
	if cam_mode == 0:
		yaw = 0.0
	else:
		yaw = logic.player_facing + PI / 2.0 # start looking the way she is facing


func _sync_visuals(delta: float) -> void:
	var p := logic.player_pos
	_player.position = Vector3(p.x, 0, p.y)
	_player.rotation.y = -logic.player_facing
	var alpha := 0.22 if logic.is_hiding() else 1.0
	for mat in _player_fade:
		mat.albedo_color.a = alpha
	_animate_player()
	_light.position = Vector3(p.x, 2.4, p.y)
	_blend_mood(delta)
	for b in logic.baddies:
		var e: Dictionary = _bnodes.get(b.id, {})
		if e.is_empty():
			continue
		(e.node as Node3D).position = Vector3(b.pos.x, 0, b.pos.y)
		(e.node as Node3D).rotation.y = -b.facing
		(e.bubble as Label3D).visible = b.distracted_left > 0.0
		_animate_baddie(e, b)
		_draw_cone(e.cone, b)
	# bob the things that can be picked up
	for uid in _pickup_nodes:
		var n: Node3D = _pickup_nodes[uid]
		n.rotation.y = _time * 1.2
		n.position.y = float(n.get_meta("y0", 0.0)) + 0.04 + 0.04 * sin(_time * 3.0 + n.position.x)
	for id in _rings:
		var ring: MeshInstance3D = _rings[id]
		ring.scale = Vector3.ONE * (1.0 + 0.1 * sin(_time * 3.0))
	_animate_bubble(delta)
	_marker.scale = Vector3.ONE * (1.0 + 0.18 * sin(_time * 4.0))
	# walls drop low for the dollhouse view and rise for third person
	var target_h := WALL_H_DOLLHOUSE if cam_mode == 0 else WALL_H_THIRD
	if absf(_wall_h - target_h) > 0.01:
		_apply_wall_height(lerpf(_wall_h, target_h, 0.15))


func _play(ap: AnimationPlayer, anim_name: String) -> void:
	if ap != null and ap.has_animation(anim_name) and ap.current_animation != anim_name:
		ap.play(anim_name, 0.2)


func _animate_player() -> void:
	var moved := logic.player_pos.distance_to(_prev_player)
	_prev_player = logic.player_pos
	if logic.is_hiding():
		_play(_player_anim, "hide")
	elif moved > 0.002:
		_play(_player_anim, "walk")
	else:
		_play(_player_anim, "idle")


func _animate_baddie(e: Dictionary, b: Dictionary) -> void:
	var ap: AnimationPlayer = e.anim
	if logic.result == "caught" and b.kind == logic.caught_by:
		_play(ap, "caught_you")
	elif b.distracted_left > 0.0:
		_play(ap, "look_around")
	elif b.wait_left > 0.0:
		_play(ap, "idle")
	else:
		_play(ap, "walk")


func _draw_cone(cone: MeshInstance3D, b: Dictionary) -> void:
	var mesh: ImmediateMesh = cone.mesh
	mesh.clear_surfaces()
	if b.distracted_left > 0.0:
		return
	var poly := Geo.cone_polygon(b.pos, b.facing, b.half_angle, b.range, logic.blockers)
	var col := Color(1, 1, 1, 0.32 if b.sees else 0.12)
	mesh.surface_begin(Mesh.PRIMITIVE_TRIANGLES)
	for k in range(1, poly.size() - 1):
		for v in [poly[0], poly[k], poly[k + 1]]:
			mesh.surface_set_color(col)
			mesh.surface_add_vertex(Vector3(v.x, 0.05, v.y))
	mesh.surface_end()


func _place_marker() -> void:
	var step := logic.current_step()
	var r := Rect2()
	var found := false
	match step.get("type", ""):
		"pickup":
			var pk := logic.pick_by_id(step.item)
			if not pk.is_empty():
				r = pk.rect
				found = true
		"use":
			for t in world.targets:
				if t.id == step.target:
					r = t.rect
					found = true
		"reach":
			var rm := world.room_by_id(step.room)
			if not rm.is_empty():
				r = rm.interior
				found = true
	_marker.visible = found
	if found:
		var c := r.get_center()
		_marker.position = Vector3(c.x, 0.06, c.y)
		var rad := maxf(0.7, minf(r.size.x, r.size.y) / 2.0 + 0.15)
		if step.get("type", "") == "reach":
			rad = 1.4 # a room is big: just ring its middle
		_marker.set_meta("radius", rad)
		(_marker.mesh as TorusMesh).inner_radius = rad - 0.04
		(_marker.mesh as TorusMesh).outer_radius = rad + 0.04


func _pop_target(id: String) -> void:
	# a little pop on the thing that was just used
	if _target_nodes.has(id):
		var n: Node3D = _target_nodes[id]
		var tw := create_tween()
		tw.tween_property(n, "scale", Vector3.ONE * 1.35, 0.12)
		tw.tween_property(n, "scale", Vector3.ONE, 0.2)


## Back in her room: put the camera and the animation state where she is now.
func _on_respawned() -> void:
	_prev_player = logic.player_pos
	yaw = 0.0 if cam_mode == 0 else logic.player_facing + PI / 2.0
	_sync_visuals(0.0)
	_update_camera(1.0, true)
	_place_marker()


func _on_pet_called(from: Vector2, to: Vector2) -> void:
	var pet := MeshInstance3D.new()
	var sm := SphereMesh.new()
	sm.radius = 0.2
	sm.height = 0.4
	pet.mesh = sm
	pet.material_override = _flat_material(Color(1, 1, 1), true)
	pet.position = Vector3(from.x, 0.25, from.y)
	add_child(pet)
	var tw := create_tween()
	tw.tween_property(pet, "position", Vector3(to.x + 0.6, 0.25, to.y + 0.4), 0.7)
	tw.tween_interval(GameLogic.PET_DISTRACTION)
	tw.tween_callback(pet.queue_free)


func _update_camera(dt: float, snap: bool) -> void:
	var p := logic.player_pos
	var target := Vector3(p.x, 0.8, p.y)
	var want: Vector3
	if cam_mode == 0:
		want = target + Vector3(0, 12.5, 8.4)
	else:
		var f := Vector2(sin(yaw), -cos(yaw))
		# pull the camera in if a wall is behind Anisha
		var back := Geo.cast_ray(p, (-f).angle(), 5.5, Geo.near(p, 6.0, world.walls))
		var dist := clampf(back - 0.35, 2.2, 5.5)
		want = target - Vector3(f.x, 0, f.y) * dist + Vector3(0, 1.3 + dist * 0.5, 0)
	var k := 1.0 if snap else 1.0 - exp(-9.0 * dt)
	cam.position = cam.position.lerp(want, k)
	var look := target + Vector3(0, 0.3, 0)
	cam.look_at(look, Vector3.UP)
