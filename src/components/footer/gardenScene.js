/**
 * The footer garden (Figma note on the Work page, 1:2), drawn to match the window intro's coloured
 * pencil (Lavanya, 2026-11-14): the visitor opened the window and let the butterfly out, and here it
 * is, enjoying the garden. Light purple grass, pale rose-pink sunflowers with dark brown hearts, and
 * the logo butterfly in its own colours, exactly as it flies out of the window.
 *
 * The butterfly never leaves: it drifts from side to side in a calm, swinging wave, wings beating
 * slowly with a glide every few seconds (Lavanya, 2026-11-14: the old loops and hops read as
 * glitchy), easing round at each side, and now and then
 * glides down to a sunflower, touches down softly (the flower dips under it), rests with its wings
 * slowly opening and closing, and lifts off again. It has no sound. With the cursor right over it (desktop), or a
 * finger tapping it (touch screens, 2026-11-21), it darts away.
 *
 * The grass does, on desktop (Lavanya, 2026-11-14): every blade (and sunflower) is a small spring.
 * The cursor brushes blades along as it moves through them and parts them where it rests; let go,
 * they spring back past upright and flutter out. Her values come from the panel's 'grass and
 * cursor' section.
 *
 * Pencil: every layer is painted, then a paper-tooth grain (fine specks with streaks running up the
 * strokes) is rubbed out of it, and each blade gets a soft pencil edge. The grain is fixed to the
 * "paper", so the grass sways over it like a drawing. The butterfly stays crisp, as over the window.
 * Layers, far to near: hazy far grass, middle grass, sunflowers, the butterfly, then the ground and
 * the near grass in front, so it dips behind the closest blades.
 *
 * Seeded, so it's the same garden on every visit; it only rebuilds when the band's size changes and
 * only animates while on screen. prefers-reduced-motion: one still picture, the butterfly resting on
 * a sunflower. ?garden opens a live panel; "copy values" gives the numbers to paste into GARDEN.
 */
export const GARDEN = {
  seed: 32,        // which garden: another number lays it out differently
  density: 1.05,   // how much grass
  flowers: 1.4,    // how many sunflowers
  light: 0.21,     // washes every purple lighter (0 to 0.6)
  round: 0.1,      // grass tips: 0 pointed, 1 blunt as the blade is wide
  grain: 0.47,     // pencil grain: how much paper shows through the colour
  edge: 0.4,       // pencil edge along each blade
  sway: 0,         // how far the grass moves in the wind, desktop (Lavanya 2026-11-14: still)
  swayPhone: 0.9, // the same on phones (600px and narrower), as before
  wind: 0.75,      // how fast the wind moves
  haze: 0.51,      // how much the far grass fades into the page
  bSize: 52,       // butterfly width on desktop, px on the 324-tall band; scales with the band
  bSizePhone: 69,  // the same on phones (600px and narrower), where the band is 150 tall
  bVivid: 1,       // butterfly colour: 1 the window flyer's boost (saturate 1.3, brightness 1.06), 0 the plain image, as in the nav bar
  bSpeed: 125,     // how fast it drifts from side to side, px a second on the desktop band
  loop: 52,        // how high it swings up and down, px on the desktop band
  loopRate: 0.26,  // swings a second
  flap: 4,         // wing beats a second (was 12: calmer, Lavanya 2026-11-14)
  hop: 0.8,        // how much each wing beat lifts it
  visit: 9,        // seconds of flying between visits to a sunflower
  stay: 2.4,       // seconds it rests on a sunflower
  phoneTall: 1.3,  // grass height on phones (600px and narrower): the tallest blades reach the band's top
  farTall: 1,      // the far grass's height on desktop (wider than 600px), against the rest

  // grass and cursor (desktop only): Lavanya's values from ?garden, 2026-11-14/15
  reach: 117,      // px around the cursor the grass feels, on the desktop band
  brush: 1.05,     // how much moving through the grass sweeps blades along with the cursor
  part: 0.3,       // how far blades lean away from a cursor resting among them
  spring: 6,       // how stiff a blade is: higher springs back quicker and flutters faster
  settle: 1,     // how quickly the flutter calms: lower flutters longer
  tipBend: 1.2,    // how much more the tip bends than the base
  depth: 0.6,     // how much the far grass feels it: 0 only the near grass, 1 all alike
  flowerTouch: 0.65, // how much the sunflowers move with it
  softness: 0.4,   // s: the cursor's push eases in and out over this long (graceful, not springy)

  // the butterfly and the cursor (desktop): with the cursor right over it, it darts away
  // (Lavanya, 2026-11-14; her values 2026-11-15)
  dart: 135,        // px it darts, on the desktop band
  dartTime: 1.35,   // s the dart takes to play out
  dartFlap: 1.6,   // its wing beats speed up this many times while it darts

  // the sunflowers (2026-11-14; her values 2026-11-15)
  petalBreeze: 0.4, // petals stirring in the breeze, desktop and phones (0 still)
  petalSpeed: 0.35, // breezes a second through the petals
  calmFps: 30,      // times a second the slow, steady motion (breeze, wind) is redrawn; the butterfly and anything the cursor moves keep every frame (2026-11-23, performance)
  flowerTwitch: 0.85, // desktop: the little twitch when the cursor passes over a flower head
}
/* The About page's garden: the same scene, butterfly and pencil, with green grass and leaves instead of
   purple (purple is [work]'s; About is teal). First nodding blue tulips (2026-11-22); then (hers, 2026-11-23,
   after two watercolours of blue wildflowers she sent) a meadow of small and medium open blossoms in the
   tulips' blues, deep blue hearts (her second reference's yellow hearts popped out: not wanted), a few buds
   and fine pale sprigs. Its own values, so tuning one garden never moves the other; ?garden on the About
   page tunes this one, colours included. */
export const MEADOW = {
  ...GARDEN,
  // her values from ?garden on /about (2026-11-22, second round; the meadow's own 2026-11-23); the same on
  // phones, but for the far grass's height, which is desktop only (phones keep phoneTall)
  seed: 15,              // which garden (hers for the meadow; the sunflowers keep 32)
  density: 1.25,         // how much grass
  farTall: 0.84,         // the far grass shorter on desktop
  light: 0.17,           // washes the greens lighter
  grain: 0.42,           // pencil grain
  reach: 128, brush: 1.4, spring: 4.5, tipBend: 1.3, softness: 0.35,   // the grass and the cursor
  flowerTouch: 0.4,      // how much the flowers move with the cursor
  flowerTwitch: 0.8,     // the twitch when the cursor passes over a head
  petalBreeze: 0.45,     // petals stirring in the breeze
  petalSpeed: 0.7,       // breezes a second through the petals
  calmFps: 30,           // times a second the breeze and the wind are redrawn (the butterfly and the cursor keep every frame)
  dart: 155,             // px the butterfly darts from the cursor or a tap
  petal: '#85b4db',      // petals: the body (the tulips' blues, hers)
  petalShade: '#5b86ae', // the petals behind, turned away
  petalLight: '#b9d3e9', // the light down each petal
  petalEdge: '#3f6f9c',  // the pencil line round each petal
  heart: '#2a4c7e',      // the heart, a deep blue (as her first reference), not yellow
  stamen: '#6d7d9b',     // the fine threads round it
  sprig: '#dbe7f3',      // the tiny pale blossoms on the sprigs
  stem: '#8b8e52',       // stems
  leaf: '#5f8448',       // the slim leaves on the stems
  leafDark: '#3e5c30',   // their shaded side
  grassFar: '#94ac80',   // far grass
  grassMid: '#9bb087',   // middle grass
  grassNear: '#5f7c4b',  // near grass and the ground
  flowers: 3.2,          // how many flowers (the sunflowers are 1.4)
  flowerSize: 1.28,      // their size (a petal 17-23 long on medium ones, about the tulips' size, 10-14 on small ones)
  small: 0.6,            // the share that are small
  buds: 0.2,             // the share that are still buds
  sprigs: 1.1,           // how many fine sprigs of tiny pale blossoms
  nod: 0,                // how far the heads tip over (0: following their stems)
  // phones (600 and narrower) have their own say over how the flowers stand (hers, 2026-11-22, for the
  // tulips: they tilted on her phone, unasked); ?meadow opens a short panel for these
  leanPhone: 0.25,       // how far the stems lean (1 as on desktop)
  followPhone: 0.55,     // how far a head turns with its stem (desktop 1.2)
  nodPhone: 0.12,        // the heads' own tip over
  swayPhone: 0.5,        // the wind's sway (hers, 2026-11-23 for the meadow; the tulips had 0.9)
}

/* Lavanya's values from her phone, 2026-11-14, second round (calm on the phone); the bigger
   butterfly is phones only, desktop keeps 52. Third round (desktop): no wind sway on desktop, and
   her grass and cursor values */

const PAL = {
  back: ['#e6dafb', '#ddcef8', '#d3c1f4', '#e0d2f9'],      // far grass, palest
  mid: ['#c4aaee', '#b79be4', '#ab8ddf', '#bea2ea'],       // middle grass
  front: ['#9a72d6', '#8f63cf', '#8457c9', '#a27ddb'],     // near grass
  ground: '#8457c9',
  bush: ['#8457c9', '#8f63cf', '#7d50c3', '#9a72d6', '#7649bf'],
  stem: ['#8457c9', '#8f63cf'],
  leaf: ['#9a72d6', '#8f63cf', '#ab8ddf'],
  page: '#fcfaff',                                          // color/white/default
}
/* the sunflowers: pale rose-pink petals (the back ring a shade deeper) around a dark brown heart.
   Not washed by `light` */
