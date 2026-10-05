class_name UIKit
extends RefCounted
## Fonts, colours and small helpers so every screen looks the same (black, grey and white only).

const WHITE := Color("f2f2ef")
const LIGHT := Color("d4d4cf")
const DIM := Color("a3a39e")
const MUTED := Color("6a6a66")
const BG := Color("0a0a0b")
const CHIP := Color("1c1c1e")
const BORDER := Color("3a3a3d")

static var _body: Font
static var _title: Font


static func body_font() -> Font:
	if _body == null:
		var base: FontFile = load("res://assets/fonts/patrick-hand-latin-400-normal.woff2")
		base.fallbacks = [load("res://assets/fonts/kalam-latin-400-normal.woff2"), load("res://assets/fonts/kalam-devanagari-400-normal.woff2")]
		_body = base
	return _body


static func title_font() -> Font:
	if _title == null:
		var base: FontFile = load("res://assets/fonts/creepster-latin-400-normal.woff2")
		base.fallbacks = [load("res://assets/fonts/kalam-latin-400-normal.woff2"), load("res://assets/fonts/kalam-devanagari-400-normal.woff2")]
		_title = base
	return _title


static func box(fill: Color, border: Color = Color(0, 0, 0, 0), radius: int = 16, border_w: int = 2) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = fill
	s.border_color = border
	s.set_border_width_all(border_w if border.a > 0.0 else 0)
	s.set_corner_radius_all(radius)
	s.content_margin_left = 16
	s.content_margin_right = 16
	s.content_margin_top = 10
	s.content_margin_bottom = 10
	return s


static func label(text: String, size: int, color: Color = WHITE, title: bool = false) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_override("font", title_font() if title else body_font())
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return l


## kind: "primary" (white), "ghost" (outlined), "dark" (dark chip).
static func button(text: String, kind: String, size: int, callback: Callable) -> Button:
	var b := Button.new()
	b.text = text
	b.focus_mode = Control.FOCUS_NONE
	b.add_theme_font_override("font", body_font())
	b.add_theme_font_size_override("font_size", size)
	var fg := BG if kind == "primary" else WHITE
	for c in ["font_color", "font_hover_color", "font_pressed_color", "font_focus_color"]:
		b.add_theme_color_override(c, fg)
	var radius := 14 if kind != "dark" else 26
	var normal: StyleBoxFlat
	var hover: StyleBoxFlat
	match kind:
		"primary":
			normal = box(WHITE, Color(0, 0, 0, 0), radius)
			hover = box(Color.WHITE, Color(0, 0, 0, 0), radius)
		"ghost":
			normal = box(Color(0, 0, 0, 0.01), Color("8a8a85"), radius, 3)
			hover = box(CHIP, WHITE, radius, 3)
		_:
			normal = box(Color(0.04, 0.04, 0.043, 0.88), BORDER, radius)
			hover = box(Color(0.11, 0.11, 0.12, 0.95), BORDER, radius)
	b.add_theme_stylebox_override("normal", normal)
	b.add_theme_stylebox_override("hover", hover)
	b.add_theme_stylebox_override("pressed", hover)
	b.add_theme_stylebox_override("focus", normal)
	b.pressed.connect(callback)
	return b


## A row of three stars. `earned` is an Array of bool.
class StarRow extends Control:
	var earned: Array = [true, false, false]
	var star_r := 38.0

	func _init() -> void:
		custom_minimum_size = Vector2(3 * 2.6 * star_r, 2.5 * star_r)
		mouse_filter = Control.MOUSE_FILTER_IGNORE

	func _draw() -> void:
		for i in 3:
			var c := Vector2(star_r * 1.3 + i * star_r * 2.6, star_r * 1.25)
			var pts := PackedVector2Array()
			for k in 10:
				var a := -PI / 2.0 + k * PI / 5.0
				var r := star_r if k % 2 == 0 else star_r * 0.45
				pts.append(c + Vector2(cos(a), sin(a)) * r)
			if earned[i]:
				for k in 10: # a fan of triangles keeps the points sharp
					draw_colored_polygon(PackedVector2Array([c, pts[k], pts[(k + 1) % 10]]), UIKit.WHITE)
			else:
				pts.append(pts[0])
				draw_polyline(pts, Color("5a5a5d"), 3.0, true)
