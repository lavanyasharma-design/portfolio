/**
 * The About page's tunable layout (hers to set by eye, 2026-11-21): her photo's size and zoom, where the
 * intro sits beside it, and the gaps she asked to tighten. Written as CSS variables on .about-page
 * (About.css reads them). `?about` opens a live panel; "copy values" gives the numbers to paste here.
 */
export const LAYOUT = {
  meSize: 180,        // px, her photo on desktop (was 220, her frame's)
  meSizePhone: 120,   // px, on phones
  meZoom: 1.25,       // how far the photo is zoomed in (1 = the whole square)
  meX: 52,            // % across: the point the zoom centres on (her face)
  meY: 38,            // % down
  meTilt: 2,          // degrees her photo leans to the right (hers, 2026-11-21: a print stuck onto the page)
  tapeAlpha: 0.92,    // the teal tape on its top left corner: how solid it is (1 = fully, 0 = gone); matte paper tape, her reference
  tapeAngle: -38,     // degrees the tape lies at
  tapeSize: 0.5,      // the tape's length, as a share of the photo's width
  expSize: 24,        // px, "Experience" (was 36: it overpowered the page; Desktop/H7)
  jobSize: 20,        // px, the job titles (was 24)
  dateSize: 16,       // px, the dates and "my resume" (was 18 / 20; Desktop/Caption)
  jobGap: 12,         // px between the jobs (was 24)
  headGap: 32,        // px between the photo and the intro beside it
  headAlign: 'end',   // the intro beside the photo: 'start' (top), 'center' or 'end' (bottom)
  wordsGap: 32,       // px from the photo and intro to the first paragraph
  paraGap: 16,        // px between paragraphs (hers, 2026-11-21; was 36)
  throwTop: 120,      // px from the words and Experience box down to {a visual throwback}
  throwGap: 24,       // px from {a visual throwback} to the first photos (was 40)
  groupGap: 56,       // px between photo groups
  paper: 8,           // px of white edge round her photo (0 = a bare photo)
  shadow: 1,          // strength of her photo's shadow (0 = none, 1 = a soft pasted-on shadow)
}

const KEY = 'about-layout-v4'
if (new URLSearchParams(location.search).has('about')) {
  try { Object.assign(LAYOUT, JSON.parse(localStorage.getItem(KEY)) || {}) } catch { /* private mode */ }
}

export function applyLayout(root) {
  const L = LAYOUT, s = root.style
  s.setProperty('--me-size', `${L.meSize}px`)
  s.setProperty('--me-size-phone', `${L.meSizePhone}px`)
  s.setProperty('--me-zoom', L.meZoom)
  s.setProperty('--me-x', `${L.meX}%`)
  s.setProperty('--me-y', `${L.meY}%`)
  s.setProperty('--me-tilt', `${L.meTilt}deg`)
  s.setProperty('--tape-alpha', L.tapeAlpha)
  s.setProperty('--tape-angle', `${L.tapeAngle}deg`)
  s.setProperty('--tape-size', L.tapeSize)
  s.setProperty('--exp-size', `${L.expSize}px`)
  s.setProperty('--job-size', `${L.jobSize}px`)
  s.setProperty('--date-size', `${L.dateSize}px`)
  s.setProperty('--job-gap', `${L.jobGap}px`)
  s.setProperty('--head-gap', `${L.headGap}px`)
  s.setProperty('--head-align', L.headAlign)
  s.setProperty('--words-gap', `${L.wordsGap}px`)
  s.setProperty('--para-gap', `${L.paraGap}px`)
  s.setProperty('--throw-top', `${L.throwTop}px`)
  s.setProperty('--throw-gap', `${L.throwGap}px`)
  s.setProperty('--group-gap', `${L.groupGap}px`)
  s.setProperty('--paper', `${L.paper}px`)
  s.setProperty('--shadow-k', L.shadow)
}

/* ?about: sliders in plain words */
export function mountLayoutPanel(root) {
  const el = document.createElement('div')
  el.className = 'tune-panel'
  el.style.cssText = 'left:auto;right:12px;top:12px;max-height:calc(100vh - 24px);overflow:auto'
  const rows = [
    ['meSize', 'photo size', 100, 260, 2],
    ['meSizePhone', 'photo (phone)', 72, 200, 2],
    ['meZoom', 'photo zoom', 1, 2.5, 0.01],
    ['meX', 'zoom on, across %', 0, 100, 1],
    ['meY', 'zoom on, down %', 0, 100, 1],
    ['meTilt', 'photo tilt (deg)', -6, 6, 0.25],
    ['tapeAlpha', 'tape opacity', 0, 1, 0.01],
    ['tapeAngle', 'tape angle', -80, 0, 1],
    ['tapeSize', 'tape length', 0.2, 0.7, 0.01],
    ['expSize', 'Experience size', 16, 36, 1],
    ['jobSize', 'job title size', 14, 24, 1],
    ['dateSize', 'dates size', 12, 18, 1],
    ['jobGap', 'gap between jobs', 4, 32, 1],
    ['headGap', 'photo to intro', 8, 80, 1],
    ['headAlign', 'intro beside photo'],
    ['wordsGap', 'to paragraphs', 8, 80, 1],
    ['paraGap', 'paragraph gap', 4, 48, 1],
    ['throwTop', 'gap above gallery', 40, 200, 2],
    ['throwGap', 'gallery title gap', 8, 64, 1],
    ['groupGap', 'between groups', 16, 120, 2],
    ['paper', 'photo white edge', 0, 16, 1],
    ['shadow', 'photo shadow', 0, 2, 0.05],
  ]
  el.innerHTML = `<b>about layout</b>${rows.map(([k, text, min, max, step]) => min === undefined
    ? `<label><span>${text}</span><select data-k="${k}">${['start', 'center', 'end'].map(v => `<option${v === LAYOUT[k] ? ' selected' : ''} value="${v}">${{ start: 'top', center: 'middle', end: 'bottom' }[v]}</option>`).join('')}</select><output></output></label>`
    : `<label><span>${text}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${LAYOUT[k]}"><output>${LAYOUT[k]}</output></label>`).join('')}<button type="button" class="copy">copy values</button>`
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(LAYOUT)) } catch { /* private mode */ } }
  const change = (e) => {
    const k = e.target.dataset.k; if (!k) return
    LAYOUT[k] = e.target.tagName === 'SELECT' ? e.target.value : +e.target.value
    if (e.target.tagName !== 'SELECT') e.target.nextElementSibling.textContent = e.target.value
    applyLayout(root); save()
  }
  el.addEventListener('input', change)
  el.addEventListener('change', change)
  el.querySelector('.copy').addEventListener('click', (e) => {
    navigator.clipboard?.writeText(JSON.stringify(LAYOUT, null, 2)); e.target.textContent = 'copied'
  })
  document.body.append(el)
  return el
}
