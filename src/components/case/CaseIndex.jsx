import { useEffect, useState } from 'react'

/**
 * The case study's side index (desktop, wide windows): the sections, the one you're reading in
 * brackets. No "all work" link: the nav bar already leads to work (Lavanya, 2026-11-15). It stays put while the story scrolls past (Mavis Lo's
 * pattern: most of what makes her page easy to skim). Click a section to glide to it.
 * Hidden below 1100px, where there's no room beside the column; phones have the bottom nav.
 */
function CaseIndex({ sections }) {
  const [current, setCurrent] = useState(sections[0]?.id)
  // the index fades away once More work is on screen
  const [gone, setGone] = useState(false)

  // the current section is the last one whose top has passed 40% of the way down the screen
  useEffect(() => {
    let raf = 0
    const check = () => {
      raf = 0
      const line = innerHeight * 0.4
      let id = sections[0]?.id
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= line) id = s.id
      }
      setCurrent(id)
      // gone as soon as More work (.cs-after) comes on screen (hers, 2026-11-20; was past the outcome)
      const after = document.querySelector('.cs-after')
      setGone(!!after && after.getBoundingClientRect().top < innerHeight)
    }
    const queue = () => { if (!raf) raf = requestAnimationFrame(check) }
    addEventListener('scroll', queue, { passive: true })
    addEventListener('resize', queue)
    check()
    return () => { cancelAnimationFrame(raf); removeEventListener('scroll', queue); removeEventListener('resize', queue) }
  }, [sections])

  const go = (e, id) => {
    e.preventDefault()
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }
  return (
    <nav className={gone ? 'cs-index gone' : 'cs-index'} aria-label="Case study sections">
      <ol>
        {sections.map(s => (
          <li key={s.id}>
            <a href={`#${s.id}`} onClick={e => go(e, s.id)} aria-current={current === s.id ? 'location' : undefined}>
              <span className="br" aria-hidden="true">[</span>{s.label}<span className="br" aria-hidden="true">]</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default CaseIndex
