class_name Geo
extends RefCounted
## Floor-plan geometry helpers. Everything is in metres on the ground plane:
## a Vector2's x is world X and its y is world Z. No nodes in here, so it can run headless.

static func angle_diff(a: float, b: float) -> float:
	var d := fmod(b - a, TAU)
	if d > PI:
		d -= TAU
	if d <= -PI:
		d += TAU
	return d


static func dist_to_rect(p: Vector2, r: Rect2) -> float:
	var e := r.end
	return p.distance_to(Vector2(clampf(p.x, r.position.x, e.x), clampf(p.y, r.position.y, e.y)))


static func point_in_rect(p: Vector2, r: Rect2) -> bool:
	var e := r.end
	return p.x >= r.position.x and p.x <= e.x and p.y >= r.position.y and p.y <= e.y


## Ray (origin, unit direction) against a rect. Returns the hit distance, or -1.0 for no hit.
static func ray_rect(o: Vector2, d: Vector2, r: Rect2) -> float:
	var tmin := 0.0
	var tmax := INF
	var e := r.end
	for axis in 2:
		var oo: float = o[axis]
		var dd: float = d[axis]
		var lo: float = r.position[axis]
		var hi: float = e[axis]
		if absf(dd) < 1e-9:
			if oo < lo or oo > hi:
				return -1.0
		else:
			var t1 := (lo - oo) / dd
			var t2 := (hi - oo) / dd
			if t1 > t2:
				var tmp := t1
				t1 = t2
				t2 = tmp
			tmin = maxf(tmin, t1)
			tmax = minf(tmax, t2)
			if tmin > tmax:
				return -1.0
	return tmin


## How far a ray travels before hitting a rect (or max_dist).
static func cast_ray(o: Vector2, angle: float, max_dist: float, rects: Array[Rect2]) -> float:
	var d := Vector2(cos(angle), sin(angle))
	var best := max_dist
	for r in rects:
		var t := ray_rect(o, d, r)
		if t >= 0.0 and t < best:
			best = t
	return best


static func has_line_of_sight(a: Vector2, b: Vector2, rects: Array[Rect2]) -> bool:
	var d := a.distance_to(b)
	if d < 1e-6:
		return true
	return cast_ray(a, (b - a).angle(), d, rects) >= d - 0.01


static func in_cone(o: Vector2, facing: float, half_angle: float, range_m: float, p: Vector2) -> bool:
	if o.distance_to(p) > range_m:
		return false
	return absf(angle_diff(facing, (p - o).angle())) <= half_angle


## Polygon of a vision cone clipped by walls. The first point is the origin.
static func cone_polygon(o: Vector2, facing: float, half_angle: float, range_m: float, blockers: Array[Rect2], steps: int = 28) -> PackedVector2Array:
	var pts := PackedVector2Array([o])
	for i in steps + 1:
		var a := facing - half_angle + (2.0 * half_angle * i) / steps
		var d := cast_ray(o, a, range_m, blockers)
		pts.append(o + Vector2(cos(a), sin(a)) * d)
	return pts


## Pushes a circle out of any rects it overlaps.
static func resolve_circle(p: Vector2, radius: float, rects: Array[Rect2]) -> Vector2:
	var x := p.x
	var y := p.y
	for _pass in 3:
		for r in rects:
			var e := r.end
			var cx := clampf(x, r.position.x, e.x)
			var cy := clampf(y, r.position.y, e.y)
			var dx := x - cx
			var dy := y - cy
			var d := sqrt(dx * dx + dy * dy)
			if d >= radius:
				continue
			if d > 1e-6:
				x += dx / d * (radius - d)
				y += dy / d * (radius - d)
			else:
				# centre is inside the rect: leave by the nearest side
				var left := x - r.position.x
				var right := e.x - x
				var top := y - r.position.y
				var bottom := e.y - y
				var m := minf(minf(left, right), minf(top, bottom))
				if m == left:
					x = r.position.x - radius
				elif m == right:
					x = e.x + radius
				elif m == top:
					y = r.position.y - radius
				else:
					y = e.y + radius
	return Vector2(x, y)
