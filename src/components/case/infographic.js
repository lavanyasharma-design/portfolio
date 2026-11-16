/**
 * Colours for the case study infographics (Lavanya's palettes, 2026-11-16): soft pastels for the
 * fills, a lilac ramp (her purple shades reference) and the site's purples for gradients. No pinks:
 * pink belongs to [play] (her call). Every infographic element carries data-ig="<slot>"; its colour
 * comes from IG, and a slot with a `<slot>To` colour is a two-colour gradient (the callout, the stats).
 * Each group has its decoration: a soft organic blob, contour lines (her "lines in the background",
 * a try-out), or none.
 * `?infographic` opens a live panel: colour per slot, decoration per group, wash, size, "copy values".
 */
export const PALETTE = {
  // pastels
  'lemon chiffon': '#fcf6bd',
  'nyanza': '#d0f4de',
  'uranian blue': '#a9def9',
  'mauve': '#e4c1f9',
  'peach fuzz': '#ffbe98',
  'silk essence': '#fffbea',
  'matcha glow': '#f1f1c1',
  'cloud skin': '#c2e9ff',
  'morning dew': '#fff9cf',
  // deeper
  'jasper': '#db6856',
  'chinese violet': '#926579',
  'cocao root': '#3a2b20',
  // lilac ramp (gradient reference), light to deep
  'lilac 1': '#f4eaf1',
  'lilac 2': '#c9c3de',
  'lilac 3': '#b9b1cd',
  'lilac 4': '#b6a8ca',
  'lilac 5': '#8e83a9',
  // the site's purples (Figma colour variables)
  'purple highlight': '#e8dbff',
  'purple tile': '#f6f0ff',
  'purple': '#6729ae',
}

// which colour sits where, and each group's decoration: her values from ?infographic (2026-11-16)
export const IG = {
  why1: 'uranian blue',     // track vehicles live
  why2: 'nyanza',           // geofences
  why3: 'lemon chiffon',    // devices
  insight1: 'mauve',        // hers, from ?infographic (2026-11-16)
  insight2: 'mauve',
  desktop: 'nyanza',        // time to configure
  mobile: 'peach fuzz',     // moments to act
  callout: 'lilac 1',       // hers: tried jasper, settled on the lilac ramp (2026-11-16)
  calloutTo: 'lilac 4',
  stats: 'mauve',           // hers: purple only (2026-11-16)
  statsTo: 'lilac 2',
  decoWhy: 'lines',
  decoInsight: 'lines',
  decoCompare: 'lines',     // hers: try something other than the solid blob (2026-11-16)
  decoCallout: 'none',
  decoStats: 'none',
  wash: 42,                 // % of the colour at its strongest corner
  decoSize: 45,             // % of the panel's width
  lines: 15,                // % strength of the contour lines
}

const GROUP = {
  why1: 'Why', why2: 'Why', why3: 'Why', insight1: 'Insight', insight2: 'Insight',
  desktop: 'Compare', mobile: 'Compare', callout: 'Callout', stats: 'Stats',
}
const COLOURS = ['why1', 'why2', 'why3', 'insight1', 'insight2', 'desktop', 'mobile', 'callout', 'calloutTo', 'stats', 'statsTo']
const DECOS = ['decoWhy', 'decoInsight', 'decoCompare', 'decoCallout', 'decoStats']
const KEY = 'case-infographic-v2'

// with ?infographic open, the panel's picks persist on this device
try {
  if (new URLSearchParams(location.search).has('infographic')) Object.assign(IG, JSON.parse(localStorage.getItem(KEY) ?? '{}'))
} catch { /* private mode */ }

const hex = name => PALETTE[name] ?? name

/** what an infographic element needs: its slot, its group's decoration, and its colours */
export function igProps(slot) {
  return {
    'data-ig': slot,
    'data-deco': IG[`deco${GROUP[slot]}`] ?? 'none',
    style: {
      '--ig': hex(IG[slot]), '--ig-to': hex(IG[`${slot}To`] ?? IG[slot]),
      '--ig-wash': `${IG.wash}%`, '--ig-deco-size': `${IG.decoSize}%`, '--ig-lines': `${IG.lines}%`,
    },
  }
}

function applyAll() {
  document.querySelectorAll('[data-ig]').forEach((el) => {
    const p = igProps(el.dataset.ig)
    el.dataset.deco = p['data-deco']
    Object.entries(p.style).forEach(([k, v]) => el.style.setProperty(k, v))
  })
}

export function mountInfographicPanel() {
  const opts = (list, sel) => list.map(n => `<option value="${n}" ${n === sel ? 'selected' : ''}>${n}</option>`).join('')
  const row = 'style="grid-template-columns:84px minmax(0,1fr) 32px"'
  const dot = k => `<i style="width:16px;height:16px;border-radius:50%;border:1px solid #ddd;background:${hex(IG[k])}"></i>`
  const range = (k, label, min, max) =>
    `<label ${row}><span>${label}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="1" value="${IG[k]}"><output>${IG[k]}</output></label>`
  const el = document.createElement('div')
  el.className = 'tune-panel'
  el.style.cssText = 'right:12px;left:auto;top:auto;bottom:100px;width:300px;max-height:70vh;overflow:auto'
  el.innerHTML = `<b>infographics</b>
    ${COLOURS.map(k => `<label ${row}><span>${k}</span><select data-k="${k}">${opts(Object.keys(PALETTE), IG[k])}</select>${dot(k)}</label>`).join('')}
    ${DECOS.map(k => `<label ${row}><span>${k.slice(4).toLowerCase()}</span><select data-k="${k}">${opts(['blob', 'lines', 'none'], IG[k])}</select><i></i></label>`).join('')}
    ${range('wash', 'wash %', 0, 100)}
    ${range('decoSize', 'blob / lines size %', 20, 120)}
    ${range('lines', 'lines strength %', 5, 100)}
    <small style="color:#616161">no pinks: they belong to [play]</small>
    <button type="button" class="copy">copy values</button>`
  el.addEventListener('input', (e) => {
    const k = e.target.dataset.k; if (!k) return
    IG[k] = e.target.tagName === 'SELECT' ? e.target.value : +e.target.value
    const out = e.target.nextElementSibling
    if (out?.tagName === 'OUTPUT') out.textContent = e.target.value
    else if (out && COLOURS.includes(k)) out.style.background = hex(IG[k])
    try { localStorage.setItem(KEY, JSON.stringify(IG)) } catch { /* private mode */ }
    applyAll()
  })
  el.querySelector('.copy').addEventListener('click', (e) => {
    navigator.clipboard?.writeText(JSON.stringify(IG, null, 2)); e.target.textContent = 'copied'
  })
  document.body.append(el)
  return el
}
