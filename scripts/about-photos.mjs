// Re-makes the About gallery's WebPs from her originals (public/about page photos/, not committed), evened out
// so the photos sit together as one set (hers, 2026-11-23: some read warm, some green or pink, some dark):
//   1. white balance: the photo's near-grey pixels (walls, paper, shirts) are moved toward one shared, slightly
//      warm grey, so every photo has the same light;
//   2. brightness: the middle tone is moved toward the set's shared middle;
//   3. contrast: the darkest and lightest 2% are pulled toward shared ends (flat photos get some punch,
//      harsh ones calm down);
//   4. colour: saturation nudged toward the set's middle.
// Each step goes only part of the way (STRENGTH), so the photos keep their own light. Output: 800 wide,
// WebP quality 80, as before. Her photo (me.webp) has its own grade and is left alone.
//   node scripts/about-photos.mjs            all of them
//   node scripts/about-photos.mjs --raw      plain re-encode, no evening (to compare)
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)
const FF = require('ffmpeg-static')
const SRC = 'public/about page photos'
const OUT = process.env.OUT || 'public/about'
const RAW = process.argv.includes('--raw')

const PHOTOS = {
  'roadcast-1': 'Roadcast 1.jpeg', 'roadcast-2': 'Roadcast 2.jpeg',
  'bharatpe-1': 'BharatPe 1.jpeg', 'bharatpe-2': 'BharatPe 2.jpeg',
  'design-grad-1': 'design grad 1.jpg', 'design-grad-2': 'design grad 2.jpg',
  'design-grad-3': 'design grad 3.jpg', 'design-grad-4': 'design grad 4.jpg',
  'adventure-1': 'adventure 1.jpg', 'adventure-2': 'adventure 2.jpg',
  'adventure-4': 'adventure 4.jpg', 'adventure-5': 'adventure 5.jpg',
}

const STRENGTH = { balance: 0.75, bright: 0.55, contrast: 0.5, colour: 0.5 }
// by eye, on top, where a photo's light is so coloured that it has few grey pixels left to measure:
// temp < 0 cools (less red, more blue), tint > 0 takes out pink (more green)
const NUDGE = {
  'bharatpe-2': { temp: -0.08 },     // orange restaurant light
  'roadcast-2': { temp: -0.03 },
  'design-grad-3': { temp: -0.025 },
  'adventure-2': { tint: 0.025 },    // pinkish
}
const GREY = [1.04, 1.0, 0.95]   // the shared light: a touch warm, as her photo (r : g : b of a grey wall)
const MID = 118                  // shared middle tone (median luminance, 0-255)
const ENDS = [10, 240]           // shared 2% / 98% luminance

function decode(file, w) {
  const probe = spawnSync(FF, ['-v', 'error', '-i', file, '-vf', `scale=${w}:-2:flags=lanczos`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 28 })
  if (probe.status) throw new Error(probe.stderr.toString())
  return probe.stdout
}
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b
const satOf = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx ? (mx - mn) / mx : 0 }

function stats(px) {
  let n = 0, R = 0, G = 0, B = 0, S = 0
  const L = []
  for (let i = 0; i < px.length; i += 3) {
    const r = px[i], g = px[i + 1], b = px[i + 2]
    const l = lum(r, g, b), s = satOf(r, g, b)
    L.push(l); S += s
    if (l > 50 && l < 235 && s < 0.22) { n++; R += r; G += g; B += b }
  }
  L.sort((a, b) => a - b)
  const q = (p) => L[Math.floor((L.length - 1) * p)]
  return { grey: n > 50 ? [R / n, G / n, B / n] : null, lo: q(0.02), mid: q(0.5), hi: q(0.98), sat: S / L.length }
}

