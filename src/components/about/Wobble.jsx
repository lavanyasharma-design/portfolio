import { useMemo } from 'react'

/**
 * Hand-drawn strokes, after Figma's "Dynamic" stroke she used on the About page (2026-11-22): the corner
 * brackets (frequency 0.75, wiggle 0.3, smoothen 0.5), 2px teal/pressed. (The photos' wobbly frames went the
 * same day: two corners on every photo instead.) The line wanders a little either side of the true edge, smoothly, as
 * a pen would. Seeded, so every photo keeps the same wobble on every visit.
 * WOBBLE holds the look (bump spacing and height, in design px); measured against her Figma at 4x.
 */
const WOBBLE = {
  corner: { period: 3.2, amp: 0.55 },  // the brackets
}

function rng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296)
}

/** smooth 1D value noise in [-1, 1], with a finer second octave */
function noise(seed, period) {
  const rand = rng(seed), vals = []
  const at = (i) => { while (vals.length <= i) vals.push(rand() * 2 - 1); return vals[i] }
  const one = (s, p) => {
    const x = s / p, i = Math.floor(x), f = x - i, t = f * f * (3 - 2 * f)
    return at(i) + (at(i + 1) - at(i)) * t
  }
  return (s) => one(s, period) * 0.8 + one(s + 997, period / 2.3) * 0.2
}

/** a wobbly polyline through `pts` ([x, y] corners), as an SVG path */
function wobblePath(pts, closed, seed, { period, amp }, step = 1.25) {
  const n = noise(seed, period)
  const out = []
  let s = 0
  const edges = closed ? pts.length : pts.length - 1
  for (let e = 0; e < edges; e++) {
    const [x0, y0] = pts[e], [x1, y1] = pts[(e + 1) % pts.length]
    const len = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / len, ny = (x1 - x0) / len
    const steps = Math.max(2, Math.round(len / step))
    for (let k = e === 0 ? 0 : 1; k <= steps; k++) {
      const t = k / steps, d = n(s + t * len) * amp
      out.push(`${(x0 + (x1 - x0) * t + nx * d).toFixed(2)} ${(y0 + (y1 - y0) * t + ny * d).toFixed(2)}`)
    }
    s += len
  }
  return `M${out.join('L')}${closed ? 'Z' : ''}`
}

/** an 18 x 18 corner bracket (her viewfinder marks); `at` is tl, tr, bl or br */
export function Corner({ at, seed }) {
  const d = useMemo(() => {
    const L = 18
    const shape = {
      tl: [[0, L], [0, 0], [L, 0]], tr: [[0, 0], [L, 0], [L, L]],
      bl: [[0, 0], [0, L], [L, L]], br: [[0, L], [L, L], [L, 0]],
    }[at]
    return wobblePath(shape, false, seed, WOBBLE.corner)
  }, [at, seed])
  return (
    <svg className={`ab-corner ${at}`} viewBox="0 0 18 18" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}
