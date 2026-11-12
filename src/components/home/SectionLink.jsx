import { useRef } from 'react'
import { animate } from 'motion'
import { play } from '../../lib/sound/notes'
import { navigate } from '../../router'

/**
 * [work] / [about] / [play]. On click or tap (never hover) the brackets ease out and back in
 * while the section's motif plays. [work] then opens /work; about and play have no page yet,
 * so they stay put until their "soon" state is designed.
 */
const BRACKETS = {
  spread: 0.25,     // em each bracket moves out (6px at the desktop 24px)
  duration: 0.45,   // s, out and back in
}

function SectionLink({ name, to }) {
  const left = useRef(null), right = useRef(null)
  const busy = useRef(false)

  const onClick = (e) => {
    e.preventDefault()
    play(name)
    if (busy.current) return
    busy.current = true
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const d = reduce ? 0 : BRACKETS.spread
    const opts = { duration: reduce ? 0.15 : BRACKETS.duration, times: [0, 0.4, 1], ease: ['easeOut', 'easeInOut'] }
    Promise.all([
      animate(left.current, { x: ['0em', `${-d}em`, '0em'] }, opts),
      animate(right.current, { x: ['0em', `${d}em`, '0em'] }, opts),
    ]).then(() => {
      busy.current = false
      if (to) navigate(to)
    })
  }

  const label = <>
    <span ref={left} className="br" aria-hidden="true">[</span>{name}<span ref={right} className="br" aria-hidden="true">]</span>
  </>

  return to
    ? <a className={`sec ${name}`} href={to} onClick={onClick}>{label}</a>
    : <button type="button" className={`sec ${name}`} onClick={onClick}>{label}</button>
}

export default SectionLink
