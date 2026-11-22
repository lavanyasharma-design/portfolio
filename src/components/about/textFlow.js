import { prepare, measureNaturalWidth } from '@chenglou/pretext'
import { prepareRichInline, layoutNextRichInlineLineRange, materializeRichInlineLineRange } from '@chenglou/pretext/rich-inline'

/**
 * The About page's words, flowing round her photo and the Experience box, with
 * Pretext (chenglou/pretext, pinned 1.0.0), the text-flow pick from her motion shortlist.
 * - The paragraphs run beside her photo (from the intro's left edge) and beside the Experience box, as she
 *   laid them out in Figma (419:14), and wrap as the window narrows.
 * - On desktop the line under the pointer turns teal, one line at a time (after Pretext's dynamic-layout
 *   demo). A round space that opened round the pointer was tried and dropped the same day (hers: it made
 *   the words hard to read).
 * Pretext breaks the lines (it measures on a canvas, no DOM reflow), the page paints each line as one
 * absolutely placed row of spans. The real paragraphs stay in the page for screen readers and as the
 * fallback until the fonts are in; the painted rows are aria-hidden.
 *
 * The canvas can't take DM Sans's optical size (the site sets opsz 14), so widths are corrected by the
 * ratio of a DOM-measured paragraph to Pretext's own measure of it.
 */

const HOVER = '(hover: hover) and (pointer: fine)'
const BOX_LIFT = 20   // the Experience box starts this far above the second paragraph, so its heading lines up with it (her Figma)
const BOX_SIDE = 24   // px between the words and the box (her Figma: 923 + 24 + 305 = 1252)
const PHOTO_BELOW = 6 // px under her photo's brackets before a line may run under it

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// a fragment's words as one span per letter (.rl), so the ripple (ripple.js) can nudge each one
const letters = (t) => [...t].map(c => (c === ' ' ? ' ' : `<span class="rl">${esc(c)}</span>`)).join('')
const cls = (r) => (typeof r === 'string' ? '' : [r.u && 'u', r.i && 'i'].filter(Boolean).join(' '))

/** subtract [a, b] from a list of free [x0, x1] spans */
function cut(spans, a, b) {
  const out = []
  for (const [x0, x1] of spans) {
    if (b <= x0 || a >= x1) { out.push([x0, x1]); continue }
    if (a > x0) out.push([x0, a])
    if (b < x1) out.push([b, x1])
  }
  return out
}

/**
 * root: .ab-flow (photo group, intro, the real paragraphs, the lines layer); box: the Experience box.
 * paragraphs: run lists (aboutContent.js); onPaint: called after the lines are (re)painted. Returns a cleanup.
 */
