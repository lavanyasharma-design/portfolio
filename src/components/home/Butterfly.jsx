import { useEffect, useRef } from 'react'
import { animate } from 'motion'
import './Butterfly.css'

/**
 * The hero butterfly. Touch it (hover or tap) and it flinches like a real one: both wings snap
 * up towards each other in a quick double flutter while the body scrunches and jolts away from
 * the pointer. As it moves it glows from within, the way the intro's butterfly is lit (brighter,
 * richer colour, no halo), with a faded pale-purple holographic shimmer drifting across the wings.
 *
 * The image is split down the body into two wings, each flexing in 3D about the centre line.
 * bflyRef stays on the outer box, which is what the intro's flying butterfly lands on.
 * data-no-motif keeps the background's hover effect off while the pointer is on it.
 * onTwitch is the hook for the sound later.
 *
 * Add ?tune to the URL for a live panel. Values chosen by Lavanya on 2026-11-05.
 */
const TWITCH = {
  fold: 57,          // deg, how far the wings snap up on the first flinch
  flutter: 34,       // deg, the smaller second beat
  scrunch: 0.86,     // scale at the tightest point
  jolt: 5.5,         // design px the body jumps away from the pointer
  duration: 0.6,     // s, the whole flinch
  glowTime: 1.05,    // s, the glow rising and fading
  glow: 0.35,       // holographic shimmer strength, 0-1 (kept faded to suit the site)
  lift: 0.08,        // how much brighter the butterfly gets at the peak, like the intro's lit one
}

const Wing = ({ side, wingRef }) => (
  <div ref={wingRef} className={`wing ${side}`}>
    <img src="/assets/butterfly.png" alt="" width="669" height="373" decoding="async" draggable="false" />
    <span className="holo" />
  </div>
)

function Butterfly({ bflyRef, onTwitch }) {
  const bodyRef = useRef(null), leftRef = useRef(null), rightRef = useRef(null)
  const busy = useRef(false)

  const twitch = (e) => {
    if (busy.current) return
    busy.current = true
    onTwitch?.()
    const box = bflyRef.current, body = bodyRef.current
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const { fold, flutter, scrunch, jolt, duration, glowTime, glow, lift } = TWITCH
    const u = box.offsetWidth / 112                        // px per Figma px of the butterfly box

    // the glow plays either way; on its own it is the reduced-motion version of the touch
    const glowAt = { duration: glowTime, times: [0, 0.15, 0.5, 1], ease: ['easeOut', 'linear', 'easeIn'] }
    const lit = filter(1 + lift, 1 + lift * 3)
    const glowing = Promise.all([
      animate(box.querySelectorAll('.wing img'), { filter: [filter(1, 1), lit, lit, filter(1, 1)] }, glowAt),
      animate(box.querySelectorAll('.holo'), {
        opacity: [0, glow, glow * 0.8, 0],
        backgroundPosition: ['0% 50%', '35% 50%', '65% 50%', '100% 50%'],   // the colours drift as it glows
      }, glowAt),
    ])
    if (reduce) { glowing.then(() => { busy.current = false }); return }

    // jolt away from where the pointer came in (no pointer, e.g. the panel button: to the right)
    const r = box.getBoundingClientRect()
    const dir = e && e.clientX < r.left + r.width / 2 ? 1 : -1
    const times = [0, 0.18, 0.42, 0.62, 1]
    const ease = ['easeOut', 'easeIn', 'easeOut', 'easeInOut']
    const deg = [0, fold, 6, flutter, 0]

    animate(leftRef.current, { rotateY: deg }, { duration, times, ease })
    animate(rightRef.current, { rotateY: deg.map((d) => -d) }, { duration, times, ease })
    const move = animate(body, {
      scale: [1, scrunch, 1.03, 0.97, 1],
      x: [0, dir * jolt * u, -dir * jolt * 0.4 * u, dir * jolt * 0.2 * u, 0],
      rotate: [0, dir * 4, -dir * 2, dir * 1, 0],
    }, { duration, times, ease })
    Promise.all([move, glowing]).then(() => { busy.current = false })
  }

  const twitchRef = useRef(twitch)
  useEffect(() => { twitchRef.current = twitch })
  useEffect(() => {
    if (!new URLSearchParams(location.search).has('tune')) return
    const panel = mountPanel(bflyRef.current, () => twitchRef.current())
    return () => panel.remove()
  }, [bflyRef])

  return (
    <div ref={bflyRef} className="bfly" data-no-motif="" onPointerEnter={twitch} onPointerDown={twitch}>
      <div ref={bodyRef} className="bfly-body">
        <Wing side="l" wingRef={leftRef} />
        <Wing side="r" wingRef={rightRef} />
      </div>
    </div>
  )
}

