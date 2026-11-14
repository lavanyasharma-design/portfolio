/**
 * The case study tiles' interaction (Lavanya, 2026-11-14): no sound, just colour.
 * Hover on desktop, a tap on phones: the tile zooms in a little and its purple shadow glows
 * (shadow/card is #ddc9ff; this one is a touch richer). A click ripple was tried and dropped.
 * ?hover opens a live panel; "copy values" gives the numbers to paste here.
 */
export const FX = {
  zoom: 1.035,           // tile scale on hover / tap
  zoomTime: 0.55,        // s, zooming in and settling back
  shadow: '#dac2ff',     // hover shadow colour
  shadowY: 4,            // px down
  shadowBlur: 16,        // px
  tapHold: 650,          // ms the tap look stays on phones before it settles back
}
/* Lavanya's values from the ?hover panel, 2026-11-14 */

/** writes FX as CSS variables (CaseTile.css reads them) */
export function applyFx(root = document.documentElement) {
  root.style.setProperty('--fx-zoom', FX.zoom)
  root.style.setProperty('--fx-zoom-time', `${FX.zoomTime}s`)
  root.style.setProperty('--fx-shadow', `0 ${FX.shadowY}px ${FX.shadowBlur}px ${FX.shadow}`)
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
