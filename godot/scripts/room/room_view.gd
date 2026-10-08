class_name RoomView
extends Node2D
## Draws one room, all of it on screen, from the art pack: the room's empty background picture, the furniture and
## things on top of it (placed where the room file says), Anisha and the baddie. The picture is 1600 x 900 and is shown
## at 0.8 on the game's 1280 x 720 screen. Tapping the floor walks there; tapping a thing walks to it and grabs it.

const SHOWN_SCALE := 0.8    # the 1600 x 900 picture on the 1280 x 720 screen
const CHAR_SCALE := 0.5     # the characters' pictures are drawn at 2x, like the items'

var game: RoomGame
var camera: RoomCamera
var sneak_toggle := false
var paused := false      # while the lift screen is up

var _stage: Node2D
var _world: Node2D
var _nodes := {}          # item uid -> its node
var _player: Node2D
var _player_sprite: Sprite2D
var _peek: Node2D
var _baddie_node: Node2D
var _baddie_sprite: Sprite2D
var _alert: Label
var _cone: Cone
var _marker: Marker
var _ring: Ring
var _t := 0.0


func setup(g: RoomGame) -> void:
	game = g
	camera = g.camera
	_stage = Node2D.new()
	_stage.scale = Vector2.ONE * SHOWN_SCALE
	add_child(_stage)
	var back := RoomBackdrop.new()
	_stage.add_child(back)
	back.setup(self)
	_cone = Cone.new()
	_cone.view = self
	_cone.z_index = 5
	_stage.add_child(_cone)
	_ring = Ring.new()
	_ring.z_index = 6
	_stage.add_child(_ring)
	_world = Node2D.new()
	_stage.add_child(_world)
	_build_items()
	_build_characters()
	_marker = Marker.new()
	_marker.z_index = 3500
	_stage.add_child(_marker)
	var hints := Hints.new()
	hints.view = self
	hints.z_index = 3400
	_stage.add_child(hints)
	get_viewport().size_changed.connect(_fit)
	_fit()


## The picture stays 16:9 in the middle of whatever shape the window is.
func _fit() -> void:
	_stage.position = (get_viewport_rect().size - RoomCamera.SCREEN * SHOWN_SCALE) / 2.0


# ---------------------------------------------------------------- room to screen

func map(p: Vector2) -> Vector2:
	return camera.map(p)


func unmap(sp: Vector2) -> Vector2:
	return camera.unmap(sp)


func scale_at(v: float) -> float:
	return camera.scale_at(v)


## Draw order: the room file gives each thing a depth `z` (the front edge of what it stands on); characters use theirs.
static func z_for(depth: float) -> int:
	return mini(3300, int(round(depth * 100.0)))


# ---------------------------------------------------------------- building

func _build_items() -> void:
	for e in game.items:
		var tex := PackArt.sprite(e.sprite)
		if tex == null:
			continue
		var d: Dictionary = e.get("draw", {})
		if d.has("quad"):
			_add_quad(e, tex, d)
			continue
		var n := Node2D.new()
		var spr := Sprite2D.new()
		spr.texture = tex
		spr.centered = false
		var sz := tex.get_size()
		if d.get("kind", "") == "side-wall" and d.has("matrix"):
			# a thing on the side wall: the file gives a slanted transform for the 1x picture
			var m: Array = d.matrix
			n.transform = Transform2D(Vector2(m[0], m[1]), Vector2(m[2], m[3]), Vector2(m[4], m[5])) * Transform2D().scaled(Vector2.ONE * 0.5)
			spr.position = Vector2.ZERO
		else:
			var at := Vector2(float(d.x), float(d.y)) if not d.is_empty() else map(e.pos)
			var sc := float(d.scale) if not d.is_empty() else scale_at(e.pos.y)
			n.position = at
			n.scale = Vector2.ONE * sc * 0.5
			spr.position = Vector2(-sz.x / 2.0, -sz.y)
		n.add_child(spr)
		var z := float(d.get("z", e.pos.y + 0.5))
		n.z_index = z_for(z) + (1 if e.host != "" else 0)
		n.set_meta("size", sz * n.scale)
		_world.add_child(n)
		_nodes[e.uid] = n


## A rug or a mat on the floor: the picture stretched over the four corners the room file gives.
func _add_quad(e: Dictionary, tex: Texture2D, d: Dictionary) -> void:
	var poly := Polygon2D.new()
	var pts := PackedVector2Array()
	for c in d.quad:
		pts.append(Vector2(float(c[0]), float(c[1])))
	var sz := tex.get_size()
	poly.polygon = pts
	poly.uv = PackedVector2Array([Vector2(0, 0), Vector2(sz.x, 0), Vector2(sz.x, sz.y), Vector2(0, sz.y)])
	poly.texture = tex
	poly.z_index = 10
	_world.add_child(poly)