const filter = (b, s) => `brightness(${b}) saturate(${s})`

/* ?tune: press twitch, drag sliders; "copy values" when it looks right */
function mountPanel(box, play) {
  const site = box.closest('.site'), soon = site?.classList.contains('soon')
  const cssVar = (k) => parseFloat(getComputedStyle(site).getPropertyValue(k))
  const layout = soon ? { '--bs': cssVar('--bs'), '--b-dy': cssVar('--b-dy'), '--b-gap': cssVar('--b-gap') } : {}

  const el = document.createElement('div')
  el.className = 'tune-panel'
  const slider = (k, label, min, max, step, val) =>
    `<label><span>${label}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${val}"><output></output></label>`
  el.innerHTML = `
    <b>butterfly</b>
    <button type="button" class="play">twitch it</button>
    ${slider('glow', 'shimmer', 0, 1, 0.05, TWITCH.glow)}
    ${slider('lift', 'brighten', 0, 0.3, 0.01, TWITCH.lift)}
    ${slider('glowTime', 'glow time', 0.3, 3, 0.05, TWITCH.glowTime)}
    ${soon ? `
    ${slider('--bs', 'size', 0.4, 1.2, 0.01, layout['--bs'])}
    ${slider('--b-dy', 'up / down', -40, 40, 1, layout['--b-dy'])}
    ${slider('--b-gap', 'gap', -10, 40, 1, layout['--b-gap'])}` : ''}
    ${slider('fold', 'wing snap', 0, 80, 1, TWITCH.fold)}
    ${slider('flutter', 'second beat', 0, 60, 1, TWITCH.flutter)}
    ${slider('scrunch', 'scrunch', 0.7, 1, 0.01, TWITCH.scrunch)}
    ${slider('jolt', 'jolt', 0, 12, 0.5, TWITCH.jolt)}
    ${slider('duration', 'flinch time', 0.2, 1.5, 0.05, TWITCH.duration)}
    <button type="button" class="copy">copy values</button>`

  const unit = { fold: '°', flutter: '°', duration: 's', glowTime: 's', jolt: 'px', '--b-dy': 'px', '--b-gap': 'px' }
  const show = () => el.querySelectorAll('input[type=range]').forEach((i) => { i.nextElementSibling.textContent = i.value + (unit[i.dataset.k] || '') })
  el.addEventListener('click', (e) => {
    const t = e.target.closest('button'); if (!t) return
    if (t.classList.contains('play')) play()
    else if (t.classList.contains('copy')) {
      const { glow, lift, glowTime, fold, flutter, scrunch, jolt, duration } = TWITCH
      navigator.clipboard?.writeText(JSON.stringify({ glow, lift, glowTime, fold, flutter, scrunch, jolt, duration, ...layout }, null, 2))
      t.textContent = 'copied'
    }
  })
  el.addEventListener('input', (e) => {
    const k = e.target.dataset.k, v = +e.target.value
    if (k.startsWith('--')) { layout[k] = v; site.style.setProperty(k, v) } else TWITCH[k] = v
    show()
  })
  show()
  document.body.append(el)
  return el
}

export default Butterfly