export function mountTextFlow(root, box, paragraphs, onPaint) {
  const group = root.querySelector('.ab-me-group')
  const intro = root.querySelector('.ab-intro')
  const firstP = root.querySelector('.ab-paras p')
  const layer = root.querySelector('.ab-lines')

  let prepared = null, preparedFor = ''
  let ratio = 1, lh = 23, W = 0
  let staticRect = []       // obstacles that don't move: her photo, the box
  let startY = 0, paraGap = 16
  const pool = []           // painted rows, reused
  let alive = true

  // ---------- fonts and measuring ----------
  const fontsFor = (size) => ({
    regular: `400 ${size}px "DM Sans Variable"`,
    italic: `italic 400 ${size}px "DM Sans Variable"`,
  })

  function prep() {
    const cs = getComputedStyle(firstP)
    const size = parseFloat(cs.fontSize)
    lh = parseFloat(cs.lineHeight) || Math.round(size * 1.28)
    const key = `${size}`
    if (key === preparedFor) return
    const f = fontsFor(size)
    prepared = paragraphs.map((runs) => {
      const items = runs.map(r => (typeof r === 'string' ? { text: r, font: f.regular } : { text: r.t, font: r.i ? f.italic : f.regular }))
      return { runs, prep: prepareRichInline(items) }
    })
    // the correction for opsz: all the words on one line, in the page and on Pretext's canvas
    const probe = document.createElement('span')
    probe.className = 'ab-line ab-probe'
    const sample = [...root.querySelectorAll('.ab-paras p')].map(p => p.textContent).join(' ')
    probe.textContent = sample
    layer.append(probe)
    const dom = probe.getBoundingClientRect().width
    probe.remove()
    const canvas = measureNaturalWidth(prepare(sample, f.regular))
    ratio = canvas > 0 && dom > 0 ? dom / canvas : 1
    preparedFor = key
  }

  // ---------- layout ----------
  /** lays every paragraph out round `obstacles`; returns the rows and where each paragraph starts and ends */
  function layoutAll(obstacles) {
    const rows = [], tops = [], bottoms = []
    let y = startY
    const minSlot = 40   // px, narrower gaps beside the photo stay empty
    prepared.forEach(({ prep }, p) => {
      let cursor, done = false, top = null, bottom = y, guard = 0
      while (!done && guard++ < 400) {
        let spans = [[0, W]]
        for (const o of obstacles) if (y < o.y1 && y + lh > o.y0) spans = cut(spans, o.x0, o.x1)
        const narrowed = spans.length !== 1 || spans[0][0] > 0 || spans[0][1] < W
        for (const [x0, x1] of spans) {
          if (x1 - x0 < minSlot && narrowed) continue
          const range = layoutNextRichInlineLineRange(prep, Math.max(1, ((x1 - x0) * 0.99 - 1) / ratio), cursor)
          if (!range) { done = true; break }
          // beside the photo, a line may not end inside a word: leave the gap empty instead
          if (narrowed && range.end.graphemeIndex > 0) continue
          rows.push({ p, x: x0, y, w: range.width * ratio, range })
          cursor = range.end
          if (top === null) top = y
          bottom = y + lh
        }
        // (a paragraph that ended on this row finds out on the next one; `bottom` keeps its real end)
        if (!done) y += lh
      }
      tops.push(top ?? y); bottoms.push(bottom)
      y = bottom + paraGap
    })
    return { rows, tops, bottoms, end: bottoms[bottoms.length - 1] ?? startY }
  }

  // ---------- painting ----------
  // a row keeps its element while its words stay the same, so a resize only moves what didn't change
  function paint(rows) {
    const keyOf = (row) => { const e = row.range.end; return `${row.p}|${row.startKey}|${e.itemIndex},${e.segmentIndex},${e.graphemeIndex}` }
    const byKey = new Map(pool.filter(el => !el.hidden && el._key).map(el => [el._key, el]))
    const used = new Set()
    rows.forEach((row) => { row.key = keyOf(row); const el = byKey.get(row.key); if (el && !used.has(el)) { row.el = el; used.add(el) } })
    const free = pool.filter(el => !used.has(el))
    rows.forEach((row) => {
      let el = row.el
      if (!el) {
        el = free.shift()
        if (!el) { el = document.createElement('div'); el.className = 'ab-line'; layer.append(el); pool.push(el) }
        const { runs, prep } = prepared[row.p]
        const line = materializeRichInlineLineRange(prep, row.range)
        el.innerHTML = line.fragments.map(f =>
          (f.gapBefore > 0 ? `<span class="${cls(runs[f.gapItemIndex] ?? '')}"> </span>` : '')
          + `<span class="${cls(runs[f.itemIndex])}">${letters(f.text)}</span>`).join('')
        el._key = row.key
        row.el = el
      }
      const pos = `translate(${row.x.toFixed(1)}px, ${row.y}px)`
      if (el._pos !== pos) { el.style.transform = pos; el._pos = pos }
      el.hidden = false
    })
    free.forEach(el => { el.hidden = true; el._key = '' })
  }

  // each row's start cursor, so a row's text is only rebuilt when its words change
  function keyRows(rows) {
    const last = {}
    for (const row of rows) {
      const s = last[row.p]
      row.startKey = s ? `${s.itemIndex},${s.segmentIndex},${s.graphemeIndex}` : '0'
      last[row.p] = row.range.end
    }
    return rows
  }

  // ---------- the still layout (on load and resize) ----------
  let pointer = null        // { x, y } in client px, while over the page
  let raf = 0
  let rows = []

  function measure() {
    if (!alive) return
    prep()
    W = root.clientWidth
    paraGap = parseFloat(getComputedStyle(root).getPropertyValue('--para-gap')) || 16
    const wordsGap = parseFloat(getComputedStyle(root).getPropertyValue('--words-gap')) || 24
    startY = intro.offsetTop + intro.offsetHeight + wordsGap
    const photo = { x0: -1e6, x1: intro.offsetLeft, y0: group.offsetTop, y1: group.offsetTop + group.offsetHeight + PHOTO_BELOW }
    const boxInFlow = getComputedStyle(box).position === 'absolute'
    staticRect = [photo]
    let end = layoutAll(staticRect)
    let height = end.end
    if (boxInFlow) {
      const top = Math.round((end.tops[1] ?? startY) - BOX_LIFT)
      box.style.top = `${top}px`
      staticRect = [photo, { x0: W - box.offsetWidth - BOX_SIDE, x1: 1e6, y0: top + BOX_LIFT, y1: top + box.offsetHeight }]
      end = layoutAll(staticRect)
      height = Math.max(end.end, top + box.offsetHeight)
    } else box.style.top = ''
    root.style.height = `${Math.ceil(height)}px`
    rows = keyRows(end.rows)
    paint(rows)
    light()
    onPaint?.()
  }

  // ---------- the line under the pointer ----------
  // turns teal (hers, 2026-11-22, after Pretext's dynamic-layout demo), one line at a time, only while the
  // pointer is on its words (desktop; reduced motion too, it's only a colour)
  function light() {
    raf = 0
    let at = -1
    if (pointer && matchMedia(HOVER).matches) {
      const b = root.getBoundingClientRect()
      const x = pointer.x - b.left, y = pointer.y - b.top
      const row = rows.find(r => y >= r.y && y < r.y + lh && x >= r.x - 4 && x <= r.x + r.w + 4)
      if (row) at = row.y
    }
    rows.forEach(r => r.el?.classList.toggle('lit', r.y === at))
  }
  const run = () => { if (!raf) raf = requestAnimationFrame(light) }

  const onMove = (e) => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') { pointer = { x: e.clientX, y: e.clientY }; run() } }
  const onLeave = () => { pointer = null; run() }
  const onScroll = () => { if (pointer) run() }

  // ---------- start once the fonts are in ----------
  const f = fontsFor(parseFloat(getComputedStyle(firstP).fontSize))
  const ro = new ResizeObserver(() => measure())
  Promise.all([document.fonts.load(f.regular), document.fonts.load(f.italic)]).then(() => document.fonts.ready).then(() => {
    if (!alive) return
    root.classList.add('flowing')
    measure()
    ro.observe(root); ro.observe(intro); ro.observe(box)
    addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    addEventListener('scroll', onScroll, { passive: true })
  })

  const stop = () => {
    alive = false
    cancelAnimationFrame(raf)
    ro.disconnect()
    removeEventListener('pointermove', onMove)
    document.documentElement.removeEventListener('pointerleave', onLeave)
    removeEventListener('scroll', onScroll)
    root.classList.remove('flowing')
    root.style.height = ''
    box.style.top = ''
    pool.forEach(el => el.remove())
  }
  // for the ?about panel: gaps changed, lay the words out again
  stop.relayout = () => { if (root.classList.contains('flowing')) measure() }
  return stop
}
