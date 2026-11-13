/**
 * The footer garden (Figma note on the Work page, 1:2), drawn to match the window intro's coloured
 * pencil (Lavanya, 2026-11-14): the visitor opened the window and let the butterfly out, and here it
 * is, enjoying the garden. Light purple grass, pale rose-pink sunflowers with dark brown hearts, and
 * the logo butterfly in its own colours, exactly as it flies out of the window.
 *
 * The butterfly never leaves: it loops in slow circles drifting from side to side, and now and then
 * glides down to a sunflower, touches down softly (the flower dips under it), rests with its wings
 * slowly opening and closing, and lifts off again. It has no sound and doesn't react to the pointer.
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
  seed: 12,        // which garden: another number lays it out differently
  density: 1.05,   // how much grass
  flowers: 1,      // how many sunflowers
  light: 0.22,     // washes every purple lighter (0 to 0.6)
  round: 0.1,      // grass tips: 0 pointed, 1 blunt as the blade is wide
  grain: 0.55,     // pencil grain: how much paper shows through the colour
  edge: 0.4,       // pencil edge along each blade
  sway: 0.65,      // how far the grass moves in the wind
  wind: 1,         // how fast the wind moves
  haze: 0.51,      // how much the far grass fades into the page
  bSize: 52,       // butterfly width, px on the desktop band (324 tall); scales with the band
  bSpeed: 125,     // how fast it drifts from side to side, px a second on the desktop band
  loop: 36,        // size of its loops, px on the desktop band
  loopRate: 0.15,  // loops a second
  flap: 11,        // wing beats a second
  hop: 1,          // how much it bobs up and down as it flies (the chirpiness)
  visit: 5,        // seconds of flying between visits to a sunflower
  stay: 2.4,       // seconds it rests on a sunflower
}
/* Lavanya's values, 2026-11-14 (seed to haze, bSize to hop). grain, edge, visit and stay are new */

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
function build(W, H, G) {
  const r = rng(G.seed)
  const s = H / 324
  const P = palette(G.light)
  const between = (a, b) => a + r() * (b - a)
  const pick = (arr) => arr[(r() * arr.length) | 0]

  const LAYERS = [
    { colors: P.back, every: 52, blades: [8, 14], h: [0.34, 0.74], w: [8, 13], base: 0.9, lean: 0.42 },
    { colors: P.mid, every: 62, blades: [7, 13], h: [0.26, 0.8], w: [9, 15], base: 0.96, lean: 0.48 },
    { colors: P.front, every: 46, blades: [5, 10], h: [0.12, 0.46], w: [10, 16], base: 1.03, lean: 0.55 },
  ]
  const layers = LAYERS.map((L) => {
    const blades = []
    const n = Math.max(3, Math.round((W / (L.every * s)) * G.density))
    for (let i = 0; i < n; i++) {
      const cx = ((i + r() * 0.9) / n) * W
      const tall = r() < 0.16 ? between(1.1, 1.3) : 1     // now and then a tall, arching clump
      const m = Math.round(between(...L.blades))
      for (let j = 0; j < m; j++) {
        const spread = m > 1 ? (j / (m - 1)) * 2 - 1 : 0
        const lean = spread * L.lean + (r() - 0.5) * 0.25
        const h = Math.min(0.95, between(...L.h) * tall) * H * (1 - Math.abs(spread) * 0.3)
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

  // sunflowers, all one kind: two rings of pointed rose-pink petals around a dark brown heart
  const flowers = []
  const nFlowers = Math.max(2, Math.round((W / (230 * s)) * G.flowers))
  for (let i = 0; i < nFlowers; i++) {
    const rad = between(19, 26) * s
    const n = Math.round(between(16, 20))
    const ring = (shades, len, wid, off) => Array.from({ length: n }, (_, p) => ({
      a: ((p + off) / n) * TAU + (r() - 0.5) * 0.12,
      len: len * between(0.9, 1.08), wid: wid * between(0.85, 1.1), color: pick(shades),
    }))
    flowers.push({
      x: ((i + 0.2 + r() * 0.6) / nFlowers) * W,
      y: H,
      h: between(0.36, 0.6) * H,
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
    W, H, s, layers, flowers, ground, bushes,
    colors: { ground: css(P.ground), page: P.page, back: P.back[2], mid: P.mid[1], front: css(P.front[1]) },
  }
}

/* ---------- the butterfly, as it flies out of the window ---------- */

// the logo image with the window flyer's crop (Design System logo 330:3) and its colour lift
// (saturate 1.3, brightness 1.06, as in WindowIntro.css), baked once
function prepare(img) {
  const sx = 139, sy = 32, sw = 391, sh = 307
  const c = document.createElement('canvas')
  c.width = sw; c.height = sh
  const x = c.getContext('2d', { willReadFrequently: true })
  x.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
  const d = x.getImageData(0, 0, sw, sh), px = d.data
  for (let i = 0; i < px.length; i += 4) {
    const L = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]
    for (let k = 0; k < 3; k++) px[i + k] = Math.min(255, (L + (px[i + k] - L) * 1.3) * 1.06)
  }
  x.putImageData(d, 0, 0)
  return c
}
const BODY = 0.496   // where the body is across the cropped image (the flyer's wing split)

/* ---------- mounting ---------- */

export function mountGarden(canvas) {
  const G = GARDEN
  const main = canvas.getContext('2d')
  const nearCanvas = document.createElement('canvas')    // ground and near grass, grained apart
  const near = nearCanvas.getContext('2d')                // so the butterfly between stays crisp
  let ctx = main
  const reduce = matchMedia('(prefers-reduced-motion: reduce)')
  let scene = null, bfly = null, dpr = 1, tooth = null, toothMain = null, toothNear = null
  let raf = 0, visible = false, last = 0, T = 0, cost = 0

  /* the flight. cruise: loops round a centre (cx) that drifts between the sides. approach / perch /
     takeoff: `w` blends it from the loops onto a sunflower and back */
  const fly = {
    cx: null, dir: -1, theta: 0, ox: 0, oy: 0, vy: 0, x: 0, y: 0, rot: 0,
    flap: 0, flapping: true, until: 0, hopAt: 0.4,
    mode: 'cruise', since: 0, next: 3, flower: null, last: null, w: 0,
  }

  const img = new Image()
  img.src = '/assets/butterfly.png'
  img.decode().then(() => { bfly = prepare(img); draw() }).catch(() => {})

  function resize() {
    const W = canvas.clientWidth, H = canvas.clientHeight
    if (!W || !H) return
    dpr = Math.min(2, devicePixelRatio || 1)
    for (const c of [canvas, nearCanvas]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr) }
    tooth ??= paperTooth()
    toothMain = main.createPattern(tooth, 'repeat')
    toothNear = near.createPattern(tooth, 'repeat')
    scene = build(W, H, G)
    fly.cx = null; fly.mode = 'cruise'; fly.w = 0; fly.flower = null; fly.next = T + 2
    draw()
  }

  const wind = (x) => G.sway * 0.09 * (Math.sin(T * 0.9 * G.wind + x * 0.0045) * 0.65 + Math.sin(T * 1.9 * G.wind + x * 0.013 + 1.3) * 0.35)

  // a blade: a tapered, bending leaf from its base to its tip
  function blade(b) {
    const sway = wind(b.x) * (0.4 + b.flex) + Math.sin(T * 2.2 * G.wind + b.phase) * 0.015 * G.sway
    const a0 = b.lean * 0.45 + sway
    const a1 = b.lean + b.curve + sway * 1.7
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

  function flowerHead(f) {
    const a = f.lean + wind(f.x) * 0.7 + Math.sin(T * 1.6 * G.wind + f.phase) * 0.02 * G.sway
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
      for (const ring of [f.back, f.front]) {
        for (const p of ring) {
          ctx.save()
          ctx.rotate(p.a)
          ctx.translate(f.rad * 0.3, 0)
          petal(f.rad * p.len * 0.95, f.rad * p.wid)
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
  const perchOn = (f) => { const { a, hx, hy } = flowerHead(f); return { x: hx, y: hy - f.rad * 0.3, tilt: a * 0.6 + f.tilt } }

  function butterfly() {
    if (!bfly || !scene) return
    const { s } = scene
    const bw = G.bSize * s, bh = bw * (bfly.height / bfly.width)
    let x, y, rot, k
    if (reduce.matches) {
      const f = scene.flowers.reduce((m, f) => (f.h > m.h ? f : m), scene.flowers[0])
      const p = perchOn(f)
      x = p.x; y = p.y; rot = p.tilt * 0.5; k = 0.85
    } else {
      if (fly.cx === null) return
      x = fly.x; y = fly.y; rot = fly.rot
      k = fly.mode === 'perch'
        ? 0.62 + 0.38 * (0.5 + 0.5 * Math.cos(T * TAU * 0.45))    // resting: wings slowly open and close
        : 0.16 + 0.84 * (0.5 + 0.5 * Math.cos(fly.flap))
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

  function draw() {
    if (!scene) return
    const { W, H } = scene
    // far and middle: grass, haze, undergrowth, sunflowers, then pencilled
    ctx = main
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    grass(scene.layers[0])
    haze(G.haze)
    underlay()
    grass(scene.layers[1])
    haze(G.haze * 0.35)
    sunflowers()
    pencil(main, toothMain)
    // the butterfly, crisp
    butterfly()
    // near: ground and the closest grass, pencilled on their own, then laid over the butterfly
    ctx = near
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    groundAndBushes()
    grass(scene.layers[2])
    pencil(near, toothNear)
    ctx = main
    main.save()
    main.setTransform(1, 0, 0, 1, 0, 0)
    main.drawImage(nearCanvas, 0, 0)
    main.restore()
  }

  // the next sunflower: the nearest one ahead in the direction it's drifting, else the nearest other
  function chooseFlower() {
    const fs = scene.flowers.filter((f) => f !== fly.last)
    const ahead = fs.filter((f) => (f.x - fly.x) * fly.dir > scene.W * 0.05)
    const pool = ahead.length ? ahead : fs
    return pool.reduce((m, f) => (Math.abs(f.x - fly.x) < Math.abs(m.x - fly.x) ? f : m), pool[0])
  }

  function update(dt) {
    const { W, H, s } = scene
    const R = G.loop * s
    const lo = W * 0.06 + R + G.bSize * s * 0.5, hi = W - lo

    // sunflowers spring back after being landed on
    for (const f of scene.flowers) { f.dipV += (-f.dip * 70 - f.dipV * 9) * dt; f.dip += f.dipV * dt }

    // the loops; they pause while it's on (or headed for) a flower
    if (fly.cx === null) { fly.cx = hi; fly.x = hi; fly.y = H * 0.4 }
    const free = 1 - fly.w
    fly.cx += fly.dir * G.bSpeed * s * dt * free
    if (fly.cx < lo) { fly.cx = lo; fly.dir = 1 }
    if (fly.cx > hi) { fly.cx = hi; fly.dir = -1 }
    fly.theta += -fly.dir * TAU * G.loopRate * dt * free
    const cy = H * 0.4 + Math.sin(T * 0.37) * 0.06 * H

    // chirpy hops while it's flying free
    if (fly.mode === 'cruise' && T >= fly.hopAt) {
      fly.vy -= H * (0.5 + Math.random() * 0.5) * G.hop
      fly.flapping = true
      fly.until = T + 0.22 + Math.random() * 0.22
      fly.hopAt = T + 0.4 + Math.random() * 0.5
    }
    fly.vy += (-fly.oy * 26 - fly.vy * 6.5 + (fly.flapping ? 0 : H * 0.6)) * dt
    fly.oy += fly.vy * dt
    if (fly.flapping && T >= fly.until && fly.mode === 'cruise') fly.flapping = false
    const loopX = fly.cx + Math.cos(fly.theta) * R
    const loopY = cy + Math.sin(fly.theta) * R * 0.8 + fly.oy * free

    // visiting a sunflower: glide down to it, touch down softly, rest, lift off back into the loops
    const u = T - fly.since
    let arc = 0
    if (fly.mode === 'cruise' && T >= fly.next && scene.flowers.length) {
      fly.flower = chooseFlower(); fly.mode = 'approach'; fly.since = T
    } else if (fly.mode === 'approach') {
      const p = u / 2
      fly.w = smooth(p)
      arc = -Math.sin(Math.PI * Math.min(1, p)) * H * 0.12
      fly.flapping = p < 0.7                             // beats, then glides in with wings open
      if (p >= 1) { fly.mode = 'perch'; fly.since = T; fly.flower.dipV += 55 * s }
    } else if (fly.mode === 'perch') {
      fly.w = 1
      fly.flapping = false
      if (u >= G.stay) { fly.mode = 'takeoff'; fly.since = T; fly.flower.dipV += 30 * s; fly.flapping = true }
    } else if (fly.mode === 'takeoff') {
      const p = u / 1.4
      fly.w = 1 - smooth(p)
      arc = -Math.sin(Math.PI * Math.min(1, p)) * H * 0.1
      fly.flapping = true
      if (p >= 1) {
        fly.mode = 'cruise'; fly.w = 0; fly.last = fly.flower; fly.flower = null
        fly.next = T + G.visit * (0.7 + Math.random() * 0.6)
        fly.until = T + 0.3
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
    fly.x = Math.min(W - 8 * s, Math.max(8 * s, fly.x))
    fly.y = Math.min(H * 0.8, Math.max(H * 0.12, fly.y))

    // face where it's going (the image's head points up, so +90deg); on a flower, settle upright
    const target = fly.mode === 'perch' || fly.w > 0.9
      ? perchOn(fly.flower).tilt * 0.5
      : (dt > 0 && Math.hypot(fly.x - px, fly.y - py) > 0.05 ? Math.atan2(fly.y - py, fly.x - px) + Math.PI / 2 : fly.rot)
    fly.rot += wrap(target - fly.rot) * Math.min(1, dt * (fly.mode === 'perch' ? 4 : 9))

    if (fly.flapping) fly.flap += TAU * G.flap * dt
    else fly.flap += (Math.round(fly.flap / TAU) * TAU - fly.flap) * Math.min(1, dt * 18)   // settle open
  }

  function frame(now) {
    raf = 0
    const t = now / 1000
    const dt = last ? Math.min(0.05, t - last) : 0
    last = t
    T += dt
    if (scene) {
      const t0 = performance.now()
      update(dt); draw()
      cost = cost * 0.95 + (performance.now() - t0) * 0.05   // smoothed, shown in the ?garden panel
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

  const panel = new URLSearchParams(location.search).has('garden')
    ? mountPanel({ rebuild: resize, redraw: () => { if (!raf) draw() }, cost: () => cost })
    : null

  return {
    destroy() {
      stop(); ro.disconnect(); io.disconnect()
      reduce.removeEventListener('change', onMotion)
      panel?.remove()
    },
  }
}

/* ?garden: sliders in plain words; "copy values" gives the GARDEN numbers */
function mountPanel({ rebuild, redraw, cost }) {
  const G = GARDEN
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
    ['flowers', 'sunflowers', 0, 2.5, 0.05, true],
    ['haze', 'far fade', 0, 0.8, 0.01],
    ['sway', 'sway', 0, 3, 0.05],
    ['wind', 'wind speed', 0, 3, 0.05],
    ['bSize', 'butterfly size', 20, 90, 1],
    ['bSpeed', 'side to side', 10, 300, 5],
    ['loop', 'loop size', 0, 90, 1],
    ['loopRate', 'loops/s', 0, 2, 0.05],
    ['flap', 'wing beats/s', 3, 20, 0.5],
    ['hop', 'chirpiness', 0, 2.5, 0.05],
    ['visit', 'flying between flowers (s)', 1, 15, 0.5],
    ['stay', 'rest on a flower (s)', 0.5, 8, 0.1],
  ]
  el.innerHTML = `<b>garden</b>${rows.map(([k, label, min, max, step]) =>
    `<label><span>${label}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${G[k]}"><output>${G[k]}</output></label>`).join('')}<button type="button" class="copy">copy values</button>`
  const rebuilds = new Set(rows.filter((r) => r[5]).map((r) => r[0]))
  el.addEventListener('input', (e) => {
    const k = e.target.dataset.k
    G[k] = +e.target.value
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
  const tick = setInterval(() => { if (!el.isConnected) clearInterval(tick); else meter.textContent = `draw time ${cost().toFixed(1)} ms a frame` }, 500)
  document.body.append(el)
  return el
}