func _build_characters() -> void:
	_player = Node2D.new()
	_player.add_child(Shade.new(80.0))
	_player_sprite = _char_sprite("anisha")
	_player.add_child(_player_sprite)
	_peek = Peek.new()
	_peek.visible = false
	_player.add_child(_peek)
	_world.add_child(_player)
	if not game.baddie.is_empty():
		_baddie_node = Node2D.new()
		_baddie_node.add_child(Shade.new(90.0))
		_baddie_sprite = _char_sprite(game.baddie.char)
		_baddie_node.add_child(_baddie_sprite)
		_alert = UIKit.label("!", 96, UIKit.BERRY, true)
		_alert.add_theme_color_override("font_outline_color", UIKit.INK)
		_alert.add_theme_constant_override("outline_size", 14)
		_baddie_node.add_child(_alert)
		_world.add_child(_baddie_node)


func _char_sprite(id: String) -> Sprite2D:
	var s := Sprite2D.new()
	s.texture = PackArt.character(id)
	s.centered = false
	var sz := s.texture.get_size()
	s.position = Vector2(-sz.x / 2.0, -sz.y)
	return s


# ---------------------------------------------------------------- every frame

func _process(delta: float) -> void:
	_t += delta
	if paused:
		game.move_dir = Vector2.ZERO
		return
	game.move_dir = Input.get_vector("move_left", "move_right", "move_up", "move_down")
	game.sneaking = Input.is_action_pressed("sneak") or sneak_toggle
	if Input.is_action_just_pressed("use"):
		game.do_action()
	game.update(delta)
	_sync()


func _sync() -> void:
	for uid in _nodes:
		_nodes[uid].visible = not game.item_by_uid(uid).taken
	_place_char(_player, _player_sprite, game.pos, game.walking, game.face, game.sneaking)
	_player.position.y += -10.0 if game.hidden else 0.0
	_player_sprite.visible = not game.hidden
	_peek.visible = game.hidden
	if game.hidden:
		_player.z_index = z_for(game.pos.y) - 40
	if _baddie_node != null:
		var b: Dictionary = game.baddie
		_place_char(_baddie_node, _baddie_sprite, b.pos, float(b.wait) <= 0.0, b.face, false)
		_alert.visible = game.seen_now
		var h := _baddie_sprite.texture.get_size().y
		_alert.position = Vector2(-26, -h - 70.0 + sin(_t * 14.0) * 8.0)
		_cone.queue_redraw()
	var action := game.current_action()
	_ring.target = null
	if action.get("kind", "") == "grab":
		_ring.target = _nodes.get(action.item.uid)
	var goal := game.objective_item()
	_marker.target = _nodes.get(goal) if goal != "" else null
	_ring.queue_redraw()
	_marker.queue_redraw()


## Puts a character on the floor at room position `p`: its size follows its depth; it bobs while walking.
func _place_char(node: Node2D, sprite: Sprite2D, p: Vector2, moving: bool, face: Vector2, slow: bool) -> void:
	node.position = map(p)
	node.scale = Vector2.ONE * scale_at(p.y) * CHAR_SCALE * (0.88 if node == _baddie_node else 1.0)
	node.z_index = z_for(p.y)
	var rate := 7.0 if slow else 11.0
	var bob := absf(sin(_t * rate)) if moving else 0.0
	sprite.position.y = -sprite.texture.get_size().y - bob * 14.0
	sprite.rotation = sin(_t * rate) * 0.05 if moving else 0.0
	sprite.scale = Vector2(1.0, 0.92 if slow else 1.0)
	if absf(face.x) > 0.3:
		sprite.flip_h = face.x < 0.0


# ---------------------------------------------------------------- taps

func _unhandled_input(event: InputEvent) -> void:
	if not (event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT):
		return
	if game.result != "" or paused:
		return
	var p := _stage.get_local_mouse_position()
	var hits := game.items.duplicate()
	hits.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return a.pos.y > b.pos.y)
	for e in hits:
		var n: Node2D = _nodes.get(e.uid)
		if n == null or e.taken or not e.tags.has("pickup"):
			continue
		var sz: Vector2 = n.get_meta("size")
		var r := Rect2(n.position + Vector2(-sz.x / 2.0, -sz.y), sz).grow(10.0)
		if r.has_point(p):
			game.go_to(e.pos, e.uid)
			return
	var room_p := unmap(p)
	if room_p.y >= 0.0 and room_p.y <= game.size.y + 0.5 and room_p.x > -0.5 and room_p.x < game.size.x + 0.5:
		game.go_to(room_p)


