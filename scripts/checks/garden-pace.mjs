/* Garden pace check (2026-11-23): runs the garden's real pace-watching code, copied out of gardenScene.js at
   run time, against recorded kinds of frame sequences, and checks where its sharpness ends up. A browser can't
   test this: a background or automated window is throttled, and none of us has his laptop.

     node scripts/checks/garden-pace.mjs

   The rule it guards: good devices (and hers on battery at 30 a second) always stay fully sharp; only a
   machine where the garden really can't keep up (a friend's RTX 4080 laptop) steps down, to 1x. Every
   expected result below is one the live garden gave when it was right. If gardenScene.js changes how it
   watches pace and this can't find the code, update the markers in `extract()`. */
import fs from 'fs'
import { fileURLToPath } from 'url'

const FILE = fileURLToPath(new URL('../../src/components/footer/gardenScene.js', import.meta.url))

function extract() {
  const src = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n').split('\n')
  const from = src.findIndex((l) => l.includes('const RES = [2, 1.5, 1, 0.75]'))
  const start = src.findIndex((l) => l.startsWith('  function watchPace('))
  if (from < 0 || start < 0) throw new Error('pace code not found in gardenScene.js (markers: "const RES = [2, 1.5, 1, 0.75]", "  function watchPace(")')
  let to = start
  while (src[to] !== '  }') to++
  return src.slice(from, to + 1).join('\n')
    .replace(/function sizeCanvases\(\) \{[\s\S]*?\n {2}\}/, 'function sizeCanvases() { dpr = resAt(res) }')
    .replace(/addEventListener\('scroll'[^\n]*/, '')
}
const code = extract()
const make = new Function('devicePixelRatio', 'performance', `
  let dpr = 1, T = 0
  ${code}
  dpr = resAt(res)
  return { step(gap, scrolling) { T += gap; if (scrolling) scrolledAt = performance.now(); watchPace(gap) },
           get state() { return { dpr, lowered, restored, retried } } }`)

// frames: [gap in seconds, scrolling?]; quicker: how much quicker frames get once it has stepped down
function run(screen, frames, quicker = 1) {
  let now = 0
  const g = make(screen, { now: () => now })
  const full = g.state.dpr
  for (const [gap, scrolling] of frames) {
    now += gap * 1000
    g.step(gap * (g.state.dpr < full ? quicker : 1), scrolling)
  }
  return { ...g.state, full }
}
const rep = (n, f) => Array.from({ length: n }, (_, i) => f(i))
const jitter = (i, a, b) => (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1 * (b - a) + a
// his laptop: 40-48 a second, frames 21-55 ms at full sharpness; a step lower and the chip keeps up
const his = (i) => [i % 3 === 0 ? jitter(i, 0.021, 0.025) : jitter(i, 0.035, 0.055), false]

// [name, screen scaling, frames, quicker when lower, where it must end: 'full' or a scaling]
const CASES = [
  ['hers on battery (30/s): scrolls in, settles unevenly, then even', 1.25, [...rep(60, () => [1 / 60, false]), ...rep(45, (i) => [jitter(i, 0.033, 0.08), true]), ...rep(30, (i) => [jitter(i, 0.033, 0.07), false]), ...rep(300, () => [1 / 30, false])], 1, 'full'],
  ['hers on battery: settles unevenly for 3 s after the scroll', 1.25, [...rep(60, () => [1 / 60, false]), ...rep(45, (i) => [jitter(i, 0.033, 0.08), true]), ...rep(60, (i) => [jitter(i, 0.033, 0.08), false]), ...rep(300, () => [1 / 30, false])], 1, 'full'],
  ['hers on battery: an even 30/s all along', 1.25, rep(400, () => [1 / 30, false]), 1, 'full'],
  ['60 Hz: a smooth scroll in, then still', 1.25, [...rep(120, () => [1 / 60, true]), ...rep(600, () => [1 / 60, false])], 1, 'full'],
  ['120 Hz, still', 2, rep(1200, () => [1 / 120, false]), 1, 'full'],
  ['60 Hz with a 120 ms hiccup every second', 2, rep(1200, (i) => [i % 60 === 0 ? 0.12 : 1 / 60, false]), 1, 'full'],
  ['a busy page, not the garden (stepping down does not help)', 1.25, rep(400, (i) => [jitter(i, 0.04, 0.06), false]), 1, 'full'],
  ['60 Hz, the browser drops to an even 20/s mid-view', 1.25, [...rep(300, () => [1 / 60, false]), ...rep(200, () => [0.05, false])], 1, 'full'],
  ['phone 60 Hz: long scroll with jank, then still', 3, [...rep(300, (i) => [i % 7 === 0 ? 0.05 : 1 / 60, true]), ...rep(600, () => [1 / 60, false])], 1, 'full'],
  ['his laptop: stutters standing still', 1.5, rep(1200, his), 0.5, 1],
  ['his laptop: scrolls 2 s first, then still', 1.5, [...rep(80, (i) => [his(i)[0], true]), ...rep(1200, his)], 0.5, 1],
  ['his laptop, worse: 4 frames in 5 late', 1.5, rep(1200, (i) => [i % 5 === 0 ? jitter(i, 0.021, 0.025) : jitter(i, 0.035, 0.06), false]), 0.5, 1],
]

let failed = 0
for (const [name, screen, frames, quicker, want] of CASES) {
  const s = run(screen, frames, quicker)
  const target = want === 'full' ? s.full : want
  const ok = s.dpr === target
  if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(62)} ends at ${s.dpr}x (want ${want === 'full' ? `full, ${s.full}x` : `${want}x`}; stepped down ${s.lowered}, tried full again ${s.retried}, stepped back up ${s.restored})`)
}
console.log(failed ? `\n${failed} failed: the garden would blur on a good device or stutter on his` : '\nall passed')
process.exit(failed ? 1 : 0)
