/**
 * Clip engine for the case study videos (Bolt, 2026-11-16).
 * A clip is a pure function of time: render(t) sets every layer from t, so the recorder can step
 * frame by frame (record.mjs) and the preview can play in real time. Screens are Lavanya's Figma
 * frames exported at 2x; all positions here are in Figma design px (393 x 852 screen).
 *
 * Open /tools/clips/<clip>.html on the dev server to preview (?v=tall for the 4:5 version,
 * ?t=3.2 to hold one moment). record.mjs renders the MP4s.
 */

export const SCREEN = { w: 393, h: 852, r: 47 }
const BEZEL = 12

/* ---------- easing and timing ---------- */
export const ease = {
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  out: t => 1 - (1 - t) ** 3,
  in: t => t * t * t,
  // iOS-like: quick start, long soft landing
  ios: t => 1 - (1 - t) ** 4,
  linear: t => t,
}

/** 0 before a, 1 after b, eased in between */
export function seg(t, a, b, e = ease.inOut) {
  if (t <= a) return 0
  if (t >= b) return 1
  return e((t - a) / (b - a))
}

/** a value from keyframes [[time, value], ...]; numbers or arrays; held before the first and after the last */
export function keys(t, list, e = ease.inOut) {
  if (t <= list[0][0]) return list[0][1]
  for (let i = 1; i < list.length; i++) {
    const [t1, v1] = list[i]
    if (t <= t1) {
      const [t0, v0] = list[i - 1]
      const k = e((t - t0) / (t1 - t0))
      return Array.isArray(v0) ? v0.map((v, j) => v + (v1[j] - v) * k) : v0 + (v1 - v0) * k
    }
  }
  return list[list.length - 1][1]
}

export const lerp = (a, b, k) => a + (b - a) * k

/* ---------- stage, device, camera ---------- */
// the versions a clip renders in: the panel shapes on the case study page
export const VARIANTS = {
  wide: { w: 1600, h: 800, fill: 0.84 },   // 2:1 panels on desktop
  tall: { w: 880, h: 1100, fill: 0.9 },    // 4:5: the feature panels, and every phone clip on phones
  square: { w: 1000, h: 1000, fill: 0.88 },
}

const el = (tag, cls, parent, css = '') => {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (css) e.style.cssText = css
  parent?.append(e)
  return e
}

export function setupStage(variantName) {
  const v = VARIANTS[variantName] ?? VARIANTS.wide
  document.body.style.cssText = 'margin:0;background:#fff'
  const stage = el('div', '', document.body,
    `position:relative;width:${v.w}px;height:${v.h}px;overflow:hidden;background:#f6f0ff`)
  stage.id = 'stage'
  const cam = el('div', '', stage, 'position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform')
  const dw = SCREEN.w + 2 * BEZEL, dh = SCREEN.h + 2 * BEZEL
  const device = el('div', '', cam, `position:absolute;left:0;top:0;width:${dw}px;height:${dh}px;
    border-radius:${SCREEN.r + BEZEL}px;background:#121212;
    box-shadow:0 0 0 1.5px #3b3b3b inset, 0 1px 2px #4545452e, 0 18px 44px #45454530`)
  const screen = el('div', '', device, `position:absolute;left:${BEZEL}px;top:${BEZEL}px;width:${SCREEN.w}px;height:${SCREEN.h}px;
    border-radius:${SCREEN.r}px;overflow:hidden;background:#fff;isolation:isolate`)
  // dynamic island, above the screen's own status bar
  el('div', '', device, `position:absolute;left:${BEZEL + (SCREEN.w - 122) / 2}px;top:${BEZEL + 11}px;width:122px;height:35px;
    border-radius:18px;background:#000;z-index:10`)
  const base = (v.h * v.fill) / dh

  /** camera: the screen point (fx, fy) sits at the stage centre, at base scale x zoom */
  function camera(zoom, fx = SCREEN.w / 2, fy = SCREEN.h / 2) {
    const S = base * zoom
    cam.style.transform = `translate(${v.w / 2 - (fx + BEZEL) * S}px, ${v.h / 2 - (fy + BEZEL) * S}px) scale(${S})`
  }
  return { stage, screen, camera, variant: v }
}

/* ---------- layers ---------- */
/** an image (a Figma frame at 2x) shown at design size; `h` is its design height */
export function sheet(src, h) { return { src, h } }

/** a crop of a frame image: design-px rect (x, y, w, h) of the image, placed at (at[0], at[1]) */
export function crop(parent, img, x, y, w, h, at = [x, y], scale = 1) {
  return el('div', '', parent, `position:absolute;left:${at[0]}px;top:${at[1]}px;width:${w}px;height:${h}px;
    background:url(${img.src}) ${-x}px ${-y}px / ${SCREEN.w}px ${img.h}px no-repeat;
    transform-origin:0 0;transform:scale(${scale})`)
}

/** a solid patch, to cover something in a frame */
export function patch(parent, x, y, w, h, color) {
  return el('div', '', parent, `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${color}`)
}

/**
 * a whole screen from a tall frame, scrollable between fixed chrome: `top` design px of status and
 * app bar stay put at the top, `bottom` px (tab bar, home indicator) at the bottom of the frame
 */
