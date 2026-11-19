/**
 * The case study hero: the Work page tile's composition with each phone tuned on its own
 * (Lavanya, 2026-11-19; before that both were zoomed out together, 0.86 about the tile's centre).
 * Per phone: zoom (1 is its size on the Work page tile, 243 wide), x and y (where its centre
 * sits, in the tile's 606x396 design pixels) and rot (degrees). The background stays put.
 * Values hers from the panel (2026-11-19).
 * `?hero` opens a live panel with "copy values".
 */
export const HERO = {
  'bolt-1': { zoom: 0.74, x: 202, y: 301, rot: 0 },   // her values, 2026-11-19
  'bolt-2': { zoom: 0.74, x: 399, y: 94, rot: 0 },
}

const BASE_W = 243          // the phones' width on the Work page tile
const IPHONE_H = 2069 / 1000 // height per unit of width, as in tiles.js
const LABELS = { 'bolt-1': 'left phone', 'bolt-2': 'right phone' }

const KEY = 'case-hero-v2'
try {
  if (new URLSearchParams(location.search).has('hero')) {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    for (const id in HERO) Object.assign(HERO[id], saved[id])
  }
} catch { /* private mode */ }

/** a layer's box (tiles.js units) from its HERO entry */
function box(id) {
  const p = HERO[id], w = BASE_W * p.zoom
  return { x: p.x - w / 2, y: p.y - (w * IPHONE_H) / 2, w, rot: p.rot }
}

/** the tile with its phones placed from HERO; layers not in HERO stay as they are */
export const heroTile = tile => ({
  ...tile,
  layers: tile.layers.map(l => (HERO[l.id] ? { ...l, ...box(l.id) } : l)),
})

export function mountHeroPanel(figure) {
  const rows = [
    ['zoom', 'zoom', 0.5, 1.3, 0.01],
    ['x', 'x', 0, 606, 1],
    ['y', 'y', -100, 496, 1],
    ['rot', 'rotate', -20, 20, 0.5],
  ]
  const el = document.createElement('div')
  el.className = 'tune-panel'
  el.style.cssText = 'left:12px;top:auto;bottom:100px'
  el.innerHTML = `<b>hero</b>
    ${Object.keys(HERO).map(id => `<i style="display:block;margin-top:8px;font-style:normal;color:#616161">${LABELS[id] ?? id}</i>
      ${rows.map(([k, label, min, max, step]) =>
        `<label><span>${label}</span><input type="range" data-id="${id}" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${HERO[id][k]}"><output>${HERO[id][k]}</output></label>`).join('')}`).join('')}
    <small style="color:#616161">zoom 1 is the Work page tile; x, y place the phone's centre</small>
    <button type="button" class="copy">copy values</button>`
  const layers = () => {
    const els = figure.querySelectorAll('.layer')
    return Object.fromEntries(Object.keys(HERO).map((id, i) => [id, els[i]]))
  }
  el.addEventListener('input', (e) => {
    const { id, k } = e.target.dataset; if (!id) return
    HERO[id][k] = +e.target.value
    e.target.nextElementSibling.textContent = e.target.value
    const node = layers()[id], b = box(id)
    if (node) { node.style.setProperty('--x', b.x); node.style.setProperty('--y', b.y); node.style.setProperty('--w', b.w); node.style.setProperty('--rot', b.rot) }
    try { localStorage.setItem(KEY, JSON.stringify(HERO)) } catch { /* private mode */ }
  })
  el.querySelector('.copy').addEventListener('click', (e) => {
    navigator.clipboard?.writeText(JSON.stringify(HERO, null, 2)); e.target.textContent = 'copied'
  })
  document.body.append(el)
  return el
}
