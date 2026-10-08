class_name UIKit
extends RefCounted
## Fonts, colours and small helpers so every screen looks the same: warm paper cards with dark plum outlines, a pumpkin
## accent, and soft shadows (cosy-spooky, readable on a phone).

const INK := Color("33243a")          # dark plum: text and outlines
const PAPER := Color("fff3da")        # cards
const PAPER_DARK := Color("f1dcb4")   # slots, wells
const PUMPKIN := Color("ff8a3d")      # the main accent
const PUMPKIN_DARK := Color("c9560f")
const GRAPE := Color("7a5cff")
const MINT := Color("4fc596")
const BERRY := Color("ff5d73")
const SUN := Color("ffd45c")
const NIGHT := Color("1d1428")        # behind everything

# names the title screen already uses
const WHITE := PAPER
const LIGHT := Color("e9d9bd")
const DIM := Color("b9a98f")
const MUTED := Color("8a7a8f")
const BG := NIGHT
const CHIP := Color("2d2040")
const BORDER := Color("5b4670")

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


## A paper card with a plum outline and a soft drop shadow.
static func card(fill: Color = PAPER, radius: int = 24, border_w: int = 3) -> StyleBoxFlat:
	var s := box(fill, INK, radius, border_w)
	s.shadow_color = Color(0, 0, 0, 0.35)
	s.shadow_size = 10
	s.shadow_offset = Vector2(0, 5)
	return s


static func label(text: String, size: int, color: Color = INK, title: bool = false) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_override("font", title_font() if title else body_font())
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return l


## kind: "primary" (pumpkin), "ghost" (paper), "dark" (plum). `radius` makes round buttons when it is half the size.
static func button(text: String, kind: String, size: int, callback: Callable, radius: int = 18) -> Button:
	var b := Button.new()
	b.text = text
	b.focus_mode = Control.FOCUS_NONE
	b.add_theme_font_override("font", body_font())
	b.add_theme_font_size_override("font_size", size)
	var fill := PUMPKIN
	var fg := INK
	match kind:
		"ghost":
			fill = PAPER
		"dark":
			fill = INK
			fg = PAPER
	for c in ["font_color", "font_hover_color", "font_pressed_color", "font_focus_color", "font_disabled_color"]:
		b.add_theme_color_override(c, fg)
	var normal := card(fill, radius)
	var hover := card(fill.lightened(0.12), radius)
	var pressed := box(fill.darkened(0.12), INK, radius, 3)
	pressed.content_margin_top = 14
	b.add_theme_stylebox_override("normal", normal)
	b.add_theme_stylebox_override("hover", hover)
	b.add_theme_stylebox_override("pressed", pressed)
	b.add_theme_stylebox_override("focus", normal)
	b.add_theme_stylebox_override("disabled", card(PAPER_DARK, radius))
	b.pressed.connect(callback)
	return b
