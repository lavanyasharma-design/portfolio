/**
 * The footer garden (Figma note on the Work page, 1:2): purple grass, light and dark purple flowers
 * with pink petals, and the logo butterfly in purple monochrome. The butterfly never leaves: it
 * flies in loops, drifting from the right side to the left and back, with quick chirpy hops
 * (Lavanya, 2026-11-14). Painted on a canvas in layers, far to near: hazy far grass, lavender
 * spikes, middle grass, flowers, the butterfly, a mound of leafy ground, then the near grass in
 * front, so the butterfly dips behind the closest blades. Everything sways in a soft wind.
 *
 * The scene is drawn from a seeded random generator, so it's the same garden on every visit and
 * only rebuilds when the band's size changes. It only animates while on screen.
 * prefers-reduced-motion: one still picture, the butterfly resting on a flower.
 * ?garden opens a live panel; "copy values" gives the numbers to paste into GARDEN.
 */
export const GARDEN = {
  seed: 7,         // which garden: another number lays it out differently
  density: 1,      // how much grass
  flowers: 1,      // how many flowers
  light: 0,        // 0 as set below; up to 0.6 washes every purple lighter
  round: 0.22,     // grass tips: 0 pointed, 1 blunt as the blade is wide
  sway: 1,         // how far the grass moves in the wind
  wind: 1,         // how fast the wind moves
  haze: 0.4,       // how much the far grass fades into the page
  bSize: 52,       // butterfly width, px on the desktop band (324 tall); scales with the band
  bSpeed: 70,      // how fast it drifts from side to side, px a second on the desktop band
  loop: 36,        // size of its loops, px on the desktop band
  loopRate: 0.55,  // loops a second
  flap: 11,        // wing beats a second
  hop: 1,          // how much it jumps up and down as it flies (the chirpiness)
  brush: 0.25,     // how much the grass bends away as it flies past
}

/* colours, all from the site's purple and pink family, kept light (Lavanya, 2026-11-14: the first
   take was too dark) */