export function scrollScreen(parent, img, { top = 54, bottom = 80 } = {}) {
  const root = el('div', '', parent, `position:absolute;inset:0;overflow:hidden;background:#fff`)
  const view = el('div', '', root, `position:absolute;left:0;top:0;width:${SCREEN.w}px;height:${SCREEN.h - bottom}px;overflow:hidden`)
  const body = el('div', '', view, `position:absolute;left:0;top:0;width:${SCREEN.w}px;height:${img.h}px;
    background:url(${img.src}) 0 0 / ${SCREEN.w}px ${img.h}px no-repeat;will-change:transform`)
  const extra = el('div', '', body, 'position:absolute;inset:0') // overlays that scroll with the content
  crop(root, img, 0, 0, SCREEN.w, top)                                         // status bar (and app bar)
  crop(root, img, 0, img.h - bottom, SCREEN.w, bottom, [0, SCREEN.h - bottom]) // tab bar and home indicator
  const max = img.h - SCREEN.h
  return {
    root, body: extra, max,
    scroll(y) { body.style.transform = `translateY(${-Math.max(0, Math.min(max, y))}px)` },
  }
}

/** iOS push: `to` slides in from the right over `from`, which drifts left and dims. k 0..1 */
export function push(from, to, k) {
  to.style.transform = `translateX(${(1 - k) * 100}%)`
  to.style.boxShadow = k > 0 && k < 1 ? '-8px 0 24px #0000001f' : 'none'
  from.style.transform = `translateX(${-30 * k}%)`
  from.style.filter = `brightness(${1 - 0.08 * k})`
  to.style.visibility = k > 0 ? 'visible' : 'hidden'
  from.style.visibility = k < 1 ? 'visible' : 'hidden'
}

/** a pressed state: a soft dark wash over a rect, k 0..1 */
export function pressLayer(parent, x, y, w, h, r = 8) {
  const p = el('div', '', parent, `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${r}px;
    background:#000;opacity:0;pointer-events:none`)
  return k => { p.style.opacity = 0.12 * k }
}

/** a press that comes and goes around time `at` */
export const pressed = (t, at, len = 0.22) => (t < at || t > at + len ? 0 : Math.sin(((t - at) / len) * Math.PI))

/** read a pixel colour from an image (same origin), for patches that must match the frame */
export async function sample(img, x, y) {
  const i = new Image(); i.src = img.src; await i.decode()
  const c = document.createElement('canvas'); c.width = i.width; c.height = i.height
  const g = c.getContext('2d'); g.drawImage(i, 0, 0)
  const s = i.width / SCREEN.w
  const [r, gg, b] = g.getImageData(Math.round(x * s), Math.round(y * s), 1, 1).data
  return `rgb(${r} ${gg} ${b})`
}

/**
 * Figma's MCP export flattens a layer onto the canvas grey (#f3f4f5), so nothing comes out
 * transparent. This keys that grey out: pixels within `lo` of it go clear, fading to solid by `hi`.
 * Fine over Bolt's maps, which are nearly the same grey, so soft edges don't show. Returns an object URL.
 */
export async function keyed(src, bg = [243, 244, 245], lo = 3, hi = 18) {
  const i = new Image(); i.src = src; await i.decode()
  const c = document.createElement('canvas'); c.width = i.width; c.height = i.height
  const g = c.getContext('2d'); g.drawImage(i, 0, 0)
  const d = g.getImageData(0, 0, c.width, c.height)
  for (let p = 0; p < d.data.length; p += 4) {
    const dist = Math.max(Math.abs(d.data[p] - bg[0]), Math.abs(d.data[p + 1] - bg[1]), Math.abs(d.data[p + 2] - bg[2]))
    d.data[p + 3] = Math.round(255 * Math.min(1, Math.max(0, (dist - lo) / (hi - lo))))
  }
  g.putImageData(d, 0, 0)
  const blob = await new Promise(r => c.toBlob(r))
  return URL.createObjectURL(blob)
}

/* ---------- running ---------- */
/**
 * start a clip: build(ctx) returns render(t). In the browser it plays in a loop with a scrubber;
 * the recorder calls window.renderAt(t) for each frame once window.clipReady is true.
 */
export async function run(build, duration) {
  const q = new URLSearchParams(location.search)
  const variant = q.get('v') ?? 'wide'
  const ctx = setupStage(variant)
  const render = await build(ctx, variant)
  const imgs = [...document.querySelectorAll('*')].map(e => getComputedStyle(e).backgroundImage).filter(b => b.startsWith('url('))
  await Promise.all([...new Set(imgs)].map(b => { const i = new Image(); i.src = b.slice(5, -2); return i.decode().catch(() => {}) }))
  window.clipDuration = duration
  window.clipSize = [ctx.variant.w, ctx.variant.h]
  window.renderAt = t => render(t)
  render(0)
  window.clipReady = true
  if (q.has('record')) return
  const bar = el('input', '', document.body, `display:block;width:${ctx.variant.w}px;margin:8px 0`)
  Object.assign(bar, { type: 'range', min: 0, max: duration, step: 0.01, value: 0 })
  const label = el('div', '', document.body, 'font:12px system-ui;color:#555')
  let t0 = performance.now(), held = q.has('t') ? +q.get('t') : null
  bar.oninput = () => { held = +bar.value }
  bar.ondblclick = () => { held = null; t0 = performance.now() - +bar.value * 1000 }
  const tick = now => {
    const t = held ?? ((now - t0) / 1000) % duration
    render(t); bar.value = t; label.textContent = `${t.toFixed(2)}s / ${duration}s (drag to scrub, double-click to play)`
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