# ---------------------------------------------------------------- little drawn helpers

## A soft oval shadow under a character.
class Shade extends Node2D:
	var half_w := 80.0

	func _init(w: float = 80.0) -> void:
		half_w = w
		z_index = -2
		z_as_relative = true

	func _draw() -> void:
		draw_set_transform(Vector2.ZERO, 0.0, Vector2(1.0, 0.3))
		draw_circle(Vector2.ZERO, half_w, Color(0.35, 0.28, 0.4, 0.22))


## The baddie's flashlight: the part of the floor she can see.
class Cone extends Node2D:
	var view: RoomView

	func _draw() -> void:
		var g := view.game
		if g.baddie.is_empty():
			return
		var b: Dictionary = g.baddie
		var pts := PackedVector2Array([view.map(b.pos)])
		var a0: float = (b.face as Vector2).angle() - float(b.half)
		var reach: float = float(b.range) * (0.6 if g.sneaking else 1.0)
		for i in 21:
			var a := a0 + float(b.half) * 2.0 * float(i) / 20.0
			pts.append(view.map((b.pos as Vector2) + Vector2(cos(a), sin(a)) * reach))
		var col := UIKit.BERRY if g.seen_now else UIKit.SUN
		draw_colored_polygon(pts, Color(col.r, col.g, col.b, 0.34 if g.seen_now else 0.26))
		pts.append(pts[0])
		draw_polyline(pts, Color(col.r, col.g, col.b, 0.7), 3.0, true)


## A pulsing ring under the thing she can grab right now.
class Ring extends Node2D:
	var target: Node2D = null

	func _draw() -> void:
		if target == null:
			return
		var sz: Vector2 = target.get_meta("size")
		var pulse := 1.0 + sin(Time.get_ticks_msec() / 160.0) * 0.08
		var r := maxf(46.0, sz.x * 0.55) * pulse
		draw_set_transform(target.position, 0.0, Vector2(1.0, 0.32))
		draw_arc(Vector2.ZERO, r, 0.0, TAU, 40, Color(1, 1, 1, 0.95), 7.0, true)
		draw_arc(Vector2.ZERO, r, 0.0, TAU, 40, UIKit.PUMPKIN, 3.5, true)


## A bobbing arrow over the thing the task wants.
class Marker extends Node2D:
	var target: Node2D = null

	func _draw() -> void:
		if target == null or not target.visible:
			return
		var sz: Vector2 = target.get_meta("size")
		var bob := sin(Time.get_ticks_msec() / 200.0) * 9.0
		var top := target.position + Vector2(0, -sz.y - 14.0 + bob)
		var pts := PackedVector2Array([top, top + Vector2(-22, -34), top + Vector2(22, -34)])
		draw_colored_polygon(pts, UIKit.SUN)
		pts.append(pts[0])
		draw_polyline(pts, UIKit.INK, 5.0, true)


## Bobbing arrows at the doors.
class Hints extends Node2D:
	var view: RoomView

	func _process(_dt: float) -> void:
		queue_redraw()

	func _draw() -> void:
		var bob := sin(Time.get_ticks_msec() / 260.0) * 8.0
		for d in view.game.doors:
			var base := view.map(d.mid)
			var dir := Vector2.ZERO
			var at := base
			match d.side:
				"E":
					dir = Vector2(1, 0)
					at = base + Vector2(-70, -90)
				"W":
					dir = Vector2(-1, 0)
					at = base + Vector2(70, -90)
				"N":
					dir = Vector2(0, -1)
					at = base + Vector2(0, -190)
				_:
					dir = Vector2(0, 1)
					at = base + Vector2(0, -150)
			at += dir * bob
			var side := Vector2(-dir.y, dir.x)
			var pts := PackedVector2Array([at + dir * 24, at - dir * 13 + side * 21, at - dir * 13 - side * 21])
			draw_colored_polygon(pts, UIKit.PAPER)
			pts.append(pts[0])
			draw_polyline(pts, UIKit.INK, 4.5, true)


## Anisha's eyes looking out from her hiding place.
class Peek extends Node2D:
	func _draw() -> void:
		for sx in [-14.0, 14.0]:
			draw_circle(Vector2(sx, -58), 12.0, Color.WHITE)
			draw_circle(Vector2(sx + 2.0, -58), 5.5, UIKit.INK)