const PAL = {
  back: ['#e6dafb', '#ddcef8', '#d3c1f4', '#e0d2f9'],      // far grass, palest
  mid: ['#c4aaee', '#b79be4', '#ab8ddf', '#bea2ea'],       // middle grass
  front: ['#9a72d6', '#8f63cf', '#8457c9', '#a27ddb'],     // near grass
  ground: '#8457c9',
  bush: ['#8457c9', '#8f63cf', '#7d50c3', '#9a72d6', '#7649bf'],
  stem: ['#8457c9', '#8f63cf'],
  leaf: ['#9a72d6', '#8f63cf', '#ab8ddf'],
  spike: ['#c4aaee', '#b79be4', '#d3c1f4'],
  petal: ['#ff33d0', '#ff5cd9', '#ff8fe3', '#e821ba'],     // color/pink/default, pressed and lighter
  discDark: '#6729ae',                                      // color/purple/default
  discLight: '#d6c3f7',
  daisyLight: ['#efe6ff', '#e0d2f9'],
  daisyDark: ['#8f63cf', '#9a72d6'],
  page: '#fcfaff',                                          // color/white/default
  bfly: ['#4e2281', '#8f63cf', '#f3ecff'],                  // the butterfly's monochrome: shadow, mid, light
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

// the palette as used: every purple washed towards white by `light`; the pinks stay as they are
function palette(light) {
  const W = [255, 255, 255]
  const lift = (h) => mixRGB(rgb(h), W, light)
  const P = {}
  for (const [k, v] of Object.entries(PAL)) {
    if (k === 'petal' || k === 'bfly' || k === 'page') P[k] = Array.isArray(v) ? v.map(rgb) : rgb(v)
    else P[k] = Array.isArray(v) ? v.map(lift) : lift(v)
  }
  return P
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
    // one fill per colour: group the blades by colour, keeping their order inside each group.
    // Each colour is a gradient up the blade, deeper at the roots and lighter at the tips, which
    // gives the clumps their painted depth
    const byColor = new Map()
    for (const b of blades) (byColor.get(b.color) ?? byColor.set(b.color, []).get(b.color)).push(b)
    return [...byColor].map(([color, list]) => ({
      blades: list,
      color: css(color), root: css(mixRGB(color, P.ground, 0.4)), tip: css(mixRGB(color, [255, 255, 255], 0.22)), grad: null,
    }))
  })

  // lavender-like spikes among the far and middle grass
  const spikes = []
  const nSpikes = Math.round((W / (150 * s)) * G.flowers)
  for (let i = 0; i < nSpikes; i++) {
    const h = between(0.36, 0.62) * H
    const dots = []
    const k = Math.round(between(10, 16))
    for (let j = 0; j < k; j++) {
      dots.push({ at: 0.55 + (j / k) * 0.45, side: j % 2 ? 1 : -1, size: between(2.4, 3.8) * s * (1 - (j / k) * 0.4), color: css(pick(P.spike)) })
    }
    spikes.push({ x: ((i + r()) / nSpikes) * W, y: H * 0.94, h, lean: (r() - 0.5) * 0.3, phase: r() * TAU, dots, stalk: css(P.mid[1]) })
  }

  // flowers: big ones with pink petals around a dark or light purple heart, small daisies with
  // light or dark purple petals around a pink heart
  const flowers = []
  const nFlowers = Math.max(2, Math.round((W / (230 * s)) * G.flowers))
  for (let i = 0; i < nFlowers; i++) {
    const big = r() < 0.6
    const rad = (big ? between(20, 28) : between(11, 15)) * s
    const petals = big ? Math.round(between(12, 15)) : Math.round(between(8, 10))
    const dark = r() < 0.5
    flowers.push({
      x: ((i + 0.2 + r() * 0.6) / nFlowers) * W,
      y: H * 1.0,
      h: between(big ? 0.36 : 0.26, big ? 0.62 : 0.46) * H,
      lean: (r() - 0.5) * 0.35,
      phase: r() * TAU,
      rad,
      tilt: (r() - 0.5) * 0.5,
      petals: Array.from({ length: petals }, (_, p) => ({
        a: (p / petals) * TAU + (r() - 0.5) * 0.2,
        len: between(0.9, 1.08),
        color: css(big ? pick(P.petal) : pick(dark ? P.daisyDark : P.daisyLight)),
      })),
      disc: css(big ? (dark ? P.discDark : P.discLight) : P.petal[0]),
      stem: css(pick(P.stem)),
      leaves: [0.28, 0.5].map((at, li) => ({ at: at + (r() - 0.5) * 0.1, side: li % 2 ? 1 : -1, len: between(24, 36) * s, color: css(pick(P.leaf)) })),
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
    W, H, s, layers, spikes, flowers, ground, bushes,
    colors: { ground: css(P.ground), page: P.page, back: P.back[2], mid: P.mid[1], front: css(P.front[1]) },
  }
}

/* ---------- the butterfly, in purple monochrome ---------- */

// the logo image, cropped the way Figma crops it, with each pixel's lightness mapped onto a purple
// ramp (a gradient map), so the wing pattern stays and only the colour goes
function tint(img) {
  const sx = 142, sy = 40, sw = 385, sh = 293
  const c = document.createElement('canvas')
  c.width = sw; c.height = sh
  const x = c.getContext('2d', { willReadFrequently: true })
  x.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
  const d = x.getImageData(0, 0, sw, sh), px = d.data
  const [a, b, e] = PAL.bfly.map(rgb)
  for (let i = 0; i < px.length; i += 4) {
    const L = (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255
    const [p, q, t] = L < 0.5 ? [a, b, L * 2] : [b, e, (L - 0.5) * 2]
    px[i] = p[0] + (q[0] - p[0]) * t
    px[i + 1] = p[1] + (q[1] - p[1]) * t
    px[i + 2] = p[2] + (q[2] - p[2]) * t
  }
  x.putImageData(d, 0, 0)
  return c
}

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a))

/* ---------- mounting ---------- */

