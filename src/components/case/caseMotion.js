import { animate, inView, scroll } from 'motion'

/**
 * Motion on a case study page, set up once per page (imperative, like the rest of the site):
 * - blocks marked data-rise rise in as they reach the screen (opacity, 12px, 3px blur, 0.4s;
 *   her values from ?parallax, 2026-11-19);
 * - panels' contents marked data-parallax drift against the scroll, so the clips and pictures
 *   move a touch slower than the words around them;
 * - clips (data-clip) play only while on screen, like Mavis Lo's, starting once (nearly) whole on screen.
 * Reduced motion: no rise, no drift; clips still play when on screen but don't loop forever.
 * `?parallax` opens a live panel with "copy values".
 */
export const CASE_MOTION = {
  drift: 10,        // px each way the panel contents travel across a full pass of the screen
  driftMax: 0.05,   // ...but never more than this share of the panel's height (small panels on phones)
  rise: 12,         // px a block rises from
  blur: 3,          // px of blur it sharpens from
  riseTime: 0.4,    // s
  riseAt: 0.05,     // how far up from the bottom of the screen a block starts rising (fraction)
}

const EASE = [0.2, 0, 0, 1] // --ease-out

// with ?parallax open, the panel's values persist on this device so a reload shows the rise again
const KEY = 'case-motion-v1'
if (new URLSearchParams(location.search).has('parallax')) {
  try { Object.assign(CASE_MOTION, JSON.parse(localStorage.getItem(KEY)) || {}) } catch { /* private mode */ }
}

export function mountCaseMotion(root) {
  const M = CASE_MOTION
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const stops = []

  if (!reduce) {
    root.classList.add('cs-motion')
    root.querySelectorAll('[data-rise]').forEach((el) => {
      stops.push(inView(el, () => {
        animate(el, { opacity: [0, 1], y: [M.rise, 0], filter: [`blur(${M.blur}px)`, 'blur(0px)'] },
          { duration: M.riseTime, ease: EASE })
      }, { margin: `0px 0px -${M.riseAt * 100}% 0px` }))
    })
    root.querySelectorAll('[data-parallax]').forEach((el) => {
      // progress 0 as the panel enters at the bottom, 1 as it leaves at the top
      stops.push(scroll((p) => {
        const drift = Math.min(M.drift, el.parentElement.offsetHeight * M.driftMax)
        el.style.transform = `translate3d(0, ${((0.5 - p) * 2 * drift).toFixed(2)}px, 0)`
      }, { target: el.parentElement, offset: ['start end', 'end start'] }))
    })
  }

  root.querySelectorAll('video[data-clip]').forEach((v) => {
    if (reduce) v.loop = false
    // load a screen ahead, so a clip is ready to play when it arrives (it sat empty while it loaded on phones)
    stops.push(inView(v, () => {
      if (v.preload === 'auto') return
      v.preload = 'auto'
      if (v.paused && v.readyState === 0) v.load()  // never when it has already started playing
    }, { margin: '0px 0px 100% 0px' }))
    // play once the clip is (nearly) whole on screen, so it starts where you can see it from the beginning
    // (hers, 2026-11-21: at 35% on screen the subscriptions clip began before she reached it); a panel taller
    // than the window starts once it fills most of it. It keeps playing until less than a quarter is left in
    // view, so a small scroll while watching doesn't stop it
    const h = v.getBoundingClientRect().height || 1
    const start = Math.min(0.9, (innerHeight * 0.85) / h)
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio >= start - 0.01) v.play().catch(() => {})
      else if (e.intersectionRatio < 0.25) v.pause()
    }, { threshold: [0, 0.25, start] })
    io.observe(v)
    stops.push(() => io.disconnect())
  })

  return () => stops.forEach(stop => stop())
}

/** ?parallax: sliders for the drift and the rise; changes apply to blocks that rise after them. */
export function mountCaseMotionPanel() {
  const M = CASE_MOTION
  const rows = [
    ['drift', 'drift (px each way)', 0, 80, 1],
    ['driftMax', 'drift cap (of panel)', 0, 0.3, 0.01],
    ['rise', 'rise (px)', 0, 40, 1],
    ['blur', 'blur (px)', 0, 12, 0.5],
    ['riseTime', 'rise time (s)', 0.2, 1.6, 0.05],
    ['riseAt', 'rise starts (screen)', 0, 0.4, 0.01],
  ]
  const el = document.createElement('div')
  el.className = 'tune-panel'
  el.style.cssText = 'left:12px;top:auto;bottom:100px'
  el.innerHTML = `<b>case study motion</b>
    ${rows.map(([k, label, min, max, step]) =>
      `<label><span>${label}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${M[k]}"><output>${M[k]}</output></label>`).join('')}
    <small style="color:#616161">drift shows as you scroll; reload to see a new rise (values are kept)</small>
    <button type="button" class="copy">copy values</button>`
  el.addEventListener('input', (e) => {
    const k = e.target.dataset.k; if (!k) return
    M[k] = +e.target.value
    e.target.nextElementSibling.textContent = e.target.value
    try { localStorage.setItem(KEY, JSON.stringify(M)) } catch { /* private mode */ }
    dispatchEvent(new Event('scroll'))
  })
  el.querySelector('.copy').addEventListener('click', (e) => {
    navigator.clipboard?.writeText(JSON.stringify(M, null, 2)); e.target.textContent = 'copied'
  })
  document.body.append(el)
  return el
}
