/**
 * The About page's tunable layout (hers to set by eye). Written as CSS variables on .about-page (About.css
 * reads them); the photo fits read these values live. `?about` opens a live
 * panel; "copy values" gives the numbers to paste here.
 * From her rough layout (Figma 419:14, 2026-11-22): her photo 164 x 176 with two viewfinder brackets (no tape
 * or tilt any more), "Hi!" and the intro beside it, the words flowing round the photo and the Experience box,
 * the gallery in the frame sizes she drew. Spacing on her 24 / 32 (hers: "24px mostly, 32px in some cases").
 */
// her values from ?about (2026-11-22)
export const LAYOUT = {
  meSize: 174,        // px, her photo's width on desktop (height keeps her frame's 164 : 176)
  meSizePhone: 122,   // px, on phones
  meZoom: 1.36,       // how far the photo is zoomed in on desktop (1 = the whole picture)
  meZoomPhone: 1.46,  // on phones
  meX: 62,            // % across: the point the zoom centres on (her face)
  meY: 44,            // % down
  introTop: 36,       // px from the top of her photo's brackets to "Hi!"
  wordsGap: 28,       // px from the intro to the first paragraph (hers 29, onto the grid)
  paraGap: 16,        // px between paragraphs (her Figma)
  throwTop: 72,       // px from the words and the Experience box down to {visuals from my journey so far} (hers: 56 looked congested;
                      // 80 → 72, the next step down on the grid, 2026-11-23, so the title shows again at the foot of the first screen)
  throwGap: 24,       // px from that title to the first group heading
  labelGap: 12,       // px from a group heading to its photos
  groupGap: 88,       // px between photo groups (hers 90, onto the grid)
  throwGapNarrow: 28, // the same two between 601 and 840 wide, the photos two to a row (hers, 2026-11-22)
  groupGapNarrow: 80,  // (hers 78, onto the grid)
  // photos two to a row (840 and under): wider apart across than down, so each group reads as two upright
  // stacks rather than a tight grid (hers, 2026-11-23: "congested"), and the groups further apart on phones
  photoColGap: 32,    // px between the two columns (was 16)
  photoRowGap: 16,    // px between a photo and the one under it
  groupGapPhone: 56,  // px from one group's photos to the next group's heading on phones (was 32)
}

// each gallery photo's fit inside the frame she drew: zoom (1 = just fills it) and the point it centres on (%).
// Hers from ?about (2026-11-22); the frames keep their shape on phones, so the same crop shows there.
export const PHOTO_FIT = {
  'roadcast-1': { zoom: 1, x: 37, y: 50 },
  'roadcast-2': { zoom: 1.1, x: 50, y: 11 },
  'bharatpe-1': { zoom: 1.61, x: 49, y: 38 },
  'bharatpe-2': { zoom: 1, x: 50, y: 50 },
  'design-grad-1': { zoom: 1.36, x: 95, y: 37 },
  'design-grad-2': { zoom: 1.21, x: 75, y: 24 },
  'design-grad-3': { zoom: 1.24, x: 38, y: 37 },
  'design-grad-4': { zoom: 1.07, x: 50, y: 50 },
  'adventure-1': { zoom: 1.8, x: 75, y: 32 },
  'adventure-2': { zoom: 1.28, x: 32, y: 63 },
  'adventure-4': { zoom: 1.13, x: 96, y: 50 },
  'adventure-5': { zoom: 1.16, x: 43, y: 46 },
}
const fit = (id) => (PHOTO_FIT[id] ??= { zoom: 1, x: 50, y: 50 })

const KEY = 'about-layout-v9'
if (new URLSearchParams(location.search).has('about')) {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY)) || {}
    Object.assign(LAYOUT, saved.layout || {})
    Object.assign(PHOTO_FIT, saved.fit || {})
  } catch { /* private mode */ }
}

export function photoFit(id) { return fit(id) }

const px = ['meSize', 'meSizePhone', 'introTop', 'wordsGap', 'paraGap', 'throwTop', 'throwGap', 'labelGap', 'groupGap', 'throwGapNarrow', 'groupGapNarrow', 'photoColGap', 'photoRowGap', 'groupGapPhone']
const kebab = (k) => k.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)