// onTouch: called when a pointer touches the butterfly (the page plays its wing flutter there)
export function mountGarden(canvas, { onTouch } = {}) {
  const G = GARDEN
  const ctx = canvas.getContext('2d')
  const reduce = matchMedia('(prefers-reduced-motion: reduce)')
  let scene = null, bfly = null, dpr = 1
  let raf = 0, visible = false, last = 0, T = 0, cost = 0
  let shown = null          // where the butterfly was last drawn, for touching it
  let touchedAt = -9        // so one touch doesn't startle it twice

  /* the flight. cx drifts between the sides (starting on the right, heading left); the butterfly
     circles around it (theta). ox/oy is a springy offset for hops and darts. rot follows the
     direction it's flying, smoothed so it turns rather than snaps */
  const fly = { cx: null, dir: -1, theta: 0, ox: 0, oy: 0, vx: 0, vy: 0, x: 0, y: 0, rot: 0, flap: 0, flapping: true, until: 0, hopAt: 0.4 }

  const img = new Image()
  img.src = '/assets/butterfly.png'
  img.decode().then(() => { bfly = tint(img); draw() }).catch(() => {})

  // touched (mouse over it, or a finger or click on it): it plays its sound and darts away from
  // the pointer, beating hard, then settles back into its loops
  function onPointer(e) {
    if (!shown || T - touchedAt < 0.8) return
    const r = canvas.getBoundingClientRect()
    const px = e.clientX - r.left, py = e.clientY - r.top
    const dx = shown.x - px, dy = shown.y - py
    const d = Math.hypot(dx, dy)
    if (d > shown.r) return
    touchedAt = T
    onTouch?.()
    if (reduce.matches) return
    const k = (scene.H * 4) / (d || 1)
    fly.vx += dx * k
    fly.vy += dy * k - scene.H * 1.2
    fly.flapping = true
    fly.until = T + 0.5
    fly.hopAt = T + 0.6
  }
  canvas.addEventListener('pointermove', onPointer)
  canvas.addEventListener('pointerdown', onPointer)

  function resize() {
    const W = canvas.clientWidth, H = canvas.clientHeight
    if (!W || !H) return
    dpr = Math.min(2, devicePixelRatio || 1)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    scene = build(W, H, G)
    fly.cx = null
    draw()
  }

  const wind = (x) => G.sway * 0.09 * (Math.sin(T * 0.9 * G.wind + x * 0.0045) * 0.65 + Math.sin(T * 1.9 * G.wind + x * 0.013 + 1.3) * 0.35)

  // a blade: a tapered, bending leaf from its base to a rounded tip
  function blade(b, push) {
    const sway = wind(b.x) * (0.4 + b.flex) + Math.sin(T * 2.2 * G.wind + b.phase) * 0.015 * G.sway
    const a0 = b.lean * 0.45 + sway + push * 0.5
    const a1 = b.lean + b.curve + sway * 1.7 + push
    const half = b.h * 0.5
    const cx = b.x + Math.sin(a0) * half, cy = b.y - Math.cos(a0) * half
    const tx = cx + Math.sin(a1) * half, ty = cy - Math.cos(a1) * half
    const px = Math.cos(a0) * b.w * 0.42, py = Math.sin(a0) * b.w * 0.42
    const tw = b.w * 0.5 * G.round                         // half the tip's width
    const qx = Math.cos(a1) * tw, qy = Math.sin(a1) * tw   // across the tip
    const ux = Math.sin(a1) * tw * 1.5, uy = -Math.cos(a1) * tw * 1.5   // past the tip, for the cap
    ctx.moveTo(b.x - b.w / 2, b.y)
    ctx.quadraticCurveTo(cx - px, cy - py, tx - qx, ty - qy)
    ctx.quadraticCurveTo(tx + ux, ty + uy, tx + qx, ty + qy)
    ctx.quadraticCurveTo(cx + px, cy + py, b.x + b.w / 2, b.y)
  }

  // grass near the butterfly leans away from it
  function brushAt(b) {
    if (!G.brush || reduce.matches || !shown) return 0
    const R = 70 * scene.s
    const dx = b.x - fly.x
    if (Math.abs(dx) > R) return 0
    if (fly.y < b.y - b.h - R * 0.6) return 0
    return Math.sign(dx || 1) * G.brush * (1 - Math.abs(dx) / R)
  }

  function grass(layer) {
    const { H } = scene
    for (const g of layer) {
      if (!g.grad) {
        g.grad = ctx.createLinearGradient(0, H, 0, H * 0.1)
        g.grad.addColorStop(0, g.root)
        g.grad.addColorStop(0.45, g.color)
        g.grad.addColorStop(1, g.tip)
      }
      ctx.fillStyle = g.grad
      ctx.beginPath()
      for (const b of g.blades) blade(b, brushAt(b))
      ctx.fill()
    }
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

  function spikes() {
    for (const k of scene.spikes) {
      const a = k.lean + wind(k.x) * 0.9
      const tx = k.x + Math.sin(a) * k.h, ty = k.y - Math.cos(a) * k.h
      ctx.strokeStyle = k.stalk
      ctx.lineWidth = 1.4 * scene.s
      ctx.beginPath(); ctx.moveTo(k.x, k.y); ctx.lineTo(tx, ty); ctx.stroke()
      for (const d of k.dots) {
        const x = k.x + (tx - k.x) * d.at + d.side * d.size * 0.8, y = k.y + (ty - k.y) * d.at
        ctx.fillStyle = d.color
        ctx.beginPath(); ctx.ellipse(x, y, d.size, d.size * 0.75, a, 0, TAU); ctx.fill()
      }
    }
  }

  function flowerHead(f) {
    const a = f.lean + wind(f.x) * 0.7 + Math.sin(T * 1.6 * G.wind + f.phase) * 0.02 * G.sway
    return { a, hx: f.x + Math.sin(a) * f.h, hy: f.y - Math.cos(a) * f.h }
  }

  function flowers() {
    const { s } = scene
    for (const f of scene.flowers) {
      const { a, hx, hy } = flowerHead(f)
      const mx = f.x + Math.sin(a * 0.5) * f.h * 0.5, my = f.y - Math.cos(a * 0.5) * f.h * 0.5
      ctx.strokeStyle = f.stem
      ctx.lineWidth = 2.2 * s
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
      // head: petals in a ring, seen a little from the side, then the heart
      ctx.save()
      ctx.translate(hx, hy)
      ctx.rotate(a * 0.6 + f.tilt)
      ctx.scale(1, 0.82)
      for (const p of f.petals) {
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.ellipse(Math.cos(p.a) * f.rad * 0.6 * p.len, Math.sin(p.a) * f.rad * 0.6 * p.len, f.rad * 0.52 * p.len, f.rad * 0.25, p.a, 0, TAU)
        ctx.fill()
      }
      ctx.fillStyle = f.disc
      ctx.beginPath(); ctx.arc(0, 0, f.rad * 0.38, 0, TAU); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,.22)'
      ctx.beginPath(); ctx.arc(-f.rad * 0.1, -f.rad * 0.1, f.rad * 0.16, 0, TAU); ctx.fill()
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

  function butterfly() {
    shown = null
    if (!bfly || !scene) return
    const { s } = scene
    const bw = G.bSize * s, bh = bw * (bfly.height / bfly.width)
    let x, y, rot, k
    if (reduce.matches) {
      // resting on the tallest flower, wings half open
      const f = scene.flowers.reduce((m, f) => (f.h > m.h ? f : m), scene.flowers[0])
      const { hx, hy } = flowerHead(f)
      x = hx; y = hy - f.rad * 0.9; rot = 0.25; k = 0.8
    } else {
      if (fly.cx === null) return
      x = fly.x; y = fly.y; rot = fly.rot
      k = 0.16 + 0.84 * (0.5 + 0.5 * Math.cos(fly.flap))
    }
    // touchable a little beyond its wings, so a finger can catch it
    shown = { x, y, r: Math.max(bw * 0.75, 22) }
    const half = bfly.width / 2
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    // each wing narrows towards the body as it beats, the way wings fold up when seen from above
    ctx.drawImage(bfly, 0, 0, half + 1, bfly.height, (-bw / 2) * k, -bh / 2, (bw / 2) * k + 0.5, bh)
    ctx.drawImage(bfly, half - 1, 0, half + 1, bfly.height, -0.5, -bh / 2, (bw / 2) * k + 0.5, bh)
    ctx.restore()
  }

  function draw() {
    if (!scene) return
    const { W, H } = scene
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    grass(scene.layers[0])
    haze(G.haze)
    underlay()
    spikes()
    grass(scene.layers[1])
    haze(G.haze * 0.35)
    flowers()
    butterfly()
    groundAndBushes()
    grass(scene.layers[2])
  }

  /* loops: the butterfly circles around a centre that drifts across the band and turns back at
     each side. On top, little hops: a burst of wing beats kicks it up, then it glides with wings
     open and settles, so the loops are jittery and alive rather than a perfect circle */
  function update(dt) {
    const { W, H, s } = scene
    const R = G.loop * s
    const lo = W * 0.06 + R + G.bSize * s * 0.5, hi = W - lo
    if (fly.cx === null) fly.cx = hi
    fly.cx += fly.dir * G.bSpeed * s * dt
    if (fly.cx < lo) { fly.cx = lo; fly.dir = 1 }
    if (fly.cx > hi) { fly.cx = hi; fly.dir = -1 }
    // loop the way it's drifting, so each circle rolls forward
    fly.theta += -fly.dir * TAU * G.loopRate * dt
    const cy = H * 0.4 + Math.sin(T * 0.37) * 0.06 * H

    // springy offset: hops and darts push it, the spring brings it back into the loop
    if (T >= fly.hopAt) {
      fly.vy -= H * (0.5 + Math.random() * 0.5) * G.hop
      fly.flapping = true
      fly.until = T + 0.22 + Math.random() * 0.22
      fly.hopAt = T + 0.4 + Math.random() * 0.5
    }
    fly.vx += (-fly.ox * 26 - fly.vx * 6.5) * dt
    fly.vy += (-fly.oy * 26 - fly.vy * 6.5 + (fly.flapping ? 0 : H * 0.6)) * dt
    fly.ox += fly.vx * dt
    fly.oy += fly.vy * dt
    if (fly.flapping && T >= fly.until) fly.flapping = false

    const px = fly.x, py = fly.y
    fly.x = Math.min(W - 8 * s, Math.max(8 * s, fly.cx + Math.cos(fly.theta) * R + fly.ox))
    fly.y = Math.min(H * 0.75, Math.max(H * 0.15, cy + Math.sin(fly.theta) * R * 0.8 + fly.oy))

    // face where it's going (the image's head points up, so +90deg), turning smoothly
    if (dt > 0) {
      const heading = Math.atan2(fly.y - py, fly.x - px) + Math.PI / 2
      fly.rot += wrap(heading - fly.rot) * Math.min(1, dt * 9)
    }
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

  const panel = new URLSearchParams(location.search).has('garden') ? mountPanel({ rebuild: resize, cost: () => cost }) : null

  return {
    destroy() {
      stop(); ro.disconnect(); io.disconnect()
      canvas.removeEventListener('pointermove', onPointer)
      canvas.removeEventListener('pointerdown', onPointer)
      reduce.removeEventListener('change', onMotion)
      panel?.remove()
    },
  }
}

/* ?garden: sliders in plain words; "copy values" gives the GARDEN numbers */
function mountPanel({ rebuild, cost }) {
  const G = GARDEN
  const el = document.createElement('div')
  el.className = 'tune-panel'
  el.style.cssText = 'left:auto;right:12px;top:12px;max-height:calc(100vh - 24px);overflow:hidden auto'
  const rows = [
    ['seed', 'which garden', 1, 60, 1, true],
    ['light', 'lighter', 0, 0.6, 0.01, true],
    ['round', 'round tips', 0, 1, 0.05],
    ['density', 'grass', 0.3, 2, 0.05, true],
    ['flowers', 'flowers', 0, 2.5, 0.05, true],
    ['haze', 'far fade', 0, 0.8, 0.01],
    ['sway', 'sway', 0, 3, 0.05],
    ['wind', 'wind speed', 0, 3, 0.05],
    ['bSize', 'butterfly size', 20, 90, 1],
    ['bSpeed', 'side to side', 10, 300, 5],
    ['loop', 'loop size', 0, 90, 1],
    ['loopRate', 'loops/s', 0, 2, 0.05],
    ['flap', 'wing beats/s', 3, 20, 0.5],
    ['hop', 'chirpiness', 0, 2.5, 0.05],
    ['brush', 'grass brush', 0, 0.8, 0.01],
  ]
  el.innerHTML = `<b>garden</b>${rows.map(([k, label, min, max, step]) =>
    `<label><span>${label}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${G[k]}"><output>${G[k]}</output></label>`).join('')}<button type="button" class="copy">copy values</button>`
  const rebuilds = new Set(rows.filter((r) => r[5]).map((r) => r[0]))
  el.addEventListener('input', (e) => {
    const k = e.target.dataset.k
    G[k] = +e.target.value
    e.target.nextElementSibling.textContent = e.target.value
    if (rebuilds.has(k)) rebuild()
  })
  el.addEventListener('click', (e) => {
    const t = e.target.closest('button'); if (!t) return
    navigator.clipboard?.writeText(JSON.stringify(G, null, 2)); t.textContent = 'copied'
  })
  // what one frame of the garden costs to draw; under ~4ms leaves plenty of room at 60fps
  const meter = document.createElement('output')
  el.append(meter)
  const tick = setInterval(() => { if (!el.isConnected) clearInterval(tick); else meter.textContent = `draw time ${cost().toFixed(1)} ms a frame` }, 500)
  document.body.append(el)
  return el
}
