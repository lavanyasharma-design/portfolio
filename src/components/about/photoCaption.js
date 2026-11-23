import { animate } from 'motion'
import { DUR, EASE } from '../../lib/motion'

/**
 * The About photos' captions, after Rachel Chen's about page (her reference, 2026-11-21): on desktop the
 * caption rides beside the pointer while it's over a photo. Unlike hers, the pointer itself stays (the
 * rest of the site needs it), and the label is the nav bar's [about] chip: pale teal, black words.
 * - desktop (a mouse or trackpad): one label for the page, following the pointer with a little lag,
 *   popping in over 0.4s (--dur-base, eased out; was a spring) and fading out as the pointer leaves the photos;
 * - phones (no hover, hers: option 1): a tap shows the caption on the photo for `tapHold`, or until
 *   another photo is tapped;
 * - keyboard: tabbing to a photo shows its caption on the photo (CSS, :focus-visible).
 * `?caption` opens a live panel with "copy values".
 */
export const CAPTION = {
  offsetX: 16,       // px right of the pointer
  offsetY: 14,       // px below it
  follow: 0.28,      // how quickly the label catches up with the pointer, per frame (1 = glued to it)
  pop: 0.85,         // the scale it pops in from (over --dur-base, 0.4s, eased out)
  tapHold: 2500,     // ms a tapped caption stays on a phone
}

const HOVER = '(hover: hover) and (pointer: fine)'

/** wires the captions for every .ab-photo inside root; returns a cleanup */
export function mountPhotoCaptions(root) {
  const stops = []
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

  // ---------- phones: tap to show it on the photo ----------
  let tapTimer = 0
  const onTap = (e) => {
    if (matchMedia(HOVER).matches) return
    const fig = e.target.closest('.ab-photo')
    root.querySelectorAll('.ab-photo.shown').forEach(f => f !== fig && f.classList.remove('shown'))
    clearTimeout(tapTimer)
    if (!fig) return
    fig.classList.add('shown')
    tapTimer = setTimeout(() => fig.classList.remove('shown'), CAPTION.tapHold)
  }
  root.addEventListener('click', onTap)
  stops.push(() => { root.removeEventListener('click', onTap); clearTimeout(tapTimer) })

  // ---------- desktop: the label beside the pointer ----------
  const label = document.createElement('div')
  label.className = 'ab-cursor'
  label.setAttribute('aria-hidden', 'true')
  document.body.append(label)
  stops.push(() => label.remove())

  let px = 0, py = 0           // the pointer
  let x = 0, y = 0             // the label
  let current = null           // the photo under the pointer
  let raf = 0, last = 0

  const target = () => {
    // flips to the pointer's left near the screen's right edge, so the words never run off it
    const w = label.offsetWidth
    const right = px + CAPTION.offsetX + w > innerWidth - 8
    return [right ? px - CAPTION.offsetX - w : px + CAPTION.offsetX, py + CAPTION.offsetY]
  }

  const tick = (t) => {
    const dt = last ? Math.min(64, t - last) / (1000 / 60) : 1
    last = t
    const [tx, ty] = target()
    const k = reduce ? 1 : 1 - Math.pow(1 - CAPTION.follow, dt)
    x += (tx - x) * k
    y += (ty - y) * k
    label.style.translate = `${x}px ${y}px`
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 || current ? requestAnimationFrame(tick) : 0
    if (!raf) last = 0
  }
  const run = () => { if (!raf) raf = requestAnimationFrame(tick) }

  // a wrapped caption's box would stay at its max-width (CSS sizes it before wrapping), leaving a gap on
  // the right; narrow it to its widest line. The pop's scale is divided out of the measured widths.
  const fit = () => {
    label.style.width = ''
    const range = document.createRange()
    range.selectNodeContents(label)
    const lines = [...range.getClientRects()]
    const box = label.getBoundingClientRect()
    if (lines.length < 2 || !box.width) return
    const scale = box.width / label.offsetWidth
    const cs = getComputedStyle(label)
    const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
    label.style.width = `${Math.ceil(Math.max(...lines.map((r) => r.width)) / scale + pad)}px`
  }

  const show = (fig) => {
    const text = fig.dataset.caption
    if (current === fig) return
    const wasOn = !!current
    current = fig
    label.textContent = text
    fit()
    if (wasOn) return   // moving straight to the next photo: the label stays up, only its words change
    const [tx, ty] = target()  // appears at the pointer, not sliding in from where it was
    x = tx; y = ty
    label.style.translate = `${x}px ${y}px`
    // one eased tween in the base timing, no spring (hers, 2026-11-23: on the site's three timings)
    animate(label, { opacity: 1, scale: reduce ? 1 : [CAPTION.pop, 1] }, { duration: reduce ? 0.1 : DUR.base, ease: EASE })
  }
  const hide = () => {
    if (!current) return
    current = null
    animate(label, { opacity: 0, scale: reduce ? 1 : 0.96 }, { duration: DUR.quick, ease: EASE })
  }

  const check = () => {
    const el = document.elementFromPoint(px, py)
    const fig = el && root.contains(el) ? el.closest('.ab-photo') : null
    if (fig) show(fig)
    else hide()
    run()
  }
  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || !matchMedia(HOVER).matches) return
    px = e.clientX; py = e.clientY
    check()
  }
  // scrolling moves the photos under a still pointer
  const onScroll = () => { if (current || px) check() }
  const onLeave = () => hide()
  addEventListener('pointermove', onMove, { passive: true })
  addEventListener('scroll', onScroll, { passive: true })
  document.documentElement.addEventListener('pointerleave', onLeave)
  stops.push(() => {
    removeEventListener('pointermove', onMove)
    removeEventListener('scroll', onScroll)
    document.documentElement.removeEventListener('pointerleave', onLeave)
    cancelAnimationFrame(raf)
  })

  return () => stops.forEach(s => s())
}

/* ?caption: sliders in plain words */
export function mountCaptionPanel() {
  const el = document.createElement('div')
  el.className = 'tune-panel'
  el.style.cssText = 'left:auto;right:12px;top:12px'
  const rows = [
    ['offsetX', 'right of pointer', 0, 48, 1],
    ['offsetY', 'below pointer', -24, 48, 1],
    ['follow', 'follow (1 = glued)', 0.05, 1, 0.01],
    ['pop', 'pops in from', 0.5, 1, 0.01],
    ['tapHold', 'phone tap (ms)', 800, 5000, 100],
  ]
  el.innerHTML = `<b>photo captions</b>${rows.map(([k, text, min, max, step]) =>
    `<label><span>${text}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${CAPTION[k]}"><output>${CAPTION[k]}</output></label>`).join('')}<button type="button" class="copy">copy values</button>`
  el.addEventListener('input', (e) => {
    const k = e.target.dataset.k; if (!k) return
    CAPTION[k] = +e.target.value
    e.target.nextElementSibling.textContent = e.target.value
  })
  el.querySelector('.copy').addEventListener('click', (e) => {
    navigator.clipboard?.writeText(JSON.stringify(CAPTION, null, 2)); e.target.textContent = 'copied'
  })
  document.body.append(el)
  return el
}
