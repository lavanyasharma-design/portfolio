import { LAYOUT } from './aboutLayout'

/**
 * The letter ripple from her hello page (D:\hello-page, src/ripple/rippleEngine.js, the X intro page, 2026-11-22:
 * "the text flares"): every letter within `rippleRadius` of the pointer is nudged straight away from it,
 * up to `ripplePush` px, the nearest most, and settles back as the pointer moves on.
 * Ported for the About page: the letters are the `.rl` spans every text above the footer is split into (hers:
 * "everywhere except the footer"); they move by relative offsets (not transforms), so her wavy underlines
 * travel with their letters. Positions are kept in page px and measured again once scrolling settles (blocks
 * rise in on the way) and after a resize. Desktop only (a mouse or trackpad), off with reduced motion.
 */
const HOVER = '(hover: hover) and (pointer: fine)'

export function rippleOn() {
  return matchMedia(HOVER).matches && !matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** wires the ripple for every .rl inside `scope`; returns { refresh, stop } */
export function mountRipple(scope) {
  let letters = [], grid = new Map(), cell = 80
  let px = -1e6, py = -1e6, have = false
  let raf = 0
  const active = new Set()

  const keyOf = (x, y) => `${Math.floor(x / cell)},${Math.floor(y / cell)}`

  function refresh() {
    if (!rippleOn()) return
    active.forEach(reset)
    cell = LAYOUT.rippleRadius
    const sx = scrollX, sy = scrollY
    letters = [...scope.querySelectorAll('.rl')].map((el) => {
      const r = el.getBoundingClientRect()
      return { el, x: r.left + r.width / 2 + sx, y: r.top + r.height / 2 + sy }
    })
    grid = new Map()
    for (const l of letters) {
      const k = keyOf(l.x, l.y)
      if (!grid.has(k)) grid.set(k, [])
      grid.get(k).push(l)
    }
    tick()
  }

  function reset(l) { l.el.style.left = ''; l.el.style.top = ''; active.delete(l) }

  function tick() {
    raf = 0
    const R = LAYOUT.rippleRadius, push = LAYOUT.ripplePush
    const touched = new Set()
    if (have) {
      const mx = px + scrollX, my = py + scrollY
      const cx = Math.floor(mx / cell), cy = Math.floor(my / cell)
      const reach = Math.ceil(R / cell)
      for (let gx = cx - reach; gx <= cx + reach; gx++) {
        for (let gy = cy - reach; gy <= cy + reach; gy++) {
          for (const l of grid.get(`${gx},${gy}`) || []) {
            const dx = l.x - mx, dy = l.y - my, d = Math.hypot(dx, dy)
            if (d >= R || d < 0.01) continue
            const s = (1 - d / R) * push
            l.el.style.left = `${((dx / d) * s).toFixed(2)}px`
            l.el.style.top = `${((dy / d) * s).toFixed(2)}px`
            active.add(l); touched.add(l)
          }
        }
      }
    }
    for (const l of active) if (!touched.has(l)) reset(l)
  }
  const run = () => { if (!raf) raf = requestAnimationFrame(tick) }

  const onMove = (e) => { if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return; px = e.clientX; py = e.clientY; have = true; run() }
  const onLeave = () => { have = false; run() }
  // blocks rise in as they reach the screen (caseMotion.js), so measure again once scrolling settles
  let settle = 0
  const onScroll = () => { if (have) run(); clearTimeout(settle); settle = setTimeout(refresh, 500) }
  const onResize = () => { clearTimeout(settle); settle = setTimeout(refresh, 200) }

  addEventListener('pointermove', onMove, { passive: true })
  document.documentElement.addEventListener('pointerleave', onLeave)
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', onResize, { passive: true })

  return {
    refresh,
    stop() {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onResize)
      clearTimeout(settle)
      active.forEach(reset)
    },
  }
}
