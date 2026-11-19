/**
 * The case study hero: the Work page tile's composition, zoomed out a little so the phones sit
 * further inside the panel (Lavanya, 2026-11-16: "a bit zoomed out", the wide shot was dropped).
 * zoom scales the phones about a centre point (cx, cy, in the tile's 606x396 design pixels);
 * the background stays put. `?hero` opens a live panel with "copy values".
 */
export const HERO = {
  zoom: 0.86,   // 1 is the Work page tile as it is
  cx: 303,      // the point the phones shrink towards: the tile's centre by default
  cy: 198,
}

const KEY = 'case-hero-v1'
try {
  if (new URLSearchParams(location.search).has('hero')) Object.assign(HERO, JSON.parse(localStorage.getItem(KEY) ?? '{}'))
} catch { /* private mode */ }

export const heroVars = () => ({ '--hz': HERO.zoom, '--hcx': HERO.cx, '--hcy': HERO.cy })

export function mountHeroPanel(figure) {
  const rows = [
    ['zoom', 'zoom', 0.6, 1.1, 0.01],
    ['cx', 'centre x', 0, 606, 1],
    ['cy', 'centre y', 0, 396, 1],
  ]
  const el = document.createElement('div')
  el.className = 'tune-panel'
  el.style.cssText = 'left:12px;top:auto;bottom:100px'
  el.innerHTML = `<b>hero</b>
    ${rows.map(([k, label, min, max, step]) =>
      `<label><span>${label}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${HERO[k]}"><output>${HERO[k]}</output></label>`).join('')}
    <small style="color:#616161">zoom 1 is the Work page tile</small>
    <button type="button" class="copy">copy values</button>`
  el.addEventListener('input', (e) => {
    const k = e.target.dataset.k; if (!k) return
    HERO[k] = +e.target.value
    e.target.nextElementSibling.textContent = e.target.value
    Object.entries(heroVars()).forEach(([p, v]) => figure.style.setProperty(p, v))
    try { localStorage.setItem(KEY, JSON.stringify(HERO)) } catch { /* private mode */ }
  })
  el.querySelector('.copy').addEventListener('click', (e) => {
    navigator.clipboard?.writeText(JSON.stringify(HERO, null, 2)); e.target.textContent = 'copied'
  })
  document.body.append(el)
  return el
}
