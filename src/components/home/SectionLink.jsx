import { useRef } from 'react'
import { animate } from 'motion'
import { play } from '../../lib/sound/notes'
import { navigate } from '../../router'

/**
 * [work] / [about] / [play]. Pressing one (never hovering) plays the section's motif and eases the
 * brackets out and back in. Both start on the press itself, not the release, so the sound lands
 * under the finger. [work] then opens /work once the brackets have settled; about and play have
 * no page yet, so they stay put until their "soon" state is designed. Keyboard: Enter / Space.
 */
const BRACKETS = {
  spread: 0.25,     // em each bracket moves out (6px at the desktop 24px)
  duration: 0.45,   // s, out and back in
}

function SectionLink({ name, to }) {
  const left = useRef(null), right = useRef(null)
  const busy = useRef(null)      // the running bracket animation
  const pressed = useRef(0)      // when the last press started, so its click doesn't play twice

  const fire = () => {
    play(name)
    if (busy.current) return busy.current
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const d = reduce ? 0 : BRACKETS.spread
    const opts = { duration: reduce ? 0.15 : BRACKETS.duration, times: [0, 0.4, 1], ease: ['easeOut', 'easeInOut'] }
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
    const done = fromPress ? (busy.current ?? Promise.resolve()) : fire()
    if (to) done.then(() => navigate(to))
  }

  const label = <>
    <span ref={left} className="br" aria-hidden="true">[</span>{name}<span ref={right} className="br" aria-hidden="true">]</span>
  </>
  const props = { className: `sec ${name}`, onPointerDown, onClick }

  return to
    ? <a href={to} {...props}>{label}</a>
    : <button type="button" {...props}>{label}</button>
}

export default SectionLink