const ROSE = {
  front: ['#f7c3d1', '#f5b6c7', '#f9cdd9', '#f3adc0'],
  back: ['#eba0b5', '#ee9fb6', '#e897ad'],
  edge: 'rgba(190,95,125,.4)',
  heart: '#4a2c1f', heartDeep: '#2f1b12', seed: '#6e4632',
}

const TAU = Math.PI * 2

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mixRGB = (p, q, t) => p.map((v, i) => Math.round(v + (q[i] - v) * t))
const css = ([r, g, b], a = 1) => (a === 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`)
const smooth = (u) => { const t = Math.min(1, Math.max(0, u)); return t * t * (3 - 2 * t) }
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a))

// the purples as used: every one washed towards white by `light`
function palette(light) {
  const lift = (h) => mixRGB(rgb(h), [255, 255, 255], light)
  const P = {}
  for (const [k, v] of Object.entries(PAL)) P[k] = k === 'page' ? rgb(v) : Array.isArray(v) ? v.map(lift) : lift(v)
  return P
}

// the meadow's greens: each tier a few close shades of its colour, all washed by `light`
function greens(G) {
  const W = [255, 255, 255], K = [20, 30, 15]
  const shades = (h) => { const c = rgb(h); return [c, mixRGB(c, W, 0.08), mixRGB(c, K, 0.06), mixRGB(c, W, 0.15)] }
  const lift = (c) => mixRGB(c, W, G.light)
  const near = shades(G.grassNear)
  return {
    back: shades(G.grassFar).map(lift), mid: shades(G.grassMid).map(lift), front: near.map(lift),
    ground: lift(mixRGB(rgb(G.grassNear), K, 0.12)),
    bush: [...near, mixRGB(rgb(G.grassNear), K, 0.15)].map(lift),
    stem: [lift(rgb(G.stem))], leaf: near.map(lift), page: rgb(PAL.page),
  }
}

/* ---------- the paper ---------- */

// a tile of paper tooth: fine specks, with streaks stretched upwards so it reads as pencil strokes
// running up the grass. Its alpha is how much colour gets rubbed out there
function paperTooth(size = 256) {
  const r = rng(3)
  const gx = 64, gy = 12
  const lat = Array.from({ length: gx * gy }, r)
  const at = (i, j) => lat[(((j % gy) + gy) % gy) * gx + (((i % gx) + gx) % gx)]
  const noise = (x, y) => {
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy)
    const a = at(i, j), b = at(i + 1, j), c = at(i, j + 1), d = at(i + 1, j + 1)
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy
  }
  const c = document.createElement('canvas')
  c.width = c.height = size
  const x = c.getContext('2d')
  const img = x.createImageData(size, size)
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const v = r() * 0.6 + noise((px / size) * gx, (py / size) * gy) * 0.4
      img.data[(py * size + px) * 4 + 3] = smooth((v - 0.4) / 0.45) * 255
    }
  }
  x.putImageData(img, 0, 0)
  return c
}

/* ---------- the scene ---------- */

// W x H in CSS px. s: one desktop design px (the band is 324 tall on desktop)
function build(W, H, G, kind) {
  const r = rng(G.seed)
  const s = H / 324
  const P = kind === 'meadow' ? greens(G) : palette(G.light)
  const between = (a, b) => a + r() * (b - a)
  const pick = (arr) => arr[(r() * arr.length) | 0]
  // phones: the grass looked unfinished in the short band (Lavanya, 2026-11-14), so the far and
  // middle grass grow by phoneTall, and the near grass and sunflowers by half as much, so the
  // flowers still stand above the near blades
  const k = W <= 600 ? G.phoneTall : 1, kNear = 1 + (k - 1) / 2

  const LAYERS = [
    { colors: P.back, every: 52, blades: [8, 14], h: [0.34, 0.74], w: [8, 13], base: 0.9, lean: 0.42 },
    { colors: P.mid, every: 62, blades: [7, 13], h: [0.26, 0.8], w: [9, 15], base: 0.96, lean: 0.48 },
    { colors: P.front, every: 46, blades: [5, 10], h: [0.12, 0.46], w: [10, 16], base: 1.03, lean: 0.55 },
  ]
  const layers = LAYERS.map((L, li) => {
    const grow = (li < 2 ? k : kNear) * (li === 0 && W > 600 ? G.farTall : 1)
    const blades = []
    const n = Math.max(3, Math.round((W / (L.every * s)) * G.density))
    for (let i = 0; i < n; i++) {
      const cx = ((i + r() * 0.9) / n) * W
      const tall = r() < 0.16 ? between(1.1, 1.3) : 1     // now and then a tall, arching clump
      const m = Math.round(between(...L.blades))
      for (let j = 0; j < m; j++) {
        const spread = m > 1 ? (j / (m - 1)) * 2 - 1 : 0
        const lean = spread * L.lean + (r() - 0.5) * 0.25
        const h = Math.min(0.95, between(...L.h) * tall * grow) * H * (1 - Math.abs(spread) * 0.3)
        blades.push({
          x: cx + (r() - 0.5) * 16 * s,
          y: H * L.base + r() * 4 * s,
          h,
          w: between(...L.w) * s,
          lean,
          curve: lean * between(0.7, 1.9) + (r() - 0.5) * 0.35,   // outer blades arch over
          color: pick(L.colors),
          phase: r() * TAU,
          flex: h / H,
        })
      }
    }
    // one fill per colour: group the blades by colour. Each colour is a gradient up the blade,
    // deeper at the roots and lighter at the tips; the edge is a deeper pencil line around it
    const byColor = new Map()
    for (const b of blades) (byColor.get(b.color) ?? byColor.set(b.color, []).get(b.color)).push(b)
    return [...byColor].map(([color, list]) => {
      const root = mixRGB(color, P.ground, 0.4)
      return {
        blades: list, grad: null,
        color: css(color), root: css(root), tip: css(mixRGB(color, [255, 255, 255], 0.22)),
        edge: mixRGB(root, [40, 20, 70], 0.25),
      }
    })
  })

  // sunflowers, all one kind: two rings of pointed rose-pink petals around a dark brown heart.
  // Or, in the meadow: small and medium open blossoms on fine stems, each turned its own way, some still buds
  const flowers = [], sprigs = []
  const nFlowers = Math.max(2, Math.round((W / (230 * s)) * G.flowers))
  if (kind === 'meadow') {
    for (let i = 0; i < nFlowers; i++) {
      const bud = r() < G.buds
      const small = bud || r() < G.small
      const lean = (r() - 0.5) * 0.55
      const side = lean === 0 ? 1 : Math.sign(lean)
      const rad = (bud ? between(6, 8) : small ? between(10, 14) : between(17, 23)) * s * G.flowerSize
      const n = small ? 5 : pick([5, 5, 6, 6, 7])
      const turn = r() * TAU
      flowers.push({
        x: ((i + 0.1 + r() * 0.8) / nFlowers) * W,
        y: H,
        h: (bud ? between(0.36, 0.6) : small ? between(0.3, 0.56) : between(0.4, 0.66)) * kNear * H,
        lean, phase: r() * TAU, rad, bud, perch: !small,
        tilt: side * between(0.3, 1),                    // which way this head tips
        face: between(0.42, 0.95),                       // how much it faces us (1: full on, low: seen from the side)
        // broad, rounded petals, a little uneven, as in her watercolours
        petals: Array.from({ length: n }, (_, p) => ({
          a: turn + (p / n) * TAU + (r() - 0.5) * 0.25,
          len: between(0.88, 1.08), wid: between(0.9, 1.1) * (5 / n) ** 0.6, shade: r(),
        })),
        stamens: small ? 0 : Math.round(between(10, 16)),
        leaves: small ? [] : [between(0.18, 0.34), between(0.4, 0.55)].slice(0, r() < 0.5 ? 1 : 2)
          .map((at, li) => ({ at, side: (li % 2 ? -1 : 1) * (r() < 0.5 ? 1 : -1), len: between(14, 24) * s, dark: r() < 0.4 })),
        dip: 0, dipV: 0,
      })
    }
    // fine sprigs of tiny pale blossoms between the flowers, as in her second reference
    const nSprigs = Math.round((W / (120 * s)) * G.sprigs)
    for (let i = 0; i < nSprigs; i++) {
      const h = between(0.3, 0.6) * kNear * H
      sprigs.push({
        x: ((i + r()) / nSprigs) * W, y: H, h, lean: (r() - 0.5) * 0.5, phase: r() * TAU,
        twigs: Array.from({ length: Math.round(between(3, 5)) }, () => ({
          at: between(0.45, 0.95), side: r() < 0.5 ? -1 : 1, len: between(8, 18) * s,
          dots: Array.from({ length: Math.round(between(2, 4)) }, () => ({ t: between(0.4, 1), off: (r() - 0.5) * 5 * s, r: between(1.6, 2.6) * s })),
        })),
      })
    }
  }
  else for (let i = 0; i < nFlowers; i++) {
    const rad = between(19, 26) * s
    const n = Math.round(between(16, 20))
    const ring = (shades, len, wid, off) => Array.from({ length: n }, (_, p) => ({
      a: ((p + off) / n) * TAU + (r() - 0.5) * 0.12,
      len: len * between(0.9, 1.08), wid: wid * between(0.85, 1.1), color: pick(shades),
    }))
    flowers.push({
      x: ((i + 0.2 + r() * 0.6) / nFlowers) * W,
      y: H,
      h: between(0.36, 0.6) * kNear * H,
      lean: (r() - 0.5) * 0.35,
      phase: r() * TAU,
      rad,
      tilt: (r() - 0.5) * 0.5,
      back: ring(ROSE.back, 1.0, 0.2, 0.5),
      front: ring(ROSE.front, 0.92, 0.22, 0),
      seeds: Array.from({ length: 16 }, (_, k) => ({ a: k * 2.4, d: Math.sqrt((k + 0.5) / 16) * 0.32 })),
      stem: css(pick(P.stem)),
      leaves: [0.28, 0.5].map((at, li) => ({ at: at + (r() - 0.5) * 0.1, side: li % 2 ? 1 : -1, len: between(24, 36) * s, color: css(pick(P.leaf)) })),
      dip: 0, dipV: 0,   // the flower head sinking a little under the butterfly, springing back
    })
  }

  // a mound along the bottom, with leafy bushes on it, so nothing shows through below the grass
  const gh = H * 0.15
  const p1 = r() * TAU, p2 = r() * TAU
  const ground = []
  for (let x = -10; x <= W + 10; x += 6 * s) {
    const n = Math.sin(x * 0.013 / s + p1) * 0.5 + Math.sin(x * 0.031 / s + p2) * 0.3 + Math.sin(x * 0.07 / s) * 0.2
    ground.push([x, H - gh * (0.78 + 0.22 * n)])
  }
  const bushes = []
  const nBush = Math.round((W / (9 * s)))
  for (let i = 0; i < nBush; i++) {
    bushes.push({
      x: ((i + r()) / nBush) * W, y: H - gh * between(0.35, 1.05),
      rx: between(6, 13) * s, ry: between(3.5, 7) * s, a: (r() - 0.5) * 1.6,
      color: css(pick(P.bush)), alpha: between(0.55, 0.95),
    })
  }

  return {
    W, H, s, layers, flowers, sprigs, ground, bushes, kind,
    perches: flowers.filter((f) => f.perch !== false),   // the flowers the butterfly visits (in the meadow, the medium ones)
    colors: { ground: css(P.ground), page: P.page, back: P.back[2], mid: P.mid[1], front: css(P.front[1]) },
  }
}

/* ---------- the butterfly, as it flies out of the window ---------- */

// the logo image with the window flyer's crop (Design System logo 330:3) and its colour lift
// (saturate 1.3, brightness 1.06, as in WindowIntro.css) scaled by v (0: the plain image), baked
// once per value
function prepare(img, v = 1) {
  const sx = 139, sy = 32, sw = 391, sh = 307
  const c = document.createElement('canvas')
  c.width = sw; c.height = sh
  const x = c.getContext('2d', { willReadFrequently: true })
  x.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
  const d = x.getImageData(0, 0, sw, sh), px = d.data
  for (let i = 0; i < px.length; i += 4) {
    const L = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]
    for (let k = 0; k < 3; k++) px[i + k] = Math.min(255, (L + (px[i + k] - L) * (1 + 0.3 * v)) * (1 + 0.06 * v))
  }
  x.putImageData(d, 0, 0)
  return c
}
const BODY = 0.496   // where the body is across the cropped image (the flyer's wing split)

/* ---------- mounting ---------- */

// the shortest time between two draws: 120Hz draws every 2nd frame (60 a second), 144Hz every 2nd (72),
// 165Hz every 2nd (82), 240Hz every 3rd (80); 60, 90 and 100Hz draw every frame. A little under 1/100s so
// 100Hz frames that arrive a touch early still count
const MIN_STEP = 0.0095

// ?perf: the garden reports its numbers for the readout (src/lib/perfProbe.js)
const PERF = typeof location !== 'undefined' && new URLSearchParams(location.search).has('perf')

export function mountGarden(canvas, kind = 'sunflowers') {
  const G = kind === 'meadow' ? MEADOW : GARDEN
  const main = canvas.getContext('2d')
  const nearCanvas = document.createElement('canvas')    // ground and near grass, grained apart
  const near = nearCanvas.getContext('2d')                // so the butterfly between stays crisp
  /* The garden is three pictures stacked (2026-11-23, the performance pass): the back (far and middle grass,
     haze, undergrowth), the flowers, and the near grass. Each is kept until something in it moves, and
     every frame only lays them together, rubs the grain out and draws the butterfly between. Redrawing all
     of it every frame (about a thousand blades and every petal) made the footer heavy, though on a desktop
     the grass stands still unless the cursor is in it. A layer redraws every frame while the cursor, a
     twitch or a landing is moving it; for slow, steady motion (petals in the breeze, the wind on phones)
     about `calmFps` times a second, the back and near on one frame and the flowers on the next. */
  const backCanvas = document.createElement('canvas'), flowerCanvas = document.createElement('canvas')
  const LAYERS = {
    back: { c: backCanvas.getContext('2d'), at: 0 },
    flowers: { c: flowerCanvas.getContext('2d'), at: -1 / 60 },   // half a step behind, so they take turns
    near: { c: near, at: 0 },
  }
  for (const L of Object.values(LAYERS)) Object.assign(L, { dirty: true, active: false, was: false })
  const moving = [false, false, false]   // grass layers the cursor is moving this frame (touchGrass)
  let ctx = main
  const reduce = matchMedia('(prefers-reduced-motion: reduce)')
  let scene = null, bfly = null, dpr = 1, tooth = null, toothMain = null, toothNear = null
  let raf = 0, visible = false, last = 0, T = 0, cost = 0, rate = 0, vividFor = null
  // the butterfly's width here: bigger on phones, where the band is short (Lavanya, 2026-11-14)
  const bSize = () => (scene.W <= 600 ? G.bSizePhone : G.bSize) * scene.s

  /* the flight. cruise: a centre (cx) drifts between the sides, easing into each turn, while the
     butterfly swings up and down along it in a smooth wave. approach / perch / takeoff: `w` blends
     it from that path onto a sunflower and back.
     Wings: `rate` beats a second, eased; every few seconds it glides, its wings settling open */
  const fly = {
    cx: null, vx: 0, dir: -1, theta: 0, x: 0, y: 0, rot: 0, svx: 0, svy: 0, perchT: 0,
    dx: 0, dy: 0, dvx: 0, dvy: 0, dartReady: 0, burstUntil: 0, wFrom: 1,
    flap: 0, rate: 0, flapping: true, stopped: false, glideAt: 2.5, glideUntil: 0, rest: 0,
    mode: 'cruise', since: 0, next: 3, flower: null, last: null, w: 0,
  }

  const img = new Image()
  img.src = '/assets/butterfly.png'
  img.decode().then(() => { bfly = prepare(img, G.bVivid); vividFor = G.bVivid; draw() }).catch(() => {})

  /* The canvas resolution steps down if this machine can't keep up (2026-11-23: a friend's gaming laptop still
     stuttered after the frame cap; on some laptops with two graphics chips Chrome paints canvases on the
     processor, at full resolution). If frames keep coming late or a frame's drawing keeps costing more than
     SLOW_COST for about a second, the garden drops to the next step: a little softer, never stuttering.
     A machine that keeps up stays at its screen's resolution (at most 2x). ?perf shows the step it's on. */
  const RES = [2, 1.5, 1, 0.75]
  const SLOW_COST = 6, SLOW_FRAME = 0.028   // ms a draw, s between frames (under about 35 a second)
  let res = 0, slowFor = 0, steppedAt = -9, rebuilds = 0, lowered = 0, firstPaint = 0
  // a full paint (every layer at once) costing more than this at load starts the garden a step lower
  const FIRST_PAINT = 12
  const resAt = (i) => Math.min(RES[i], devicePixelRatio || 1)

  function sizeCanvases() {
    dpr = resAt(res)
    const W = canvas.clientWidth, H = canvas.clientHeight
    for (const c of [canvas, nearCanvas, backCanvas, flowerCanvas]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr) }
    redrawAll()
  }

  function lowerResolution() {
    let next = res
    while (next < RES.length - 1 && resAt(next) >= dpr) next++
    if (resAt(next) >= dpr) return false   // already as low as it goes
    res = next; steppedAt = T; slowFor = 0; lowered++
    sizeCanvases()
    return true
  }

  /* Before anyone sees it (2026-11-23: on the friend's laptop it stuttered for the two seconds the pace
     watch took to step down): once the page has settled, time a full paint while the garden is still off
     screen, warm (the first paint runs cold and would misjudge a fast machine), and step down straight away
     while it costs more than FIRST_PAINT. The pace watch below stays as the backup. */
  function calibrate() {
    if (reduce.matches || !scene) return
    draw()   // warm up
    for (let i = 0; i < RES.length; i++) {
      const t0 = performance.now()
      draw()
      firstPaint = performance.now() - t0
      if (firstPaint <= FIRST_PAINT || !lowerResolution()) break
    }
  }

  function watchPace(gap) {
    const slow = cost > SLOW_COST || gap > SLOW_FRAME
    const step = Math.min(gap, 0.05)
    slowFor = slow ? slowFor + step : Math.max(0, slowFor - step)
    if (slowFor > 1 && T - steppedAt > 2) lowerResolution()
  }

  function resize() {
    const W = canvas.clientWidth, H = canvas.clientHeight
    if (!W || !H) return
    sizeCanvases()
    tooth ??= paperTooth()
    toothMain = main.createPattern(tooth, 'repeat')
    toothNear = near.createPattern(tooth, 'repeat')
    // the same size (a zoom, a change of screen scaling): repaint, keep the garden and the butterfly's flight
    if (scene && scene.W === W && scene.H === H) { draw(); return }
    rebuilds++
    scene = build(W, H, G, kind)
    fly.cx = null; fly.mode = 'cruise'; fly.w = 0; fly.flower = null; fly.next = T + 2
    draw()
    if (rebuilds === 1) (window.requestIdleCallback ?? ((fn) => setTimeout(fn, 500)))(calibrate, { timeout: 1500 })
  }

  const swayNow = () => (scene.W <= 600 ? G.swayPhone : G.sway)
  const wind = (x) => swayNow() * 0.09 * (Math.sin(T * 0.9 * G.wind + x * 0.0045) * 0.65 + Math.sin(T * 1.9 * G.wind + x * 0.013 + 1.3) * 0.35)

  // a blade: a tapered, bending leaf from its base to its tip
  function blade(b) {
    const sway = wind(b.x) * (0.4 + b.flex) + Math.sin(T * 2.2 * G.wind + b.phase) * 0.015 * swayNow()
    const push = b.pa || 0   // the cursor's bend (desktop)
    const a0 = b.lean * 0.45 + sway + push
    const a1 = b.lean + b.curve + sway * 1.7 + push * G.tipBend
    const half = b.h * 0.5
    const cx = b.x + Math.sin(a0) * half, cy = b.y - Math.cos(a0) * half
    const tx = cx + Math.sin(a1) * half, ty = cy - Math.cos(a1) * half
    const px = Math.cos(a0) * b.w * 0.42, py = Math.sin(a0) * b.w * 0.42
    const tw = b.w * 0.5 * G.round
    const qx = Math.cos(a1) * tw, qy = Math.sin(a1) * tw
    const ux = Math.sin(a1) * tw * 1.5, uy = -Math.cos(a1) * tw * 1.5
    ctx.moveTo(b.x - b.w / 2, b.y)
    ctx.quadraticCurveTo(cx - px, cy - py, tx - qx, ty - qy)
    ctx.quadraticCurveTo(tx + ux, ty + uy, tx + qx, ty + qy)
    ctx.quadraticCurveTo(cx + px, cy + py, b.x + b.w / 2, b.y)
  }

  function grass(layer) {
    const { H, s } = scene
    for (const g of layer) {
      if (!g.grad) {
        g.grad = ctx.createLinearGradient(0, H, 0, H * 0.1)
        g.grad.addColorStop(0, g.root)
        g.grad.addColorStop(0.45, g.color)
        g.grad.addColorStop(1, g.tip)
      }
      ctx.fillStyle = g.grad
      ctx.beginPath()
      for (const b of g.blades) blade(b)
      ctx.fill()
      if (G.edge > 0) {
        ctx.strokeStyle = css(g.edge, G.edge)
        ctx.lineWidth = 0.9 * s
        ctx.stroke()
      }
    }
  }

  // rub the paper's tooth out of everything drawn so far on this layer
  function pencil(c, pattern) {
    if (G.grain <= 0) return
    c.save()
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.globalCompositeOperation = 'destination-out'
    c.globalAlpha = G.grain
    c.fillStyle = pattern
    c.fillRect(0, 0, c.canvas.width, c.canvas.height)
    c.restore()
  }

  function haze(amount) {
    if (amount <= 0) return
    const { W, H, colors } = scene
    const grad = ctx.createLinearGradient(0, H * 0.05, 0, H * 0.9)
    grad.addColorStop(0, css(colors.page, amount))
    grad.addColorStop(1, css(colors.page, 0))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
  }

  // dense undergrowth behind the middle grass, so no page shows through between the clumps' roots
  function underlay() {
    const { W, H, colors } = scene
    if (!scene.under) {
      const g = ctx.createLinearGradient(0, H * 0.55, 0, H)
      g.addColorStop(0, css(colors.back, 0))
      g.addColorStop(0.45, css(colors.mid, 0.85))
      g.addColorStop(1, colors.front)
      scene.under = g
    }
    ctx.fillStyle = scene.under
    ctx.fillRect(0, H * 0.55, W, H * 0.45)
  }

  // on phones a meadow flower's stem leans by leanPhone of its own lean
  const leanOf = (f) => (kind === 'meadow' && scene.W <= 600 ? f.lean * G.leanPhone : f.lean)
  function flowerHead(f) {
    const a = leanOf(f) + wind(f.x) * 0.7 + Math.sin(T * 1.6 * G.wind + f.phase) * 0.02 * swayNow() + (f.pa || 0) * G.flowerTouch + (f.tw || 0)
    return { a, hx: f.x + Math.sin(a) * f.h, hy: f.y - Math.cos(a) * f.h + f.dip }
  }

  function petal(len, wid) {
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(len * 0.45, -wid, len, 0)
    ctx.quadraticCurveTo(len * 0.45, wid, 0, 0)
  }

  function sunflowers() {
    const { s } = scene
    for (const f of scene.flowers) {
      const { a, hx, hy } = flowerHead(f)
      const mx = f.x + Math.sin(a * 0.5) * f.h * 0.5, my = f.y - Math.cos(a * 0.5) * f.h * 0.5
      ctx.strokeStyle = f.stem
      ctx.lineWidth = 2.4 * s
      ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.quadraticCurveTo(mx, my, hx, hy); ctx.stroke()
      for (const l of f.leaves) {
        const lx = f.x + (hx - f.x) * l.at, ly = f.y + (hy - f.y) * l.at
        ctx.save()
        ctx.translate(lx, ly)
        ctx.rotate(a + l.side * 0.95)
        ctx.fillStyle = l.color
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.quadraticCurveTo(l.side * l.len * 0.35, -l.len * 0.55, 0, -l.len)
        ctx.quadraticCurveTo(-l.side * l.len * 0.12, -l.len * 0.5, 0, 0)
        ctx.fill()
        ctx.restore()
      }
      // the head, seen a little from the side: back petals, front petals, then the heart
      ctx.save()
      ctx.translate(hx, hy)
      ctx.rotate(a * 0.6 + f.tilt)
      ctx.scale(1, 0.82)
      ctx.lineWidth = 0.7 * s
      ctx.strokeStyle = ROSE.edge
      // each petal stirs on its own beat, the stir running round the ring like a breeze; a twitch
      // ruffles them harder for a moment
      const stir = G.petalBreeze + (f.ruffle || 0) * 2.5
      const tb = T * G.petalSpeed * TAU
      for (const ring of [f.back, f.front]) {
        for (const p of ring) {
          const w1 = Math.sin(tb + p.a * 2 + f.phase), w2 = Math.sin(tb * 1.7 + p.a * 3.1 + f.phase * 2)
          ctx.save()
          ctx.rotate(p.a + (w1 * 0.05 + w2 * 0.025) * stir)
          ctx.translate(f.rad * 0.3, 0)
          petal(f.rad * p.len * 0.95 * (1 + w2 * 0.035 * stir), f.rad * p.wid * (1 + w1 * 0.08 * stir))
          ctx.fillStyle = p.color
          ctx.fill()
          ctx.stroke()
          ctx.restore()
        }
      }
      ctx.fillStyle = ROSE.heart
      ctx.beginPath(); ctx.arc(0, 0, f.rad * 0.42, 0, TAU); ctx.fill()
      ctx.fillStyle = ROSE.heartDeep
      ctx.beginPath(); ctx.arc(0, 0, f.rad * 0.26, 0, TAU); ctx.fill()
      ctx.fillStyle = ROSE.seed
      for (const d of f.seeds) {
        ctx.beginPath(); ctx.arc(Math.cos(d.a) * d.d * f.rad, Math.sin(d.a) * d.d * f.rad, f.rad * 0.035, 0, TAU); ctx.fill()
      }
      ctx.restore()
    }
  }

  /* the meadow (hers, 2026-11-23): small and medium open blossoms on fine stems, after her two watercolours.
     Each head is a ring of broad rounded petals seen at its own angle (`face`: full on to nearly side on),
     the petals turned away drawn first and in shade, every petal with a light down it and a pencil line round
     it; then the deep blue heart with fine threads round it. Buds are closed drops; sprigs of tiny pale
     blossoms stand between them. The tulips this replaced are in git (2026-11-22) */
  const MC = {}   // the meadow's colours, kept as css strings until the panel changes one
  function meadowColours() {
    const key = [G.petal, G.petalShade, G.petalLight, G.petalEdge, G.heart, G.stamen, G.sprig, G.leaf, G.leafDark, G.stem].join()
    if (MC.key === key) return MC
    const c = rgb(G.petal), sh = rgb(G.petalShade), li = rgb(G.petalLight)
    Object.assign(MC, {
      key, shades: [0, 0.25, 0.5, 0.75, 1].map((t) => css(mixRGB(c, sh, t * 0.7))), front: css(mixRGB(c, li, 0.3)),
      light: css(li, 0.6), edge: css(rgb(G.petalEdge), 0.55), heart: css(rgb(G.heart)),
      heartLight: css(mixRGB(rgb(G.heart), li, 0.35)), stamen: css(rgb(G.stamen), 0.8),
      sprig: css(rgb(G.sprig)), sprigEdge: css(sh, 0.5),
      leaf: css(rgb(G.leaf)), leafDark: css(rgb(G.leafDark)), stem: css(rgb(G.stem)),
    })
    return MC
  }
  // the tip: the head's angle, the stem's lean carried on and tipped over by `nod`
  const nodOf = (f, a) => (scene.W <= 600 ? a * G.followPhone + f.tilt * G.nodPhone : a * 1.2 + f.tilt * G.nod)
  // a broad petal from the heart outwards along +x: narrow at its foot, full, its tip rounded with a soft dent
  function roundPetal(len, wid) {
    const w = wid / 2
    ctx.beginPath()
    ctx.moveTo(0, -w * 0.25)
    ctx.bezierCurveTo(len * 0.3, -w * 0.9, len * 0.75, -w * 1.15, len * 0.96, -w * 0.45)
    ctx.quadraticCurveTo(len * 1.02, -w * 0.1, len * 0.93, 0)
    ctx.quadraticCurveTo(len * 1.02, w * 0.1, len * 0.96, w * 0.45)
    ctx.bezierCurveTo(len * 0.75, w * 1.15, len * 0.3, w * 0.9, 0, w * 0.25)
    ctx.closePath()
  }
  function blossom(f, C, stirT) {
    const { s } = scene
    const R = f.rad
    const stir = G.petalBreeze + (f.ruffle || 0) * 2.5
    ctx.lineWidth = 0.6 * s
    if (f.bud) {
      // a closed drop, the petals' tips just parting, on a little green cup
      ctx.fillStyle = C.shades[1]
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.bezierCurveTo(-R * 1.1, -R * 0.6, -R * 0.5, -R * 2, 0, -R * 2.3)
      ctx.bezierCurveTo(R * 0.5, -R * 2, R * 1.1, -R * 0.6, 0, 0)
      ctx.fill(); ctx.strokeStyle = C.edge; ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, -R * 0.3); ctx.quadraticCurveTo(R * 0.25, -R * 1.2, 0, -R * 2.1)
      ctx.strokeStyle = C.light; ctx.lineWidth = R * 0.3; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineCap = 'butt'
      ctx.fillStyle = C.leaf
      ctx.beginPath(); ctx.moveTo(-R * 0.7, -R * 0.25); ctx.quadraticCurveTo(0, R * 0.5, R * 0.7, -R * 0.25); ctx.quadraticCurveTo(0, -R * 0.05, -R * 0.7, -R * 0.25); ctx.fill()
      return
    }
    // seen at an angle: the ring squashed by `face`; petals pointing away from us (up the screen) go first, in shade
    const order = f.order || (f.order = [...f.petals].sort((p, q) => Math.sin(p.a) - Math.sin(q.a)))
    for (const p of order) {
      const w1 = Math.sin(stirT + p.a * 2 + f.phase), w2 = Math.sin(stirT * 1.7 + p.a * 3.1 + f.phase * 2)
      const a = p.a + (w1 * 0.05 + w2 * 0.025) * stir
      const away = -Math.sin(a)                       // 1: pointing up the screen, away from us
      // where the petal points once the ring is squashed, and how long it looks from here
      const dx = Math.cos(a), dy = Math.sin(a) * f.face
      const ang = Math.atan2(dy, dx), seen = Math.hypot(dx, dy)
      const len = R * p.len * (0.35 + 0.65 * seen) * (1 + w2 * 0.035 * stir)
      ctx.save()
      ctx.rotate(ang)
      roundPetal(len, R * p.wid * (1 + w1 * 0.06 * stir))
      const shade = Math.max(0, Math.min(4, Math.round((away * 0.5 + 0.5) * 3 * (1 - f.face * 0.4) + p.shade)))
      ctx.fillStyle = away < -0.3 ? C.front : C.shades[shade]
      ctx.fill()
      ctx.strokeStyle = C.edge; ctx.stroke()
      // the watercolour's light down the middle of the petal
      ctx.beginPath(); ctx.moveTo(R * 0.25, 0); ctx.quadraticCurveTo(len * 0.55, -R * p.wid * 0.12, len * 0.82, 0)
      ctx.lineWidth = R * p.wid * 0.16; ctx.lineCap = 'round'; ctx.strokeStyle = C.light; ctx.stroke()
      ctx.lineCap = 'butt'; ctx.lineWidth = 0.6 * s
      ctx.restore()
    }
    // the heart: fine threads with dark tips round a deep blue centre, squashed with the ring
    ctx.save()
    ctx.scale(1, f.face)
    if (f.stamens) {
      ctx.strokeStyle = C.stamen; ctx.lineWidth = 0.55 * s
      ctx.beginPath()
      for (let k = 0; k < f.stamens; k++) {
        const a = (k / f.stamens) * TAU + f.phase
        ctx.moveTo(Math.cos(a) * R * 0.2, Math.sin(a) * R * 0.2)
        ctx.lineTo(Math.cos(a) * R * 0.46, Math.sin(a) * R * 0.46)
      }
      ctx.stroke()
      ctx.fillStyle = C.heart
      for (let k = 0; k < f.stamens; k++) {
        const a = (k / f.stamens) * TAU + f.phase
        ctx.beginPath(); ctx.arc(Math.cos(a) * R * 0.47, Math.sin(a) * R * 0.47, 0.75 * s, 0, TAU); ctx.fill()
      }
    }
    ctx.fillStyle = C.heart
    ctx.beginPath(); ctx.arc(0, 0, R * (f.stamens ? 0.22 : 0.26), 0, TAU); ctx.fill()
    ctx.fillStyle = C.heartLight
    ctx.beginPath(); ctx.arc(-R * 0.05, -R * 0.06, R * 0.08, 0, TAU); ctx.fill()
    ctx.restore()
  }
  function meadow() {
    const { s } = scene
    const C = meadowColours()
    const tb = T * G.petalSpeed * TAU
    // the sprigs, behind the flowers: a fine stem, short twigs, tiny pale blossoms
    for (const g of scene.sprigs) {
      const a = leanOf(g) + wind(g.x) * 0.7 + Math.sin(T * 1.6 * G.wind + g.phase) * 0.02 * swayNow()
      const hx = g.x + Math.sin(a) * g.h, hy = g.y - Math.cos(a) * g.h
      const mx = g.x + Math.sin(a * 0.4) * g.h * 0.55, my = g.y - Math.cos(a * 0.4) * g.h * 0.55
      ctx.strokeStyle = C.stem; ctx.lineWidth = 0.8 * s
      ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.quadraticCurveTo(mx, my, hx, hy); ctx.stroke()
      for (const t of g.twigs) {
        const u = t.at, iu = 1 - u
        const px = iu * iu * g.x + 2 * iu * u * mx + u * u * hx, py = iu * iu * g.y + 2 * iu * u * my + u * u * hy
        const ta = a + t.side * 0.75
        const ex = px + Math.sin(ta) * t.len, ey = py - Math.cos(ta) * t.len
        ctx.strokeStyle = C.stem; ctx.lineWidth = 0.6 * s
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke()
        for (const d of t.dots) {
          const dx = px + (ex - px) * d.t + d.off * Math.cos(ta), dy = py + (ey - py) * d.t + d.off * Math.sin(ta)
          ctx.fillStyle = C.sprig; ctx.beginPath(); ctx.arc(dx, dy, d.r, 0, TAU); ctx.fill()
          ctx.strokeStyle = C.sprigEdge; ctx.lineWidth = 0.4 * s; ctx.stroke()
        }
      }
    }
    for (const f of scene.flowers) {
      const { a, hx, hy } = flowerHead(f)
      const mx = f.x + Math.sin(a * 0.4) * f.h * 0.55, my = f.y - Math.cos(a * 0.4) * f.h * 0.55
      ctx.strokeStyle = C.stem; ctx.lineWidth = (f.perch ? 1.5 : 1.1) * s
      ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.quadraticCurveTo(mx, my, hx, hy); ctx.stroke()
      // slim leaves along the stem
      for (const l of f.leaves) {
        const u = l.at, iu = 1 - u
        const lx = iu * iu * f.x + 2 * iu * u * mx + u * u * hx, ly = iu * iu * f.y + 2 * iu * u * my + u * u * hy
        ctx.save()
        ctx.translate(lx, ly)
        ctx.rotate(a * 0.6 + l.side * 0.7)
        ctx.fillStyle = l.dark ? C.leafDark : C.leaf
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.quadraticCurveTo(l.side * l.len * 0.22, -l.len * 0.5, 0, -l.len)
        ctx.quadraticCurveTo(-l.side * l.len * 0.08, -l.len * 0.5, 0, 0)
        ctx.fill()
        ctx.restore()
      }
      ctx.save()
      ctx.translate(hx, hy)
      ctx.rotate(nodOf(f, a))
      blossom(f, C, tb)
      ctx.restore()
    }
  }

  function groundAndBushes() {
    const { W, H } = scene
    ctx.fillStyle = scene.colors.ground
    ctx.beginPath()
    ctx.moveTo(-10, H)
    for (const [x, y] of scene.ground) ctx.lineTo(x, y)
    ctx.lineTo(W + 10, H)
    ctx.closePath()
    ctx.fill()
    for (const b of scene.bushes) {
      ctx.globalAlpha = b.alpha
      ctx.fillStyle = b.color
      ctx.beginPath(); ctx.ellipse(b.x, b.y, b.rx, b.ry, b.a, 0, TAU); ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  // where the butterfly sits on a sunflower: on its heart
  const perchOn = (f) => {
    const { a, hx, hy } = flowerHead(f)
    if (kind !== 'meadow') return { x: hx, y: hy - f.rad * 0.3, tilt: a * 0.6 + f.tilt }
    // in the meadow: on the heart of a medium blossom, tipped with it
    const n = nodOf(f, a), up = f.rad * 0.25 * f.face
    return { x: hx + Math.sin(n) * up, y: hy - Math.cos(n) * up, tilt: n * 0.6 }
  }
  // the middle of a flower's head (the twitch's target): the stem's tip in both gardens
  const headMid = (f) => { const { hx, hy } = flowerHead(f); return { hx, hy } }

  function butterfly() {
    if (!bfly || !scene) return
    if (G.bVivid !== vividFor) { bfly = prepare(img, G.bVivid); vividFor = G.bVivid }
    const bw = bSize(), bh = bw * (bfly.height / bfly.width)
    let x, y, rot, k
    if (reduce.matches) {
      const f = scene.perches.reduce((m, f) => (f.h > m.h ? f : m), scene.perches[0])
      const p = perchOn(f)
      x = p.x; y = p.y; rot = p.tilt * 0.5; k = 0.85
    } else {
      if (fly.cx === null) return
      x = fly.x; y = fly.y; rot = fly.rot
      // in flight the wings beat from open (1) to nearly closed; resting, they slowly open and close,
      // starting open, and `rest` blends between the two so neither change jumps
      const flight = 0.22 + 0.78 * (0.5 + 0.5 * Math.cos(fly.flap))
      const resting = 0.62 + 0.38 * (0.5 + 0.5 * Math.cos((T - fly.perchT) * TAU * 0.4))
      k = flight + (resting - flight) * fly.rest
    }
    const split = bfly.width * BODY
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    // each wing narrows towards the body as it beats, the way the window's butterfly folds
    ctx.drawImage(bfly, 0, 0, split + 1, bfly.height, -bw * BODY * k, -bh / 2, bw * BODY * k + 0.5, bh)
    ctx.drawImage(bfly, split - 1, 0, bfly.width - split + 1, bfly.height, -0.5, -bh / 2, bw * (1 - BODY) * k + 0.5, bh)
    ctx.restore()
  }

  // what each layer holds
  const PAINT = {
    back() { grass(scene.layers[0]); haze(G.haze); underlay(); grass(scene.layers[1]); haze(G.haze * 0.35) },
    flowers() { if (kind === 'meadow') meadow(); else sunflowers() },
    // ground and the closest grass, pencilled on their own, so they can be laid over the butterfly
    near() { groundAndBushes(); grass(scene.layers[2]); pencil(near, toothNear) },
  }
  const redrawAll = () => { for (const L of Object.values(LAYERS)) L.dirty = true }

  // all: every layer afresh (a resize, a panel change, the still garden); otherwise only those that moved
  function draw(all = true) {
    if (!scene) return
    const { W, H } = scene
    const windy = swayNow() > 0
    const calm = { back: windy, flowers: windy || G.petalBreeze > 0, near: windy }
    const step = 0.72 / Math.max(1, G.calmFps)   // a little under 1 / calmFps, so a frame early still counts
    for (const [name, L] of Object.entries(LAYERS)) {
      if (!(all || L.dirty || L.active || L.was || (calm[name] && T - L.at >= step))) continue
      ctx = L.c
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      PAINT[name]()
      L.at = T; L.dirty = false
    }
    for (const L of Object.values(LAYERS)) L.was = L.active   // once more after it settles, at rest
    // far and middle, then the flowers, pencilled together; the butterfly, crisp; then the near grass over it
    ctx = main
    main.setTransform(1, 0, 0, 1, 0, 0)
    main.clearRect(0, 0, main.canvas.width, main.canvas.height)
    main.drawImage(backCanvas, 0, 0)
    main.drawImage(flowerCanvas, 0, 0)
    main.setTransform(dpr, 0, 0, dpr, 0, 0)
    pencil(main, toothMain)
    butterfly()
    main.save()
    main.setTransform(1, 0, 0, 1, 0, 0)
    main.drawImage(nearCanvas, 0, 0)
    main.restore()
  }

  // the next sunflower: the nearest one ahead in the direction it's drifting, else the nearest other
  function chooseFlower() {
    const fs = scene.perches.filter((f) => f !== fly.last)
    const ahead = fs.filter((f) => (f.x - fly.x) * fly.dir > scene.W * 0.05)
    const pool = ahead.length ? ahead : fs
    return pool.reduce((m, f) => (Math.abs(f.x - fly.x) < Math.abs(m.x - fly.x) ? f : m), pool[0])
  }

  /* ---------- grass and cursor (desktop) ---------- */
  const fine = matchMedia('(hover: hover) and (pointer: fine)')
  const ptr = { x: 0, y: 0, in: false, vx: 0, lx: null }
  const onMove = (e) => {
    if (!fine.matches) return
    const r = canvas.getBoundingClientRect()
    ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.in = true
  }
  const onLeave = () => { ptr.in = false; ptr.lx = null }
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerleave', onLeave)
  // a tap on a touch screen (hers, 2026-11-21: her mum tapped the butterfly to see what it does): it darts
  // away as from the cursor, and nothing else (the grass stays still). The tap holds for a moment, so a
  // butterfly flying under the finger still goes
  const tap = { x: 0, y: 0, until: 0 }
  const onDown = (e) => {
    if (e.pointerType !== 'touch') return
    const r = canvas.getBoundingClientRect()
    tap.x = e.clientX - r.left; tap.y = e.clientY - r.top; tap.until = T + 0.25
  }
  canvas.addEventListener('pointerdown', onDown)

  // a springy thing (blade or stem) of height h leaning by `lean` from its base (x, y): how close the
  // cursor is to it, 0 out of reach to 1 touching
  const nearness = (x, y, h, lean, R) => {
    const top = y - h
    const dx = ptr.x - (x + Math.sin(lean) * h * 0.4)
    const dy = ptr.y < top ? top - ptr.y : ptr.y > y ? ptr.y - y : 0
    const d = Math.hypot(dx, dy)
    return d >= R ? 0 : (1 - d / R) ** 2
  }

  function touchGrass(dt) {
    if (dt <= 0) return
    const { s } = scene
    // graceful, not springy: the cursor's sideways speed is smoothed over `softness` (mouse events
    // arrive in uneven steps), and each blade's push eases in and out over it too (below), so the
    // spring follows a gliding target instead of being kicked
    const ease = Math.min(1, dt / Math.max(0.02, G.softness))
    const raw = ptr.in && ptr.lx !== null ? (ptr.x - ptr.lx) / dt / s : 0
    ptr.vx += (raw - ptr.vx) * Math.min(1, dt / Math.max(0.02, G.softness * 0.5))
    ptr.lx = ptr.in ? ptr.x : null
    const R = G.reach * s, k = G.spring * G.spring, c = G.settle
    const swept = Math.max(-1.5, Math.min(1.5, ptr.vx / 300))   // a brisk sweep is about 300px/s
    // o.pt: the bend the cursor is asking for, eased; the blade springs towards it
    const spring = (o, near, away, weight) => {
      const want = ptr.in && near > 0 ? near * weight * (G.brush * swept * 0.35 + G.part * away) : 0
      const pt = (o.pt || 0) + (want - (o.pt || 0)) * ease
      const pa = o.pa || 0, pv = o.pv || 0
      o.pt = pt
      o.pv = pv + (k * (pt - pa) - c * pv) * dt
      o.pa = pa + o.pv * dt
    }
    const weights = [G.depth, (1 + G.depth) / 2, 1]
    // lean away: none right under the cursor, growing to full half a reach to either side, so a
    // blade the cursor rests on doesn't flick from side to side
    const away = (x) => Math.max(-1, Math.min(1, (x - ptr.x) / (R * 0.5)))
    scene.layers.forEach((layer, li) => {
      moving[li] = false
      for (const g of layer) for (const b of g.blades) {
        const near = ptr.in ? nearness(b.x, b.y, b.h, b.lean, R) : 0
        if (!near && !b.pa && !b.pv && !b.pt) continue
        spring(b, near, away(b.x), weights[li])
        if (!near && Math.abs(b.pa) < 1e-4 && Math.abs(b.pv) < 1e-3 && Math.abs(b.pt) < 1e-4) { b.pa = 0; b.pv = 0; b.pt = 0 }
        else moving[li] = true
      }
    })
    for (const f of scene.flowers) {
      const near = ptr.in ? nearness(f.x, f.y, f.h, f.lean, R) : 0
      spring(f, near, away(f.x), 1)
      // a twitch when the cursor passes over the head: a quick, small jolt away from it on a stiff
      // spring of its own, and the petals ruffle
      if (ptr.in && G.flowerTwitch > 0 && T >= (f.twitchReady || 0)) {
        const { hx, hy } = headMid(f)
        if (Math.hypot(ptr.x - hx, ptr.y - hy) < f.rad * 1.3) {
          f.tv = (f.tv || 0) + (ptr.x < hx ? 1 : -1) * 1.6 * G.flowerTwitch
          f.dipV += 12 * s * G.flowerTwitch
          f.ruffle = Math.min(1, G.flowerTwitch)
          f.twitchReady = T + 0.9
        }
      }
    }
  }

  // the twitch spring and the petals' ruffle settle on every frame, wherever the cursor is
  function settleFlowers(dt) {
    for (const f of scene.flowers) {
      const tw = f.tw || 0, tv = f.tv || 0
      f.tv = tv + (-196 * tw - 9 * tv) * dt
      f.tw = tw + f.tv * dt
      if (f.ruffle) f.ruffle = f.ruffle < 0.01 ? 0 : f.ruffle * Math.exp(-dt * 2.5)
    }
  }

  /* the dart: with the cursor right over it (desktop), or a tap on it (touch), it darts off away from it, wings racing,
     up and out; then it carries on calmly from where it got to. On a flower, or landing on one,
     it lifts off at once. dx / dy: the dart's offset from its usual path */
  function dartAway(dt) {
    const { s } = scene, bw = bSize()
    const om = 4.5 / Math.max(0.2, G.dartTime)
    // a fingertip is broad and the butterfly small on a phone: a tap counts a little further out than the cursor
    const from = ptr.in ? { x: ptr.x, y: ptr.y, r: 0.55 } : T < tap.until ? { x: tap.x, y: tap.y, r: 0.9 } : null
    if (from && T >= fly.dartReady && Math.hypot(from.x - fly.x, from.y - fly.y) < bw * from.r) {
      tap.until = 0
      let ax = fly.x - from.x, ay = fly.y - from.y - bw * 0.35   // away, and a little up
      const n = Math.hypot(ax, ay) || 1
      ax /= n; ay /= n
      fly.dvx += ax * G.dart * s * 2 * om
      fly.dvy += ay * G.dart * s * om * Math.E
      if (Math.abs(ax) > 0.2) fly.dir = Math.sign(ax)
      fly.burstUntil = T + G.dartTime * 0.7
      fly.dartReady = T + 0.6
      if (fly.mode === 'perch' || fly.mode === 'approach') {
        if (fly.mode === 'perch') fly.flower.dipV += 30 * s
        fly.wFrom = fly.w; fly.mode = 'takeoff'; fly.since = T; fly.flapping = true
      }
    }
    if (!fly.dvx && !fly.dvy && !fly.dx && !fly.dy) return
    // sideways: it coasts to a stop, and the distance passes into its path so it carries on from there
    fly.dvx -= fly.dvx * Math.min(1, 2 * om * dt)
    fly.dx += fly.dvx * dt
    const bleed = fly.dx * Math.min(1, dt * om * 0.5)
    fly.cx += bleed; fly.dx -= bleed
    // up and down: it springs back to its height
    fly.dvy += (-om * om * fly.dy - 2 * om * fly.dvy) * dt
    fly.dy += fly.dvy * dt
    if (Math.abs(fly.dx) + Math.abs(fly.dy) < 0.05 && Math.abs(fly.dvx) + Math.abs(fly.dvy) < 0.5) { fly.dx = fly.dy = fly.dvx = fly.dvy = 0 }
  }

  function update(dt) {
    const { W, H, s } = scene
    const R = G.loop * s
    const lo = W * 0.06 + R + bSize() * 0.5, hi = W - lo

    // sunflowers spring back after being landed on
    for (const f of scene.flowers) { f.dipV += (-f.dip * 70 - f.dipV * 9) * dt; f.dip += f.dipV * dt }
    touchGrass(dt)
    settleFlowers(dt)
    // which layers are moving now (draw redraws those every frame): grass the cursor is in, and flowers
    // bending to it, twitching, dipping under the butterfly or ruffled
    LAYERS.back.active = moving[0] || moving[1]
    LAYERS.near.active = moving[2]
    LAYERS.flowers.active = scene.flowers.some((f) => f.ruffle > 0 || Math.abs(f.dip) > 0.01 || Math.abs(f.dipV) > 0.05
      || Math.abs(f.pa || 0) > 1e-4 || Math.abs(f.pv || 0) > 1e-3 || Math.abs(f.tw || 0) > 1e-4 || Math.abs(f.tv || 0) > 1e-3)

    // the drift; it pauses while it's on (or headed for) a flower. The speed eases, and it starts
    // turning early enough to come about right at the edge, so it never reverses with a jolt
    if (fly.cx === null) { fly.cx = hi; fly.x = hi; fly.y = H * 0.4 }
    const free = 1 - fly.w
    const speed = G.bSpeed * s, ease = 0.8
    if (fly.dir < 0 && fly.cx - lo < -fly.vx / ease) fly.dir = 1
    if (fly.dir > 0 && hi - fly.cx < fly.vx / ease) fly.dir = -1
    fly.vx += (fly.dir * speed - fly.vx) * Math.min(1, dt * ease)
    fly.cx += fly.vx * dt * free
    const going = Math.min(1, Math.abs(fly.vx) / speed)   // 0 mid-turn, 1 at full speed

    // the swing: up and down in a smooth wave, swooping forward a little on the way down, like a
    // pendulum. The swoop fades during a turn so it never flies backwards
    fly.theta += TAU * G.loopRate * dt * free
    const cy = H * 0.4 + Math.sin(T * 0.37) * 0.06 * H
    const loopX = fly.cx + Math.sin(fly.theta * 2) * R * 0.2 * going * Math.sign(fly.vx)
    const loopY = cy + Math.sin(fly.theta) * R * 0.8
      + Math.sin(fly.flap) * H * 0.012 * G.hop * Math.min(1, fly.rate / Math.max(1, G.flap))   // a lift with each wing beat

    // glides: every few seconds the wings settle open for a moment (never mid-dart)
    if (fly.mode === 'cruise') {
      if (T >= fly.glideAt) { fly.glideUntil = T + 0.7 + Math.random() * 0.6; fly.glideAt = fly.glideUntil + 2.5 + Math.random() * 3 }
      fly.flapping = T >= fly.glideUntil || T < fly.burstUntil
    }

    // visiting a sunflower: glide down to it, touch down softly, rest, lift off back into the loops
    const u = T - fly.since
    let arc = 0
    if (fly.mode === 'cruise' && T >= fly.next && scene.perches.length) {
      fly.flower = chooseFlower(); fly.mode = 'approach'; fly.since = T
    } else if (fly.mode === 'approach') {
      const p = u / 2
      fly.w = smooth(p)
      arc = -Math.sin(Math.PI * Math.min(1, p)) * H * 0.12
      fly.flapping = p < 0.7                             // beats, then glides in with wings open
      if (p >= 1) { fly.mode = 'perch'; fly.since = T; fly.perchT = T; fly.flower.dipV += 55 * s }
    } else if (fly.mode === 'perch') {
      fly.w = 1
      fly.flapping = false
      if (u >= G.stay) { fly.mode = 'takeoff'; fly.since = T; fly.wFrom = 1; fly.flower.dipV += 30 * s; fly.flapping = true }
    } else if (fly.mode === 'takeoff') {
      const p = u / 1.4
      fly.w = fly.wFrom * (1 - smooth(p))   // from wherever it was, if a dart cut a landing short
      arc = -Math.sin(Math.PI * Math.min(1, p)) * H * 0.1
      fly.flapping = true
      if (p >= 1) {
        fly.mode = 'cruise'; fly.w = 0; fly.last = fly.flower; fly.flower = null
        fly.next = T + G.visit * (0.7 + Math.random() * 0.6)
        fly.glideAt = T + 2 + Math.random() * 2
      }
    }

    const px = fly.x, py = fly.y
    if (fly.flower) {
      const p = perchOn(fly.flower)
      fly.x = loopX + (p.x - loopX) * fly.w
      fly.y = loopY + (p.y - loopY) * fly.w + arc
    } else {
      fly.x = loopX
      fly.y = loopY
    }
    dartAway(dt)
    fly.x += fly.dx
    fly.y += fly.dy
    fly.x = Math.min(W - 8 * s, Math.max(8 * s, fly.x))
    fly.y = Math.min(H * 0.8, Math.max(H * 0.12, fly.y))

    // face the way it's flying (the image's head points up: +90deg faces right, -90deg left), nose
    // up a little as it climbs and down as it dips. Turning round, it comes about through upright,
    // never upside down. On a flower, settle upright
    if (dt > 0) {
      const a = Math.min(1, dt * 4)
      fly.svx += ((fly.x - px) / dt - fly.svx) * a
      fly.svy += ((fly.y - py) / dt - fly.svy) * a
    }
    const side = Math.max(-1, Math.min(1, fly.svx / (speed * 0.7)))
    const pitch = Math.max(-0.5, Math.min(0.5, Math.atan(fly.svy / Math.max(Math.abs(fly.svx), speed * 0.5))))
    let target = side * (Math.PI / 2 + pitch)
    // settling upright onto a flower and leaning back out happen across the glide, not at once
    if (fly.flower) target += wrap(perchOn(fly.flower).tilt * 0.5 - target) * smooth((fly.w - 0.4) / 0.6)
    fly.rot += wrap(target - fly.rot) * Math.min(1, dt * 3)

    // the wings: the beat eases up and down; when it stops beating, the wings finish their stroke
    // and settle open instead of snapping there
    const darting = T < fly.burstUntil
    fly.rate += ((fly.flapping ? G.flap * (darting ? G.dartFlap : 1) : 0) - fly.rate) * Math.min(1, dt * (darting ? 10 : 3))
    if (fly.flapping) fly.stopped = false
    if (!fly.stopped) {
      const before = fly.flap
      fly.flap += TAU * Math.max(fly.rate, fly.flapping ? 0 : 1.5) * dt
      if (!fly.flapping && Math.floor(fly.flap / TAU) > Math.floor(before / TAU)) {
        fly.flap = Math.ceil(before / TAU) * TAU; fly.rate = 0; fly.stopped = true
      }
    }
    // resting on a flower blends in and out over about half a second
    fly.rest += ((fly.mode === 'perch' ? 1 : 0) - fly.rest) * Math.min(1, dt * 5)
  }

  function frame(now) {
    raf = 0
    const t = now / 1000
    // fast screens (120 to 240Hz, gaming laptops) skip a frame or two between draws, so the garden draws
    // 60 to 80 times a second at an even beat. Every frame there left too little time for the page's own
    // scrolling and it stuttered (a friend's laptop, 2026-11-23). 60 and 90Hz screens draw every frame.
    if (last && t - last < MIN_STEP) {
      if (visible && !reduce.matches) raf = requestAnimationFrame(frame)
      return
    }
    const gap = last ? t - last : 0
    const dt = Math.min(0.05, gap)
    last = t
    T += dt
    if (scene) {
      const t0 = performance.now()
      update(dt); draw(false)
      cost = cost * 0.95 + (performance.now() - t0) * 0.05   // smoothed, shown in the ?garden panel
      if (dt) { rate = rate * 0.95 + (1 / dt) * 0.05; watchPace(gap) }
      if (PERF) window.__garden = { kind, cost, rate, dpr, screen: devicePixelRatio, lowered, firstPaint, rebuilds, size: `${canvas.width}x${canvas.height}` }
    }
    if (visible && !reduce.matches) raf = requestAnimationFrame(frame)
  }

  const start = () => { if (!raf && visible && !reduce.matches) { last = 0; raf = requestAnimationFrame(frame) } }
  const stop = () => { cancelAnimationFrame(raf); raf = 0 }

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible) start()
    else stop()
  })
  io.observe(canvas)
  const onMotion = () => { stop(); draw(); start() }
  reduce.addEventListener('change', onMotion)

  const q = new URLSearchParams(location.search)
  const redraw = () => { redrawAll(); if (!raf) draw() }   // a panel change repaints every layer
  const panel = q.has('garden') ? mountPanel({ G, kind, rebuild: resize, redraw, cost: () => cost, rate: () => rate })
    : q.has('meadow') && kind === 'meadow' ? mountMeadowPanel(G, redraw) : null

  return {
    destroy() {
      stop(); ro.disconnect(); io.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onDown)
      reduce.removeEventListener('change', onMotion)
      panel?.remove()
    },
  }
}

/* ?meadow: a short panel for how the flowers stand on phones, kept to the top of the screen so the garden
   stays in view below it */
function mountMeadowPanel(G, redraw) {
  const el = document.createElement('div')
  el.className = 'tune-panel'
  el.style.cssText = 'left:auto;right:12px;top:12px;max-height:40vh;overflow:hidden auto'
  const rows = [
    ['leanPhone', 'stems lean', 0, 1, 0.05],
    ['followPhone', 'heads turn with stems', 0, 1.5, 0.05],
    ['nodPhone', 'heads nod over', 0, 1.5, 0.02],
    ['swayPhone', 'wind sway', 0, 1.5, 0.05],
  ]
  el.innerHTML = '<b>flowers on phones</b>' + rows.map(([k, label, min, max, step]) =>
    `<label><span>${label}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${G[k]}"><output>${G[k]}</output></label>`).join('')
    + '<button type="button" class="copy">copy values</button>'
  el.addEventListener('input', (e) => {
    const k = e.target.dataset.k; if (!k) return
    G[k] = +e.target.value; e.target.nextElementSibling.textContent = e.target.value; redraw()
  })
  el.querySelector('.copy').addEventListener('click', (e) => {
    navigator.clipboard?.writeText(JSON.stringify(Object.fromEntries(rows.map(([k]) => [k, G[k]])), null, 2)); e.target.textContent = 'copied'
  })
  document.body.append(el)
  return el
}