export function applyLayout(root) {
  const L = LAYOUT, s = root.style
  px.forEach(k => s.setProperty(`--${kebab(k)}`, `${L[k]}px`))
  s.setProperty('--me-zoom', L.meZoom)
  s.setProperty('--me-zoom-phone', L.meZoomPhone)
  s.setProperty('--me-x', `${L.meX}%`)
  s.setProperty('--me-y', `${L.meY}%`)
  root.querySelectorAll('.ab-frame[data-id]').forEach((el) => {
    const f = fit(el.dataset.id)
    el.style.setProperty('--zoom', f.zoom)
    el.style.setProperty('--fx', `${f.x}%`)
    el.style.setProperty('--fy', `${f.y}%`)
  })
}

/* ?about: sliders in plain words */
export function mountLayoutPanel(root, onChange) {
  const el = document.createElement('div')
  el.className = 'tune-panel'
  el.style.cssText = 'left:auto;right:12px;top:12px;max-height:calc(100vh - 24px);overflow:auto'
  const rows = [
    ['meSize', 'my photo width', 100, 240, 2],
    ['meSizePhone', 'my photo (phone)', 72, 180, 2],
    ['meZoom', 'my photo zoom', 1, 2.5, 0.01],
    ['meZoomPhone', 'my photo zoom (phone)', 1, 2.5, 0.01],
    ['meX', 'zoom on, across %', 0, 100, 1],
    ['meY', 'zoom on, down %', 0, 100, 1],
    ['introTop', '“Hi!” down from top', 0, 80, 1],
    ['wordsGap', 'intro to words', 8, 64, 1],
    ['paraGap', 'paragraph gap', 4, 48, 1],
    ['throwTop', 'words to gallery', 24, 160, 2],
    ['throwGap', 'gallery title gap', 8, 64, 1],
    ['labelGap', 'heading to photos', 8, 48, 1],
    ['groupGap', 'between groups', 16, 120, 2],
    ['throwGapNarrow', 'title gap (601-840)', 8, 64, 1],
    ['groupGapNarrow', 'groups (601-840)', 16, 120, 2],
    ['photoColGap', 'photo columns (840 and under)', 8, 64, 4],
    ['photoRowGap', 'photo rows (840 and under)', 8, 64, 4],
    ['groupGapPhone', 'groups (phone)', 16, 120, 4],
  ]
  const ids = [...root.querySelectorAll('.ab-frame[data-id]')].map(f => f.dataset.id)
  el.innerHTML = `<b>about layout</b>${rows.map(([k, text, min, max, step]) =>
    `<label><span>${text}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${LAYOUT[k]}"><output>${LAYOUT[k]}</output></label>`).join('')}
    <b>photo fit</b>
    <label><span>photo</span><select data-photo>${ids.map(id => `<option>${id}</option>`).join('')}</select><output></output></label>
    <label><span>zoom</span><input type="range" data-f="zoom" min="1" max="2.5" step="0.01"><output></output></label>
    <label><span>centre, across %</span><input type="range" data-f="x" min="0" max="100" step="1"><output></output></label>
    <label><span>centre, down %</span><input type="range" data-f="y" min="0" max="100" step="1"><output></output></label>
    <button type="button" class="copy">copy values</button>`
  const pick = el.querySelector('[data-photo]')
  const showFit = () => {
    const f = fit(pick.value)
    el.querySelectorAll('[data-f]').forEach(i => { i.value = f[i.dataset.f]; i.nextElementSibling.textContent = f[i.dataset.f] })
    root.querySelectorAll('.ab-frame.picked').forEach(x => x.classList.remove('picked'))
    root.querySelector(`.ab-frame[data-id="${pick.value}"]`)?.classList.add('picked')
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ layout: LAYOUT, fit: PHOTO_FIT })) } catch { /* private mode */ } }
  el.addEventListener('input', (e) => {
    const t = e.target
    if (t.dataset.k) { LAYOUT[t.dataset.k] = +t.value; t.nextElementSibling.textContent = t.value }
    else if (t.dataset.f) { fit(pick.value)[t.dataset.f] = +t.value; t.nextElementSibling.textContent = t.value }
    else return
    applyLayout(root); save(); onChange?.()
  })
  pick.addEventListener('change', showFit)
  showFit()
  el.querySelector('.copy').addEventListener('click', (e) => {
    navigator.clipboard?.writeText(JSON.stringify({ LAYOUT, PHOTO_FIT }, null, 2)); e.target.textContent = 'copied'
  })
  document.body.append(el)
  return el
}
