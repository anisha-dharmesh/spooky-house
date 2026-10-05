class_name LevelView
extends Node3D
## Shows the world in 3D and drives the game each frame. Two cameras: a tilted "dollhouse" view from above
## and a third-person view behind Anisha (V switches, Q / R or a drag turns the third-person camera).
## Only Granny's house is spooky: the light and fog change as Anisha walks in and out of it.

signal pause_requested

const WALL_H_DOLLHOUSE := 1.0
const WALL_H_THIRD := 2.6

var logic: GameLogic
var world: WorldData
var active := true
var touch: Node = null   # TouchControls when on a touch device

var cam: Camera3D
var cam_mode := 0        # 0 = dollhouse, 1 = third person
var yaw := 0.0

var _player: Node3D
var _player_fade: Array = []   # materials whose alpha shows sneaking / hiding
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
	logic.item_picked.connect(func(id: String) -> void:
		if _pickup_nodes.has(id):
			_pickup_nodes[id].visible = false)
	logic.items_restored.connect(func(ids: Array) -> void:
		for id in ids:
			if _pickup_nodes.has(id):
				_pickup_nodes[id].visible = true)
	logic.steps_changed.connect(_place_marker)
	logic.pet_called.connect(_on_pet_called)
	logic.target_used.connect(_pop_target)
	logic.baddies_changed.connect(_sync_baddie_nodes)
	logic.room_unlocked.connect(_open_doors_into)
	logic.respawned.connect(_on_respawned)
	for id in logic.picked: # used up in tasks that are already done
		if _pickup_nodes.has(id):
			_pickup_nodes[id].visible = false
	_place_marker()


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
		var iv := Input.get_vector("move_left", "move_right", "move_up", "move_down")
		var sneak := Input.is_action_pressed("sneak")
		if touch != null:
			if touch.move_vec.length() > 0.05:
				iv = touch.move_vec
			sneak = sneak or touch.sneak_on
		var f := Vector2(sin(yaw), -cos(yaw))
		var r := Vector2(cos(yaw), sin(yaw))
		logic.tick(dt, r * iv.x + f * (-iv.y), sneak)
		if cam_mode == 1:
			var turn := Input.get_axis("cam_left", "cam_right")
			if touch != null:
				turn += touch.cam_turn
			yaw += turn * 1.8 * dt
	_sync_visuals(delta)
	_update_camera(dt, false)


func _unhandled_input(event: InputEvent) -> void:
	if not active or logic.result != "":
		if event.is_action_pressed("pause") and logic.result == "":
			pause_requested.emit()
		return
	if event.is_action_pressed("use"):
		logic.use()
	elif event.is_action_pressed("hide"):
		logic.toggle_hide()
	elif event.is_action_pressed("pet"):
		logic.call_pet()
	elif event.is_action_pressed("pause"):
		pause_requested.emit()
	elif event.is_action_pressed("cam_toggle"):
		toggle_camera()
	elif cam_mode == 1 and event is InputEventMouseMotion and (event.button_mask & MOUSE_BUTTON_MASK_RIGHT) != 0:
		yaw += event.relative.x * 0.008


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
	var alpha := 0.22 if logic.is_hiding() else (0.7 if logic.sneaking else 1.0)
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
		_play(_player_anim, "sneak" if logic.sneaking else "walk")
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
