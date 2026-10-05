class_name TitleScreen
extends Control
## Title screen: the haunted house, the moon, the name and a Play button.

signal play_pressed
signal language_chosen(lang: String)

var _bats: Array[Vector2] = []
var _t := 0.0
var _stars: Array[Vector3] = []


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var rng := RandomNumberGenerator.new()
	rng.seed = 7
	for i in 18:
		_stars.append(Vector3(rng.randf(), rng.randf() * 0.5, rng.randf_range(1.0, 2.4)))
	for i in 3:
		_bats.append(Vector2(0.62 + i * 0.09, 0.14 + i * 0.07))

	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 14)
	col.anchor_top = 0.5
	col.anchor_bottom = 0.5
	col.offset_left = 80
	col.offset_top = -250
	col.offset_right = 700
	col.offset_bottom = 260
	add_child(col)
	var anisha := UIKit.label(GameData.t("anisha"), 30, Color("bdbdb8"))
	col.add_child(anisha)
	var title := UIKit.label(GameData.t("gameTitle"), 112, UIKit.WHITE, true)
	col.add_child(title)
	var tag := UIKit.label(GameData.t("tagline"), 28, Color("c9c9c4"))
	tag.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	tag.custom_minimum_size = Vector2(580, 0)
	col.add_child(tag)
	var play := UIKit.button(GameData.t("play"), "primary", 36, func() -> void: play_pressed.emit())
	play.custom_minimum_size = Vector2(340, 72)
	col.add_child(play)
	var lang_row := HBoxContainer.new()
	lang_row.add_theme_constant_override("separation", 8)
	for spec in [["en", "English"], ["hi", "हिन्दी"]]:
		var active: bool = GameData.lang == spec[0]
		var b := UIKit.button(spec[1], "primary" if active else "dark", 20, func() -> void: language_chosen.emit(spec[0]))
		b.custom_minimum_size = Vector2(120, 48)
		lang_row.add_child(b)
	col.add_child(lang_row)


func _process(delta: float) -> void:
	_t += delta
	queue_redraw()


func _draw() -> void:
	var s := size
	draw_rect(Rect2(Vector2.ZERO, s), UIKit.BG)
	for st in _stars:
		var a := 0.5 + 0.4 * sin(_t * st.z + st.x * 9.0)
		draw_circle(Vector2(st.x * s.x, st.y * s.y), st.z, Color(0.75, 0.75, 0.73, a))
	# crescent moon
	var moon := Vector2(s.x * 0.86, s.y * 0.16)
	draw_circle(moon, 58, Color("e9e9e4"))
	draw_circle(moon + Vector2(20, -14), 54, UIKit.BG)
	# bats
	for i in _bats.size():
		var b := _bats[i]
		var p := Vector2(b.x * s.x, b.y * s.y + sin(_t * 2.0 + i) * 8.0)
		var w := 22.0 - i * 4.0
		var flap := sin(_t * 9.0 + i) * 0.5
		draw_colored_polygon(PackedVector2Array([p, p + Vector2(-w, -w * 0.3 - flap * w), p + Vector2(-w * 0.5, w * 0.35), p + Vector2(0, w * 0.15), p + Vector2(w * 0.5, w * 0.35), p + Vector2(w, -w * 0.3 - flap * w)]), Color("3a3a3c"))
	# ground, tree, gravestones
	var gy := s.y * 0.92
	draw_rect(Rect2(0, gy, s.x, s.y - gy), Color("141415"))
	var tx := s.x * 0.5
	for seg in [[0, 0, 0, -170], [0, -110, -50, -190], [0, -150, 60, -220], [-50, -190, -80, -230], [60, -220, 90, -250]]:
		draw_line(Vector2(tx + seg[0], gy + seg[1]), Vector2(tx + seg[2], gy + seg[3]), Color("2c2c2f"), 9.0)
	draw_rect(Rect2(s.x * 0.375, gy - 52, 40, 52), Color("2a2a2d"))
	draw_circle(Vector2(s.x * 0.375 + 20, gy - 52), 20, Color("2a2a2d"))
	# the house
	var hx := s.x * 0.6
	var hy := s.y * 0.35
	draw_colored_polygon(PackedVector2Array([Vector2(hx + 20, hy + 70), Vector2(hx + 220, hy), Vector2(hx + 420, hy + 70)]), Color("1a1a1c"))
	draw_rect(Rect2(hx + 40, hy + 70, 360, gy - hy - 70), Color("161618"))
	var lit := [0, 3, 5, 10]
	for i in 12:
		var col := i % 4
		var row := i / 4
		var wx := hx + 66 + col * 78
		var wy := hy + 94 + row * 78
		var c := Color("0d0d0e")
		if i == 0 or i == 10:
			c = Color("d8d8d2") if sin(_t * 3.0 + i) > -0.85 else Color("5a5a56")
		elif lit.has(i):
			c = Color("8a8a85")
		draw_rect(Rect2(wx, wy, 52, 52), c)
		draw_rect(Rect2(wx, wy, 52, 52), Color("2a2a2d"), false, 3.0)
	draw_rect(Rect2(hx + 190, gy - 90, 60, 90), UIKit.BG)
