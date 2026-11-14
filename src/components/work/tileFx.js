/**
 * The case study tiles' interaction (Lavanya, 2026-11-14): no sound, just colour.
 * - Hover (desktop) or tap (phones): the tile zooms in a little and its purple shadow
 *   (shadow/card, #ddc9ff) glows brighter and a touch more saturated.
 * - Click or tap: a slow ripple of that purple bleeds out from where you pressed, behind the
 *   tile, so it shows around its edges and fades.
 * ?hover opens a live panel; "copy values" gives the numbers to paste here.
 */
export const FX = {
  zoom: 1.025,           // tile scale on hover / tap
  zoomTime: 0.55,        // s, zooming in and settling back
  shadow: '#c9a6ff',     // hover shadow colour (shadow/card is #ddc9ff: this is brighter and richer)
  shadowY: 4,            // px down
  shadowBlur: 16,        // px
  tapHold: 650,          // ms the tap look stays on phones before it settles back
  ripple: '#c9a6ff',     // ripple colour
  rippleStrength: 0.55,  // how strong the colour is at its peak (0 to 1)
  rippleReach: 70,       // px it bleeds past the tile's furthest corner
  rippleRing: 0.45,      // ring width: 0 a thin ring, 1 a filled wash
  rippleTime: 1.8,       // s, slow
}

const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(' ')

/** writes FX as CSS variables (CaseTile.css reads them) */
export function applyFx(root = document.documentElement) {
  root.style.setProperty('--fx-zoom', FX.zoom)
  root.style.setProperty('--fx-zoom-time', `${FX.zoomTime}s`)
  root.style.setProperty('--fx-shadow', `0 ${FX.shadowY}px ${FX.shadowBlur}px ${FX.shadow}`)
}

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** the ripple: a soft ring of colour from (x, y) inside `wrap`, growing past the tile and fading */
export function ripple(wrap, x, y) {
  if (reduce()) return
  const { width: w, height: h } = wrap.getBoundingClientRect()
  const far = Math.max(Math.hypot(x, y), Math.hypot(w - x, y), Math.hypot(x, h - y), Math.hypot(w - x, h - y))
  const R = far + FX.rippleReach
  const el = document.createElement('span')
  el.className = 'tile-ripple'
  const inner = Math.round((1 - FX.rippleRing) * 80)
  el.style.cssText = `left:${x - R}px;top:${y - R}px;width:${R * 2}px;height:${R * 2}px;` +
    `background:radial-gradient(closest-side, rgb(${hexRgb(FX.ripple)} / 0) ${inner}%, rgb(${hexRgb(FX.ripple)} / 1) ${(inner + 100) / 2 + 5}%, rgb(${hexRgb(FX.ripple)} / 0) 100%)`
  wrap.prepend(el)
  const a = el.animate([
    { transform: 'scale(.04)', opacity: 0 },
    { opacity: FX.rippleStrength, offset: 0.12 },
    { transform: 'scale(1)', opacity: 0 },
  ], { duration: FX.rippleTime * 1000, easing: 'cubic-bezier(.22,.61,.36,1)' })
  a.onfinish = a.oncancel = () => el.remove()
}

/* ?hover: sliders in plain words */
export function mountFxPanel() {
  const el = document.createElement('div')
  el.className = 'tune-panel'
  el.style.cssText = 'left:auto;right:12px;top:12px'
  const rows = [
    ['zoom', 'zoom', 1, 1.08, 0.005],
    ['zoomTime', 'zoom time (s)', 0.1, 1.5, 0.05],
    ['shadow', 'shadow colour'],
    ['shadowY', 'shadow down', 0, 20, 1],
    ['shadowBlur', 'shadow blur', 0, 40, 1],
    ['tapHold', 'tap look (ms)', 200, 1500, 50],
    ['ripple', 'ripple colour'],
    ['rippleStrength', 'ripple strength', 0, 1, 0.05],
    ['rippleReach', 'ripple bleed', 0, 200, 5],
    ['rippleRing', 'ring width', 0, 1, 0.05],
    ['rippleTime', 'ripple time (s)', 0.4, 4, 0.1],
  ]
  el.innerHTML = `<b>tile hover</b>${rows.map(([k, label, min, max, step]) => min === undefined
    ? `<label><span>${label}</span><input type="color" data-k="${k}" value="${FX[k]}"><output>${FX[k]}</output></label>`
    : `<label><span>${label}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${FX[k]}"><output>${FX[k]}</output></label>`).join('')}<button type="button" class="copy">copy values</button>`
  el.addEventListener('input', (e) => {
    const k = e.target.dataset.k; if (!k) return
    FX[k] = e.target.type === 'color' ? e.target.value : +e.target.value
    e.target.nextElementSibling.textContent = e.target.value
    applyFx()
  })
  el.querySelector('.copy').addEventListener('click', (e) => {
    navigator.clipboard?.writeText(JSON.stringify(FX, null, 2)); e.target.textContent = 'copied'
  })
  document.body.append(el)
  return el
}
