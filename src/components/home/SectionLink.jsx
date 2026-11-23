import { useRef } from 'react'
import { animate } from 'motion'
import { play } from '../../lib/sound/notes'
import { navigate } from '../../router'
import { pages } from '../../pages/routes'
import { DUR } from '../../lib/motion'

/**
 * [work] / [about] / [play]. Pressing one (never hovering) plays the section's motif and eases the
 * brackets out and back in. Both start on the press itself, not the release, so the sound lands
 * under the finger. [work] and [about] open their page on the click itself, while the note and the
 * brackets play (hers, 2026-11-23: waiting for the brackets to settle held the page back 0.4 s, and it
 * felt like waiting for the sound); the page starts downloading when the pointer comes over the link, in
 * case the background download hasn't reached it yet. play has no page yet, so it stays put until its
 * "soon" state is designed. Keyboard: Enter / Space.
 */
const BRACKETS = {
  spread: 0.25,     // em each bracket moves out (6px at the desktop 24px)
  duration: DUR.base,   // s, out and back in (the site's base timing; was 0.45)
}

function SectionLink({ name, to, current = false }) {
  const left = useRef(null), right = useRef(null)
  const busy = useRef(null)      // the running bracket animation
  const pressed = useRef(0)      // when the last press started, so its click doesn't play twice

  const fire = () => {
    play(name)
    if (busy.current) return busy.current
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const d = reduce ? 0 : BRACKETS.spread
    const opts = { duration: reduce ? DUR.quick : BRACKETS.duration, times: [0, 0.4, 1], ease: ['easeOut', 'easeInOut'] }
    busy.current = Promise.all([
      animate(left.current, { x: ['0em', `${-d}em`, '0em'] }, opts),
      animate(right.current, { x: ['0em', `${d}em`, '0em'] }, opts),
    ]).then(() => { busy.current = null })
    return busy.current
  }

  const onPointerDown = (e) => {
    if (e.button !== 0) return
    pressed.current = performance.now()
    fire()
  }

  const onClick = (e) => {
    e.preventDefault()
    // a click that follows a press has already played; one without (keyboard) plays now
    const fromPress = performance.now() - pressed.current < 1500
    pressed.current = 0
    if (!fromPress) fire()
    if (to) navigate(to)
  }

  // the page's code and first pictures, fetched while the pointer is on its way to a click (once each)
  const warm = () => {
    const page = to && pages[to]
    if (page) { page.preload().catch(() => {}); page.warmImages('high') }
  }

  const label = <>
    <span ref={left} className="br" aria-hidden="true">[</span>{name}<span ref={right} className="br" aria-hidden="true">]</span>
  </>
  // data-no-motif: the background's hover stays off over the button, just the pointer cursor.
  // current: the page you're on (the nav bar's selected item)
  const props = {
    className: `sec ${name}${current ? ' current' : ''}`, onPointerDown, onClick, onPointerEnter: warm, onFocus: warm, 'data-no-motif': '',
    'aria-current': current ? 'page' : undefined,
  }

  return to
    ? <a href={to} {...props}>{label}</a>
    : <button type="button" {...props}>{label}</button>
}

export default SectionLink
