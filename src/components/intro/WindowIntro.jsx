import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { animate, cubicBezier } from 'motion'
import { fieldState, makeField, lerp } from './orbField'
import './WindowIntro.css'

// measured on the render: fractions of the cropped window box
const WIN = { aspect: 1.3506, open: [0.1801, 0.1137, 0.6384, 0.7678], hole: [0.124, 0.1137, 0.7506, 0.8404], sash: [0.124, 0.494, 0.7506, 0.4601] }
const PUSH = [0.65, 0, 0.15, 1]
const PATH = cubicBezier(0.4, 0, 0.25, 1)
const smooth = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k) }

/**
 * The window loader. A pencil-drawn sash window on paper with the orb field behind the glass and a
 * glowing butterfly tapping the pane. Drag the sash up (or Enter / Space / ArrowUp, scroll up, "skip"),
 * the butterfly escapes, the camera pushes through the opening and the butterfly flies on to land
 * on the hero's own butterfly.
 *
 * heroRef / heroBflyRef: the hero block and its butterfly box, used as the flight target.
 * onReveal: called part-way through the push, when the site should fade in.
 */
function WindowIntro({ heroRef, heroBflyRef, onReveal }) {
  const canvasRef = useRef(null)
  const introRef = useRef(null)
  const veilRef = useRef(null)
  const winRef = useRef(null)
  const viewRef = useRef(null)
  const sashRef = useRef(null)
  const hintRef = useRef(null)
  const skipRef = useRef(null)
  const flyerRef = useRef(null)
  const wingLRef = useRef(null)
  const wingRRef = useRef(null)
  const onRevealRef = useRef(onReveal)
  useEffect(() => { onRevealRef.current = onReveal })

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const _sl = new URLSearchParams(location.search).get('slow'); const SLOW = _sl === null ? 1 : (parseFloat(_sl) || 4)   // debug: ?slow or ?slow=8
    const intro = introRef.current, veil = veilRef.current, win = winRef.current, view = viewRef.current, sash = sashRef.current,
      bfly = flyerRef.current, hint = hintRef.current, wingL = wingLRef.current, wingR = wingRRef.current,
      heroBfly = heroBflyRef.current, heroBlock = heroRef.current
    const F = fieldState()
    const field = makeField(canvasRef.current, F)

    // everything that needs stopping if the component goes away mid-intro
    const anims = new Set(), timers = new Set(), taps = new Set()
    const run = (from, to, opts) => { const a = animate(from, to, opts); anims.add(a); a.finished.then(() => anims.delete(a), () => {}); return a }
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
    let raf = 0

    let progress = 0   // the camera curve, used for everything that moves with the push

    /* --------------------------- intro window --------------------------- */
    let G = {}
    function buildWindow(W) {
      const H = Math.round(W * WIN.aspect)
      const px = (f, d) => Math.round(f * d)
      const [ox, oy, ow, oh] = WIN.open, [hx, hy, hw, hh] = WIN.hole, [sx, sy, sw, shh] = WIN.sash
      win.style.width = W + 'px'; win.style.height = H + 'px'
      view.style.left = px(hx, W) + 'px'; view.style.top = px(hy, H) + 'px'; view.style.width = px(hw, W) + 'px'; view.style.height = px(hh, H) + 'px'
      sash.style.left = px(sx, W) + 'px'; sash.style.top = px(sy, H) + 'px'; sash.style.width = px(sw, W) + 'px'; sash.style.height = px(shh, H) + 'px'
      const sh = px(shh, H)
      // gx..gh is where the butterfly may roam (the glass), sh is the sash height, travel is how far it slides
      return { W, H, gx: px(ox, W), gy: px(oy, H), gw: px(ow, W), gh: px(oh, H), sh, st: Math.round(W * 0.05), rail: Math.round(W * 0.07), travel: Math.round(sh * 0.96) }
    }
    function layout() {
      const W = Math.round(Math.min(360, innerWidth * 0.7, innerHeight * 0.54 / 1.4))
      G = buildWindow(W)
      sizeButterfly()
      field?.size()
    }
    // paper veil with a hole where the opening is; the hole follows the window as it scales
    function cutVeil() {
      const r = view.getBoundingClientRect()
      const x1 = r.left.toFixed(2), y1 = r.top.toFixed(2), x2 = (r.left + r.width).toFixed(2), y2 = (r.top + r.height).toFixed(2)
      veil.style.clipPath = `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${x1}px ${y1}px, ${x1}px ${y2}px, ${x2}px ${y2}px, ${x2}px ${y1}px, ${x1}px ${y1}px)`
    }

    /* ---------------- butterfly ---------------- */
    // B.x / B.y are window-local; the flyer is fixed on the page, so it adds the window's position
    const B = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, ang: 0, scale: 1, flap: 0, flapRate: 9, state: 'roam', timer: 0 }
    let BW = 112, BH = 99, BS = 0.5   // hero butterfly box, and the scale it has inside the window
    function sizeButterfly() {
      BW = heroBfly.offsetWidth; BH = heroBfly.offsetHeight; BS = G.W * 0.17 / BW
      bfly.style.width = BW + 'px'; bfly.style.height = BH + 'px'
    }
    function setWings(w) {
      wingL.style.transform = wingR.style.transform = `scaleX(${w})`
    }
    function glassRect() { return { x: G.gx + G.st + 14, y: G.gy + G.st + 14, w: G.gw - 2 * G.st - 28, h: G.gh - G.st - G.rail - 28 } }
    function pickTarget() { const r = glassRect(), u = Math.random(); B.tx = r.x + r.w * (0.25 + Math.random() * 0.6); B.ty = r.y + r.h * (u < 0.7 ? Math.random() * 0.35 : Math.random() * 0.9) }
    function startRoam() { B.state = 'roam'; pickTarget(); B.timer = 1.2 + Math.random() * 1.6; B.flapRate = 2 + Math.random() * 0.8 }   // flapRate is half the wingbeats/s (|cos| peaks twice a cycle)
    function startTap() {
      B.state = 'tap'; B.timer = 0.42; B.flapRate = 4
      // on the page like the flyer, so the ripple still draws over the butterfly
      const r = win.getBoundingClientRect()
      const t = document.createElement('div'); t.className = 'tap'; t.style.position = 'fixed'; t.style.zIndex = '61'
      t.style.left = (r.left + B.x + (Math.random() * 8 - 4)) + 'px'; t.style.top = (r.top + B.y - 8) + 'px'; document.body.appendChild(t); taps.add(t)
      t.addEventListener('animationend', () => { t.remove(); taps.delete(t) }, { once: true })
      B.vy = 55; B.vx = (Math.random() - 0.5) * 90
    }
    function initButterfly() { const r = glassRect(); B.x = r.x + r.w * 0.55; B.y = r.y + r.h * 0.55; startRoam() }
    function stepButterfly(dt, t) {
      const r = glassRect(); B.timer -= dt
      if (B.state === 'roam') {
        const dx = B.tx - B.x, dy = B.ty - B.y, dist = Math.hypot(dx, dy)
        B.vx += dx * 2.6 * dt * 3; B.vy += dy * 2.6 * dt * 3; B.vx *= Math.pow(0.12, dt); B.vy *= Math.pow(0.12, dt)
        B.vx += Math.sin(t * 6.3) * 22 * dt * 10; B.vy += Math.cos(t * 8.1) * 18 * dt * 10
        if (dist < 14 || B.timer < 0) { if (B.ty < r.y + r.h * 0.36 && Math.random() < 0.75) startTap(); else startRoam() }
      } else if (B.state === 'tap') {
        B.vy += 260 * dt; B.vx *= Math.pow(0.3, dt); B.vy *= Math.pow(0.35, dt); if (B.timer < 0) startRoam()
      } else if (B.state === 'escape') {
        const dx = B.tx - B.x, dy = B.ty - B.y, dist = Math.hypot(dx, dy)
        B.vx += dx * 9 * dt; B.vy += dy * 9 * dt; B.vx *= Math.pow(0.08, dt); B.vy *= Math.pow(0.08, dt)
        if (dist < 10 || B.timer < 0) escaped()
      }
      B.x += B.vx * dt; B.y += B.vy * dt
      if (B.state === 'roam' || B.state === 'tap') {
        if (B.x < r.x) { B.x = r.x; B.vx = Math.abs(B.vx) * 0.4 } if (B.x > r.x + r.w) { B.x = r.x + r.w; B.vx = -Math.abs(B.vx) * 0.4 }
        if (B.y < r.y) { B.y = r.y; B.vy = Math.abs(B.vy) * 0.3 } if (B.y > r.y + r.h) { B.y = r.y + r.h; B.vy = -Math.abs(B.vy) * 0.4 }
      }
      const targetAng = Math.max(-28, Math.min(28, B.vx * 0.16)); B.ang += (targetAng - B.ang) * Math.min(1, dt * 6)
      B.flap += dt * B.flapRate * Math.PI * 2
      const f = Math.abs(Math.cos(B.flap)), wingScale = 0.4 + 0.6 * f, sc = B.state === 'tap' ? B.scale * 0.94 : B.scale
      if (B.state === 'flying') return   // escaped() just took over
      const w = win.getBoundingClientRect()
      bfly.style.transform = `translate(${w.left + B.x - BW / 2}px,${w.top + B.y - BH / 2}px) rotate(${B.ang}deg) scale(${sc * BS})`
      setWings(wingScale)
    }

    /* ---------------- sash drag + spring (Motion) ---------------- */
    let dragging = false, startY = 0, startP = 0, lastY = 0, lastT = 0, vel = 0, opened = false, hinted = false, moved = false, sashAnim = null
    function setProgress(p) {
      progress = p; sash.style.transform = `translateY(${-p * G.travel}px)`   // the view stays put; only the sash moves
    }
    function springTo(target, velocity, onDone) {
      sashAnim?.stop()
      sashAnim = run(progress, target, { type: 'spring', stiffness: 170, damping: 22, velocity, onUpdate: setProgress, onComplete: () => { setProgress(target); onDone?.() } })
    }
    function showHint() { if (hinted || opened) return; hinted = true; hint.classList.add('show') }
    later(showHint, Math.max(0, 1000 - performance.now()))   // 1s from page load, not from when this setup finishes
    const onSashDown = e => {
      if (opened) return
      dragging = true; moved = false; sash.classList.add('dragging'); sashAnim?.stop()
      try { sash.setPointerCapture(e.pointerId) } catch { /* pointer already gone */ }
      startY = lastY = e.clientY; startP = progress; lastT = performance.now(); vel = 0
    }
    const onSashMove = e => {
      if (!dragging) return
      const now = performance.now(), dt = Math.max(1, now - lastT)
      vel = vel * 0.6 + ((lastY - e.clientY) / dt) * 0.4; lastY = e.clientY; lastT = now
      let raw = startP + (startY - e.clientY) / G.travel
      if (Math.abs(startY - e.clientY) > 3) moved = true
      if (raw > 1) raw = 1 + (raw - 1) * 0.18; if (raw < 0) raw = raw * 0.18
      setProgress(raw)
    }
    function endDrag() {
      if (!dragging) return; dragging = false; sash.classList.remove('dragging')
      if (!moved) { nudge(); return }
      const v = vel * 1000 / G.travel                 // px/ms → progress/s
      if (progress > 0.42 || vel > 0.9) open(v); else springTo(0, v)
    }
    const onSashKey = e => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); open(0) } }
    function nudge() { showHint(); sashAnim?.stop(); sashAnim = run(0, 0, { type: 'spring', stiffness: 170, damping: 14, velocity: 2.4, onUpdate: setProgress }) }
    let wheelAcc = 0, wheelTimer; const loadedAt = performance.now()
    const onWheel = e => {
      if (opened || performance.now() - loadedAt < 700) return
      wheelAcc += -e.deltaY
      if (wheelAcc > 0) setProgress(Math.min(1, wheelAcc / 500))
      clearTimeout(wheelTimer); timers.delete(wheelTimer)
      wheelTimer = later(() => { if (opened) return; if (progress > 0.42) open(0); else { springTo(0, 0); wheelAcc = 0 } }, 140)
    }
    const onPointer = e => { if (dragging) return; F.pointer = [(e.clientX / innerWidth - 0.5) * 0.18, -(e.clientY / innerHeight - 0.5) * 0.18] }

    /* ---------------- open → escape → through the window → butterfly lands on the hero ---------------- */
    function open(v) { if (opened) return; opened = true; sash.style.cursor = 'default'; springTo(1, Math.max(v || 0, 1.6), onOpened) }
    function onOpened() {
      B.state = 'escape'; B.flapRate = 3.5; B.timer = 1.2   // timer: go anyway if it can't quite reach the opening
      B.tx = G.gx + G.gw * 0.5; B.ty = G.gy + G.sh + G.sh * 0.62
    }
    // the moment it is through the opening: the camera follows and the butterfly leaves the window for the page
    function escaped() {
      if (B.state === 'flying') return; B.state = 'flying'
      const r = win.getBoundingClientRect()
      const from = { x: r.left + B.x, y: r.top + B.y, ang: B.ang, s: BS * B.scale }
      bfly.style.transform = `translate(${from.x - BW / 2}px,${from.y - BH / 2}px) rotate(${from.ang}deg) scale(${from.s})`
      through()
      if (reduce) { bfly.style.display = 'none'; heroBfly.style.visibility = ''; return }
      flyToHero(from)
    }
    /* 3s from escape. While the camera pushes (A) it flutters from the opening to a spot just below the hero block,
       under its landing spot. Then (B) it rises steadily while its sideways drift traces one small arc to the right
       and one wider arc to the left (a smooth wave, rounded at both tips), easing out into the hero butterfly's
       exact box and tilt. Two shallow wingbeats early on, then it glides.
       It never turns round: the body stays upright, leaning at most ~16deg into each sideways sweep,
       and settles to its resting tilt at the end. */
    function flyToHero(from) {
      const A = 0.8, T = 3, TILT = parseFloat(getComputedStyle(heroBfly).rotate) || 0
      const place = (x, y, ang, sc, w) => {
        bfly.style.transform = `translate(${x - BW / 2}px,${y - BH / 2}px) rotate(${ang}deg) scale(${sc})`; setWings(w)
      }
      const flap = (u, a, b) => u > a && u < b ? 1 - 0.45 * Math.sin(Math.PI * (u - a) / (b - a)) : 1   // one shallow close-and-open, never edge-on
      const target = () => { const R = heroBfly.getBoundingClientRect(); return [R.left + R.width / 2, R.top + R.height / 2] }
      const amp = () => Math.max(50, innerWidth * 0.065)   // sets the swing width: right arc 0.4x this, left arc 0.6x
      // where the S begins: just below the hero block, a touch left of the landing spot
      const start = () => { const [tx] = target(); return [tx, heroBlock.getBoundingClientRect().bottom + Math.max(32, innerHeight * 0.09)] }
      // sideways offset at height progress v (0 start .. 1 landed). Each arc's width is in step with its height,
      // so the two join with no kink, and both tips are rounded
      const drift = v => amp() * (v < 0.4 ? 0.4 * Math.sin(Math.PI * v / 0.4) : -0.6 * Math.sin(Math.PI * (v - 0.4) / 0.6))
      let s0 = from.s, ang = from.ang, lastT = 0
      run(0, T, {
        duration: T * SLOW, ease: 'linear',
        onUpdate: tt => {
          const dt = Math.max(0, tt - lastT); lastT = tt
          sizeButterfly()   // follows the hero box if the viewport changes mid-flight
          if (tt < A) {
            const a = tt / A, e = a * a * (3 - 2 * a), [x0, y0] = start()
            ang = lerp(from.ang, 0, e)
            place(lerp(from.x, x0, e), lerp(from.y, y0, e), ang, from.s, 0.4 + 0.6 * Math.abs(Math.cos(Math.PI * 3 * a)))
            return
          }
          const u = (tt - A) / (T - A), [tx, ty] = target(), [, y0] = start(), v = PATH(u)
          const p = { x: tx + drift(v), y: lerp(y0, ty, v) }
          const dx = (drift(Math.min(1, v + 0.01)) - drift(Math.max(0, v - 0.01))), dy = (y0 - ty) * 0.02
          const side = dx / (Math.hypot(dx, dy) || 1)   // -1 heading left .. 1 heading right
          ang += (16 * side - ang) * Math.min(1, dt * 2.5)                            // lean into the sweep, never more than 16deg
          place(p.x, p.y, lerp(ang, TILT, smooth(0.65, 1, u)),
            lerp(s0, 1, 1 - Math.pow(1 - Math.min(1, u / 0.6), 3)), flap(u, 0.04, 0.24) * flap(u, 0.30, 0.50))
        },
        onComplete: () => {
          const [tx, ty] = target(); place(tx, ty, TILT, 1, 1)
          heroBfly.style.visibility = ''                      // identical, underneath
          bfly.classList.add('plain')                         // the shine fades off, then the flyer goes
          later(() => { bfly.style.display = 'none' }, 650 * SLOW)
        }
      })
    }
    let zoomStarted = false, zoomK = 0, siteShown = false
    function through() {
      if (zoomStarted) return; zoomStarted = true; intro.classList.add('pushing')
      const vw = innerWidth, vh = innerHeight, rect = win.getBoundingClientRect()
      // we go through the OPEN part: the lower half of the glass, where the sash used to be
      const ox = G.gx + G.gw / 2, oy = G.gy + G.sh + G.sh / 2
      const S = Math.max(vw / G.gw, vh / G.sh) * 1.15
      win.style.transformOrigin = `${ox}px ${oy}px`
      const dx = (vw / 2) - (rect.left + ox), dy = (vh / 2) - (rect.top + oy)
      const camFrom = F.cam, softFrom = F.soft
      run(0, 1, {
        duration: (reduce ? 0.7 : 2.2) * SLOW, ease: PUSH,
        onUpdate: k => {
          zoomK = k
          win.style.transform = `translate(${dx * k}px,${dy * k}px) scale(${1 + (S - 1) * k})`
          F.cam = camFrom + (1 - camFrom) * k         // frame and orbs ride the same curve
          F.soft = lerp(softFrom, 1.45, k)
          if (k > 0.55 && !siteShown) showSite()
        },
        onComplete: () => { introRunning = false; intro.style.display = 'none'; F.intro = 0 }
      })
    }
    function showSite() {
      siteShown = true
      onRevealRef.current?.()
      run(F.sketch, 0.55, { duration: 2.4 * SLOW, ease: 'easeOut', onUpdate: v => { F.sketch = v; F.grain = (0.85 - v) * 0.06 } })
      // settle: slower orbits, thinner and softer orbs, so type sits comfortably on top
      const s0 = { speed: F.speed, amt: F.amt, soft: 1.45 }
      run(0, 1, { duration: 3.2 * SLOW, ease: 'easeOut', delay: 0.6 * SLOW, onUpdate: e => { F.speed = lerp(s0.speed, 0.35, e); F.amt = lerp(s0.amt, 0.72, e); if (!zoomStarted || zoomK >= 1) F.soft = lerp(s0.soft, 1.6, e) } })
    }
    const onSkip = e => { e.preventDefault(); if (opened) return; opened = true; setProgress(1); escaped() }

    /* ---------------- loop: shader + butterfly + veil ---------------- */
    let introRunning = true, last = performance.now(), t = 0
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000) / SLOW; last = now; t += dt
      if (introRunning) { cutVeil(); if (B.state !== 'flying') stepButterfly(dt, t) }
      if (field && introRunning) field.render(t, dt)   // afterwards the opaque site covers the canvas
      raf = requestAnimationFrame(loop)
    }
    const onResize = () => { if (!opened) { layout(); setProgress(progress); cutVeil() } else field?.size() }

    const skip = skipRef.current
    sash.addEventListener('pointerdown', onSashDown)
    sash.addEventListener('pointermove', onSashMove)
    sash.addEventListener('pointerup', endDrag)
    sash.addEventListener('pointercancel', endDrag)
    sash.addEventListener('keydown', onSashKey)
    intro.addEventListener('wheel', onWheel, { passive: true })
    skip.addEventListener('click', onSkip)
    addEventListener('pointermove', onPointer, { passive: true })
    addEventListener('resize', onResize)

    heroBfly.style.visibility = 'hidden'   // shown when the flying one lands on it
    layout(); initButterfly(); setProgress(0); cutVeil()
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      anims.forEach(a => a.stop())
      timers.forEach(clearTimeout)
      taps.forEach(el => el.remove())
      sash.removeEventListener('pointerdown', onSashDown)
      sash.removeEventListener('pointermove', onSashMove)
      sash.removeEventListener('pointerup', endDrag)
      sash.removeEventListener('pointercancel', endDrag)
      sash.removeEventListener('keydown', onSashKey)
      intro.removeEventListener('wheel', onWheel)
      skip.removeEventListener('click', onSkip)
      removeEventListener('pointermove', onPointer)
      removeEventListener('resize', onResize)
      field?.destroy()
      // back to the untouched markup, so a remount (StrictMode, HMR) starts clean
      for (const el of [intro, win, sash, bfly]) el.removeAttribute('style')
      intro.classList.remove('pushing'); hint.classList.remove('show'); bfly.classList.remove('plain')
      heroBfly.style.visibility = ''
    }
  }, [heroRef, heroBflyRef])

  return (
    <>
      <canvas ref={canvasRef} className="orb-field" aria-hidden="true" />

      <div ref={introRef} className="intro" aria-label="Intro. Drag the window up to enter.">
        <div ref={veilRef} className="veil" />
        <div className="stage">
          <div ref={winRef} className="window">
            <img className="wback" src="/assets/window-back.webp" alt="" width="1355" height="1830" decoding="async" />
            <div ref={viewRef} className="glass" />
            <div ref={sashRef} className="sash" role="button" tabIndex={0} aria-label="Window sash. Drag up or press Enter to open.">
              <img src="/assets/window-sash.webp" alt="" width="1017" height="842" decoding="async" />
            </div>
          </div>
          <p ref={hintRef} className="hint">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 10V2M2.5 5.5 6 2l3.5 3.5" /></svg>
            drag the window up
          </p>
        </div>
        <a ref={skipRef} className="skip" href="#">skip</a>
      </div>

      {createPortal(
        <div ref={flyerRef} className="flyer" aria-hidden="true">
          <div ref={wingLRef} className="wing wl"><img src="/assets/butterfly.png" alt="" width="669" height="373" /></div>
          <div ref={wingRRef} className="wing wr"><img src="/assets/butterfly.png" alt="" width="669" height="373" /></div>
        </div>,
        document.body,
      )}
    </>
  )
}

export default WindowIntro