/* ?garden: sliders in plain words; "copy values" gives the GARDEN numbers */
function mountPanel({ G, kind, rebuild, redraw, cost, rate }) {
  const meadowKind = kind === 'meadow'
  const flower = meadowKind ? 'flowers' : 'sunflowers'
  const el = document.createElement('div')
  el.className = 'tune-panel'
  el.style.cssText = 'left:auto;right:12px;top:12px;max-height:calc(100vh - 24px);overflow:hidden auto'
  const rows = [
    ['seed', 'which garden', 1, 60, 1, true],
    ['light', 'lighter', 0, 0.6, 0.01, true],
    ['grain', 'pencil grain', 0, 1, 0.01],
    ['edge', 'pencil edge', 0, 1, 0.01],
    ['round', 'round tips', 0, 1, 0.05],
    ['density', 'grass', 0.3, 2, 0.05, true],
    ['flowers', flower, 0, 3.5, 0.05, true],
    ['haze', 'far fade', 0, 0.8, 0.01],
    ['sway', 'sway, desktop', 0, 3, 0.05],
    ['swayPhone', 'sway, phones', 0, 3, 0.05],
    ['wind', 'wind speed', 0, 3, 0.05],
    ['bSize', 'butterfly size, desktop', 20, 90, 1],
    ['bSizePhone', 'butterfly size, phones', 20, 90, 1],
    ['bVivid', 'butterfly colour (0 as in the nav)', 0, 1, 0.05],
    ['bSpeed', 'side to side', 10, 300, 5],
    ['loop', 'swing height', 0, 90, 1],
    ['loopRate', 'swings/s', 0, 1, 0.02],
    ['flap', 'wing beats/s', 1, 14, 0.5],
    ['hop', 'lift per wing beat', 0, 2.5, 0.05],
    ['visit', 'flying between flowers (s)', 1, 15, 0.5],
    ['stay', 'rest on a flower (s)', 0.5, 8, 0.1],
    ['phoneTall', 'grass height on phones', 1, 1.6, 0.05, true],
    ['farTall', 'far grass height, desktop', 0.3, 1.2, 0.01, true],
    'grass and cursor (desktop)',
    ['softness', 'softness (s)', 0.05, 1.5, 0.05],
    ['reach', 'cursor reach (px)', 10, 200, 1],
    ['brush', 'sweep along', 0, 3, 0.05],
    ['part', 'lean away', 0, 1, 0.01],
    ['spring', 'springiness', 2, 25, 0.5],
    ['settle', 'calm down', 0.3, 10, 0.1],
    ['tipBend', 'tip bend', 0.5, 3, 0.05],
    ['depth', 'far grass feels it', 0, 1, 0.05],
    ['flowerTouch', `${flower} move`, 0, 1.5, 0.05],
    ['flowerTwitch', 'flower twitch', 0, 3, 0.05],
    'butterfly and cursor (desktop)',
    ['dart', 'dart distance (px)', 0, 250, 5],
    ['dartTime', 'dart time (s)', 0.3, 3, 0.05],
    ['dartFlap', 'wing race', 1, 5, 0.1],
    'petals (desktop and phones)',
    ['petalBreeze', 'petal breeze', 0, 2, 0.05],
    ['petalSpeed', 'breezes/s', 0.05, 2, 0.05],
    ['calmFps', 'breeze redraws/s', 10, 60, 5],
    ...(meadowKind ? [
      'meadow',
      ['flowerSize', 'flower size', 0.6, 1.6, 0.02, true],
      ['small', 'share small', 0, 1, 0.05, true],
      ['buds', 'share buds', 0, 0.6, 0.05, true],
      ['sprigs', 'pale sprigs', 0, 3, 0.1, true],
      ['nod', 'heads nod over', 0, 1.5, 0.02],
      'colours (meadow)',
      ['petal', 'petals', 'color'], ['petalShade', 'petal shade', 'color'], ['petalLight', 'petal light', 'color'],
      ['petalEdge', 'pencil line', 'color'], ['heart', 'hearts', 'color'], ['stamen', 'heart threads', 'color'], ['sprig', 'sprig blossoms', 'color'], ['stem', 'stems', 'color', true], ['leaf', 'leaves', 'color'],
      ['leafDark', 'leaves, shade', 'color'], ['grassFar', 'far grass', 'color', true], ['grassMid', 'middle grass', 'color', true],
      ['grassNear', 'near grass', 'color', true],
    ] : []),
  ]
  // a string is a section heading
  el.innerHTML = `<b>${meadowKind ? 'meadow' : 'garden'}</b>${rows.map((row) => {
    if (typeof row === 'string') return `<b style="margin-top:8px">${row}</b>`
    const [k, label, min, max, step] = row
    if (min === 'color') return `<label><span>${label}</span><input type="color" data-k="${k}" data-color value="${G[k]}"><output>${G[k]}</output></label>`
    return `<label><span>${label}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${G[k]}"><output>${G[k]}</output></label>`
  }).join('')}<button type="button" class="copy">copy values</button>`
  const rebuilds = new Set(rows.filter((r) => Array.isArray(r) && (r[2] === 'color' ? r[3] : r[5])).map((r) => r[0]))
  el.addEventListener('input', (e) => {
    const k = e.target.dataset.k
    if (!k) return
    G[k] = 'color' in e.target.dataset ? e.target.value : +e.target.value
    e.target.nextElementSibling.textContent = e.target.value
    if (rebuilds.has(k)) rebuild()
    else redraw()
  })
  el.addEventListener('click', (e) => {
    const t = e.target.closest('button'); if (!t) return
    navigator.clipboard?.writeText(JSON.stringify(G, null, 2)); t.textContent = 'copied'
  })
  const meter = document.createElement('output')
  el.append(meter)
  const tick = setInterval(() => { if (!el.isConnected) clearInterval(tick); else meter.textContent = `draw time ${cost().toFixed(1)} ms a frame, ${Math.round(rate())} frames a second` }, 500)
  document.body.append(el)
  return el
}
