/**
 * The nav bar's outline and float (Lavanya, 2026-11-15): a lilac stroke with depth, so the bar
 * floats rather than sitting on a grey line. Every colour is mixed from the page's own section
 * colours (NavBar.css: work purple, about teal, play pink), so one set of values serves all pages.
 * Her values from ?nav, 2026-11-15 (Figma's 1px color/<section>/highlight and shadow/nav bar, black
 * 10% 0 2 4, read as a grey line). "copy values" gives the numbers to paste here.
 * Teal and pink read paler than the purple at the same mix, so about and play can take extra
 * colour on top (Lavanya, 2026-11-15: they looked bleak).
 */
export const NAV_LOOK = {
  stroke: 2.25,        // px, the outline's width
  strokeDepth: 0.18,   // outline colour: 0 the section's highlight (Figma), 1 its full colour
  strokeBright: 0.57,  // outline brightness: below 0 darker, above 0 lighter
  shadowTint: 0.34,    // drop shadow colour: 0 grey (Figma), 1 the section's colour
  shadowA: 0.05,       // drop shadow strength
  shadowY: 2,          // px down
  shadowBlur: 8,       // px
  shadowSpread: 2,     // px
  glowA: 0.06,         // a second, wide soft shadow in the section's colour, for the float (0 off)
  glowY: 1,            // px down
  glowBlur: 17,        // px
  // extra on top, for the about and play pages only. Starting at 0 (same as work) for her to set
  aboutColour: 0,      // more outline colour on about
  aboutGlow: 0,        // more glow on about
  playColour: 0,       // more outline colour on play
  playGlow: 0,         // more glow on play
}

/** writes NAV_LOOK as CSS variables on :root (NavBar.css mixes them with the section colours) */
export function applyNavLook(root = document.documentElement) {
  const L = NAV_LOOK, set = (k, v) => root.style.setProperty(k, v)
  set('--nav-stroke', `${L.stroke}px`)
  set('--nav-stroke-depth', `${L.strokeDepth * 100}%`)
  set('--nav-stroke-to', L.strokeBright < 0 ? '#000' : '#fff')
  set('--nav-stroke-bright', `${Math.abs(L.strokeBright) * 100}%`)
  set('--nav-shadow-tint', `${L.shadowTint * 100}%`)
  set('--nav-shadow-a', `${L.shadowA * 100}%`)
  set('--nav-shadow', `0 ${L.shadowY}px ${L.shadowBlur}px ${L.shadowSpread}px`)
  set('--nav-glow-a', `${L.glowA * 100}%`)
  set('--nav-glow', `0 ${L.glowY}px ${L.glowBlur}px 0`)
  for (const s of ['about', 'play']) {
    set(`--nav-stroke-depth-${s}`, `${Math.min(1, L.strokeDepth + L[`${s}Colour`]) * 100}%`)
    set(`--nav-glow-a-${s}`, `${Math.min(1, L.glowA + L[`${s}Glow`]) * 100}%`)
  }
}

/* ?nav: sliders in plain words, plus a preview of the bar in each section's colours */
export function mountNavPanel() {
  const L = NAV_LOOK
  const el = document.createElement('div')
  el.className = 'tune-panel'
  el.style.cssText = 'left:12px;top:auto;bottom:100px;max-height:calc(100vh - 140px);overflow:hidden auto'
  const rows = [
    'outline',
    ['stroke', 'width (px)', 0, 3, 0.25],
    ['strokeDepth', 'colour: pale to full', 0, 1, 0.01],
    ['strokeBright', 'brightness', -0.6, 0.6, 0.01],
    'drop shadow',
    ['shadowTint', 'colour: grey to tint', 0, 1, 0.01],
    ['shadowA', 'strength', 0, 0.6, 0.01],
    ['shadowY', 'down (px)', 0, 20, 1],
    ['shadowBlur', 'blur (px)', 0, 40, 1],
    ['shadowSpread', 'spread (px)', -6, 6, 1],
    'float glow',
    ['glowA', 'strength', 0, 0.6, 0.01],
    ['glowY', 'down (px)', 0, 30, 1],
    ['glowBlur', 'blur (px)', 0, 80, 1],
    'about and play: extra colour (preview as them to see it)',
    ['aboutColour', 'about: outline', 0, 0.8, 0.01],
    ['aboutGlow', 'about: glow', 0, 0.4, 0.01],
    ['playColour', 'play: outline', 0, 0.8, 0.01],
    ['playGlow', 'play: glow', 0, 0.4, 0.01],
  ]
  el.innerHTML = `<b>nav bar</b>
    <label><span>preview as</span><select data-preview><option value="">this page</option><option>work</option><option>about</option><option>play</option></select><output></output></label>
    ${rows.map((row) => {
      if (typeof row === 'string') return `<b style="margin-top:8px">${row}</b>`
      const [k, label, min, max, step] = row
      return `<label><span>${label}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${L[k]}"><output>${L[k]}</output></label>`
    }).join('')}<button type="button" class="copy">copy values</button>`
  el.addEventListener('input', (e) => {
    const k = e.target.dataset.k; if (!k) return
    L[k] = +e.target.value
    e.target.nextElementSibling.textContent = e.target.value
    applyNavLook()
  })
  el.querySelector('[data-preview]').addEventListener('change', (e) => {
    document.querySelectorAll('.navbar').forEach((n) => {
      if (e.target.value) n.dataset.preview = e.target.value
      else delete n.dataset.preview
    })
  })
  el.querySelector('.copy').addEventListener('click', (e) => {
    navigator.clipboard?.writeText(JSON.stringify(L, null, 2)); e.target.textContent = 'copied'
  })
  document.body.append(el)
  return el
}