function correction(st, satTarget) {
  // 1. gains that take the photo's grey to the shared grey, part way, keeping its brightness
  let gain = [1, 1, 1]
  if (st.grey) {
    const g = st.grey, gl = lum(...g)
    const t = GREY.map(c => c * gl / lum(...GREY))
    gain = t.map((c, i) => 1 + (c / g[i] - 1) * STRENGTH.balance)
  }
  const n = NUDGE[st.id] || {}
  if (n.temp) { gain[0] *= 1 + n.temp; gain[2] *= 1 - n.temp }
  if (n.tint) { gain[1] *= 1 + n.tint; gain[0] *= 1 - n.tint / 2; gain[2] *= 1 - n.tint / 2 }
  // 3. ends, part way toward the shared ends
  const lo = st.lo + (ENDS[0] - st.lo) * STRENGTH.contrast
  const hi = st.hi + (ENDS[1] - st.hi) * STRENGTH.contrast
  // 2. middle: where the photo's middle lands after the ends move, then a gamma to bring it toward MID
  const midAfter = lo + (st.mid - st.lo) / (st.hi - st.lo) * (hi - lo)
  const want = midAfter + (MID - midAfter) * STRENGTH.bright
  const x = Math.min(0.95, Math.max(0.05, midAfter / 255)), y = Math.min(0.95, Math.max(0.05, want / 255))
  const gamma = Math.log(y) / Math.log(x)
  // 4. saturation toward the set's middle
  const sat = Math.min(1.2, Math.max(0.85, 1 + (satTarget / st.sat - 1) * STRENGTH.colour))
  return { gain, from: [st.lo, st.hi], to: [lo, hi], gamma, sat }
}

function apply(px, c) {
  const out = Buffer.alloc(px.length)
  const [f0, f1] = c.from, [t0, t1] = c.to
  // a tone curve on luminance, applied to all three channels by the same ratio (no hue shifts)
  const curve = new Float32Array(256 * 4)
  for (let i = 0; i < curve.length; i++) {
    const l = i / 4
    let v = t0 + (l - f0) / (f1 - f0) * (t1 - t0)
    v = 255 * Math.pow(Math.min(1, Math.max(0, v / 255)), c.gamma)
    curve[i] = v
  }
  for (let i = 0; i < px.length; i += 3) {
    let r = px[i] * c.gain[0], g = px[i + 1] * c.gain[1], b = px[i + 2] * c.gain[2]
    const l = lum(r, g, b)
    const nl = curve[Math.min(curve.length - 1, Math.max(0, Math.round(l * 4)))]
    const k = l > 0.5 ? nl / l : 1
    r *= k; g *= k; b *= k
    const m = lum(r, g, b)
    r = m + (r - m) * c.sat; g = m + (g - m) * c.sat; b = m + (b - m) * c.sat
    out[i] = Math.max(0, Math.min(255, Math.round(r)))
    out[i + 1] = Math.max(0, Math.min(255, Math.round(g)))
    out[i + 2] = Math.max(0, Math.min(255, Math.round(b)))
  }
  return out
}

const all = Object.entries(PHOTOS).map(([id, name]) => {
  const file = path.join(SRC, name)
  return { id, file, st: { ...stats(decode(file, 200)), id } }
})
const sats = all.map(p => p.st.sat).sort((a, b) => a - b)
const satTarget = sats[Math.floor(sats.length / 2)]

for (const p of all) {
  // 800 wide, never enlarged (adventure 5's original is 514 wide)
  const ow = +spawnSync(FF, ['-hide_banner', '-i', p.file], { encoding: 'utf8' }).stderr.match(/Video:.*?, (\d+)x\d+/)[1]
  const w = Math.min(800, ow - (ow % 2))
  let px = decode(p.file, w)
  const h = px.length / (w * 3)
  const c = correction(p.st, satTarget)
  if (!RAW) px = apply(px, c)
  const enc = spawnSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${w}x${h}`, '-i', '-',
    '-c:v', 'libwebp', '-quality', '80', path.join(OUT, `${p.id}.webp`)], { input: px })
  if (enc.status) throw new Error(enc.stderr.toString())
  console.log(p.id.padEnd(14), RAW ? 'plain' : `gain ${c.gain.map(v => v.toFixed(3)).join(' ')}  gamma ${c.gamma.toFixed(2)}  ends ${c.from.map(Math.round)}→${c.to.map(Math.round)}  sat ${c.sat.toFixed(2)}`)
}
