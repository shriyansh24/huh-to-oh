// Geometry for the 404 page's draw-the-track game. Coordinates are in the drawing's own space (1600 × 1000),
// the same space as art/out/lost-geometry.json, so the SVG overlay lines up with the picture at any size.
export type Pt = [number, number]

export const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1])

/** Drop points closer than `min` to the previous one, so a shaky hand doesn't make a shaky track. */
export function thin(pts: Pt[], min = 14): Pt[] {
  const out: Pt[] = []
  for (const p of pts) if (!out.length || dist(out[out.length - 1], p) >= min) out.push(p)
  return out
}

/** Catmull-Rom through the points, sampled every ~`step` units. */
export function smooth(pts: Pt[], step = 6): Pt[] {
  if (pts.length < 2) return pts.slice()
  const out: Pt[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)]
    const n = Math.max(2, Math.round(dist(p1, p2) / step))
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])])
    }
  }
  out.push(pts[pts.length - 1])
  return out
}

export type Attempt = { ok: true; path: Pt[] } | { ok: false; reason: 'start' | 'end' | 'short' }

/**
 * A drawn stroke counts as track when it starts at the end of the rails and finishes at the far side.
 * The ends are snapped onto the real rail ends so the joins look laid, not dropped.
 */
export function judge(stroke: Pt[], from: Pt, to: Pt, reach = 80): Attempt {
  if (stroke.length < 3) return { ok: false, reason: 'short' }
  const startIdx = stroke.findIndex((p) => dist(p, from) <= reach)
  if (startIdx === -1) return { ok: false, reason: 'start' }
  let endIdx = -1
  for (let i = stroke.length - 1; i > startIdx; i--) if (dist(stroke[i], to) <= reach) { endIdx = i; break }
  if (endIdx === -1) return { ok: false, reason: 'end' }
  const middle = thin(stroke.slice(startIdx, endIdx + 1)).filter((p) => dist(p, from) > 24 && dist(p, to) > 24)
  return { ok: true, path: smooth([from, ...middle, to]) }
}

/** The bridge "lay it for me" builds: a gentle arch over the gap. */
export function arch(from: Pt, to: Pt, rise = 46, n = 24): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n
    return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t - rise * Math.sin(t * Math.PI)] as Pt
  })
}

/** Two rails and the sleepers under them, as SVG path data. */
export function railPaths(path: Pt[], gauge = 6, tieEvery = 3): { rails: string; ties: string } {
  const left: string[] = [], right: string[] = [], ties: string[] = []
  path.forEach((p, i) => {
    const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)]
    const len = dist(a, b) || 1, nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len
    left.push(`${i ? 'L' : 'M'}${(p[0] + nx * gauge).toFixed(1)} ${(p[1] + ny * gauge).toFixed(1)}`)
    right.push(`${i ? 'L' : 'M'}${(p[0] - nx * gauge).toFixed(1)} ${(p[1] - ny * gauge).toFixed(1)}`)
    if (i % tieEvery === 0) ties.push(`M${(p[0] + nx * gauge * 1.7).toFixed(1)} ${(p[1] + ny * gauge * 1.7).toFixed(1)}L${(p[0] - nx * gauge * 1.7).toFixed(1)} ${(p[1] - ny * gauge * 1.7).toFixed(1)}`)
  })
  return { rails: left.join('') + right.join(''), ties: ties.join('') }
}

export const toD = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('')
